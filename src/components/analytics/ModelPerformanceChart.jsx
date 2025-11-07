import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function ModelPerformanceChart({ accuracyByModel, predictionCounts }) {
  const data = [
    {
      model: 'Conservative',
      accuracy: accuracyByModel.conservative,
      predictions: predictionCounts.conservative,
      color: '#3B82F6',
    },
    {
      model: 'Balanced',
      accuracy: accuracyByModel.balanced,
      predictions: predictionCounts.balanced,
      color: '#FBBF24',
    },
    {
      model: 'Aggressive',
      accuracy: accuracyByModel.aggressive,
      predictions: predictionCounts.aggressive,
      color: '#EF4444',
    },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Model Performance Comparison
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Accuracy rates for each prediction model type
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="model" stroke="#64748b" />
            <YAxis 
              stroke="#64748b"
              label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value) => [`${value.toFixed(1)}%`, 'Accuracy']}
            />
            <Bar dataKey="accuracy" fill="#10B981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Model comparison insights */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {data.map(model => (
            <div key={model.model} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-600">{model.model}</div>
                <Badge 
                  className="capitalize"
                  style={{ backgroundColor: model.color, color: 'white' }}
                >
                  {model.predictions} predictions
                </Badge>
              </div>
              <div className="text-3xl font-bold" style={{ color: model.color }}>
                {model.accuracy > 0 ? `${model.accuracy.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {model.accuracy === 0 ? 'No completed matches' : 'Accuracy rate'}
              </div>
            </div>
          ))}
        </div>

        {/* Best performing model */}
        {Math.max(data[0].accuracy, data[1].accuracy, data[2].accuracy) > 0 && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-sm text-emerald-800">
              <span className="font-semibold">Top Performer:</span>{' '}
              {data.reduce((best, current) => 
                current.accuracy > best.accuracy ? current : best
              ).model} model with{' '}
              {data.reduce((best, current) => 
                current.accuracy > best.accuracy ? current : best
              ).accuracy.toFixed(1)}% accuracy
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}