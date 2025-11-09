import type { Match, Player, ConfidenceLevel } from '../data/DataClient';
import type { PredictionBase, ModelConfig } from './types';
import {
  round2,
  calculateBaseProbabilities,
  applyModelVariance,
  generatePointByPointData,
} from './predictionUtils';

const getConfidenceLevel = (maxProb: number): ConfidenceLevel => {
  if (maxProb < 0.55) return 'low';
  if (maxProb <= 0.7) return 'medium';
  return 'high';
};

/**
 * Generates three predictions for a match using different models
 * Returns raw prediction objects; caller is responsible for persisting
 */
export const generateAllPredictions = (
  match: Match,
  player1: Player,
  player2: Player,
): PredictionBase[] => {
  if (!match || !player1 || !player2) {
    throw new Error('Match and both players required for prediction generation');
  }

  const base = calculateBaseProbabilities(player1, player2, match);
  const models: ModelConfig[] = [
    { type: 'conservative', variance: 0.05, favoriteBoost: 1.08 },
    { type: 'balanced', variance: 0.1, favoriteBoost: 1.0 },
    { type: 'aggressive', variance: 0.15, favoriteBoost: 0.95 },
  ];

  return models.map((model): PredictionBase => {
    const { p1Prob, p2Prob } = applyModelVariance(base, model, player1, player2);
    const predictedWinnerId = p1Prob > p2Prob ? player1.id : player2.id;
    const maxProb = Math.max(p1Prob, p2Prob);
    const confidence_level = getConfidenceLevel(maxProb);

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
      point_by_point_data: generatePointByPointData(p1Prob, p2Prob, match.best_of || 3),
      created_at: createdAt,
      created_date: createdAt,
    };
  });
};
