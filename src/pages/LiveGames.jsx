import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLiveMatches, getUpcomingMatches } from '@/services/tennisDataService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Radio } from 'lucide-react';
import { getCurrentClient } from '@/data/dataSourceStore';
import { enrichMatchesWithLocalPlayers } from '@/utils/playerMatcher';

export default function LiveGames() {
  const [activeTab, setActiveTab] = useState('live');

  // Fetch local players for matching - with error handling
  const { data: dbPlayers = [], isError: playersError } = useQuery({
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

  const { data: rawLiveMatches, isLoading: loadingLive, error: liveError } = useQuery(
    ['liveMatches'],
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

  const { data: rawUpcomingMatches, isLoading: loadingUpcoming, error: upcomingError } = useQuery(
    ['upcomingMatches'],
    getUpcomingMatches,
    {
      staleTime: 1000 * 60 * 30, // 30 minutes
      cacheTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    }
  );

  // Enrich matches with local player data - with null checks
  const liveMatches = useMemo(() => {
    if (!rawLiveMatches || !Array.isArray(rawLiveMatches)) return [];
    if (!dbPlayers || !Array.isArray(dbPlayers) || dbPlayers.length === 0) {
      return rawLiveMatches; // Return raw matches if no players to match
    }
    try {
      return enrichMatchesWithLocalPlayers(rawLiveMatches, dbPlayers);
    } catch (error) {
      console.warn('Failed to enrich live matches:', error);
      return rawLiveMatches;
    }
  }, [rawLiveMatches, dbPlayers]);

  const upcomingMatches = useMemo(() => {
    if (!rawUpcomingMatches || !Array.isArray(rawUpcomingMatches)) return [];
    if (!dbPlayers || !Array.isArray(dbPlayers) || dbPlayers.length === 0) {
      return rawUpcomingMatches; // Return raw matches if no players to match
    }
    try {
      return enrichMatchesWithLocalPlayers(rawUpcomingMatches, dbPlayers);
    } catch (error) {
      console.warn('Failed to enrich upcoming matches:', error);
      return rawUpcomingMatches;
    }
  }, [rawUpcomingMatches, dbPlayers]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 dark:text-slate-100">Tennis Matches</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Live Matches
            {liveMatches && liveMatches.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                {liveMatches.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming
            {upcomingMatches && upcomingMatches.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                {upcomingMatches.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Live Matches Tab */}
        <TabsContent value="live">
          {loadingLive ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">Loading live matches...</div>
          ) : liveError ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-700 dark:text-red-400">
                Failed to load live matches. Please try again later.
              </div>
            </div>
          ) : (
            <>
              {(!liveMatches || liveMatches.length === 0) && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  No live matches at the moment. Check upcoming matches or try again later.
                </div>
              )}
              
              <div className="space-y-3">
                {(liveMatches || []).map((m, idx) => (
                  <MatchCard key={m.id || idx} match={m} isLive={true} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Upcoming Matches Tab */}
        <TabsContent value="upcoming">
          {loadingUpcoming ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">Loading upcoming matches...</div>
          ) : upcomingError ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-700 dark:text-red-400">
                Failed to load upcoming matches. Please try again later.
              </div>
            </div>
          ) : (
            <>
              {(!upcomingMatches || upcomingMatches.length === 0) && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  No upcoming matches scheduled.
                </div>
              )}
              
              <div className="space-y-3">
                {(upcomingMatches || []).map((m, idx) => (
                  <MatchCard key={m.id || idx} match={m} isLive={false} />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MatchCard({ match, isLive }) {
  // Safety check for match object
  if (!match) return null;

  const getPlayerLink = (playerName, playerSlug, playerId) => {
    if (!playerName) return '/players';
    // Use slug from matched player, fall back to ID or name-based slug
    if (playerSlug) {
      return `/player/${playerSlug}`;
    }
    if (playerId) {
      return `/player/${playerId}`;
    }
    return `/player/${playerName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {match.tournament || 'Unknown Tournament'} • {match.round || 'Round'} • {match.surface || 'Court'}
            </div>
            {isLive && (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full animate-pulse">
                ● LIVE
              </span>
            )}
            {match.player_a_data && (
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full" title="Player in your database">
                ✓
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {match.player_a && (
              <Link 
                to={getPlayerLink(match.player_a, match.player_a_slug, match.player_a_id)}
                className={`block font-medium text-lg hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${
                  match.player_a_data ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {match.player_a}
                {match.player_a_data && match.player_a_data.current_rank && (
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    (#{match.player_a_data.current_rank})
                  </span>
                )}
              </Link>
            )}
            {match.player_b && (
              <Link 
                to={getPlayerLink(match.player_b, match.player_b_slug, match.player_b_id)}
                className={`block hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${
                  match.player_b_data ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                vs {match.player_b}
                {match.player_b_data && match.player_b_data.current_rank && (
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    (#{match.player_b_data.current_rank})
                  </span>
                )}
              </Link>
            )}
          </div>

          {match.start_time && !isLive && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {new Date(match.start_time).toLocaleString()}
            </div>
          )}
        </div>
        
        <div className="text-right">
          {match.score ? (
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {match.score}
            </div>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {isLive ? 'Starting...' : 'Scheduled'}
            </div>
          )}
          {match.status && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {match.status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
