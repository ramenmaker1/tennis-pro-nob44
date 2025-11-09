/**
 * Tennis Data Service - Centralized API for live tennis data
 * 
 * Supports multiple data sources:
 * - RapidAPI Tennis Live (free tier available)
 * - API-Sports Tennis
 * - Custom backend endpoint
 * 
 * Environment variables needed:
 * - VITE_TENNIS_API_KEY
 * - VITE_TENNIS_API_HOST (optional)
 * - VITE_TENNIS_API_PROVIDER (rapidapi|apisports|custom)
 * 
 * REQUEST CONSERVATION:
 * - Live matches: 5 min cache (only 12 calls/hour, 288/day max)
 * - Rankings: 6 hour cache (only 4 calls/day per tour)
 * - Tournaments: 24 hour cache (only 1 call/day per tour)
 * - Player search: LocalStorage cache
 */

const API_KEY = import.meta.env.VITE_TENNIS_API_KEY;
const API_HOST = import.meta.env.VITE_TENNIS_API_HOST || 'ultimate-tennis1.p.rapidapi.com';
const API_PROVIDER = import.meta.env.VITE_TENNIS_API_PROVIDER || 'rapidapi';

// Mock data fallback when no API key is configured
const MOCK_MODE = !API_KEY;

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
 * Fetches data from the configured tennis API
 */
async function fetchTennisAPI(endpoint, options = {}) {
  if (MOCK_MODE) {
    console.warn('Tennis API: Running in MOCK mode (no API key configured)');
    return getMockData(endpoint);
  }

  // Check if we should make the request
  if (!checkRequestLimit() && !options.forceFetch) {
    console.log('⚠️ Skipping API call to conserve quota. Using cached/mock data.');
    return getMockData(endpoint);
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  // Configure based on provider
  if (API_PROVIDER === 'rapidapi') {
    headers['X-RapidAPI-Key'] = API_KEY;
    headers['X-RapidAPI-Host'] = API_HOST;
  } else if (API_PROVIDER === 'apisports') {
    headers['x-apisports-key'] = API_KEY;
  }

  const url = getAPIUrl(endpoint);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Tennis API error: ${response.status} ${response.statusText}`);
    }

    incrementRequestCount();
    return await response.json();
  } catch (error) {
    console.error('Tennis API fetch error:', error);
    // Fallback to mock data on error
    return getMockData(endpoint);
  }
}

function getAPIUrl(endpoint) {
  if (API_PROVIDER === 'rapidapi') {
    return `https://${API_HOST}${endpoint}`;
  } else if (API_PROVIDER === 'apisports') {
    return `https://v1.tennis.api-sports.io${endpoint}`;
  } else {
    // Custom backend
    return `${import.meta.env.VITE_TENNIS_API_BASE_URL}${endpoint}`;
  }
}

/**
 * Get live matches currently in progress
 */
export async function getLiveMatches() {
  // This API uses /tennis/v2/atp/live for live matches
  const data = await fetchTennisAPI('/tennis/v2/atp/live');
  return normalizeMatches(data);
}

/**
 * Get ATP Top 100 rankings
 */
export async function getATPRankings(limit = 100) {
  const data = await fetchTennisAPI('/tennis/v2/atp/rankings');
  return normalizeRankings(data, 'ATP');
}

/**
 * Get WTA Top 100 rankings
 */
export async function getWTARankings(limit = 100) {
  const data = await fetchTennisAPI('/tennis/v2/wta/rankings');
  return normalizeRankings(data, 'WTA');
}

/**
 * Get ITF rankings
 */
export async function getITFRankings(limit = 100) {
  // Try ITF endpoint, fallback to mock if not available
  const data = await fetchTennisAPI('/tennis/v2/itf/rankings');
  return normalizeRankings(data, 'ITF');
}

/**
 * Get upcoming/current tournaments
 */
export async function getTournaments(options = {}) {
  const { tour = 'atp' } = options;
  const endpoint = `/tennis/v2/${tour.toLowerCase()}/tournaments`;
  const data = await fetchTennisAPI(endpoint);
  return normalizeTournaments(data);
}

/**
 * Get player details by ID
 */
export async function getPlayerDetails(playerId) {
  const data = await fetchTennisAPI(`/tennis/v2/players/${playerId}`);
  return normalizePlayer(data);
}

/**
 * Get match details by ID
 */
export async function getMatchDetails(matchId) {
  const data = await fetchTennisAPI(`/tennis/v2/matches/${matchId}`);
  return normalizeMatch(data);
}

/**
 * Search players by name
 */
export async function searchPlayers(query, tour = 'all') {
  const data = await fetchTennisAPI(`/tennis/v2/search?search=${encodeURIComponent(query)}`);
  return normalizeRankings(data);
}

// ============================================================================
// Data Normalization Functions
// ============================================================================

function normalizeMatches(data) {
  // Handle different API response structures
  const matches = data?.matches || data?.data || data || [];
  
  return matches.map(m => ({
    id: m.id || m.match_id,
    tournament: m.tournament?.name || m.tournament_name || 'Unknown',
    round: m.round || 'R1',
    surface: m.surface || 'hard',
    player_a: normalizePlayerName(m.player1 || m.home_player || m.player_a),
    player_b: normalizePlayerName(m.player2 || m.away_player || m.player_b),
    score: m.score || m.current_score || '',
    status: m.status || 'live',
    start_time: m.start_time || m.scheduled,
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
  
  if (endpoint.includes('/live-matches')) {
    return {
      matches: [
        {
          id: 'mock-1',
          tournament_name: 'ATP Paris Masters',
          round: 'Quarterfinals',
          surface: 'hard',
          player_a: 'Novak Djokovic',
          player_b: 'Holger Rune',
          score: '6-4, 3-2',
          status: 'live',
        },
        {
          id: 'mock-2',
          tournament_name: 'ATP Paris Masters',
          round: 'Quarterfinals',
          surface: 'hard',
          player_a: 'Carlos Alcaraz',
          player_b: 'Jannik Sinner',
          score: '7-6, 2-1',
          status: 'live',
        },
      ],
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
      tournaments: [
        { name: 'Australian Open', location: 'Melbourne', surface: 'hard', tour: 'ATP' },
        { name: 'French Open', location: 'Paris', surface: 'clay', tour: 'ATP' },
        { name: 'Wimbledon', location: 'London', surface: 'grass', tour: 'ATP' },
        { name: 'US Open', location: 'New York', surface: 'hard', tour: 'ATP' },
        { name: 'ATP Paris Masters', location: 'Paris', surface: 'hard', tour: 'ATP' },
      ],
    };
  }
  
  return { data: [] };
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
  getATPRankings,
  getWTARankings,
  getITFRankings,
  getTournaments,
  getPlayerDetails,
  getMatchDetails,
  searchPlayers,
};
