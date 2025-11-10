import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPlayerDetails } from '@/services/tennisDataService';
import { ArrowLeft, Trophy, TrendingUp, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PlayerDetail() {
  const { playerId } = useParams();
  
  const { data: player, isLoading, error } = useQuery(
    ['playerDetails', playerId],
    () => getPlayerDetails(playerId),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    }
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="p-6">
        <Link to="/LivePlayers" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Live Players
        </Link>
        <div className="text-red-600 dark:text-red-400">
          Error loading player details
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <Link 
        to="/LivePlayers" 
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Live Players
      </Link>

      {/* Player Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              {player.country && (
                <span className="px-3 py-1 bg-white/20 rounded-full">
                  {player.country}
                </span>
              )}
              {player.age && (
                <span>Age: {player.age}</span>
              )}
              {player.turned_pro && (
                <span>Pro: {player.turned_pro}</span>
              )}
            </div>
          </div>
          {player.ranking?.current && (
            <div className="text-right">
              <div className="text-sm opacity-80">Current Ranking</div>
              <div className="text-4xl font-bold">#{player.ranking.current}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ranking Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {player.ranking?.current && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Current</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    #{player.ranking.current}
                  </span>
                </div>
              )}
              {player.ranking?.highest && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Career High</span>
                  <span className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                    #{player.ranking.highest}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Physical Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Physical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {player.height && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Height</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {player.height} cm
                  </span>
                </div>
              )}
              {player.weight && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Weight</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {player.weight} kg
                  </span>
                </div>
              )}
              {player.hand && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Plays</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {player.hand}-handed
                  </span>
                </div>
              )}
              {player.backhand && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Backhand</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {player.backhand}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Career Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              Career Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {player.stats?.titles !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Titles</span>
                  <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    {player.stats.titles}
                  </span>
                </div>
              )}
              {player.stats?.win_rate !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Win Rate</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {(player.stats.win_rate * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Surface Stats */}
      {player.stats && (player.stats.hard_win_rate || player.stats.clay_win_rate || player.stats.grass_win_rate) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Surface Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {player.stats.hard_win_rate !== undefined && (
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Hard Court</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${player.stats.hard_win_rate * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold min-w-[3rem] text-right">
                      {(player.stats.hard_win_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              
              {player.stats.clay_win_rate !== undefined && (
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Clay Court</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${player.stats.clay_win_rate * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold min-w-[3rem] text-right">
                      {(player.stats.clay_win_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              
              {player.stats.grass_win_rate !== undefined && (
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Grass Court</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${player.stats.grass_win_rate * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold min-w-[3rem] text-right">
                      {(player.stats.grass_win_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
