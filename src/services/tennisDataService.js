/**
 * Tennis Data Service - Multi-source tennis data with intelligent fallbacks
 * 
 * Data Sources (Priority Order):
 * 1. Pinnacle Odds API (Betting odds & live data)
 * 2. RapidAPI Tennis (Primary - requires key)
 * 3. Sofascore Public API (Free - no key required)
 * 4. TheSportsDB (Free - limited data)
 * 5. Mock Data (Always available)
 * 
 * Features:
 * - Automatic fallback on API failures
 * - Request conservation (20/day limit)
 * - Aggressive caching
 * - Unified data normalization
 * - Live odds integration
 * 
 * Environment variables:
 * - VITE_PINNACLE_API_KEY (optional - enables Pinnacle Odds)
 * - VITE_TENNIS_API_KEY (optional - enables RapidAPI)
 * - VITE_TENNIS_API_HOST (optional)
 * - VITE_TENNIS_API_PROVIDER (optional)
 */

const API_KEY = import.meta.env.VITE_TENNIS_API_KEY || 'c4da663c6emshf08c4503b1a7366p148028jsn4fce0daf017e';
const API_HOST = import.meta.env.VITE_TENNIS_API_HOST || 'tennis-api-atp-wta-itf.p.rapidapi.com';
const API_PROVIDER = import.meta.env.VITE_TENNIS_API_PROVIDER || 'rapidapi';

// Pinnacle Odds API configuration
const PINNACLE_API_KEY = import.meta.env.VITE_PINNACLE_API_KEY || 'c4da663c6emshf08c4503b1a7366p148028jsn4fce0daf017e';
const PINNACLE_HOST = 'pinnacle-odds.p.rapidapi.com';
const TENNIS_SPORT_ID = 33; // Tennis sport ID in Pinnacle

// Mock data fallback when no API key is configured
const MOCK_MODE = !API_KEY && !PINNACLE_API_KEY;

// Available free data sources (no API key required)
const FREE_SOURCES = {
  SOFASCORE: 'https://api.sofascore.com/api/v1',
  SPORTSDB: 'https://www.thesportsdb.com/api/v1/json/3',
};

// Request counter and limits
const REQUEST_STATS = {
  total: 0,
  today: 0,
  lastReset: new Date().toDateString(),
  monthlyLimit: 500,
  dailyLimit: 20, // Conservative: 500/month ≈ 16-17/day, use 20 as buffer
};

// Load stats from localStorage
try {
  const saved = localStorage.getItem('tennis_api_stats');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.lastReset === new Date().toDateString()) {
      Object.assign(REQUEST_STATS, parsed);
    }
  }
} catch (e) {
  // ignore
}

function saveRequestStats() {
  try {
    localStorage.setItem('tennis_api_stats', JSON.stringify(REQUEST_STATS));
  } catch (e) {
    // ignore
  }
}

function checkRequestLimit() {
  // Reset daily counter if it's a new day
  const today = new Date().toDateString();
  if (REQUEST_STATS.lastReset !== today) {
    REQUEST_STATS.today = 0;
    REQUEST_STATS.lastReset = today;
  }

  // Check if we've hit daily limit
  if (REQUEST_STATS.today >= REQUEST_STATS.dailyLimit) {
    console.warn(`🚫 Daily API limit reached (${REQUEST_STATS.dailyLimit} calls). Using cached data.`);
    return false;
  }

  return true;
}

function incrementRequestCount() {
  REQUEST_STATS.total++;
  REQUEST_STATS.today++;
  saveRequestStats();
  console.log(`📊 API Calls - Today: ${REQUEST_STATS.today}/${REQUEST_STATS.dailyLimit} | Total: ${REQUEST_STATS.total}/${REQUEST_STATS.monthlyLimit}`);
}

/**
 * Multi-source fetch with automatic fallback
 * Tries sources in order: Pinnacle → RapidAPI → Sofascore → TheSportsDB → TennisLive.net → Mock
 */
