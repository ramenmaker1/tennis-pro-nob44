import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLiveMatches } from '@/services/tennisDataService';
import { Activity } from 'lucide-react';
import { getCurrentClient } from '@/data/dataSourceStore';
import { enrichMatchesWithLocalPlayers } from '@/utils/playerMatcher';

export default function LivePlayers() {
  // Fetch local players for matching - with error handling
  const { data: dbPlayers = [] } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      try {
        const client = getCurrentClient();
        if (!client || !client.players || !client.players.list) {
          return [];
        }
        return await client.players.list('-created_date');
      } catch (error) {
        console.warn('Failed to load players for matching:', error);
        return [];
      }
    },
    initialData: [],
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const { data: rawMatches, error: matchesError } = useQuery(
    ['liveMatchesForPlayers'],
    getLiveMatches,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    }
  );

  // Enrich matches with local player data - with null checks
  const matches = useMemo(() => {
    if (!rawMatches || !Array.isArray(rawMatches)) return [];
    if (!dbPlayers || !Array.isArray(dbPlayers) || dbPlayers.length === 0) {
      return rawMatches; // Return raw matches if no players to match
    }
    try {
      return enrichMatchesWithLocalPlayers(rawMatches, dbPlayers);
    } catch (error) {
      console.warn('Failed to enrich live matches:', error);
      return rawMatches;
    }
  }, [rawMatches, dbPlayers]);

  // Extract unique players from live matches
  const players = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    
    const playerSet = new Map();
    
    matches.forEach((m) => {
      if (!m) return; // Skip null/undefined matches
      
      if (m.player_a) {
        const playerId = m.player_a_slug || m.player_a_id || m.player_a.toLowerCase().replace(/\s+/g, '-');
        playerSet.set(m.player_a, {
          name: m.player_a,
          id: playerId,
          slug: m.player_a_slug,
          match: m,
          opponent: m.player_b || 'TBD',
          playerData: m.player_a_data,
        });
      }
      if (m.player_b) {
        const playerId = m.player_b_slug || m.player_b_id || m.player_b.toLowerCase().replace(/\s+/g, '-');
        playerSet.set(m.player_b, {
          name: m.player_b,
          id: playerId,
          slug: m.player_b_slug,
          match: m,
          opponent: m.player_a || 'TBD',
          playerData: m.player_b_data,
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
              <Link 
                to={`/player/${p.slug || p.id}`}
                className="font-semibold text-lg dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {p.name}
              </Link>
              <div className="flex items-center gap-1">
                {p.playerData && (
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded" title="Player in your database">
                    ✓
                  </span>
                )}
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded">
                  Live
                </span>
              </div>
            </div>
            
            {p.playerData && p.playerData.current_rank && (
              <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">
                Rank #{p.playerData.current_rank}
              </div>
            )}
            
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
