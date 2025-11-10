import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLiveMatches, getUpcomingMatches } from '@/services/tennisDataService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Radio } from 'lucide-react';

export default function LiveGames() {
  const [activeTab, setActiveTab] = useState('live');

  const { data: liveMatches, isLoading: loadingLive } = useQuery(
    ['liveMatches'],
    getLiveMatches,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const { data: upcomingMatches, isLoading: loadingUpcoming } = useQuery(
    ['upcomingMatches'],
    getUpcomingMatches,
    {
      staleTime: 1000 * 60 * 30, // 30 minutes
      cacheTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

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
  const getPlayerLink = (playerName, playerId) => {
    // Use player ID if available, otherwise use name as slug
    const slug = playerId || playerName.toLowerCase().replace(/\s+/g, '-');
    return `/player/${slug}`;
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {match.tournament} • {match.round} • {match.surface}
            </div>
            {isLive && (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full animate-pulse">
                ● LIVE
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <Link 
              to={getPlayerLink(match.player_a, match.player_a_id)}
              className="block font-medium dark:text-slate-100 text-lg hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {match.player_a}
            </Link>
            <Link 
              to={getPlayerLink(match.player_b, match.player_b_id)}
              className="block text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              vs {match.player_b}
            </Link>
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
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {match.status}
          </div>
        </div>
      </div>
    </div>
  );
}