async function fetchWithFallback(endpoint, dataType) {
  const sources = [];
  
  // Add Pinnacle if available for live/scheduled matches
  if (PINNACLE_API_KEY && (dataType === 'live' || dataType === 'scheduled')) {
    sources.push({
      name: 'Pinnacle',
      fetch: () => fetchPinnacleMatches(dataType),
    });
  }
  
  // Add RapidAPI if available and quota allows
  if (API_KEY && checkRequestLimit()) {
    sources.push({
      name: 'RapidAPI',
      fetch: () => fetchRapidAPI(endpoint),
    });
  }
  
  // Always try free sources
  sources.push(
    {
      name: 'Sofascore',
      fetch: () => fetchSofascore(dataType),
    },
    {
      name: 'TheSportsDB',
      fetch: () => fetchSportsDB(dataType),
    },
    {
      name: 'TennisLive.net',
      fetch: () => fetchTennisLive(dataType),
    }
  );
  
  // Try each source until one succeeds
  for (const source of sources) {
    try {
      console.log(`🎾 Trying ${source.name} for ${dataType}...`);
      const data = await source.fetch();
      if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
        console.log(`✅ ${source.name} returned data for ${dataType}`);
        if (source.name === 'RapidAPI') incrementRequestCount();
        return data;
      }
    } catch (error) {
      console.warn(`❌ ${source.name} failed:`, error.message);
      continue;
    }
  }
  
  // All sources failed, return mock data
  console.log(`⚠️ All sources failed for ${dataType}, using mock data`);
  return getMockData(endpoint);
}

/**
 * Fetch from RapidAPI (requires API key)
 */
async function fetchRapidAPI(endpoint) {
  const headers = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST,
  };

  const url = `https://${API_HOST}${endpoint}`;

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`RapidAPI error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch from Pinnacle Odds API (requires API key)
 */
async function fetchPinnacle(endpoint) {
  const headers = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': PINNACLE_API_KEY,
    'X-RapidAPI-Host': PINNACLE_HOST,
  };

  const url = `https://${PINNACLE_HOST}${endpoint}`;

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Pinnacle API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get tennis matches with odds from Pinnacle
 */
async function fetchPinnacleMatches(type = 'live') {
  try {
    // Get tennis events with odds
    let endpoint;
    if (type === 'live') {
      // Get live matches with odds
      endpoint = `/kit/v1/markets?sport_id=${TENNIS_SPORT_ID}&is_have_odds=true`;
    } else {
      // Get upcoming matches
      endpoint = `/kit/v1/markets?sport_id=${TENNIS_SPORT_ID}&is_have_odds=true`;
    }
    
    const data = await fetchPinnacle(endpoint);
    return data;
  } catch (error) {
    console.warn('Pinnacle API fetch failed:', error.message);
    throw error;
  }
}

/**
 * Fetch from Sofascore public API (free, no key required)
 */
