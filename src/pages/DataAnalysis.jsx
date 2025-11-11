import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function DataAnalysis() {
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['predictionsSample'],
    queryFn: async () => {
      try {
        const res = await base44.entities.Prediction.list({ limit: 50 });
        return res?.data ?? res ?? [];
      } catch (err) {
        return [];
      }
    },
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 dark:text-slate-100">Data & Predictions Analysis</h2>
      {isLoading && <div>Loading predictions...</div>}
      {!isLoading && predictions.length === 0 && (
        <div className="text-sm text-slate-500 dark:text-slate-400">No prediction data available.</div>
      )}

      <div className="mt-3 space-y-3">
        {predictions.slice(0, 20).map((p, idx) => (
          <div key={p.id || idx} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-700 dark:text-slate-300">Match: {p.match_id || p.match || 'unknown'}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Model: {p.model_name || p.model || 'n/a'}</div>
            <div className="text-sm font-semibold dark:text-slate-100">Probability: {p.probability ?? p.score ?? '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
