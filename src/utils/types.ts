import type { Match, Player, ConfidenceLevel } from '../data/DataClient';

export interface PredictionBase {
  match_id: string;
  model_type: string;
  predicted_winner_id: string;
  player1_win_probability: number;
  player2_win_probability: number;
  confidence_level: ConfidenceLevel;
  predicted_sets: string;
  prob_straight_sets: number;
  prob_deciding_set: number;
  point_by_point_data?: Record<string, unknown>[];
  created_at: string;
  created_date: string;
}

export interface MLFeatures {
  rank_diff: number;
  serve_diff: number;
  return_diff: number;
  surface_pref_diff: number;
  best_of: number;
}

export interface ModelConfig {
  type: string;
  variance: number;
  favoriteBoost: number;
}
