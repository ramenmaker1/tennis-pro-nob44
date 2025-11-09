import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getATPRankings, getWTARankings } from '@/services/tennisDataService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function TopPlayers() {
  const [tour, setTour] = useState('ATP');

  const { data: players, isLoading } = useQuery(
    ['rankings', tour],
    () => (tour === 'ATP' ? getATPRankings(100) : getWTARankings(100)),
    {
      staleTime: 1000 * 60 * 60 * 6, // 6 hours - rankings don't change often
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours - keep in cache for a full day
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  if (isLoading) return <div className="p-6">Loading rankings...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 dark:text-slate-100">World Rankings</h2>

      <Tabs value={tour} onValueChange={setTour} className="mb-6">
        <TabsList>
          <TabsTrigger value="ATP">ATP (Men)</TabsTrigger>
          <TabsTrigger value="WTA">WTA (Women)</TabsTrigger>
        </TabsList>

        <TabsContent value="ATP" className="mt-4">
          <RankingsList players={players} tour="ATP" />
        </TabsContent>

        <TabsContent value="WTA" className="mt-4">
          <RankingsList players={players} tour="WTA" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RankingsList({ players = [], tour }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {players.slice(0, 100).map((p, idx) => (
        <div
          key={p.player_id || idx}
          className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                #{p.rank}
              </div>
              {p.movement !== 0 && (
                <div
                  className={`text-xs ${
                    p.movement > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {p.movement > 0 ? '↑' : '↓'} {Math.abs(p.movement)}
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{p.country}</div>
          </div>
          
          <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {p.player_name}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">{p.points.toLocaleString()} pts</span>
            {p.age && <span className="text-xs text-slate-500 dark:text-slate-400">Age {p.age}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
