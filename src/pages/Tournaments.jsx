import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTournaments } from '@/services/tennisDataService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, MapPin, Trophy } from 'lucide-react';

export default function Tournaments() {
  const [tourFilter, setTourFilter] = useState('all');

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments', tourFilter],
    queryFn: () => getTournaments({ tour: tourFilter }),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - tournaments change rarely
    gcTime: 1000 * 60 * 60 * 48, // 48 hours - keep in cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) return <div className="p-6">Loading tournaments...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 dark:text-slate-100">Tournaments</h2>

      <Tabs value={tourFilter} onValueChange={setTourFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Tours</TabsTrigger>
          <TabsTrigger value="ATP">ATP</TabsTrigger>
          <TabsTrigger value="WTA">WTA</TabsTrigger>
          <TabsTrigger value="ITF">ITF</TabsTrigger>
        </TabsList>

        <TabsContent value={tourFilter} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((t, idx) => (
              <div
                key={t.id || idx}
                className="p-5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {t.tour}
                    </span>
                  </div>
                  {t.category && (
                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                      {t.category}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg mb-2">
                  {t.name}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {t.location}
                      {t.country && `, ${t.country}`}
                    </span>
                  </div>

                  {t.start_date && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(t.start_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded capitalize">
                      {t.surface || 'Hard'}
                    </span>
                    {t.prize_money && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ${t.prize_money.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
