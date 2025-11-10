/**
 * Player Matching Utility
 * Links external API player names with local database players
 */

/**
 * Normalize player name for matching
 * Removes accents, converts to lowercase, removes special characters
 */
export function normalizePlayerName(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Calculate similarity score between two player names (0-1)
 */
export function calculateNameSimilarity(name1, name2) {
  const n1 = normalizePlayerName(name1);
  const n2 = normalizePlayerName(name2);
  
  if (n1 === n2) return 1.0;
  
  // Check if one name contains the other
  if (n1.includes(n2) || n2.includes(n1)) {
    return 0.9;
  }
  
  // Split into parts (first name, last name, etc.)
  const parts1 = n1.split(' ');
  const parts2 = n2.split(' ');
  
  // Check if last names match
  if (parts1.length > 0 && parts2.length > 0) {
    const lastName1 = parts1[parts1.length - 1];
    const lastName2 = parts2[parts2.length - 1];
    
    if (lastName1 === lastName2) {
      return 0.85; // Last name match is very strong indicator
    }
  }
  
  // Calculate Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(n1, n2);
  const maxLength = Math.max(n1.length, n2.length);
  
  if (maxLength === 0) return 0;
  
  return 1 - (distance / maxLength);
}

/**
 * Levenshtein distance algorithm for fuzzy string matching
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Match external API player name to local database player
 * Returns best matching player or null
 */
export function matchPlayerToDatabase(apiPlayerName, dbPlayers, threshold = 0.75) {
  if (!apiPlayerName || !dbPlayers || dbPlayers.length === 0) {
    return null;
  }
  
  let bestMatch = null;
  let bestScore = threshold; // Minimum threshold
  
  for (const dbPlayer of dbPlayers) {
    // Try different name fields
    const namesToTry = [
      dbPlayer.display_name,
      dbPlayer.full_name,
      dbPlayer.name,
      `${dbPlayer.first_name} ${dbPlayer.last_name}`.trim(),
    ].filter(Boolean);
    
    for (const dbName of namesToTry) {
      const score = calculateNameSimilarity(apiPlayerName, dbName);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = dbPlayer;
      }
    }
  }
  
  return bestMatch;
}

/**
 * Enrich external API match data with local player data
 */
export function enrichMatchWithLocalPlayers(apiMatch, dbPlayers) {
  if (!apiMatch || !dbPlayers) return apiMatch;
  
  const enrichedMatch = { ...apiMatch };
  
  // Match player A
  if (apiMatch.player_a) {
    const playerA = matchPlayerToDatabase(apiMatch.player_a, dbPlayers);
    if (playerA) {
      enrichedMatch.player_a_id = playerA.id;
      enrichedMatch.player_a_slug = playerA.slug;
      enrichedMatch.player_a_data = playerA;
    }
  }
  
  // Match player B
  if (apiMatch.player_b) {
    const playerB = matchPlayerToDatabase(apiMatch.player_b, dbPlayers);
    if (playerB) {
      enrichedMatch.player_b_id = playerB.id;
      enrichedMatch.player_b_slug = playerB.slug;
      enrichedMatch.player_b_data = playerB;
    }
  }
  
  return enrichedMatch;
}

/**
 * Enrich multiple matches with local player data
 */
export function enrichMatchesWithLocalPlayers(apiMatches, dbPlayers) {
  if (!apiMatches || !Array.isArray(apiMatches)) return apiMatches;
  if (!dbPlayers || !Array.isArray(dbPlayers) || dbPlayers.length === 0) return apiMatches;
  
  return apiMatches.map(match => enrichMatchWithLocalPlayers(match, dbPlayers));
}

/**
 * Auto-create missing players from API data
 * Returns array of newly created players
 */
export async function autoCreateMissingPlayers(apiMatches, dbPlayers, createPlayerFn) {
  if (!apiMatches || !Array.isArray(apiMatches)) return [];
  
  const uniquePlayerNames = new Set();
  const createdPlayers = [];
  
  // Collect all unique player names from API matches
  apiMatches.forEach(match => {
    if (match.player_a) uniquePlayerNames.add(match.player_a);
    if (match.player_b) uniquePlayerNames.add(match.player_b);
  });
  
  // Check each player against database
  for (const playerName of uniquePlayerNames) {
    const existingPlayer = matchPlayerToDatabase(playerName, dbPlayers, 0.85);
    
    if (!existingPlayer) {
      // Player doesn't exist in database, create it
      try {
        const nameParts = playerName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const newPlayer = await createPlayerFn({
          display_name: playerName,
          first_name: firstName,
          last_name: lastName,
          data_source: 'auto-imported-from-live-matches',
        });
        
        createdPlayers.push(newPlayer);
        dbPlayers.push(newPlayer); // Add to local cache
      } catch (error) {
        console.error(`Failed to auto-create player: ${playerName}`, error);
      }
    }
  }
  
  return createdPlayers;
}
