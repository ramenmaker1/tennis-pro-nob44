import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Target, Zap, RefreshCw, Settings } from 'lucide-react';
import { toast } from 'sonner';
import ModelWeightsEditor from '../components/ml/ModelWeightsEditor';
import LearningAnalytics from '../components/ml/LearningAnalytics';
import FeatureImportance from '../components/ml/FeatureImportance';

export default function MLDashboard() {
  const queryClient = useQueryClient();
  const [showWeightsEditor, setShowWeightsEditor] = useState(false);

  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['model-feedback'],
    queryFn: () => base44.entities.ModelFeedback.list('-feedback_date'),
    initialData: [],
  });

  const { data: weights } = useQuery({
    queryKey: ['model-weights'],
    queryFn: () => base44.entities.ModelWeights.list('-last_updated'),
    initialData: [],
  });

  const activeWeights = weights.find((w) => w.is_active) || {};

  // Calculate ML model statistics
  const mlFeedback = feedback.filter((f) => f.model_type === 'ml_enhanced');
  const totalML = mlFeedback.length;
  const correctML = mlFeedback.filter((f) => f.was_correct).length;
  const accuracyML = totalML > 0 ? (correctML / totalML) * 100 : 0;

  const calibrationScore =
    totalML > 0 ? mlFeedback.reduce((sum, f) => sum + (100 - f.calibration_error), 0) / totalML : 0;

  const highConfidenceML = mlFeedback.filter((f) => f.confidence_level === 'high');
  const highConfAccuracy =
    highConfidenceML.length > 0
      ? (highConfidenceML.filter((f) => f.was_correct).length / highConfidenceML.length) * 100
      : 0;

  // Recent performance (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentML = mlFeedback.filter(
    (f) => f.feedback_date && new Date(f.feedback_date) >= thirtyDaysAgo
  );
  const recentAccuracy =
    recentML.length > 0
      ? (recentML.filter((f) => f.was_correct).length / recentML.length) * 100
      : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            ML Dashboard
          </h1>
          <p className="text-slate-500 mt-2">
            Machine Learning model performance, feature importance, and adaptive learning
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['model-feedback'] })}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button
            onClick={() => setShowWeightsEditor(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Tune Model
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="shadow-md bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-sm text-purple-700 font-medium">ML Model Accuracy</div>
                <div className="text-3xl font-bold text-purple-900">
                  {totalML > 0 ? accuracyML.toFixed(1) : 'N/A'}%
                </div>
              </div>
            </div>
            <div className="text-xs text-purple-600">
              {correctML}/{totalML} predictions correct
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="text-sm text-slate-600 font-medium">Calibration Score</div>
                <div className="text-3xl font-bold text-slate-900">
                  {totalML > 0 ? calibrationScore.toFixed(1) : 'N/A'}%
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500">Prediction confidence accuracy</div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-sm text-slate-600 font-medium">High Confidence</div>
                <div className="text-3xl font-bold text-slate-900">
                  {highConfidenceML.length > 0 ? highConfAccuracy.toFixed(1) : 'N/A'}%
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {highConfidenceML.filter((f) => f.was_correct).length}/{highConfidenceML.length}{' '}
              correct
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-sm text-slate-600 font-medium">Recent Trend (30d)</div>
                <div className="text-3xl font-bold text-slate-900">
                  {recentML.length > 0 ? recentAccuracy.toFixed(1) : 'N/A'}%
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500">{recentML.length} predictions analyzed</div>
          </CardContent>
        </Card>
      </div>

      {/* Model Info */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Active Model Configuration</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Current model version: {activeWeights.model_version || 'v4.0'} • Last updated:{' '}
            {activeWeights.last_updated
              ? new Date(activeWeights.last_updated).toLocaleDateString()
              : 'Never'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <WeightDisplay label="Ranking" value={activeWeights.ranking_weight || 0.25} />
            <WeightDisplay label="Serve" value={activeWeights.serve_weight || 0.2} />
            <WeightDisplay label="Return" value={activeWeights.return_weight || 0.15} />
            <WeightDisplay label="Surface" value={activeWeights.surface_weight || 0.15} />
            <WeightDisplay label="Head-to-Head" value={activeWeights.h2h_weight || 0.1} />
            <WeightDisplay label="Form" value={activeWeights.form_weight || 0.1} />
            <WeightDisplay label="Fatigue" value={activeWeights.fatigue_weight || 0.03} />
            <WeightDisplay label="Injury" value={activeWeights.injury_weight || 0.02} />
          </div>

          {activeWeights.notes && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>Notes:</strong> {activeWeights.notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="learning" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learning">Learning Analytics</TabsTrigger>
          <TabsTrigger value="features">Feature Importance</TabsTrigger>
          <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="learning">
          <LearningAnalytics feedback={mlFeedback} />
        </TabsContent>

        <TabsContent value="features">
          <FeatureImportance feedback={mlFeedback} weights={activeWeights} />
        </TabsContent>

        <TabsContent value="comparison">
          <ModelComparisonView feedback={feedback} />
        </TabsContent>
      </Tabs>

      {/* Model Weights Editor Modal */}
      {showWeightsEditor && (
        <ModelWeightsEditor
          currentWeights={activeWeights}
          onClose={() => setShowWeightsEditor(false)}
        />
      )}

      {/* Info Card */}
      <Card className="shadow-md bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">About ML-Enhanced Predictions</h3>
              <p className="text-sm text-purple-800 mb-3">
                Our machine learning model uses{' '}
                {Object.keys(activeWeights).filter((k) => k.endsWith('_weight')).length} weighted
                features including:
              </p>
              <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                <li>Head-to-head historical data and surface-specific records</li>
                <li>Recent form analysis (win/loss streaks, confidence trends)</li>
                <li>Player fatigue indicators based on match frequency</li>
                <li>Active injury status and performance impact</li>
                <li>Advanced statistics (serve quality, return efficiency, clutch factor)</li>
                <li>Tournament importance and round weighting</li>
              </ul>
              <p className="text-sm text-purple-800 mt-3">
                The model continuously learns from match outcomes and user feedback to improve
                prediction accuracy over time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WeightDisplay({ label, value }) {
  const percentage = (value * 100).toFixed(0);

  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all"
            style={{ width: `${value * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-900 w-10 text-right">{percentage}%</span>
      </div>
    </div>
  );
}

function ModelComparisonView({ feedback }) {
  const modelTypes = ['conservative', 'balanced', 'aggressive', 'ml_enhanced'];

  const comparison = modelTypes.map((type) => {
    const modelFeedback = feedback.filter((f) => f.model_type === type);
    const total = modelFeedback.length;
    const correct = modelFeedback.filter((f) => f.was_correct).length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    return { type, total, correct, accuracy };
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Model Performance Comparison</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Compare accuracy across all prediction models</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comparison.map((model) => (
            <div key={model.type} className="p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-slate-900 capitalize flex items-center gap-2">
                    {model.type.replace('_', ' ')}
                    {model.type === 'ml_enhanced' && (
                      <Badge className="bg-purple-100 text-purple-700">
                        <Brain className="w-3 h-3 mr-1" />
                        ML
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {model.correct}/{model.total} predictions correct
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {model.total > 0 ? model.accuracy.toFixed(1) : 'N/A'}%
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    model.type === 'ml_enhanced'
                      ? 'bg-purple-500'
                      : model.type === 'conservative'
                      ? 'bg-blue-500'
                      : model.type === 'balanced'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${model.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
