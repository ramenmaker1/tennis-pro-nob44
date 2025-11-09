import type { Match, Player } from '../data/DataClient';
import type { ModelConfig } from './types';

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export const calculateBaseProbabilities = (player1: Player, player2: Player, match: Match) => {
  const rank1 = player1.current_rank || 100;
  const rank2 = player2.current_rank || 100;
  const rankDiff = Math.abs(rank1 - rank2);
  const p1Prob = 0.5 + (rankDiff / 200) * (rank2 > rank1 ? 1 : -1);
  const p2Prob = 1 - p1Prob;
  return { p1Prob, p2Prob };
};

export const applyModelVariance = (
  base: { p1Prob: number; p2Prob: number },
  model: ModelConfig,
  player1: Player,
  player2: Player,
) => {
  const variance = Math.random() * model.variance;
  const favorite = base.p1Prob > base.p2Prob ? player1 : player2;
  const scale = favorite === player1 ? model.favoriteBoost : 1 / model.favoriteBoost;

  const p1Prob = Math.min(
    0.99,
    Math.max(0.01, base.p1Prob * scale + (Math.random() > 0.5 ? variance : -variance)),
  );
  const p2Prob = Math.min(0.99, Math.max(0.01, 1 - p1Prob));

  return { p1Prob, p2Prob };
};

export const generatePointByPointData = (
  p1Prob: number,
  p2Prob: number,
  bestOf: number,
): Record<string, unknown>[] => {
  // Simplified simulation for demonstration
  const pointCount = bestOf === 5 ? 200 : 120;
  const points: Record<string, unknown>[] = [];

  for (let i = 0; i < pointCount; i++) {
    const isP1Point = Math.random() < p1Prob;
    points.push({
      point: i + 1,
      winner: isP1Point ? 1 : 2,
      type: Math.random() > 0.8 ? 'winner' : 'error',
      game: Math.floor(i / 6) + 1,
      set: Math.floor(i / 36) + 1,
    });
  }

  return points;
};