async function fetchSofascore(dataType) {
  let url;
  
  switch (dataType) {
    case 'live':
      url = `${FREE_SOURCES.SOFASCORE}/sport/tennis/events/live`;
      break;
    case 'scheduled':
      url = `${FREE_SOURCES.SOFASCORE}/sport/tennis/scheduled-events/${getTodayDate()}`;
      break;
    case 'tournaments':
      url = `${FREE_SOURCES.SOFASCORE}/sport/tennis/tournaments`;
      break;
    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Sofascore error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch from TheSportsDB (free, no key required)
 */
async function fetchSportsDB(dataType) {
  let url;
  
  switch (dataType) {
    case 'live':
      // TheSportsDB doesn't have live scores in free tier
      throw new Error('TheSportsDB does not support live matches');
    case 'scheduled':
      url = `${FREE_SOURCES.SPORTSDB}/eventsseason.php?id=4370&s=2025`;
      break;
    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TheSportsDB error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch live matches from TennisLive.net (web scraping fallback)
 */
async function fetchTennisLive(dataType) {
  // Only supports live matches
  if (dataType !== 'live') {
    throw new Error('TennisLive.net only supports live matches');
  }

  try {
    const response = await fetch('https://www.tennislive.net/tennis_livescore.php?t=live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Parse matches from HTML (returns already normalized format)
    const matches = parseTennisLiveHTML(html);
    
    // Return in format expected by normalizeMatches
    return { matches, source: 'tennislive' };
    
  } catch (error) {
    throw new Error(`TennisLive.net fetch failed: ${error.message}`);
  }
}

/**
 * Parse TennisLive.net HTML to extract match data
 */
function parseTennisLiveHTML(html) {
  const matches = [];
  const tbodyRegex = /<tbody id="b_(\d+)_(\d+)_(\d+)">([\s\S]*?)<\/tbody>/g;
  
  let tbodyMatch;
  while ((tbodyMatch = tbodyRegex.exec(html)) !== null) {
    const [, tournamentId, player1Id, player2Id, content] = tbodyMatch;
    
    // Skip if no match data (just header)
    if (!content.includes('<td class="match')) continue;
    
    try {
      // Extract tournament
      const tournamentMatch = content.match(/<a[^>]*title="([^"]+)"[^>]*>([^<]+)<\/a>/);
      const tournament = tournamentMatch ? tournamentMatch[2].trim() : 'Unknown';
      
      // Extract surface
      const surfaceMatch = content.match(/title="([^"]*(?:Clay|hard|grass|carpet)[^"]*)"/i);
      let surface = 'hard';
      if (surfaceMatch) {
        const s = surfaceMatch[1].toLowerCase();
        if (s.includes('clay')) surface = 'clay';
        else if (s.includes('grass')) surface = 'grass';
      }
      
      // Extract players
      const playerRegex = /<td class="match[^"]*"><a[^>]*>([^<]+)<\/a>/g;
      const players = [...content.matchAll(playerRegex)];
      if (players.length < 2) continue;
      
      const player1 = players[0][1].trim();
      const player2 = players[1][1].trim();
      
      // Extract round
      const roundMatch = content.match(/<div class="L_round">([^<]+)<\/div>/);
      const round = roundMatch ? roundMatch[1].replace(/<[^>]+>/g, '').trim() : 'R1';
      
      // Check if live
      const isLive = content.includes('class="set act') || content.includes('tennis_ball.gif');
      
      matches.push({
        id: `tl-${tournamentId}-${player1Id}-${player2Id}`,
        tournament_name: tournament,
        tournament: tournament,
        round: round,
        surface: surface,
        player_a: player1,
        player_b: player2,
        player1_name: player1,
        player2_name: player2,
        player_a_id: player1Id,
        player_b_id: player2Id,
        player1_id: player1Id,
        player2_id: player2Id,
        score: '',
        status: isLive ? 'live' : 'scheduled',
        is_live: isLive,
        start_time: new Date().toISOString(),
        odds: null,
      });
    } catch (e) {
      // Skip malformed matches
      continue;
    }
  }
  
  return matches;
}

/**
 * Helper: Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get live matches currently in progress
 */
export async function getLiveMatches() {
  console.log('🎾 getLiveMatches() called');
  console.log('  PINNACLE_API_KEY configured:', !!PINNACLE_API_KEY);
  console.log('  TENNIS_API_KEY configured:', !!API_KEY);
  console.log('  MOCK_MODE:', MOCK_MODE);
  console.log('  Daily requests:', `${REQUEST_STATS.today}/${REQUEST_STATS.dailyLimit}`);
  
  const data = await fetchWithFallback('/tennis/v2/atp/live', 'live');
  
  // Detect source and normalize accordingly
  let source = 'sofascore';
  if (Array.isArray(data)) {
    source = 'pinnacle';
  } else if (data?.events) {
    source = 'sofascore';
  } else if (data?.matches || data?.data) {
    source = 'rapidapi';
  }
  
  console.log('  Data source used:', source);
  const normalized = normalizeMatches(data, source);
  
  console.log('  Matches returned:', normalized.length);
  if (normalized.length > 0) {
    console.log('  First match:', normalized[0]);
    if (normalized[0].odds) {
      console.log('  ✨ Odds available!', normalized[0].odds);
    }
  }
  
  return normalized;
}

/**
 * Get upcoming/scheduled matches
 */
export async function getUpcomingMatches() {
  const data = await fetchWithFallback('/tennis/v2/atp/schedule', 'scheduled');
  
  // Detect source
  let source = 'sofascore';
  if (Array.isArray(data)) {
    source = 'pinnacle';
  } else if (data?.events) {
    source = 'sofascore';
  } else if (data?.matches || data?.data) {
    source = 'rapidapi';
  }
  
  return normalizeMatches(data, source);
}

/**
 * Get matches by date
 */
export async function getMatchesByDate(date = getTodayDate()) {
  const data = await fetchWithFallback(`/tennis/v2/matches/${date}`, 'scheduled');
  return normalizeMatches(data, 'sofascore');
}

/**
 * Get ATP Top 100 rankings
 */
export async function getATPRankings(limit = 100) {
  // Rankings are less critical, keep using RapidAPI if available
  if (!MOCK_MODE && checkRequestLimit()) {
    try {
      const data = await fetchRapidAPI('/tennis/v2/atp/rankings');
      incrementRequestCount();
      return normalizeRankings(data, 'ATP');
    } catch (error) {
      console.warn('RapidAPI rankings failed, using mock data');
    }
  }
  return normalizeRankings(getMockData('/rankings/atp'), 'ATP');
}

/**
 * Get WTA Top 100 rankings
 */
export async function getWTARankings(limit = 100) {
  if (!MOCK_MODE && checkRequestLimit()) {
    try {
      const data = await fetchRapidAPI('/tennis/v2/wta/rankings');
      incrementRequestCount();
      return normalizeRankings(data, 'WTA');
    } catch (error) {
      console.warn('RapidAPI rankings failed, using mock data');
    }
  }
  return normalizeRankings(getMockData('/rankings/wta'), 'WTA');
}

/**
 * Get ITF rankings
 */
export async function getITFRankings(limit = 100) {
  if (!MOCK_MODE && checkRequestLimit()) {
    try {
      const data = await fetchRapidAPI('/tennis/v2/itf/rankings');
      incrementRequestCount();
      return normalizeRankings(data, 'ITF');
    } catch (error) {
      console.warn('RapidAPI rankings failed, using mock data');
    }
  }
  return normalizeRankings(getMockData('/rankings/itf'), 'ITF');
}

/**
 * Get upcoming/current tournaments
 */
export async function getTournaments(options = {}) {
  const data = await fetchWithFallback('/tennis/v2/tournaments', 'tournaments');
  return normalizeTournaments(data);
}

/**
 * Get player details by ID or name
 */
export async function getPlayerDetails(playerIdOrName) {
  if (!MOCK_MODE && checkRequestLimit()) {
    try {
      const data = await fetchRapidAPI(`/tennis/v2/players/${playerIdOrName}`);
      incrementRequestCount();
      return normalizePlayer(data);
    } catch (error) {
      console.warn('Player details fetch failed, using mock data');
    }
  }
  // Return mock player data
  return getMockPlayerDetails(playerIdOrName);
}

/**
 * Get match details by ID
 */
export async function getMatchDetails(matchId) {
  if (!MOCK_MODE && checkRequestLimit()) {
    try {
      const data = await fetchRapidAPI(`/tennis/v2/matches/${matchId}`);
      incrementRequestCount();
      return normalizeMatch(data);
    } catch (error) {
      console.warn('Match details fetch failed, using mock data');
    }
  }
  return getMockMatchDetails(matchId);
}

/**
 * Search players by name
 */
export async function searchPlayers(query, tour = 'all') {
  if (!MOCK_MODE && checkRequestLimit()) {
    try {
      const data = await fetchRapidAPI(`/tennis/v2/search?search=${encodeURIComponent(query)}`);
      incrementRequestCount();
      return normalizeRankings(data);
    } catch (error) {
      console.warn('Player search failed');
    }
  }
  // Search in mock rankings
  const atpMock = generateMockRankings('ATP', 100);
  const wtaMock = generateMockRankings('WTA', 100);
  const allPlayers = [...atpMock, ...wtaMock];
  return allPlayers.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 20);
}

// ============================================================================
// Data Normalization Functions
// ============================================================================

function normalizeMatches(data, source = 'rapidapi') {
  let matches = [];
  
  // Handle TennisLive.net format (already normalized)
  if (source === 'tennislive' && data?.matches) {
    return data.matches.map(m => ({
      ...m,
      player1_name: m.player_a,
      player2_name: m.player_b,
      player1_id: m.player_a_id,
      player2_id: m.player_b_id,
    }));
  }
  
  // Handle Pinnacle format
  if (source === 'pinnacle' && Array.isArray(data)) {
    matches = data.map(event => ({
      id: event.event_id || event.id,
      tournament_name: event.league?.name || event.parent?.name || 'Tennis Match',
      round: 'Live', // Pinnacle doesn't provide round info
      surface: 'hard', // Default, Pinnacle doesn't provide surface
      player_a: event.home || event.participants?.[0]?.name || 'Player 1',
      player_b: event.away || event.participants?.[1]?.name || 'Player 2',
      player_a_id: event.home_id || event.participants?.[0]?.id,
      player_b_id: event.away_id || event.participants?.[1]?.id,
      score: event.scores || event.current_score || '',
      status: event.is_live ? 'live' : 'scheduled',
      start_time: event.starts ? new Date(event.starts).toISOString() : null,
      is_live: event.is_live || false,
      // Odds data (Pinnacle specialty)
      odds: event.periods?.[0]?.money_line ? {
        player_a_odds: event.periods[0].money_line.home,
        player_b_odds: event.periods[0].money_line.away,
        spread: event.periods[0].spreads?.[0],
        total: event.periods[0].totals?.[0],
      } : null,
    }));
  }
  // Handle Sofascore format
  else if (source === 'sofascore' && data?.events) {
    matches = data.events.map(e => ({
      id: e.id,
      tournament_name: e.tournament?.name || e.tournament?.uniqueTournament?.name || 'Unknown',
      round: e.roundInfo?.name || e.roundInfo?.round || 'R1',
      surface: e.groundType || 'hard',
      player_a: e.homeTeam?.name || 'Player 1',
      player_b: e.awayTeam?.name || 'Player 2',
      player_a_id: e.homeTeam?.id,
      player_b_id: e.awayTeam?.id,
      score: e.homeScore && e.awayScore ? `${e.homeScore?.display || 0} - ${e.awayScore?.display || 0}` : '',
      status: e.status?.description || e.status?.type || 'scheduled',
      start_time: e.startTimestamp ? new Date(e.startTimestamp * 1000).toISOString() : null,
      is_live: e.status?.type === 'inprogress',
      odds: null,
    }));
  } 
  // Handle RapidAPI format
  else if (data?.matches || data?.data) {
    const rawMatches = data?.matches || data?.data || [];
    matches = rawMatches.map(m => ({
      id: m.id || m.match_id,
      tournament_name: m.tournament?.name || m.tournament_name || 'Unknown',
      round: m.round || 'R1',
      surface: m.surface || 'hard',
      player_a: normalizePlayerName(m.player1 || m.home_player || m.player_a),
      player_b: normalizePlayerName(m.player2 || m.away_player || m.player_b),
      player_a_id: m.player1_id || m.home_player_id,
      player_b_id: m.player2_id || m.away_player_id,
      score: m.score || m.current_score || '',
      status: m.status || 'scheduled',
      start_time: m.start_time || m.scheduled,
      is_live: m.status === 'live' || m.status === 'inprogress',
      odds: null,
    }));
  }
  
  return matches.map(m => ({
    id: m.id,
    tournament: m.tournament_name,
    tournament_name: m.tournament_name,
    round: m.round,
    surface: m.surface,
    player_a: m.player_a,
    player_b: m.player_b,
    player1_name: m.player_a, // For prediction service
    player2_name: m.player_b, // For prediction service
    player_a_id: m.player_a_id,
    player_b_id: m.player_b_id,
    player1_id: m.player_a_id, // For prediction service
    player2_id: m.player_b_id, // For prediction service
    score: m.score,
    status: m.status,
    start_time: m.start_time,
    is_live: m.is_live,
    odds: m.odds, // Include betting odds if available
  }));
}

function normalizeRankings(data, tour = null) {
  const rankings = data?.rankings || data?.data || data || [];
  
  return rankings.map(r => ({
    rank: r.rank || r.ranking || r.position,
    player_name: normalizePlayerName(r.player || r.name || r.full_name),
    player_id: r.player_id || r.id,
    points: r.points || r.ranking_points || 0,
    country: r.country || r.nationality || '',
    age: r.age,
    tour: tour || r.tour || 'ATP',
    movement: r.movement || 0,
  }));
}

function normalizeTournaments(data) {
  const tournaments = data?.tournaments || data?.data || data || [];
  
  return tournaments.map(t => ({
    id: t.id || t.tournament_id,
    name: t.name || t.tournament_name,
    location: t.location || t.city,
    country: t.country,
    surface: t.surface || 'hard',
    category: t.category || t.level,
    start_date: t.start_date || t.date_start,
    end_date: t.end_date || t.date_end,
    prize_money: t.prize_money,
    tour: t.tour || 'ATP',
  }));
}

function normalizePlayer(data) {
  const player = data?.player || data?.data || data;
  
  return {
    id: player.id || player.player_id,
    name: normalizePlayerName(player.name || player.full_name),
    country: player.country || player.nationality,
    age: player.age,
    height: player.height_cm,
    weight: player.weight_kg,
    hand: player.plays || player.handedness,
    backhand: player.backhand,
    turned_pro: player.turned_pro,
    ranking: {
      current: player.rank || player.current_rank,
      highest: player.highest_rank,
    },
    stats: player.stats || {},
  };
}

function normalizeMatch(data) {
  const match = data?.match || data?.data || data;
  return normalizeMatches([match])[0];
}

function normalizePlayerName(player) {
  if (typeof player === 'string') return player;
  return player?.name || player?.full_name || player?.display_name || 'Unknown';
}

// ============================================================================
// Mock Data (for development/testing)
// ============================================================================

function getMockData(endpoint) {
  console.log('Returning mock data for:', endpoint);
  
  if (endpoint.includes('/live') || endpoint.includes('live-matches')) {
    return {
      matches: generateMockLiveMatches(),
    };
  }
  
  if (endpoint.includes('/schedule') || endpoint.includes('scheduled')) {
    return {
      matches: generateMockUpcomingMatches(),
    };
  }
  
  if (endpoint.includes('/rankings/atp')) {
    return {
      rankings: generateMockRankings('ATP', 100),
    };
  }
  
  if (endpoint.includes('/rankings/wta')) {
    return {
      rankings: generateMockRankings('WTA', 100),
    };
  }
  
  if (endpoint.includes('/rankings/itf')) {
    return {
      rankings: generateMockRankings('ITF', 50),
    };
  }
  
  if (endpoint.includes('/tournaments')) {
    return {
      tournaments: generateMockTournaments(),
    };
  }
  
  return { data: [] };
}

function generateMockLiveMatches() {
  return [
    {
      id: 'mock-live-1',
      tournament_name: 'ATP Paris Masters',
      round: 'Quarterfinals',
      surface: 'hard',
      player_a: 'Novak Djokovic',
      player_b: 'Holger Rune',
      player_a_id: 'djokovic',
      player_b_id: 'rune',
      score: '6-4, 3-2',
      status: 'live',
      is_live: true,
    },
    {
      id: 'mock-live-2',
      tournament_name: 'ATP Paris Masters',
      round: 'Quarterfinals',
      surface: 'hard',
      player_a: 'Carlos Alcaraz',
      player_b: 'Jannik Sinner',
      player_a_id: 'alcaraz',
      player_b_id: 'sinner',
      score: '7-6, 2-1',
      status: 'live',
      is_live: true,
    },
    {
      id: 'mock-live-3',
      tournament_name: 'WTA Finals',
      round: 'Semifinals',
      surface: 'hard',
      player_a: 'Iga Swiatek',
      player_b: 'Aryna Sabalenka',
      player_a_id: 'swiatek',
      player_b_id: 'sabalenka',
      score: '4-6, 6-3, 1-0',
      status: 'live',
      is_live: true,
    },
  ];
}

function generateMockUpcomingMatches() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString();
  
  return [
    {
      id: 'mock-upcoming-1',
      tournament_name: 'ATP Paris Masters',
      round: 'Semifinals',
      surface: 'hard',
      player_a: 'Daniil Medvedev',
      player_b: 'Stefanos Tsitsipas',
      player_a_id: 'medvedev',
      player_b_id: 'tsitsipas',
      score: '',
      status: 'scheduled',
      start_time: tomorrowStr,
      is_live: false,
    },
    {
      id: 'mock-upcoming-2',
      tournament_name: 'ATP Paris Masters',
      round: 'Semifinals',
      surface: 'hard',
      player_a: 'Andrey Rublev',
      player_b: 'Taylor Fritz',
      player_a_id: 'rublev',
      player_b_id: 'fritz',
      score: '',
      status: 'scheduled',
      start_time: tomorrowStr,
      is_live: false,
    },
    {
      id: 'mock-upcoming-3',
      tournament_name: 'WTA Finals',
      round: 'Final',
      surface: 'hard',
      player_a: 'Coco Gauff',
      player_b: 'Elena Rybakina',
      player_a_id: 'gauff',
      player_b_id: 'rybakina',
      score: '',
      status: 'scheduled',
      start_time: tomorrowStr,
      is_live: false,
    },
    {
      id: 'mock-upcoming-4',
      tournament_name: 'ATP Next Gen Finals',
      round: 'Round Robin',
      surface: 'hard',
      player_a: 'Arthur Fils',
      player_b: 'Ben Shelton',
      player_a_id: 'fils',
      player_b_id: 'shelton',
      score: '',
      status: 'scheduled',
      start_time: tomorrowStr,
      is_live: false,
    },
  ];
}

function generateMockTournaments() {
  return [
    { name: 'Australian Open', location: 'Melbourne', surface: 'hard', tour: 'Grand Slam', category: 'Grand Slam' },
    { name: 'French Open', location: 'Paris', surface: 'clay', tour: 'Grand Slam', category: 'Grand Slam' },
    { name: 'Wimbledon', location: 'London', surface: 'grass', tour: 'Grand Slam', category: 'Grand Slam' },
    { name: 'US Open', location: 'New York', surface: 'hard', tour: 'Grand Slam', category: 'Grand Slam' },
    { name: 'ATP Paris Masters', location: 'Paris', surface: 'hard', tour: 'ATP', category: 'Masters 1000' },
    { name: 'ATP Finals', location: 'Turin', surface: 'hard', tour: 'ATP', category: 'Finals' },
    { name: 'WTA Finals', location: 'Cancun', surface: 'hard', tour: 'WTA', category: 'Finals' },
  ];
}

function getMockPlayerDetails(playerIdOrName) {
  const mockPlayers = {
    'djokovic': {
      id: 'djokovic',
      name: 'Novak Djokovic',
      country: 'SRB',
      age: 37,
      height: 188,
      weight: 80,
      hand: 'Right',
      backhand: 'Two-handed',
      turned_pro: 2003,
      ranking: { current: 1, highest: 1 },
      stats: {
        titles: 98,
        win_rate: 0.834,
        hard_win_rate: 0.844,
        clay_win_rate: 0.798,
        grass_win_rate: 0.871,
      },
    },
    'alcaraz': {
      id: 'alcaraz',
      name: 'Carlos Alcaraz',
      country: 'ESP',
      age: 21,
      height: 183,
      weight: 80,
      hand: 'Right',
      backhand: 'Two-handed',
      turned_pro: 2018,
      ranking: { current: 2, highest: 1 },
      stats: {
        titles: 15,
        win_rate: 0.768,
        hard_win_rate: 0.745,
        clay_win_rate: 0.802,
        grass_win_rate: 0.756,
      },
    },
  };
  
  // Return specific player or default
  return mockPlayers[playerIdOrName?.toLowerCase()] || {
    id: playerIdOrName,
    name: playerIdOrName || 'Unknown Player',
    country: 'Unknown',
    age: 25,
    ranking: { current: 50, highest: 30 },
    stats: {},
  };
}

function getMockMatchDetails(matchId) {
  return {
    id: matchId,
    tournament: 'ATP Paris Masters',
    round: 'Quarterfinals',
    surface: 'hard',
    player_a: 'Novak Djokovic',
    player_b: 'Holger Rune',
    score: '6-4, 3-2',
    status: 'live',
    sets: [
      { player_a: 6, player_b: 4 },
      { player_a: 3, player_b: 2 },
    ],
  };
}

function generateMockRankings(tour, count) {
  const atpPlayers = [
    'Novak Djokovic', 'Carlos Alcaraz', 'Daniil Medvedev', 'Jannik Sinner',
    'Andrey Rublev', 'Stefanos Tsitsipas', 'Holger Rune', 'Taylor Fritz',
    'Casper Ruud', 'Grigor Dimitrov', 'Alex de Minaur', 'Hubert Hurkacz',
  ];
  
  const wtaPlayers = [
    'Iga Swiatek', 'Aryna Sabalenka', 'Coco Gauff', 'Elena Rybakina',
    'Jessica Pegula', 'Ons Jabeur', 'Marketa Vondrousova', 'Qinwen Zheng',
    'Maria Sakkari', 'Barbora Krejcikova', 'Jelena Ostapenko', 'Beatriz Haddad Maia',
  ];
  
  const names = tour === 'WTA' ? wtaPlayers : atpPlayers;
  
  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    name: names[i % names.length] || `Player ${i + 1}`,
    points: 10000 - i * 50,
    country: ['ESP', 'SRB', 'USA', 'ITA', 'RUS', 'GRE', 'DEN', 'NOR'][i % 8],
    tour,
  }));
}

// Export all functions
export default {
  getLiveMatches,
  getUpcomingMatches,
  getMatchesByDate,
  getATPRankings,
  getWTARankings,
  getITFRankings,
  getTournaments,
  getPlayerDetails,
  getMatchDetails,
  searchPlayers,
};
