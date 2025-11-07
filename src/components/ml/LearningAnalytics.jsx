import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

export default function LearningAnalytics({ feedback }) {
  // Group by surface
  const bySurface = feedback.reduce((acc, f) => {
    const surface = f.surface || 'unknown';
    if (!acc[surface]) {
      acc[surface] = { total: 0, correct: 0 };
    }
    acc[surface].total++;
    if (f.was_correct) acc[surface].correct++;
    return acc;
  }, {});

  const surfaceData = Object.keys(bySurface).map(surface => ({
    surface: surface.charAt(0).toUpperCase() + surface.slice(1),
    accuracy: (bySurface[surface].correct / bySurface[surface].total * 100).toFixed(1),
    total: bySurface[surface].total,
  }));

  // Group by confidence level
  const byConfidence = feedback.reduce((acc, f) => {
    const conf = f.confidence_level || 'medium';
    if (!acc[conf]) {
      acc[conf] = { total: 0, correct: 0 };
    }
    acc[conf].total++;
    if (f.was_correct) acc[conf].correct++;
    return acc;
  }, {});

  const confidenceData = ['low', 'medium', 'high'].map(level => ({
    level: level.charAt(0).toUpperCase() + level.slice(1),
    accuracy: byConfidence[level] ? (byConfidence[level].correct / byConfidence[level].total * 100).toFixed(1) : 0,
    total: byConfidence[level]?.total || 0,
  }));

  // Time series (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentFeedback = feedback.filter(f => 
    f.feedback_date && new Date(f.feedback_date) >= thirtyDaysAgo
  );

  // Group by day
  const byDay = recentFeedback.reduce((acc, f) => {
    const date = new Date(f.feedback_date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { total: 0, correct: 0 };
    }
    acc[date].total++;
    if (f.was_correct) acc[date].correct++;
    return acc;
  }, {});

  const timeSeriesData = Object.keys(byDay)
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(-14) // Last 14 days
    .map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: (byDay[date].correct / byDay[date].total * 100).toFixed(1),
    }));

  return (
    <div className="space-y-6">
      {/* Time Series */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Accuracy Trend (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Accuracy (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No data available for the last 14 days</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Surface Performance */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Accuracy by Surface</CardTitle>
        </CardHeader>
        <CardContent>
          {surfaceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={surfaceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="surface" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#10b981" name="Accuracy (%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              No surface data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confidence Level Performance */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Accuracy by Confidence Level</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="accuracy" fill="#f59e0b" name="Accuracy (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Calibration Analysis */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Model Calibration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {confidenceData.map(item => (
              <div key={item.level} className="p-4 rounded-lg border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">{item.level} Confidence</div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {item.accuracy}%
                </div>
                <div className="text-xs text-slate-500">{item.total} predictions</div>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      item.level === 'High' ? 'bg-emerald-500' :
                      item.level === 'Medium' ? 'bg-yellow-500' :
                      'bg-slate-400'
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}