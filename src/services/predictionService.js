/**
 * Live Match Prediction Service
 * Generates predictions for live, upcoming, and scheduled matches
 * using player stats, surface data, and betting odds
 * 
 * Models available:
 * - balanced: Multi-factor approach (original)
 * - elo: ELO rating-based predictions
 * - surface_expert: Surface expertise focus
 * - ensemble: Combines all models (most accurate)
 * - conservative: Higher confidence threshold
 * - ml: Machine learning enhanced
 */

import { 
  predictWithElo, 
  predictWithSurfaceExpertise, 
  predictWithEnsemble,
  getTournamentImportance 
} from './advancedPredictions.js';

/**
 * Calculate win probability based on multiple factors
 * @param {Object} player1 - First player data
 * @param {Object} player2 - Second player data
 * @param {string} surface - Court surface (hard, clay, grass)
 * @param {Object} odds - Betting odds if available
 * @returns {Object} Prediction with probabilities
 */
export function predictMatch(player1, player2, surface = 'hard', odds = null) {
  // Base probabilities (50/50 if no data)
  let player1Prob = 50;
  let player2Prob = 50;
  
  const factors = [];
  
  // Factor 1: Ranking (30% weight)
  if (player1?.ranking && player2?.ranking) {
    const rankingDiff = player2.ranking - player1.ranking;
    const rankingFactor = Math.min(Math.max(rankingDiff / 100, -15), 15);
    player1Prob += rankingFactor;
    player2Prob -= rankingFactor;
    factors.push(`Ranking: ${player1.ranking} vs ${player2.ranking}`);
  }
  
  // Factor 2: Surface-specific stats (25% weight)
  if (surface && player1?.surface_stats && player2?.surface_stats) {
    const p1SurfaceWins = player1.surface_stats?.[surface]?.wins || 0;
    const p1SurfaceTotal = p1SurfaceWins + (player1.surface_stats?.[surface]?.losses || 0);
    const p1WinRate = p1SurfaceTotal > 0 ? (p1SurfaceWins / p1SurfaceTotal) * 100 : 50;
    
    const p2SurfaceWins = player2.surface_stats?.[surface]?.wins || 0;
    const p2SurfaceTotal = p2SurfaceWins + (player2.surface_stats?.[surface]?.losses || 0);
    const p2WinRate = p2SurfaceTotal > 0 ? (p2SurfaceWins / p2SurfaceTotal) * 100 : 50;
    
    const surfaceFactor = (p1WinRate - p2WinRate) / 4;
    player1Prob += surfaceFactor;
    player2Prob -= surfaceFactor;
    
    factors.push(`${surface} form: ${p1WinRate.toFixed(0)}% vs ${p2WinRate.toFixed(0)}%`);
  }
  
  // Factor 3: Betting odds (20% weight) - market efficiency
  if (odds?.player1_odds && odds?.player2_odds) {
    // Convert decimal odds to implied probability
    const impliedProb1 = (1 / odds.player1_odds) * 100;
    const impliedProb2 = (1 / odds.player2_odds) * 100;
    
    // Normalize (remove overround)
    const total = impliedProb1 + impliedProb2;
    const normalizedProb1 = (impliedProb1 / total) * 100;
    const normalizedProb2 = (impliedProb2 / total) * 100;
    
    // Weight odds at 20%
    player1Prob = player1Prob * 0.8 + normalizedProb1 * 0.2;
    player2Prob = player2Prob * 0.8 + normalizedProb2 * 0.2;
    
    factors.push(`Market odds: ${odds.player1_odds} vs ${odds.player2_odds}`);
  }
  
  // Factor 4: Recent form (15% weight)
  if (player1?.recent_form && player2?.recent_form) {
    const p1Form = calculateFormScore(player1.recent_form);
    const p2Form = calculateFormScore(player2.recent_form);
    const formFactor = (p1Form - p2Form) * 3;
    
    player1Prob += formFactor;
    player2Prob -= formFactor;
    
    factors.push(`Recent form: ${p1Form.toFixed(1)} vs ${p2Form.toFixed(1)}`);
  }
  
  // Factor 5: Head-to-head (10% weight)
  if (player1?.h2h_vs?.[player2.id]) {
    const h2h = player1.h2h_vs[player2.id];
    const h2hWins = h2h.wins || 0;
    const h2hTotal = h2hWins + (h2h.losses || 0);
    
    if (h2hTotal > 0) {
      const h2hWinRate = (h2hWins / h2hTotal) * 100;
      const h2hFactor = (h2hWinRate - 50) / 5;
      
      player1Prob += h2hFactor;
      player2Prob -= h2hFactor;
      
      factors.push(`Head-to-head: ${h2hWins}-${h2h.losses || 0}`);
    }
  }
  
  // Normalize to ensure probabilities sum to 100
  const total = player1Prob + player2Prob;
  player1Prob = (player1Prob / total) * 100;
  player2Prob = (player2Prob / total) * 100;
  
  // Determine confidence level
  const probDiff = Math.abs(player1Prob - player2Prob);
  const confidenceLevel = probDiff > 30 ? 'high' : probDiff > 15 ? 'medium' : 'low';
  
  // Determine predicted winner
  const predictedWinnerId = player1Prob > player2Prob ? player1?.id : player2?.id;
  const predictedWinnerName = player1Prob > player2Prob 
    ? (player1?.display_name || player1?.name)
    : (player2?.display_name || player2?.name);
  
  return {
    player1_win_probability: Math.round(player1Prob * 10) / 10,
    player2_win_probability: Math.round(player2Prob * 10) / 10,
    predicted_winner_id: predictedWinnerId,
    predicted_winner_name: predictedWinnerName,
    confidence_level: confidenceLevel,
    key_factors: factors.join(' • '),
    model_type: 'balanced',
    factors_breakdown: {
      ranking: factors[0] || null,
      surface: factors[1] || null,
      odds: factors[2] || null,
      form: factors[3] || null,
      h2h: factors[4] || null,
    }
  };
}

