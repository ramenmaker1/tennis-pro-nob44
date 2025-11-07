
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, CheckCircle, TrendingDown, Edit } from "lucide-react";

export default function DataQuality() {
  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list(),
    initialData: [],
  });

  // Calculate quality metrics
  const playersWithoutRank = players.filter(p => !p.current_rank);
  const playersWithoutServeStats = players.filter(p => 
    !p.first_serve_pct || !p.first_serve_win_pct || !p.second_serve_win_pct
  );
  const playersWithoutReturnStats = players.filter(p => 
    !p.first_return_win_pct || !p.second_return_win_pct
  );
  const playersWithoutSurfaceStats = players.filter(p => 
    !p.hard_court_win_pct || !p.clay_court_win_pct || !p.grass_court_win_pct
  );
  const unverifiedPlayers = players.filter(p => !p.is_verified);
  const playersWithoutSource = players.filter(p => !p.data_source);

  // Calculate completeness score for each player
  const calculateCompleteness = (player) => {
    const fields = [
      'current_rank', 'first_serve_pct', 'first_serve_win_pct', 'second_serve_win_pct',
      'first_return_win_pct', 'second_return_win_pct', 'break_points_converted_pct',
      'hard_court_win_pct', 'clay_court_win_pct', 'grass_court_win_pct'
    ];
    
    let completed = 0;
    fields.forEach(field => {
      if (player[field] !== null && player[field] !== undefined) completed++;
    });
    
    return Math.round((completed / fields.length) * 100);
  };

  const incompletePlayers = players
    .map(p => ({ ...p, completeness: calculateCompleteness(p) }))
    .filter(p => p.completeness < 70)
    .sort((a, b) => a.completeness - b.completeness)
    .slice(0, 20);

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Data Quality Dashboard</h1>
        <p className="text-slate-500 mt-2">Monitor and improve player data completeness</p>
      </div>

      {/* Quality Metrics */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500">Missing Rank</div>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{playersWithoutRank.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500">No Serve Stats</div>
              <TrendingDown className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{playersWithoutServeStats.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500">No Return Stats</div>
              <TrendingDown className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{playersWithoutReturnStats.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500">No Surface Stats</div>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{playersWithoutSurfaceStats.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500">Unverified</div>
              <CheckCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{unverifiedPlayers.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500">No Source</div>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{playersWithoutSource.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Players Needing Attention */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Players Needing Attention</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Players with less than 70% data completeness
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : incompletePlayers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Player</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Completeness</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Missing Data</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Source</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incompletePlayers.map((player) => {
                    const issues = [];
                    if (!player.current_rank) issues.push('rank');
                    if (!player.first_serve_pct) issues.push('serve');
                    if (!player.first_return_win_pct) issues.push('return');
                    if (!player.hard_court_win_pct) issues.push('surface');

                    return (
                      <tr key={player.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="font-medium text-slate-900">
                            {player.display_name || player.name}
                          </div>
                          {player.nationality && (
                            <div className="text-xs text-slate-500 mt-1">{player.nationality}</div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  player.completeness >= 70 ? 'bg-emerald-500' :
                                  player.completeness >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${player.completeness}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">
                              {player.completeness}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex gap-1 justify-center flex-wrap">
                            {issues.map(issue => (
                              <Badge key={issue} variant="outline" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-sm text-slate-600">
                          {player.data_source || (
                            <span className="text-yellow-600">Not set</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Link to={createPageUrl("Players")}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Great Data Quality!</h3>
              <p className="text-slate-500">All players have at least 70% complete data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Quality Tips */}
      <Card className="shadow-md bg-emerald-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 mb-2">Data Quality Tips</h3>
              <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside">
                <li>Prioritize completing serve and return stats for accurate predictions</li>
                <li>Surface-specific win percentages significantly improve model accuracy</li>
                <li>Always set the <code className="bg-emerald-100 px-1 rounded">data_source</code> field to track data origin</li>
                <li>Use the bulk import feature for adding multiple players efficiently</li>
                <li>Mark players as verified after reviewing their statistics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
