import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function FeatureImportance({ feedback, weights }) {
  // Calculate feature importance based on weights
  const features = [
    { name: 'Ranking', weight: weights.ranking_weight || 0.25, icon: '🏆' },
    { name: 'Serve', weight: weights.serve_weight || 0.2, icon: '🎾' },
    { name: 'Return', weight: weights.return_weight || 0.15, icon: '↩️' },
    { name: 'Surface', weight: weights.surface_weight || 0.15, icon: '🏟️' },
    { name: 'Head-to-Head', weight: weights.h2h_weight || 0.1, icon: '🤝' },
    { name: 'Form', weight: weights.form_weight || 0.1, icon: '📈' },
    { name: 'Fatigue', weight: weights.fatigue_weight || 0.03, icon: '😓' },
    { name: 'Injury', weight: weights.injury_weight || 0.02, icon: '🩹' },
  ];

  const sortedFeatures = [...features].sort((a, b) => b.weight - a.weight);

  const chartData = sortedFeatures.map((f) => ({
    name: f.name,
    weight: (f.weight * 100).toFixed(1),
    percentage: f.weight * 100,
  }));

  // Analyze which features contribute most to correct predictions
  const featureContribution = feedback.reduce((acc, f) => {
    if (!f.features_used) return acc;

    const features = f.features_used;
    Object.keys(features).forEach((key) => {
      if (!acc[key]) {
        acc[key] = { correct: 0, total: 0 };
      }
      acc[key].total++;
      if (f.was_correct) {
        acc[key].correct++;
      }
    });

    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Feature Weights Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Current Feature Weights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 30]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="weight" fill="#8b5cf6" name="Weight (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feature Details */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Feature Importance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedFeatures.map((feature, idx) => (
              <div
                key={feature.name}
                className="p-4 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {feature.name}
                        {idx === 0 && (
                          <Badge className="bg-purple-100 text-purple-700">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Highest
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {getFeatureDescription(feature.name)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {(feature.weight * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                    style={{ width: `${feature.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="shadow-md bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Optimization Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
              <p className="text-slate-700">
                <strong>Top Features:</strong> Ranking ({(weights.ranking_weight * 100).toFixed(0)}
                %) and Serve ({(weights.serve_weight * 100).toFixed(0)}%) are the most influential
                factors in predictions.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
              <p className="text-slate-700">
                <strong>Balance:</strong> The model maintains a good balance between player
                statistics and situational factors (H2H, form, fatigue).
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
              <p className="text-slate-700">
                <strong>Recommendation:</strong> Monitor prediction accuracy by feature to identify
                opportunities for weight adjustments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getFeatureDescription(name) {
  const descriptions = {
    Ranking: 'ATP/WTA ranking difference between players',
    Serve: 'First serve percentage and effectiveness',
    Return: 'Return game statistics and break point conversion',
    Surface: 'Performance on specific court surfaces',
    'Head-to-Head': 'Historical matchup results',
    Form: 'Recent match results and win streaks',
    Fatigue: 'Rest days and match frequency',
    Injury: 'Active injury status and impact',
  };
  return descriptions[name] || '';
}
