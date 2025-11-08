/**
 * Generates three predictions for a match using different models
 * Returns raw prediction objects; caller is responsible for persisting
 */
export const generateAllPredictions = (match, player1, player2) => {
  if (!match || !player1 || !player2) {
    throw new Error('Match and both players required for prediction generation');
  }

  const base = calculateBaseProbabilities(player1, player2, match);
  const models = [
    { type: 'conservative', variance: 0.05, favoriteBoost: 1.08 },
    { type: 'balanced', variance: 0.1, favoriteBoost: 1.0 },
    { type: 'aggressive', variance: 0.15, favoriteBoost: 0.95 },
  ];

  return models.map((model) => {
    const { p1Prob, p2Prob } = applyModelVariance(base, model, player1, player2);
    const predictedWinnerId = p1Prob > p2Prob ? player1.id : player2.id;
    const maxProb = Math.max(p1Prob, p2Prob);
    const confidence_level = maxProb < 0.55 ? 'low' : maxProb <= 0.7 ? 'medium' : 'high';

    // Simple sets estimate
    const predicted_sets =
      match.best_of === 5 ? (maxProb > 0.65 ? '3-0' : '3-1') : maxProb > 0.65 ? '2-0' : '2-1';

    const prob_straight_sets = Math.round((maxProb - 0.5) * 200);
    const prob_deciding_set = Math.max(0, 100 - prob_straight_sets);

    const createdAt = new Date().toISOString();

    return {
      match_id: match.id,
      model_type: model.type,
      predicted_winner_id: predictedWinnerId,
      player1_win_probability: round2(p1Prob),
      player2_win_probability: round2(p2Prob),
      confidence_level,
      predicted_sets,
      prob_straight_sets,
      prob_deciding_set,
      point_by_point_data: generatePointByPointData(p1Prob, p2Prob, match.best_of),
      created_at: createdAt,
      created_date: createdAt,
    };
  });
};

const round2 = (n) => Math.round(n * 100) / 100;

// Base probabilities from a few simple features present in player records
const calculateBaseProbabilities = (p1, p2, match) => {
  // Start at coin flip
  let p1Prob = 0.5;

  // Ranking advantage (if available, lower is better)
  if (p1.current_rank && p2.current_rank) {
    const diff = p2.current_rank - p1.current_rank; // positive favors p1
    p1Prob += Math.max(-0.2, Math.min(0.2, diff / 200));
  }

  // Serve/return deltas (stats are percentages 0-100 in this app)
  if (p1.first_serve_win_pct && p2.first_serve_win_pct) {
    p1Prob += Math.max(
      -0.1,
      Math.min(0.1, ((p1.first_serve_win_pct - p2.first_serve_win_pct) / 100) * 0.3)
    );
  }
  if (p1.first_return_win_pct && p2.first_return_win_pct) {
    p1Prob += Math.max(
      -0.1,
      Math.min(0.1, ((p1.first_return_win_pct - p2.first_return_win_pct) / 100) * 0.3)
    );
  }

  // Surface-specific adjustment
  if (match.surface) {
    const key = `${match.surface}_court_win_pct`;
    if (p1[key] && p2[key]) {
      p1Prob += Math.max(-0.1, Math.min(0.1, ((p1[key] - p2[key]) / 100) * 0.2));
    }
  }

  // Clamp to a reasonable base range
  p1Prob = Math.max(0.35, Math.min(0.65, p1Prob));
  return { p1: p1Prob, p2: 1 - p1Prob };
};

const applyModelVariance = (base, model, p1, p2) => {
  let p1Prob = base.p1;
  if (p1.current_rank && p2.current_rank) {
    const p1Fav = p1.current_rank < p2.current_rank;
    p1Prob = p1Fav ? p1Prob * model.favoriteBoost : p1Prob / model.favoriteBoost;
  }
  p1Prob += (Math.random() - 0.5) * model.variance;
  p1Prob = Math.max(0.35, Math.min(0.75, p1Prob));
  const p2Prob = 1 - p1Prob;
  return { p1Prob, p2Prob };
};

const generatePointByPointData = (p1Base, _p2Base, bestOf) => {
  const numGames = bestOf === 5 ? 50 : 30;
  const data = [];
  let momentum = 0;
  for (let game = 1; game <= numGames; game++) {
    momentum = Math.max(-0.15, Math.min(0.15, momentum + (Math.random() - 0.5) * 0.1));
    let p1Game = Math.max(0.3, Math.min(0.7, p1Base + momentum));
    data.push({
      game,
      player1_probability: round2(p1Game),
      player2_probability: round2(1 - p1Game),
    });
    momentum *= 0.95;
  }
  return data;
};
