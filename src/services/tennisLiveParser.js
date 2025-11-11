/**
 * TennisLive.net HTML Parser
 * Scrapes live match data from TennisLive.net HTML tables
 * 
 * Note: This is web scraping and may break if their HTML structure changes.
 * Use as a fallback source after APIs.
 */

/**
 * Fetch and parse live matches from TennisLive.net
 * @returns {Promise<Array>} Array of match objects
 */
export async function getTennisLiveMatches() {
  try {
    console.log('🎾 Fetching matches from TennisLive.net...');
    
    const response = await fetch('https://www.tennislive.net/tennis_livescore.php?t=live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const matches = parseMatchesFromHTML(html);
    
    console.log(`✅ Found ${matches.length} live matches from TennisLive.net`);
    return matches;
    
  } catch (error) {
    console.error('❌ TennisLive.net fetch failed:', error.message);
    return [];
  }
}

/**
 * Parse match data from HTML
 * @param {string} html - HTML content
 * @returns {Array} Parsed matches
 */
function parseMatchesFromHTML(html) {
  const matches = [];
  
  // Look for tbody sections with match data
  // Format: <tbody id="b_{tournament}_{match}_{category}">
  const tbodyRegex = /<tbody id="b_(\d+)_(\d+)_(\d+)">([\s\S]*?)<\/tbody>/g;
  
  let tbodyMatch;
  while ((tbodyMatch = tbodyRegex.exec(html)) !== null) {
    const [, tournamentId, player1Id, player2Id, tableContent] = tbodyMatch;
    
    try {
      const match = parseMatchTable(tableContent, { 
        tournamentId, 
        player1Id, 
        player2Id,
        matchId: `${player1Id}_${player2Id}`
      });
      if (match) {
        matches.push(match);
      }
    } catch (error) {
      console.warn('Failed to parse match:', error.message);
    }
  }
  
  return matches;
}

/**
 * Parse individual match from table HTML
 * @param {string} html - Table HTML content
 * @param {Object} ids - Match IDs
 * @returns {Object|null} Match object
 */
function parseMatchTable(html, ids) {
  // Skip if this is just a header row without match data
  if (!html.includes('<td class="match')) {
    return null;
  }
  
  // Extract tournament name from header
  const tournamentMatch = html.match(/<a[^>]*title="([^"]+)"[^>]*>([^<]+)<\/a>/);
  const tournament = tournamentMatch ? cleanText(tournamentMatch[2]) : 'Unknown Tournament';
  
  // Extract surface from image title
  const surfaceMatch = html.match(/title="([^"]*(?:Clay|hard|grass|carpet)[^"]*)"/i);
  let surface = 'hard'; // default
  if (surfaceMatch) {
    const surfaceText = surfaceMatch[1].toLowerCase();
    if (surfaceText.includes('clay')) surface = 'clay';
    else if (surfaceText.includes('grass')) surface = 'grass';
    else if (surfaceText.includes('carpet')) surface = 'carpet';
  }
  
  // Extract player names from <td class="match"> tags
  const playerRegex = /<td class="match[^"]*"><a[^>]*title="([^"]+)">([^<]+)<\/a>/g;
  const playerMatches = [...html.matchAll(playerRegex)];
  
  if (playerMatches.length < 2) {
    return null; // Need at least 2 players
  }
  
  const player1 = cleanText(playerMatches[0][2]); // Get the visible name, not title
  const player2 = cleanText(playerMatches[1][2]);
  
  // Extract round info
  const roundMatch = html.match(/<div class="L_round">([^<]+)<\/div>/);
  const round = roundMatch ? cleanText(roundMatch[1]).replace(/(<sup>|<\/sup>)/g, '') : 'R1';
  
  // Extract score from set columns
  const setScores = [];
  const setRegex = /<td class="set[^"]*"[^>]*>(\d+|)<\/td>/g;
  let setMatch;
  while ((setMatch = setRegex.exec(html)) !== null) {
    if (setMatch[1]) setScores.push(setMatch[1]);
  }
  
  // Build score string (player1 sets vs player2 sets)
  let score = '';
  if (setScores.length >= 2) {
    // Pair up scores (player1 set1, player2 set1, player1 set2, player2 set2, ...)
    const sets = [];
    for (let i = 0; i < setScores.length - 1; i += 2) {
      if (setScores[i] && setScores[i + 1]) {
        sets.push(`${setScores[i]}-${setScores[i + 1]}`);
      }
    }
    score = sets.join(' ');
  }
  
  // Check if match is live (has active set or serve indicator)
  const isLive = html.includes('class="set act') || html.includes('tennis_ball.gif');
  
  // Extract start time
  const timeMatch = html.match(/<td[^>]*class="beg[^"]*">([^<]+)</);
  const timeStr = timeMatch ? cleanText(timeMatch[1]) : '';
  
  return {
    id: `tennislive-${ids.matchId}`,
    source: 'tennislive',
    tournament_id: ids.tournamentId,
    tournament_name: tournament,
    tournament: tournament,
    round: round,
    surface: surface,
    player_a: player1,
    player_b: player2,
    player1_name: player1,
    player2_name: player2,
    player_a_id: ids.player1Id,
    player_b_id: ids.player2Id,
    player1_id: ids.player1Id,
    player2_id: ids.player2Id,
    score: score,
    status: isLive ? 'live' : 'scheduled',
    is_live: isLive,
    start_time: timeStr || new Date().toISOString(),
    odds: null,
  };
}

/**
 * Clean text from HTML entities and extra whitespace
 * @param {string} text - Raw text
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Test function - run with: node -e "import('./tennisLiveParser.js').then(m => m.testTennisLive())"
 */
export async function testTennisLive() {
  console.log('🧪 Testing TennisLive.net parser...\n');
  
  const matches = await getTennisLiveMatches();
  
  console.log(`\n📊 Results: ${matches.length} matches found\n`);
  
  if (matches.length > 0) {
    console.log('Sample matches:');
    matches.slice(0, 5).forEach((match, i) => {
      console.log(`\n${i + 1}. ${match.player_a} vs ${match.player_b}`);
      console.log(`   Tournament: ${match.tournament_name}`);
      console.log(`   Surface: ${match.surface} | Status: ${match.status}`);
      console.log(`   Score: ${match.score || 'Not started'}`);
    });
  }
  
  return matches;
}