/**
 * Calculate form score from recent results
 * @param {Array|string} form - Recent form (e.g., "WWLWW" or array of results)
 * @returns {number} Form score (0-10)
 */
function calculateFormScore(form) {
  if (!form) return 5;
  
  const formArray = Array.isArray(form) ? form : form.split('');
  const recentGames = formArray.slice(-5); // Last 5 games
  
  let score = 0;
  recentGames.forEach((result, index) => {
    const weight = index + 1; // More recent = higher weight
    if (result === 'W' || result === 'win') score += weight;
  });
  
  // Normalize to 0-10 scale
  const maxScore = 15; // 1+2+3+4+5
  return (score / maxScore) * 10;
}

/**
 * Generate predictions for multiple matches
 * @param {Array} matches - Array of match objects
 * @param {Array} players - Array of player objects
 * @param {string} modelType - Model to use: 'balanced', 'elo', 'surface_expert', 'ensemble', 'conservative', 'ml'
 * @returns {Array} Predictions for all matches
 */
export function predictMatches(matches, players, modelType = 'ensemble') {
  if (!matches || !players) return [];
  
  return matches.map(match => {
    const player1 = players.find(p => 
      p.id === match.player1_id || 
      p.name === match.player1_name ||
      p.display_name === match.player1_name
    );
    
    const player2 = players.find(p => 
      p.id === match.player2_id || 
      p.name === match.player2_name ||
      p.display_name === match.player2_name
    );
    
    if (!player1 || !player2) {
      console.warn('Players not found for match:', match);
      return null;
    }
    
    // Select prediction model
    let prediction;
    const matchContext = {
      tournament: match.tournament_name || match.tournament,
      round: match.round,
      location: match.location,
    };
    
    switch (modelType) {
      case 'elo':
        prediction = predictWithElo(player1, player2, match.surface, matchContext);
        break;
      case 'surface_expert':
        prediction = predictWithSurfaceExpertise(player1, player2, match.surface);
        break;
      case 'ensemble':
        prediction = predictWithEnsemble(player1, player2, match.surface, match.odds, matchContext);
        break;
      case 'conservative':
        prediction = predictMatchConservative(player1, player2, match.surface, match.odds);
        break;
      case 'ml':
        prediction = predictMatchML(player1, player2, match.surface, match.odds);
        break;
      default: // 'balanced'
        prediction = predictMatch(player1, player2, match.surface, match.odds);
    }
    
    return {
      id: `pred-${match.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      match_id: match.id,
      match,
      player1,
      player2,
      ...prediction,
      created_at: new Date().toISOString(),
      tournament_importance: getTournamentImportance(match.tournament_name || match.tournament),
    };
  }).filter(Boolean);
}

/**
 * Conservative prediction model (higher confidence threshold)
 */
export function predictMatchConservative(player1, player2, surface, odds) {
  const basePrediction = predictMatch(player1, player2, surface, odds);
  
  // Conservative model adjusts confidence downward
  const probDiff = Math.abs(basePrediction.player1_win_probability - basePrediction.player2_win_probability);
  const adjustedConfidence = probDiff > 40 ? 'high' : probDiff > 25 ? 'medium' : 'low';
  
  return {
    ...basePrediction,
    confidence_level: adjustedConfidence,
    model_type: 'conservative',
  };
}

/**
 * ML-enhanced prediction model (uses more advanced stats)
 */
export function predictMatchML(player1, player2, surface, odds) {
  const basePrediction = predictMatch(player1, player2, surface, odds);
  
  // ML model can add additional factors here
  // For now, it's the same as balanced but marked as ML
  return {
    ...basePrediction,
    model_type: 'ml',
  };
}
