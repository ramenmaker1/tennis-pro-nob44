/**
 * Generates a single ML-enhanced prediction for a match
 * Returns raw prediction object; caller persists it
 */
export const generateMLPrediction = (match, player1, player2, weights = null) => {
  if (!match || !player1 || !player2) {
<<<<<<< HEAD
    throw new Error('Match and both players required for ML prediction');
=======
    throw new Error("Match and both players required for ML prediction");
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  }

  const features = extractFeatures(player1, player2, match);
  const w = weights || getDefaultWeights();
  const { p1Prob, p2Prob } = calculateMLProbability(features, w);
  const predictedWinnerId = p1Prob > p2Prob ? player1.id : player2.id;
  const maxProb = Math.max(p1Prob, p2Prob);
<<<<<<< HEAD
  const confidence_level = maxProb < 0.55 ? 'low' : maxProb <= 0.7 ? 'medium' : 'high';
  const predicted_sets =
    match.best_of === 5 ? (maxProb > 0.65 ? '3-0' : '3-1') : maxProb > 0.65 ? '2-0' : '2-1';
=======
  const confidence_level = maxProb < 0.55 ? "low" : maxProb <= 0.7 ? "medium" : "high";
  const predicted_sets = match.best_of === 5 ? (maxProb > 0.65 ? "3-0" : "3-1") : (maxProb > 0.65 ? "2-0" : "2-1");
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  const prob_straight_sets = Math.round((maxProb - 0.5) * 200);
  const prob_deciding_set = Math.max(0, 100 - prob_straight_sets);
  const createdAt = new Date().toISOString();

  return {
    match_id: match.id,
<<<<<<< HEAD
    model_type: 'ml',
=======
    model_type: "ml",
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
    predicted_winner_id: predictedWinnerId,
    player1_win_probability: round2(p1Prob),
    player2_win_probability: round2(p2Prob),
    confidence_level,
    predicted_sets,
    prob_straight_sets,
    prob_deciding_set,
    point_by_point_data: generateMLPointData(p1Prob, p2Prob, match.best_of),
    ml_features_used: Object.keys(features),
    created_at: createdAt,
    created_date: createdAt,
  };
};

const round2 = (n) => Math.round(n * 100) / 100;

const extractFeatures = (p1, p2, match) => {
  return {
    rank_diff: (p2.current_rank || 100) - (p1.current_rank || 100),
    serve_diff: ((p1.first_serve_win_pct || 65) - (p2.first_serve_win_pct || 65)) / 100,
    return_diff: ((p1.first_return_win_pct || 35) - (p2.first_return_win_pct || 35)) / 100,
    surface_pref_diff: getSurfacePreferenceDiff(p1, p2, match.surface),
    best_of: match.best_of || 3,
  };
};

const getSurfacePreferenceDiff = (p1, p2, surface) => {
  if (!surface) return 0;
  const key = `${surface}_court_win_pct`;
  const a = p1[key] || 60;
  const b = p2[key] || 60;
  return (a - b) / 100;
};

const getDefaultWeights = () => ({
  rank_diff: -0.3, // higher rank number worse
  serve_diff: 0.25,
  return_diff: 0.2,
  surface_pref_diff: 0.15,
  intercept: 0.5,
});

const calculateMLProbability = (features, weights) => {
  let score = weights.intercept || 0.5;
  for (const k of Object.keys(features)) {
    if (weights[k]) score += features[k] * weights[k];
  }
  let p1Prob = 1 / (1 + Math.exp(-score * 5));
  p1Prob = Math.max(0.35, Math.min(0.75, p1Prob));
  return { p1Prob, p2Prob: 1 - p1Prob };
};

const generateMLPointData = (p1BaseProb, _p2Base, bestOf) => {
  const numGames = bestOf === 5 ? 50 : 30;
  const data = [];
  for (let game = 1; game <= numGames; game++) {
    const adaptive = Math.sin((game / numGames) * Math.PI) * 0.05;
    let p1Game = Math.max(0.3, Math.min(0.7, p1BaseProb + adaptive));
    data.push({
      game,
      player1_probability: round2(p1Game),
      player2_probability: round2(1 - p1Game),
    });
  }
  return data;
};
<<<<<<< HEAD
=======

>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
