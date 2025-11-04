import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { format } from "date-fns";
import ProbabilityChart from "../components/match/ProbabilityChart";

export default function Predictions() {
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  const { data: predictions, isLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list('-created_date'),
    initialData: [],
  });

  const { data: matches } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list(),
    initialData: [],
  });

  const { data: players } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list(),
    initialData: [],
  });

  const getPredictionDetails = (prediction) => {
    const match = matches.find(m => m.id === prediction.match_id);
    const player1 = players.find(p => p.id === match?.player1_id);
    const player2 = players.find(p => p.id === match?.player2_id);
    const winner = players.find(p => p.id === prediction.predicted_winner_id);

    return { match, player1, player2, winner };
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Match Predictions</h1>
        <p className="text-slate-500 mt-2">View all probability analyses and predictions</p>
      </div>

      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-white rounded-lg animate-pulse" />
          ))}
        </div>
      ) : predictions.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {predictions.map((prediction) => {
            const { match, player1, player2, winner } = getPredictionDetails(prediction);
            
            return (
              <Card 
                key={prediction.id}
                className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPrediction(selectedPrediction?.id === prediction.id ? null : prediction)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {player1?.name || 'Player 1'} vs {player2?.name || 'Player 2'}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        {match?.tournament} • {match?.surface}
                      </p>
                    </div>
                    <Badge className={
                      prediction.confidence_level === 'high' ? 'bg-emerald-100 text-emerald-700' :
                      prediction.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {prediction.confidence_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-slate-600">{player1?.name}</div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {prediction.player1_win_probability?.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-sm text-slate-600">{player2?.name}</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {prediction.player2_win_probability?.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50">
                      <div className="text-sm text-slate-600">Predicted Winner</div>
                      <div className="font-semibold text-slate-900 mt-1">
                        {winner?.name} ({prediction.predicted_sets})
                      </div>
                    </div>

                    {match?.match_date && (
                      <div className="text-xs text-slate-500">
                        Match Date: {format(new Date(match.match_date), "MMMM d, yyyy")}
                      </div>
                    )}

                    {selectedPrediction?.id === prediction.id && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Key Factors:</h4>
                          <ul className="space-y-1">
                            {prediction.key_factors?.map((factor, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="text-emerald-600">•</span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {prediction.point_by_point_data && prediction.point_by_point_data.length > 0 && (
                          <ProbabilityChart
                            data={prediction.point_by_point_data}
                            player1Name={player1?.name}
                            player2Name={player2?.name}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-md">
          <CardContent className="py-16 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Predictions Yet
            </h3>
            <p className="text-slate-500">
              Start analyzing matches to see predictions here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}