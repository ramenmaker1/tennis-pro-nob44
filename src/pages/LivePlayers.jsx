import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLiveMatches } from '@/services/tennisDataService';
import { Activity } from 'lucide-react';

export default function LivePlayers() {
  const { data: matches } = useQuery(
    ['liveMatchesForPlayers'],
    getLiveMatches,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  // Extract unique players from live matches
  const players = React.useMemo(() => {
    if (!matches) return [];
    
    const playerSet = new Map();
    
    matches.forEach((m) => {
      if (m.player_a) {
        playerSet.set(m.player_a, {
          name: m.player_a,
          match: m,
          opponent: m.player_b,
        });
      }
      if (m.player_b) {
        playerSet.set(m.player_b, {
          name: m.player_b,
          match: m,
          opponent: m.player_a,
        });
      }
    });
    
    return Array.from(playerSet.values());
  }, [matches]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-semibold dark:text-slate-100">Live Players</h2>
        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full flex items-center gap-1">
          <Activity className="w-3 h-3" />
          {players.length} Active
        </span>
      </div>
      
      {players.length === 0 && (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          No players currently in live matches.
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
        {players.map((p, idx) => (
          <div
            key={idx}
            className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold text-lg dark:text-slate-100">{p.name}</div>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded">
                Live
              </span>
            </div>
            
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              vs {p.opponent}
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div>{p.match.tournament}</div>
              <div className="flex items-center gap-2">
                <span className="capitalize">{p.match.surface}</span>
                <span>•</span>
                <span>{p.match.round}</span>
              </div>
            </div>
            
            {p.match.score && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {p.match.score}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
