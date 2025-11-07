
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, Users, BarChart3, Plus, Calendar, Trophy } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: players } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list(),
    initialData: [],
  });

  const { data: matches } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-created_date'),
    initialData: [],
  });

  const { data: predictions } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list('-created_date'),
    initialData: [],
  });

  const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'upcoming').slice(0, 5);
  const recentPredictions = predictions.slice(0, 5);

  // Calculate accuracy stats
  const completedPredictions = predictions.filter(p => p.actual_winner_id);
  const accurateCount = completedPredictions.filter(p => p.was_correct === true).length;
  const accuracyRate = completedPredictions.length > 0 
    ? Math.round((accurateCount / completedPredictions.length) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Match Analytics Dashboard</h1>
          <p className="text-slate-500 mt-2">Advanced probability modeling for tennis predictions</p>
        </div>
        <Link to={createPageUrl("MatchAnalysis")}>
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Players"
          value={players.length}
          icon={Users}
          gradient="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Total Matches"
          value={matches.length}
          icon={Trophy}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Predictions Made"
          value={predictions.length}
          icon={BarChart3}
          gradient="from-orange-500 to-red-500"
        />
        <StatsCard
          title="Accuracy Rate"
          value={completedPredictions.length > 0 ? `${accuracyRate}%` : 'N/A'}
          subtitle={completedPredictions.length > 0 ? `${accurateCount}/${completedPredictions.length} correct` : 'No completed matches'}
          icon={Calendar}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

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
                <Link to={createPageUrl("MatchAnalysis")}>
                  <Button variant="outline" size="sm" className="mt-2">
                    Create Match Analysis
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Predictions */}
        <Card className="shadow-md">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Recent Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {recentPredictions.length > 0 ? (
              <div className="space-y-4">
                {recentPredictions.map((prediction) => (
                  <PredictionRow 
                    key={prediction.id} 
                    prediction={prediction} 
                    matches={matches}
                    players={players}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No predictions yet</p>
                <Link to={createPageUrl("MatchAnalysis")}>
                  <Button variant="outline" size="sm" className="mt-2">
                    Make Your First Prediction
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to={createPageUrl("Players")} className="block">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                <Users className="w-6 h-6" />
                <span className="text-sm">Manage Players</span>
              </Button>
            </Link>
            <Link to={createPageUrl("MatchAnalysis")} className="block">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm">Analyze Match</span>
              </Button>
            </Link>
            <Link to={createPageUrl("Predictions")} className="block">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">View Predictions</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, subtitle, icon: Icon, gradient }) {
  return (
    <Card className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full transform translate-x-12 -translate-y-12`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
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
  const player1 = players.find(p => p.id === match.player1_id);
  const player2 = players.find(p => p.id === match.player2_id);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
      <div className="flex-1">
        <div className="font-medium text-slate-900">
          {player1?.name || 'Player 1'} vs {player2?.name || 'Player 2'}
        </div>
        <div className="text-sm text-slate-500 mt-1">
          {match.tournament} • {match.surface}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-slate-700">
          {match.match_date && format(new Date(match.match_date), "MMM d")}
        </div>
      </div>
    </div>
  );
}

function PredictionRow({ prediction, matches, players }) {
  const match = matches.find(m => m.id === prediction.match_id);
  const player1 = players.find(p => p.id === match?.player1_id);
  const player2 = players.find(p => p.id === match?.player2_id);
  const winner = players.find(p => p.id === prediction.predicted_winner_id);

  return (
    <div className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-slate-900">
            {player1?.name || player1?.display_name || 'Player 1'} vs {player2?.name || player2?.display_name || 'Player 2'}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Predicted Winner: <span className="font-semibold text-emerald-600">{winner?.name || winner?.display_name}</span>
          </div>
        </div>
        <div className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
          {prediction.confidence_level || 'medium'}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="text-xs text-slate-500">{player1?.name || player1?.display_name}</div>
          <div className="text-lg font-bold text-emerald-600">
            {prediction.player1_win_probability?.toFixed(0)}%
          </div>
        </div>
        <div className="flex-1 text-right">
          <div className="text-xs text-slate-500">{player2?.name || player2?.display_name}</div>
          <div className="text-lg font-bold text-orange-600">
            {prediction.player2_win_probability?.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}
