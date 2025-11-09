import React, { useState } from 'react';
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
import { getCurrentClient } from '@/data/dataSourceStore';

export default function MLDashboard() {
  const queryClient = useQueryClient();
  const [showWeightsEditor, setShowWeightsEditor] = useState(false);

  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['model-feedback'],
    queryFn: () => getCurrentClient().modelFeedback.list('-feedback_date'),
    initialData: [],
  });

  const { data: weights } = useQuery({
    queryKey: ['model-weights'],
    queryFn: () => getCurrentClient().modelWeights.list('-last_updated'),
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
  const recentML = mlFeedback.filter((f) => new Date(f.feedback_date) > thirtyDaysAgo);
  const recentCorrect = recentML.filter((f) => f.was_correct).length;
  const recentAccuracy = recentML.length > 0 ? (recentCorrect / recentML.length) * 100 : 0;

  // Stats by surface
  const surfaceStats = {
    hard: calculateSurfaceStats(mlFeedback, 'hard'),
    clay: calculateSurfaceStats(mlFeedback, 'clay'),
    grass: calculateSurfaceStats(mlFeedback, 'grass'),
  };

  return (
    <div className="space-y-8">
      {/* Header and ML stats summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ML Model Dashboard</h1>
          <p className="text-slate-500">
            Monitor model performance, calibration, and feature importance
          </p>
        </div>

        <Button onClick={() => setShowWeightsEditor(true)} className="shrink-0">
          <Settings className="w-4 h-4 mr-2" />
          Configure Model Weights
        </Button>
      </div>

      {/* ML Model stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">ML Accuracy</CardTitle>
            <Brain className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accuracyML.toFixed(1)}%</div>
            <p className="text-xs text-slate-500 mt-1">
              {totalML} total predictions • {correctML} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">30-Day Trend</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-slate-500 mt-1">
              {recentML.length} matches • {recentCorrect} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <Target className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highConfAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-slate-500 mt-1">
              {highConfidenceML.length} matches • when confidence = high
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Calibration</CardTitle>
            <Zap className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calibrationScore.toFixed(1)}%</div>
            <p className="text-xs text-slate-500 mt-1">
              Higher is better • Based on error margins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics tabs */}
      <Tabs defaultValue="learning">
        <TabsList>
          <TabsTrigger value="learning">Learning Analytics</TabsTrigger>
          <TabsTrigger value="features">Feature Importance</TabsTrigger>
        </TabsList>
        <TabsContent value="learning">
          <LearningAnalytics feedback={mlFeedback} surfaceStats={surfaceStats} />
        </TabsContent>
        <TabsContent value="features">
          <FeatureImportance feedback={mlFeedback} weights={activeWeights} />
        </TabsContent>
      </Tabs>

      {/* Model weights editor modal */}
      {showWeightsEditor && (
        <ModelWeightsEditor
          currentWeights={activeWeights}
          onClose={() => setShowWeightsEditor(false)}
        />
      )}
    </div>
  );
}

function calculateSurfaceStats(feedback, surface) {
  const surfaceFeedback = feedback.filter((f) => f.surface === surface);
  const total = surfaceFeedback.length;
  const correct = surfaceFeedback.filter((f) => f.was_correct).length;
  return {
    total,
    correct,
    accuracy: total > 0 ? (correct / total) * 100 : 0,
  };
}