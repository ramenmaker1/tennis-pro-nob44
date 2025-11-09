import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLiveMatches } from '@/services/tennisDataService';

export default function LiveGames() {
  const { data: matches, isLoading, error } = useQuery(
    ['liveMatches'],
    getLiveMatches,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache
      refetchInterval: 1000 * 60 * 5, // Only refetch every 5 minutes (max 12 calls/hour)
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab
      refetchOnMount: false, // Don't refetch on component mount if data exists
    }
  );

  if (isLoading) return <div className="p-6">Loading live games...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading live matches</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold dark:text-slate-100">Live Games</h2>
        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium rounded-full animate-pulse">
          ● LIVE
        </span>
      </div>
      
      {(!matches || matches.length === 0) && (
        <div className="text-sm text-slate-500 dark:text-slate-400">No live matches at the moment.</div>
      )}
      
      <div className="space-y-3 mt-3">
        {(matches || []).map((m, idx) => (
          <div
            key={m.id || idx}
            className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {m.tournament} • {m.round} • {m.surface}
                </div>
                <div className="font-medium dark:text-slate-100 text-lg">{m.player_a}</div>
                <div className="text-slate-600 dark:text-slate-300">vs {m.player_b}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {m.score || 'Starting...'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.status}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
