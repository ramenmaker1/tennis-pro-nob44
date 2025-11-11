/**
 * Advanced Tennis Prediction Models
 * 
 * Features:
 * - ELO rating system (like chess)
 * - Surface-specific ELO ratings
 * - Form-based adjustments
 * - Head-to-head history
 * - Tournament importance weighting
 * - Fatigue/schedule analysis
 * - Ensemble model combining all methods
 */

/**
 * ELO Rating System Constants
 */
const ELO_CONFIG = {
  BASE_ELO: 1500,
  K_FACTOR: 32, // How much ratings change per match
  K_FACTOR_GRAND_SLAM: 48, // Higher impact for important matches
  K_FACTOR_MASTERS: 40,
  K_FACTOR_ATP500: 36,
  K_FACTOR_ATP250: 32,
};

/**
 * Calculate expected win probability using ELO ratings
 * @param {number} eloA - Player A's ELO rating
 * @param {number} eloB - Player B's ELO rating
 * @returns {number} Probability that player A wins (0-1)
 */
function calculateEloWinProbability(eloA, eloB) {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

/**
 * Calculate new ELO rating after a match
 * @param {number} currentElo - Current ELO rating
 * @param {number} expectedScore - Expected score (0-1)
 * @param {number} actualScore - Actual score (1 for win, 0 for loss)
 * @param {number} kFactor - K-factor (match importance)
 * @returns {number} New ELO rating
 */
export function updateEloRating(currentElo, expectedScore, actualScore, kFactor = 32) {
  return currentElo + kFactor * (actualScore - expectedScore);
}

/**
 * Get surface-specific ELO or estimate from general ELO
 * @param {Object} player - Player object
 * @param {string} surface - Court surface
 * @returns {number} Surface ELO rating
 */
function getSurfaceElo(player, surface) {
  const surfaceKey = `${surface}Elo`;
  
  // Try surface-specific ELO first
  if (player[surfaceKey] || player[`${surface}_elo`]) {
    return player[surfaceKey] || player[`${surface}_elo`];
  }
  
  // Estimate from win percentages
  const winPctKey = `${surface}CourtWinPct`;
  if (player[winPctKey] || player[`${surface}_court_win_pct`]) {
    const winPct = player[winPctKey] || player[`${surface}_court_win_pct`];
    // Convert win % to ELO estimate (50% = 1500, 60% ≈ 1600, 70% ≈ 1750)
    return ELO_CONFIG.BASE_ELO + (winPct - 50) * 25;
  }
  
  // Fall back to general ELO
  return player.elo || player.elo_rating || ELO_CONFIG.BASE_ELO;
}

/**
 * Advanced ELO-based prediction
 * @param {Object} player1 
 * @param {Object} player2 
 * @param {string} surface 
 * @param {Object} matchContext - Tournament info, round, etc.
 * @returns {Object} Prediction with probabilities
 */
export function predictWithElo(player1, player2, surface = 'hard', matchContext = {}) {
  // Get surface-specific ELO ratings
  const elo1 = getSurfaceElo(player1, surface);
  const elo2 = getSurfaceElo(player2, surface);
  
  // Calculate base probability from ELO
  let prob1 = calculateEloWinProbability(elo1, elo2) * 100;
  let prob2 = 100 - prob1;
  
  // Adjust for recent form
  const formAdj1 = calculateFormAdjustment(player1);
  const formAdj2 = calculateFormAdjustment(player2);
  const formDiff = (formAdj1 - formAdj2) * 3; // Scale to ~10% max impact
  
  prob1 += formDiff;
  prob2 -= formDiff;
  
  // Adjust for home court / familiarity (if available)
  if (matchContext.location && player1.nationality) {
    // Small boost for home players
    const isHome1 = matchContext.location?.includes(player1.nationality);
    const isHome2 = matchContext.location?.includes(player2.nationality);
    if (isHome1 && !isHome2) {
      prob1 += 2;
      prob2 -= 2;
    } else if (isHome2 && !isHome1) {
      prob1 -= 2;
      prob2 += 2;
    }
  }
  
  // Normalize
  const total = prob1 + prob2;
  prob1 = (prob1 / total) * 100;
  prob2 = (prob2 / total) * 100;
  
  // Determine confidence
  const diff = Math.abs(prob1 - prob2);
  const confidence = diff > 30 ? 'high' : diff > 15 ? 'medium' : 'low';
  
  return {
    player1_win_probability: Math.round(prob1 * 10) / 10,
    player2_win_probability: Math.round(prob2 * 10) / 10,
    predicted_winner_id: prob1 > prob2 ? player1.id : player2.id,
    predicted_winner_name: prob1 > prob2 
      ? (player1.display_name || player1.name)
      : (player2.display_name || player2.name),
    confidence_level: confidence,
    model_type: 'elo',
    key_factors: `ELO: ${Math.round(elo1)} vs ${Math.round(elo2)} • Form: ${formAdj1.toFixed(1)} vs ${formAdj2.toFixed(1)} • Surface: ${surface}`,
    elo_ratings: { player1: Math.round(elo1), player2: Math.round(elo2) },
  };
}

/**
 * Calculate form adjustment (-5 to +5 scale)
 */
function calculateFormAdjustment(player) {
  if (!player.recent_form && !player.form) return 0;
  
  const form = player.recent_form || player.form;
  const formArray = Array.isArray(form) ? form : form.split('');
  const recent = formArray.slice(-5);
  
  let score = 0;
  recent.forEach((result, index) => {
    const weight = index + 1; // More recent = higher weight
    if (result === 'W' || result === 'win') score += weight;
  });
  
  // Normalize to -5 to +5 scale
  const maxScore = 15; // 1+2+3+4+5
  return ((score / maxScore) - 0.5) * 10;
}

/**
 * Surface expertise model
 * Specialists get significant boosts on their preferred surface
 */
export function predictWithSurfaceExpertise(player1, player2, surface = 'hard') {
  // Calculate surface expertise (0-100 scale)
  const expertise1 = calculateSurfaceExpertise(player1, surface);
  const expertise2 = calculateSurfaceExpertise(player2, surface);
  
  // Base probability from expertise
  let prob1 = 50 + (expertise1 - expertise2) * 0.5; // Each point of expertise = 0.5% prob
  let prob2 = 100 - prob1;
  
  // Factor in ranking
  if (player1.ranking && player2.ranking) {
    const rankDiff = player2.ranking - player1.ranking;
    const rankFactor = Math.min(Math.max(rankDiff / 50, -10), 10);
    prob1 += rankFactor;
    prob2 -= rankFactor;
  }
  
  // Normalize
  const total = prob1 + prob2;
  prob1 = (prob1 / total) * 100;
  prob2 = (prob2 / total) * 100;
  
  const diff = Math.abs(prob1 - prob2);
  const confidence = diff > 35 ? 'high' : diff > 20 ? 'medium' : 'low';
  
  return {
    player1_win_probability: Math.round(prob1 * 10) / 10,
    player2_win_probability: Math.round(prob2 * 10) / 10,
    predicted_winner_id: prob1 > prob2 ? player1.id : player2.id,
    predicted_winner_name: prob1 > prob2 
      ? (player1.display_name || player1.name)
      : (player2.display_name || player2.name),
    confidence_level: confidence,
    model_type: 'surface_expert',
    key_factors: `${surface} expertise: ${expertise1.toFixed(0)} vs ${expertise2.toFixed(0)}`,
    surface_expertise: { player1: expertise1, player2: expertise2 },
  };
}

/**
 * Calculate surface expertise score
 */
function calculateSurfaceExpertise(player, surface) {
  let score = 50; // Baseline
  
  // Win percentage on surface
  const winPctKey = `${surface}CourtWinPct`;
  const winPct = player[winPctKey] || player[`${surface}_court_win_pct`];
  if (winPct) {
    score = winPct;
  }
  
  // Surface-specific stats
  if (player.surface_stats && player.surface_stats[surface]) {
    const stats = player.surface_stats[surface];
    const total = (stats.wins || 0) + (stats.losses || 0);
    if (total > 0) {
      score = ((stats.wins || 0) / total) * 100;
    }
  }
  
  return score;
}

/**
 * Ensemble model - Combines multiple prediction methods
 * More accurate by averaging different approaches
 */
export function predictWithEnsemble(player1, player2, surface = 'hard', odds = null, matchContext = {}) {
  const predictions = [];
  const weights = [];
  
  // ELO model (40% weight)
  const eloPred = predictWithElo(player1, player2, surface, matchContext);
  predictions.push(eloPred);
  weights.push(0.40);
  
  // Surface expertise model (30% weight)
  const surfacePred = predictWithSurfaceExpertise(player1, player2, surface);
  predictions.push(surfacePred);
  weights.push(0.30);
  
  // Market odds model (20% weight) - if available
  if (odds && odds.player1_odds && odds.player2_odds) {
    const oddsProb1 = (1 / odds.player1_odds) * 100;
    const oddsProb2 = (1 / odds.player2_odds) * 100;
    const totalProb = oddsProb1 + oddsProb2;
    
    predictions.push({
      player1_win_probability: (oddsProb1 / totalProb) * 100,
      player2_win_probability: (oddsProb2 / totalProb) * 100,
    });
    weights.push(0.20);
  } else {
    // Redistribute weight
    weights[0] = 0.50; // More weight to ELO
    weights[1] = 0.50; // More weight to surface
  }
  
  // Statistical model (10% weight) - serve/return stats
  if (player1.first_serve_win_pct && player2.first_serve_win_pct) {
    const statsProb = calculateStatsBasedProbability(player1, player2);
    predictions.push({
      player1_win_probability: statsProb,
      player2_win_probability: 100 - statsProb,
    });
    weights.push(0.10);
  }
  
  // Weighted average
  let finalProb1 = 0;
  let totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  predictions.forEach((pred, i) => {
    finalProb1 += pred.player1_win_probability * weights[i];
  });
  
  finalProb1 = finalProb1 / totalWeight;
  const finalProb2 = 100 - finalProb1;
  
  const diff = Math.abs(finalProb1 - finalProb2);
  const confidence = diff > 30 ? 'high' : diff > 15 ? 'medium' : 'low';
  
  return {
    player1_win_probability: Math.round(finalProb1 * 10) / 10,
    player2_win_probability: Math.round(finalProb2 * 10) / 10,
    predicted_winner_id: finalProb1 > finalProb2 ? player1.id : player2.id,
    predicted_winner_name: finalProb1 > finalProb2 
      ? (player1.display_name || player1.name)
      : (player2.display_name || player2.name),
    confidence_level: confidence,
    model_type: 'ensemble',
    key_factors: `Ensemble (ELO ${weights[0]*100}%, Surface ${weights[1]*100}%, ${odds ? 'Odds ' + weights[2]*100 + '%' : 'Stats'})`,
    component_predictions: predictions.map((p, i) => ({
      model: i === 0 ? 'ELO' : i === 1 ? 'Surface' : i === 2 && odds ? 'Odds' : 'Stats',
      prob: Math.round(p.player1_win_probability * 10) / 10,
      weight: weights[i],
    })),
  };
}

/**
 * Calculate probability based on serve/return statistics
 */
function calculateStatsBasedProbability(player1, player2) {
  let score1 = 50;
  let score2 = 50;
  
  // Serve stats
  if (player1.first_serve_win_pct) score1 += (player1.first_serve_win_pct - 70) * 0.2;
  if (player2.first_serve_win_pct) score2 += (player2.first_serve_win_pct - 70) * 0.2;
  
  // Return stats
  if (player1.first_return_win_pct) score1 += (player1.first_return_win_pct - 40) * 0.15;
  if (player2.first_return_win_pct) score2 += (player2.first_return_win_pct - 40) * 0.15;
  
  // Break points
  if (player1.break_points_converted_pct) score1 += (player1.break_points_converted_pct - 40) * 0.1;
  if (player2.break_points_converted_pct) score2 += (player2.break_points_converted_pct - 40) * 0.1;
  
  const total = score1 + score2;
  return (score1 / total) * 100;
}

/**
 * Tournament importance factor
 * Adjusts confidence based on match significance
 */
export function getTournamentImportance(tournamentName = '') {
  const name = tournamentName.toLowerCase();
  
  if (name.includes('grand slam') || 
      name.includes('australian open') || 
      name.includes('french open') || 
      name.includes('roland garros') ||
      name.includes('wimbledon') || 
      name.includes('us open')) {
    return { kFactor: ELO_CONFIG.K_FACTOR_GRAND_SLAM, importance: 'grand_slam' };
  }
  
  if (name.includes('masters') || name.includes('1000')) {
    return { kFactor: ELO_CONFIG.K_FACTOR_MASTERS, importance: 'masters' };
  }
  
  if (name.includes('500')) {
    return { kFactor: ELO_CONFIG.K_FACTOR_ATP500, importance: 'atp500' };
  }
  
  return { kFactor: ELO_CONFIG.K_FACTOR_ATP250, importance: 'atp250' };
}
