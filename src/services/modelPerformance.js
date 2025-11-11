/**
 * Model Performance Tracking Service
 * Tracks prediction accuracy, calibration, and performance metrics
 * Helps improve models over time through feedback
 */

const STORAGE_KEY = 'tennis_prediction_performance';

/**
 * Performance metrics structure
 */
export class ModelPerformance {
  constructor() {
    this.metrics = this.loadMetrics();
  }

  /**
   * Load metrics from localStorage
   */
  loadMetrics() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load performance metrics:', e);
    }
    
    return {
      ensemble: { total: 0, correct: 0, calibration: [] },
      elo: { total: 0, correct: 0, calibration: [] },
      surface_expert: { total: 0, correct: 0, calibration: [] },
      balanced: { total: 0, correct: 0, calibration: [] },
      conservative: { total: 0, correct: 0, calibration: [] },
      ml: { total: 0, correct: 0, calibration: [] },
    };
  }

  /**
   * Save metrics to localStorage
   */
  saveMetrics() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (e) {
      console.error('Failed to save performance metrics:', e);
    }
  }

  /**
   * Record prediction result
   * @param {string} modelType - Type of model used
   * @param {number} predictedProb - Predicted win probability (0-100)
   * @param {boolean} actualWin - Did predicted winner actually win?
   * @param {string} confidenceLevel - high/medium/low
   */
  recordPrediction(modelType, predictedProb, actualWin, confidenceLevel = 'medium') {
    if (!this.metrics[modelType]) {
      this.metrics[modelType] = { total: 0, correct: 0, calibration: [] };
    }
    
    const metric = this.metrics[modelType];
    metric.total++;
    
    if (actualWin) {
      metric.correct++;
    }
    
    // Track calibration (predicted probability vs actual outcome)
    metric.calibration.push({
      predicted: predictedProb,
      actual: actualWin ? 100 : 0,
      confidence: confidenceLevel,
      timestamp: Date.now(),
    });
    
    // Keep only last 1000 predictions for memory
    if (metric.calibration.length > 1000) {
      metric.calibration = metric.calibration.slice(-1000);
    }
    
    this.saveMetrics();
  }

  /**
   * Get accuracy for a model
   * @param {string} modelType 
   * @returns {number} Accuracy percentage (0-100)
   */
  getAccuracy(modelType) {
    const metric = this.metrics[modelType];
    if (!metric || metric.total === 0) return null;
    
    return (metric.correct / metric.total) * 100;
  }

  /**
   * Get calibration error (Brier score)
   * Lower is better (0 = perfect, 1 = worst)
   * @param {string} modelType 
   * @returns {number} Brier score
   */
  getCalibrationError(modelType) {
    const metric = this.metrics[modelType];
    if (!metric || metric.calibration.length === 0) return null;
    
    // Brier score: average of (predicted - actual)^2
    const brierScore = metric.calibration.reduce((sum, cal) => {
      const diff = (cal.predicted / 100) - (cal.actual / 100);
      return sum + (diff * diff);
    }, 0) / metric.calibration.length;
    
    return brierScore;
  }

  /**
   * Get accuracy by confidence level
   * @param {string} modelType 
   * @param {string} confidence - high/medium/low
   * @returns {Object} Stats for confidence level
   */
  getAccuracyByConfidence(modelType, confidence) {
    const metric = this.metrics[modelType];
    if (!metric) return null;
    
    const filtered = metric.calibration.filter(c => c.confidence === confidence);
    if (filtered.length === 0) return null;
    
    const correct = filtered.filter(c => 
      (c.predicted > 50 && c.actual === 100) || 
      (c.predicted < 50 && c.actual === 0)
    ).length;
    
    return {
      total: filtered.length,
      correct,
      accuracy: (correct / filtered.length) * 100,
    };
  }

  /**
   * Compare all models
   * @returns {Array} Model rankings
   */
  compareModels() {
    const models = ['ensemble', 'elo', 'surface_expert', 'balanced', 'conservative', 'ml'];
    
    return models
      .map(model => ({
        model,
        accuracy: this.getAccuracy(model),
        total: this.metrics[model]?.total || 0,
        calibration: this.getCalibrationError(model),
      }))
      .filter(m => m.total > 0)
      .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
  }

  /**
   * Get recommended model based on performance
   * @returns {string} Best performing model
   */
  getRecommendedModel() {
    const rankings = this.compareModels();
    
    // Need at least 10 predictions to recommend
    const qualified = rankings.filter(r => r.total >= 10);
    
    if (qualified.length === 0) {
      return 'ensemble'; // Default
    }
    
    // Best accuracy with good calibration
    return qualified[0].model;
  }

  /**
   * Get performance summary
   * @returns {Object} Summary stats
   */
  getSummary() {
    const rankings = this.compareModels();
    
    return {
      totalPredictions: rankings.reduce((sum, r) => sum + r.total, 0),
      bestModel: rankings[0]?.model,
      bestAccuracy: rankings[0]?.accuracy,
      modelRankings: rankings,
    };
  }

  /**
   * Reset all metrics (for testing)
   */
  reset() {
    this.metrics = {
      ensemble: { total: 0, correct: 0, calibration: [] },
      elo: { total: 0, correct: 0, calibration: [] },
      surface_expert: { total: 0, correct: 0, calibration: [] },
      balanced: { total: 0, correct: 0, calibration: [] },
      conservative: { total: 0, correct: 0, calibration: [] },
      ml: { total: 0, correct: 0, calibration: [] },
    };
    this.saveMetrics();
  }

  /**
   * Export metrics for analysis
   * @returns {Object} All metrics
   */
  export() {
    return JSON.parse(JSON.stringify(this.metrics));
  }
}

// Global instance
export const modelPerformance = new ModelPerformance();

/**
 * Update prediction with actual result
 * Call this when match finishes
 * @param {Object} prediction - Prediction object
 * @param {string} actualWinnerId - ID of actual winner
 */
export function recordPredictionResult(prediction, actualWinnerId) {
  if (!prediction || !actualWinnerId) return;
  
  const predictedCorrect = prediction.predicted_winner_id === actualWinnerId;
  const predictedProb = prediction.player1_win_probability > 50 
    ? prediction.player1_win_probability 
    : prediction.player2_win_probability;
  
  modelPerformance.recordPrediction(
    prediction.model_type || 'balanced',
    predictedProb,
    predictedCorrect,
    prediction.confidence_level
  );
  
  console.log(`📊 Recorded prediction result for ${prediction.model_type}: ${predictedCorrect ? '✅ Correct' : '❌ Wrong'}`);
}

/**
 * Get performance stats for display
 * @param {string} modelType 
 * @returns {Object} Stats
 */
export function getModelStats(modelType) {
  const accuracy = modelPerformance.getAccuracy(modelType);
  const calibration = modelPerformance.getCalibrationError(modelType);
  const total = modelPerformance.metrics[modelType]?.total || 0;
  
  const highConf = modelPerformance.getAccuracyByConfidence(modelType, 'high');
  const medConf = modelPerformance.getAccuracyByConfidence(modelType, 'medium');
  const lowConf = modelPerformance.getAccuracyByConfidence(modelType, 'low');
  
  return {
    modelType,
    total,
    accuracy: accuracy ? Math.round(accuracy * 10) / 10 : null,
    calibration: calibration ? Math.round(calibration * 1000) / 1000 : null,
    byConfidence: {
      high: highConf,
      medium: medConf,
      low: lowConf,
    },
  };
}
