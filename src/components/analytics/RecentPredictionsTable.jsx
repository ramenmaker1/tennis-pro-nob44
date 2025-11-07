import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";

export default function RecentPredictionsTable({ predictions, matches, players }) {
  const getPredictionDetails = (prediction) => {
    const match = matches.find(m => m.id === prediction.match_id);
    const player1 = players.find(p => p.id === match?.player1_id);
    const player2 = players.find(p => p.id === match?.player2_id);
    const winner = players.find(p => p.id === prediction.predicted_winner_id);

    return { match, player1, player2, winner };
  };

  const getStatusIcon = (prediction) => {
    if (prediction.was_correct === true) {
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    } else if (prediction.was_correct === false) {
      return <XCircle className="w-4 h-4 text-red-600" />;
    } else {
      return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (prediction) => {
    if (prediction.was_correct === true) {
      return <Badge className="bg-emerald-100 text-emerald-700">Correct</Badge>;
    } else if (prediction.was_correct === false) {
      return <Badge className="bg-red-100 text-red-700">Incorrect</Badge>;
    } else {
      return <Badge className="bg-slate-100 text-slate-700">Pending</Badge>;
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Predictions</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Latest match analyses and their outcomes</p>
          </div>
          <Link to={createPageUrl("Predictions")}>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {predictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Match</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Model</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Confidence</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Predicted</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction) => {
                  const { match, player1, player2, winner } = getPredictionDetails(prediction);
                  
                  return (
                    <tr key={prediction.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="text-sm font-medium text-slate-900">
                          {player1?.display_name || player1?.name || 'Player 1'} vs{' '}
                          {player2?.display_name || player2?.name || 'Player 2'}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {match?.tournament_name || 'Tournament'} • {match?.surface || 'Surface'}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className="capitalize" variant="outline">
                          {prediction.model_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={
                          prediction.confidence_level === 'high' ? 'bg-emerald-100 text-emerald-700' :
                          prediction.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {prediction.confidence_level}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(prediction)}
                          <span className="text-sm font-medium text-slate-700">
                            {winner?.display_name || winner?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {prediction.player1_win_probability?.toFixed(1)}% / {prediction.player2_win_probability?.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {getStatusBadge(prediction)}
                      </td>
                      <td className="py-3 px-2 text-center text-sm text-slate-600">
                        {prediction.created_date 
                          ? format(new Date(prediction.created_date), 'MMM d, yyyy')
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No predictions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}