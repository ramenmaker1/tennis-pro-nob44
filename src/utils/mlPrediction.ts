import type { Match, Player, ConfidenceLevel } from '../data/DataClient';
import type { PredictionBase, MLFeatures } from './types';
import { round2, generatePointByPointData } from './predictionUtils';

const getConfidenceLevel = (maxProb: number): ConfidenceLevel => {
  if (maxProb < 0.55) return 'low';
  if (maxProb <= 0.7) return 'medium';
  return 'high';
};

const getDefaultWeights = () => ({
  rank: 0.4,
  serve: 0.2,
  return: 0.2,
  surface: 0.2,
});

const extractFeatures = (p1: Player, p2: Player, match: Match): MLFeatures => {
  return {
    rank_diff: (p2.current_rank || 100) - (p1.current_rank || 100),
    serve_diff: ((p1.first_serve_win_pct || 65) - (p2.first_serve_win_pct || 65)) / 100,
    return_diff: ((p1.first_return_win_pct || 35) - (p2.first_return_win_pct || 35)) / 100,
    surface_pref_diff: getSurfacePreferenceDiff(p1, p2, match.surface || 'hard'),
    best_of: match.best_of || 3,
  };
};

const getSurfacePreferenceDiff = (p1: Player, p2: Player, surface: string): number => {
  const getSurfaceRating = (p: Player, s: string): number => {
    switch (s) {
      case 'hard':
        return p.hard_court_win_pct || 50;
      case 'clay':
        return p.clay_court_win_pct || 50;
      case 'grass':
        return p.grass_court_win_pct || 50;
      default:
        return 50;
    }
  };
  return (getSurfaceRating(p1, surface) - getSurfaceRating(p2, surface)) / 100;
};

const calculateMLProbability = (features: MLFeatures, weights: Record<string, number>) => {
  const rankEffect =
    -Math.sign(features.rank_diff) * Math.log(Math.abs(features.rank_diff) + 1) * weights.rank;
  const serveEffect = features.serve_diff * weights.serve;
  const returnEffect = features.return_diff * weights.return;
  const surfaceEffect = features.surface_pref_diff * weights.surface;

  const total = rankEffect + serveEffect + returnEffect + surfaceEffect;
  const p1Prob = Math.min(0.99, Math.max(0.01, 0.5 + total));
  const p2Prob = 1 - p1Prob;

  return { p1Prob, p2Prob };
};

const generateMLPointData = (
  p1Prob: number,
  p2Prob: number,
  bestOf: number,
): Record<string, unknown>[] => {
  return generatePointByPointData(p1Prob, p2Prob, bestOf);
};

/**
 * Generates a single ML-enhanced prediction for a match
 * Returns raw prediction object; caller persists it
 */
export const generateMLPrediction = (
  match: Match,
  player1: Player,
  player2: Player,
  weights: Record<string, number> | null = null,
): PredictionBase => {
  if (!match || !player1 || !player2) {
    throw new Error('Match and both players required for ML prediction');
  }

  const features = extractFeatures(player1, player2, match);
  const w = weights || getDefaultWeights();
  const { p1Prob, p2Prob } = calculateMLProbability(features, w);
  const predictedWinnerId = p1Prob > p2Prob ? player1.id : player2.id;
  const maxProb = Math.max(p1Prob, p2Prob);
  const confidence_level = getConfidenceLevel(maxProb);
  const predicted_sets =
    match.best_of === 5 ? (maxProb > 0.65 ? '3-0' : '3-1') : maxProb > 0.65 ? '2-0' : '2-1';
  const prob_straight_sets = Math.round((maxProb - 0.5) * 200);
  const prob_deciding_set = Math.max(0, 100 - prob_straight_sets);
  const createdAt = new Date().toISOString();

  return {
    match_id: match.id,
    model_type: 'ml',
    predicted_winner_id: predictedWinnerId,
    player1_win_probability: round2(p1Prob),
    player2_win_probability: round2(p2Prob),
    confidence_level,
    predicted_sets,
    prob_straight_sets,
    prob_deciding_set,
    point_by_point_data: generateMLPointData(p1Prob, p2Prob, match.best_of || 3),
    created_at: createdAt,
    created_date: createdAt,
  };
};
