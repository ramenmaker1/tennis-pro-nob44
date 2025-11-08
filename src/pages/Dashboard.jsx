<<<<<<< HEAD
import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  TrendingUp,
  Users,
  BarChart3,
  Plus,
  Calendar,
  Trophy,
  Target,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatMatchTime } from '../utils/timezone.js';
import ModelPerformanceChart from '../components/analytics/ModelPerformanceChart';
import RecentPredictionsTable from '../components/analytics/RecentPredictionsTable';
import EmptyState from '../components/EmptyState.jsx';
=======

import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, Users, BarChart3, Plus, Calendar, Trophy, Target, Activity } from "lucide-react";
import { format } from "date-fns";
import { formatMatchTime } from "../utils/timezone.js";
import ModelPerformanceChart from "../components/analytics/ModelPerformanceChart";
import RecentPredictionsTable from "../components/analytics/RecentPredictionsTable";
import EmptyState from "../components/EmptyState.jsx";
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
import {
  getAccuracyByModel,
  getPredictionCountsByModel,
  calculateOverallAccuracy,
  getPredictionsByConfidence,
  getRecentTrends,
} from '../utils/dashboardStats.js';

export default function Dashboard() {
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list(),
    initialData: [],
  });

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-created_date'),
    initialData: [],
  });

  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list('-created_date'),
    initialData: [],
  });

  // Show loading state
  const isLoading = playersLoading || matchesLoading || predictionsLoading;
  const hasError = false; // placeholder if wiring query errors later

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 rounded w-1/3 mb-2" />
          <div className="h-6 bg-slate-200 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-lg animate-pulse" /> {/* Chart placeholder */}
        <div className="h-80 bg-slate-200 rounded-lg animate-pulse" /> {/* Table placeholder */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-96 bg-slate-200 rounded-lg animate-pulse" />{' '}
          {/* Upcoming matches placeholder */}
          <div className="h-96 bg-slate-200 rounded-lg animate-pulse" />{' '}
          {/* Quick actions placeholder */}
        </div>
      </div>
    );
  }

  // Calculate analytics
  const accuracyByModel = getAccuracyByModel(predictions);
  const predictionCounts = getPredictionCountsByModel(predictions);
  const overallAccuracy = calculateOverallAccuracy(predictions);
  const confidenceCounts = getPredictionsByConfidence(predictions);
  const recentTrends = getRecentTrends(predictions);
<<<<<<< HEAD

  const upcomingMatches = matches.filter((m) => m.status === 'scheduled').slice(0, 5);
=======
  
  const upcomingMatches = matches.filter(m => m.status === 'scheduled').slice(0, 5);
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  const recentPredictions = predictions.slice(0, 10);

  const completedPredictions = predictions.filter((p) => p.actual_winner_id);
  const accurateCount = completedPredictions.filter((p) => p.was_correct === true).length;

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
            Match Analytics Dashboard
          </h1>
          <p className="text-slate-500 mt-2">
            Advanced probability modeling for tennis predictions
          </p>
        </div>
        <Link to={createPageUrl('MatchAnalysis')}>
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Empty predictions state */}
      {predictions?.length === 0 && !isLoading && (
        <EmptyState
          icon={<BarChart3 className="w-6 h-6 text-emerald-600" />}
          title="No predictions yet"
          description="Create your first match analysis to see predictions here."
<<<<<<< HEAD
          action={
            <Link to={createPageUrl('MatchAnalysis')}>
              <Button>Create Match</Button>
            </Link>
          }
=======
          action={(
            <Link to={createPageUrl("MatchAnalysis")}>
              <Button>Create Match</Button>
            </Link>
          )}
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
        />
      )}

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Players"
          value={players.length}
          subtitle={`${
            players.filter((p) => p.current_rank && p.current_rank <= 100).length
          } in Top 100`}
          icon={Users}
          gradient="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Total Predictions"
          value={predictions.length}
          subtitle={`${recentTrends.total} in last 30 days`}
          icon={BarChart3}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Overall Accuracy"
          value={completedPredictions.length > 0 ? `${overallAccuracy.toFixed(1)}%` : 'N/A'}
          subtitle={
            completedPredictions.length > 0
              ? `${accurateCount}/${completedPredictions.length} correct`
              : 'No completed matches'
          }
          icon={Target}
          gradient="from-orange-500 to-red-500"
        />
        <StatsCard
          title="Recent Trend"
          value={recentTrends.completed > 0 ? `${recentTrends.accuracy.toFixed(1)}%` : 'N/A'}
          subtitle={`${recentTrends.completed} completed recently`}
          icon={Activity}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Confidence Distribution */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-500">High Confidence</div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{confidenceCounts.high}</div>
            <div className="text-xs text-slate-500 mt-1">predictions</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-500">Medium Confidence</div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{confidenceCounts.medium}</div>
            <div className="text-xs text-slate-500 mt-1">predictions</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-500">Low Confidence</div>
              <div className="w-3 h-3 rounded-full bg-slate-400"></div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{confidenceCounts.low}</div>
            <div className="text-xs text-slate-500 mt-1">predictions</div>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance Chart */}
      <ModelPerformanceChart
        accuracyByModel={accuracyByModel}
        predictionCounts={predictionCounts}
      />

      {/* Recent Predictions Table */}
      <RecentPredictionsTable predictions={recentPredictions} matches={matches} players={players} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Matches */}
        <Card className="shadow-md">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Scheduled Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <MatchRow key={match.id} match={match} players={players} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No scheduled matches</p>
                <Link to={createPageUrl('MatchAnalysis')}>
                  <Button variant="outline" size="sm" className="mt-2">
                    Create Match Analysis
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-md">
          <CardHeader className="border-b border-slate-200">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
              <Link to={createPageUrl('Players')} className="block">
                <Button
                  variant="outline"
                  className="w-full h-16 flex items-center gap-3 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                >
                  <Users className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Players</div>
                    <div className="text-xs text-slate-500">
                      {players.length} players in database
                    </div>
                  </div>
                </Button>
              </Link>
              <Link to={createPageUrl('MatchAnalysis')} className="block">
                <Button
                  variant="outline"
                  className="w-full h-16 flex items-center gap-3 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                >
                  <TrendingUp className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">Analyze Match</div>
                    <div className="text-xs text-slate-500">Generate new predictions</div>
                  </div>
                </Button>
              </Link>
              <Link to={createPageUrl('Predictions')} className="block">
                <Button
                  variant="outline"
                  className="w-full h-16 flex items-center gap-3 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                >
                  <BarChart3 className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">View All Predictions</div>
                    <div className="text-xs text-slate-500">
                      {predictions.length} total predictions
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, subtitle, icon: Icon, gradient }) {
  return (
    <Card className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full transform translate-x-12 -translate-y-12`}
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MatchRow({ match, players }) {
  const player1 = players.find((p) => p.id === match.player1_id);
  const player2 = players.find((p) => p.id === match.player2_id);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
      <div className="flex-1">
        <div className="font-medium text-slate-900">
          {player1?.display_name || player1?.name || 'Player 1'} vs{' '}
          {player2?.display_name || player2?.name || 'Player 2'}
        </div>
        <div className="text-sm text-slate-500 mt-1">
          {match.tournament_name || 'Tournament'} • {match.surface}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-slate-700">
          {match.utc_start ? formatMatchTime(match.utc_start) : null}
        </div>
      </div>
    </div>
  );
}
