// Utilities for dashboard statistics, aligned to current UI usage

/**
 * Calculates overall prediction accuracy as a number (0-100)
 * @param {Array} predictions
 * @returns {number}
 */
export const calculateOverallAccuracy = (predictions) => {
  if (!Array.isArray(predictions) || predictions.length === 0) return 0;
  const completed = predictions.filter((p) => p.actual_winner_id);
  if (completed.length === 0) return 0;
  const correct = completed.filter(
    (p) => p.predicted_winner_id === p.actual_winner_id
  ).length;
  return (correct / completed.length) * 100;
};

/**
 * Returns accuracy by model type keyed by the three main models
 * { conservative: number, balanced: number, aggressive: number }
 * @param {Array} predictions
 */
export const getAccuracyByModel = (predictions) => {
  const result = { conservative: 0, balanced: 0, aggressive: 0 };
  if (!Array.isArray(predictions) || predictions.length === 0) return result;

  const byModel = {
    conservative: { correct: 0, total: 0 },
    balanced: { correct: 0, total: 0 },
    aggressive: { correct: 0, total: 0 },
  };

  for (const p of predictions) {
    if (!p?.model_type || !p?.actual_winner_id) continue;
    if (!(p.model_type in byModel)) continue;
    byModel[p.model_type].total++;
    if (p.predicted_winner_id === p.actual_winner_id) {
      byModel[p.model_type].correct++;
    }
  }

  Object.keys(byModel).forEach((k) => {
    const { correct, total } = byModel[k];
    result[k] = total > 0 ? (correct / total) * 100 : 0;
  });

  return result;
};

/**
 * Returns prediction counts by model type
 * { conservative: number, balanced: number, aggressive: number }
 * @param {Array} predictions
 */
export const getPredictionCountsByModel = (predictions) => {
  const counts = { conservative: 0, balanced: 0, aggressive: 0 };
  if (!Array.isArray(predictions) || predictions.length === 0) return counts;
  for (const p of predictions) {
    if (p?.model_type && p.model_type in counts) counts[p.model_type] += 1;
  }
  return counts;
};

/**
 * Buckets predictions by confidence level
 * { low: number, medium: number, high: number }
 * @param {Array} predictions
 */
export const getPredictionsByConfidence = (predictions) => {
  const buckets = { low: 0, medium: 0, high: 0 };
  if (!Array.isArray(predictions) || predictions.length === 0) return buckets;

  for (const p of predictions) {
    if (p?.confidence_level && buckets.hasOwnProperty(p.confidence_level)) {
      buckets[p.confidence_level] += 1;
      continue;
    }
    const p1 = p?.player1_win_probability ?? 0;
    const p2 = p?.player2_win_probability ?? 0;
    const maxProb = Math.max(p1, p2);
    if (maxProb < 0.55) buckets.low += 1;
    else if (maxProb <= 0.7) buckets.medium += 1;
    else buckets.high += 1;
  }

  return buckets;
};

/**
 * Recent trend summary used by the Dashboard KPI card
 * { total, completed, accuracy }
 * @param {Array} predictions
 */
export const getRecentTrends = (predictions) => {
  if (!Array.isArray(predictions) || predictions.length === 0) {
    return { total: 0, completed: 0, accuracy: 0 };
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recent = predictions.filter((p) => {
    const ts = p.created_date || p.created_at || p.created || p.updated_at;
    if (!ts) return false;
    const d = new Date(ts);
    return d >= thirtyDaysAgo;
  });

  const completed = recent.filter((p) => p.actual_winner_id);
  const correct = completed.filter(
    (p) => p.predicted_winner_id === p.actual_winner_id
  ).length;

  return {
    total: recent.length,
    completed: completed.length,
    accuracy: completed.length > 0 ? (correct / completed.length) * 100 : 0,
  };
};

