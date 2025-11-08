<<<<<<< HEAD
import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Area,
} from 'recharts';

export default function Analytics() {
  const {
    data: predictions = [],
    isLoading,
    isError,
  } = useQuery({
=======
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ComposedChart, Area } from "recharts";

export default function Analytics() {
  const { data: predictions = [], isLoading, isError } = useQuery({
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
    queryKey: ['predictions', 'analytics'],
    queryFn: async () => {
      return base44.entities.Prediction.list({ limit: 1000 });
    },
    initialData: [],
  });

  const analytics = React.useMemo(() => buildAnalytics(predictions), [predictions]);

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Advanced Analytics</h1>
        <p className="text-slate-500 mt-2">
<<<<<<< HEAD
          Calibration insights, model comparisons, and upset detection across {predictions.length}{' '}
          predictions.
=======
          Calibration insights, model comparisons, and upset detection across {predictions.length} predictions.
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Analytics unavailable</AlertTitle>
          <AlertDescription>We could not load predictions. Please try again.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white shadow-sm rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Confidence Calibration</CardTitle>
            </CardHeader>
            <CardContent>
              <CalibrationCurve data={analytics.calibrationData} />
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Model Head-to-Head</CardTitle>
              </CardHeader>
              <CardContent>
                <ModelComparisonMatrix matrix={analytics.modelMatrix} models={analytics.models} />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Upset Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <UpsetAnalysisChart data={analytics.upsetData} />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Feature Importance Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <FeatureImportanceViz data={analytics.factorData} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function CalibrationCurve({ data }) {
  if (!data.length) {
<<<<<<< HEAD
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No completed predictions yet
      </div>
    );
=======
    return <div className="h-64 flex items-center justify-center text-slate-500">No completed predictions yet</div>;
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bucket" />
        <YAxis domain={[40, 100]} tickFormatter={(v) => `${v}%`} />
        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
        <Legend />
<<<<<<< HEAD
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#0ea5e9"
          strokeWidth={3}
          name="Predicted %"
        />
        <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual %" />
        <Line
          type="monotone"
          dataKey="ideal"
          stroke="#94a3b8"
          strokeDasharray="4 4"
          name="Perfect Calibration"
        />
=======
        <Line type="monotone" dataKey="predicted" stroke="#0ea5e9" strokeWidth={3} name="Predicted %" />
        <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual %" />
        <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="4 4" name="Perfect Calibration" />
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
      </LineChart>
    </ResponsiveContainer>
  );
}

function ModelComparisonMatrix({ models, matrix }) {
  if (!models.length) {
    return <p className="text-sm text-slate-500">No model data available yet.</p>;
  }

  return (
    <div className="overflow-auto">
      <div
        className="min-w-[480px] grid text-sm"
        style={{ gridTemplateColumns: `140px repeat(${models.length}, minmax(100px, 1fr))` }}
      >
        <div></div>
        {models.map((model) => (
          <div key={`head-${model}`} className="px-3 py-2 font-semibold text-center text-slate-600">
            {model}
          </div>
        ))}
        {models.map((row) => (
          <React.Fragment key={row}>
            <div className="px-3 py-2 font-semibold text-slate-600 bg-slate-50 border border-slate-100 sticky left-0">
              {row}
            </div>
            {models.map((col) => {
              const value = matrix[row]?.[col];
              const backgroundColor = col === row ? '#ecfdf5' : getHeatmapColor(value);
              return (
                <div
                  key={`${row}-${col}`}
                  className="px-3 py-3 border border-slate-100 text-center font-medium"
                  style={{ backgroundColor }}
                >
                  {value != null ? `${value.toFixed(1)}%` : '—'}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function FeatureImportanceViz({ data }) {
  if (!data.length) {
<<<<<<< HEAD
    return (
      <p className="text-sm text-slate-500">
        Key factors will appear once predictions include feedback.
      </p>
    );
=======
    return <p className="text-sm text-slate-500">Key factors will appear once predictions include feedback.</p>;
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="factor" />
<<<<<<< HEAD
        <YAxis
          yAxisId="left"
          orientation="left"
          domain={[0, Math.max(...data.map((d) => d.appearances)) + 2]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
=======
        <YAxis yAxisId="left" orientation="left" domain={[0, Math.max(...data.map((d) => d.appearances)) + 2]} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="appearances" fill="#6366f1" name="Mentions" />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="accuracy"
          stroke="#22c55e"
          fill="#bbf7d0"
          name="Accuracy %"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function UpsetAnalysisChart({ data }) {
  if (!data.length) {
    return <p className="text-sm text-slate-500">Record results to unlock upset tracking.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bucket" />
        <YAxis />
        <Legend />
        <Tooltip />
        <Bar dataKey="favorites" fill="#0ea5e9" name="Predicted favorites correct" stackId="a" />
        <Bar dataKey="upsets" fill="#f97316" name="Upsets" stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function buildAnalytics(predictions = []) {
  const completed = predictions.filter((p) => p.actual_winner_id);
  return {
    calibrationData: buildCalibrationData(completed),
    ...buildModelMatrix(completed),
    factorData: buildFactorData(predictions),
    upsetData: buildUpsetData(completed),
  };
}

function buildCalibrationData(predictions = []) {
  const buckets = {};
  predictions.forEach((pred) => {
    const maxProb = Math.max(pred.player1_win_probability || 0, pred.player2_win_probability || 0);
    if (!maxProb) return;
    const bucketKey = Math.min(90, Math.floor((maxProb * 100) / 10) * 10);
    if (!buckets[bucketKey]) {
      buckets[bucketKey] = { predicted: 0, actual: 0, count: 0 };
    }
    buckets[bucketKey].predicted += maxProb * 100;
    buckets[bucketKey].actual += pred.predicted_winner_id === pred.actual_winner_id ? 100 : 0;
    buckets[bucketKey].count += 1;
  });

  return Object.keys(buckets)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => {
      const bucket = buckets[key];
      return {
        bucket: `${key}-${Number(key) + 10}%`,
        predicted: bucket.predicted / bucket.count,
        actual: bucket.actual / bucket.count,
<<<<<<< HEAD
        ideal: Number(key) + 5,
=======
        ideal: (Number(key) + 5),
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
      };
    });
}

function buildModelMatrix(predictions = []) {
  const modelStats = {};
  const matchResults = new Map();

  predictions.forEach((pred) => {
    if (!pred.model_type) return;
    if (!modelStats[pred.model_type]) {
      modelStats[pred.model_type] = { total: 0, correct: 0 };
    }
    modelStats[pred.model_type].total += 1;
    if (pred.was_correct) modelStats[pred.model_type].correct += 1;

    if (!pred.match_id) return;
    if (!matchResults.has(pred.match_id)) {
      matchResults.set(pred.match_id, {});
    }
    matchResults.get(pred.match_id)[pred.model_type] = pred.was_correct ? 1 : 0;
  });

  const models = Object.keys(modelStats);
  const pairStats = {};

  matchResults.forEach((modelResult) => {
    const modelList = Object.keys(modelResult);
    if (modelList.length < 2) return;
    for (let i = 0; i < modelList.length; i++) {
      for (let j = 0; j < modelList.length; j++) {
        const a = modelList[i];
        const b = modelList[j];
        const key = `${a}|${b}`;
        if (!pairStats[key]) {
          pairStats[key] = { total: 0, wins: 0 };
        }
        if (modelResult[a] > modelResult[b]) {
          pairStats[key].wins += 1;
        }
        pairStats[key].total += 1;
      }
    }
  });

  const matrix = {};
  models.forEach((row) => {
    matrix[row] = {};
    models.forEach((col) => {
      if (row === col) {
        const stat = modelStats[row];
        matrix[row][col] = stat.total ? (stat.correct / stat.total) * 100 : null;
      } else {
        const stat = pairStats[`${row}|${col}`];
        matrix[row][col] = stat?.total ? (stat.wins / stat.total) * 100 : null;
      }
    });
  });

  return { models, modelMatrix: matrix };
}

function buildFactorData(predictions = []) {
  const factorMap = {};
  predictions.forEach((pred) => {
    if (!Array.isArray(pred.key_factors) || pred.key_factors.length === 0) return;
    pred.key_factors.forEach((factor) => {
      if (!factorMap[factor]) {
        factorMap[factor] = { appearances: 0, correct: 0 };
      }
      factorMap[factor].appearances += 1;
      if (pred.was_correct) {
        factorMap[factor].correct += 1;
      }
    });
  });

  return Object.entries(factorMap)
    .map(([factor, stats]) => ({
      factor,
      appearances: stats.appearances,
<<<<<<< HEAD
      accuracy: stats.appearances
        ? Number(((stats.correct / stats.appearances) * 100).toFixed(1))
        : 0,
=======
      accuracy: stats.appearances ? Number(((stats.correct / stats.appearances) * 100).toFixed(1)) : 0,
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
    }))
    .sort((a, b) => b.appearances - a.appearances)
    .slice(0, 10);
}

function buildUpsetData(predictions = []) {
  const buckets = {};
  const bucketLabel = (prob) => {
    const pct = Math.floor((prob * 100) / 5) * 5;
    const start = Math.max(50, pct);
    return `${start}-${start + 5}%`;
  };

  predictions.forEach((pred) => {
    const maxProb = Math.max(pred.player1_win_probability || 0, pred.player2_win_probability || 0);
    if (!maxProb || maxProb < 0.5) return;
    const label = bucketLabel(maxProb);
    if (!buckets[label]) {
      buckets[label] = { bucket: label, favorites: 0, upsets: 0 };
    }
    if (pred.predicted_winner_id === pred.actual_winner_id) {
      buckets[label].favorites += 1;
    } else {
      buckets[label].upsets += 1;
    }
  });

  return Object.values(buckets).sort((a, b) => parseInt(a.bucket) - parseInt(b.bucket));
}

function getHeatmapColor(value) {
<<<<<<< HEAD
  if (value == null) return 'transparent';
=======
  if (value == null) return "transparent";
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  const ratio = Math.max(0, Math.min(1, value / 100));
  const alpha = 0.15 + ratio * 0.4;
  return `rgba(16, 185, 129, ${alpha.toFixed(2)})`;
}
