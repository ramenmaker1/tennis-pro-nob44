import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import ProbabilityChart from '../components/match/ProbabilityChart';
import { exportPredictionsToJSON, exportPredictionsToCSV } from '../utils/exportData.js';
import { toast } from 'sonner';
import { PredictionFeedback } from '../components/ml/PredictionFeedback.jsx';

export default function Predictions() {
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [modelFilter, setModelFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');

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

  const filteredPredictions = useMemo(() => {
    return predictions.filter((pred) => {
      if (modelFilter !== 'all' && pred.model_type !== modelFilter) return false;
      if (confidenceFilter !== 'all' && pred.confidence_level !== confidenceFilter) return false;
      return true;
    });
  }, [predictions, modelFilter, confidenceFilter]);

  const getPredictionDetails = (prediction) => {
    const match = matches.find((m) => m.id === prediction.match_id);
    const player1 = players.find((p) => p.id === match?.player1_id);
    const player2 = players.find((p) => p.id === match?.player2_id);
    const winner = players.find((p) => p.id === prediction.predicted_winner_id);

    return { match, player1, player2, winner };
  };

  const handleExport = (format) => {
    if (format === 'json') {
      exportPredictionsToJSON(filteredPredictions, matches, players);
      toast.success('Exported to JSON');
    } else {
      exportPredictionsToCSV(filteredPredictions, matches, players);
      toast.success('Exported to CSV');
    }
  };

  // Calculate accuracy stats
  const accuracyStats = {
    total: predictions.length,
    correct: predictions.filter((p) => p.was_correct === true).length,
    byModel: {
      conservative: predictions.filter(
        (p) => p.model_type === 'conservative' && p.was_correct === true
      ).length,
      balanced: predictions.filter((p) => p.model_type === 'balanced' && p.was_correct === true)
        .length,
      aggressive: predictions.filter((p) => p.model_type === 'aggressive' && p.was_correct === true)
        .length,
    },
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Match Predictions</h1>
          <p className="text-slate-500 mt-2">View all probability analyses and predictions</p>
        </div>
        {predictions.length > 0 && (
          <div className="flex gap-2">
            <Select onValueChange={(value) => handleExport(value)}>
              <SelectTrigger className="w-40">
                <Download className="w-4 h-4 mr-2" />
                Export
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">Export JSON</SelectItem>
                <SelectItem value="csv">Export CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Filters and Stats */}
      {predictions.length > 0 && (
        <div className="grid lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Total Predictions</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{predictions.length}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">Filtered Results</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {filteredPredictions.length}
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                Model
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                Confidence
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-white rounded-lg animate-pulse shadow-sm" />
          ))}
        </div>
      ) : filteredPredictions.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredPredictions.map((prediction) => {
            const { match, player1, player2, winner } = getPredictionDetails(prediction);

            return (
              <Card
                key={prediction.id}
                className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  setSelectedPrediction(
                    selectedPrediction?.id === prediction.id ? null : prediction
                  )
                }
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {player1?.display_name || player1?.name || 'Player 1'} vs{' '}
                        {player2?.display_name || player2?.name || 'Player 2'}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        {match?.tournament_name || 'Tournament'} • {match?.surface || 'Surface'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="capitalize">{prediction.model_type}</Badge>
                      <Badge
                        className={
                          prediction.confidence_level === 'high'
                            ? 'bg-emerald-100 text-emerald-700'
                            : prediction.confidence_level === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-700'
                        }
                      >
                        {prediction.confidence_level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-slate-600">
                          {player1?.display_name || player1?.name}
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {prediction.player1_win_probability?.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-sm text-slate-600">
                          {player2?.display_name || player2?.name}
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {prediction.player2_win_probability?.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50">
                      <div className="text-sm text-slate-600">Predicted Winner</div>
                      <div className="font-semibold text-slate-900 mt-1">
                        {winner?.display_name || winner?.name} ({prediction.predicted_sets})
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-50 rounded">
                        <div className="text-slate-500">Straight Sets</div>
                        <div className="font-semibold">
                          {prediction.prob_straight_sets?.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <div className="text-slate-500">Deciding Set</div>
                        <div className="font-semibold">
                          {prediction.prob_deciding_set?.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {prediction.created_date && (
                      <div className="text-xs text-slate-500 pt-2 border-t">
                        Created:{' '}
                        {format(new Date(prediction.created_date), "MMMM d, yyyy 'at' h:mm a")}
                      </div>
                    )}

                    {selectedPrediction?.id === prediction.id && (
                      <div className="mt-4 space-y-4 pt-4 border-t">
                        {prediction.reasoning && (
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Analysis:</h4>
                            <p className="text-sm text-slate-600">{prediction.reasoning}</p>
                          </div>
                        )}

                        {prediction.key_factors && prediction.key_factors.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Key Factors:</h4>
                            <ul className="space-y-1">
                              {prediction.key_factors.map((factor, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-slate-600 flex items-start gap-2"
                                >
                                  <span className="text-emerald-600">•</span>
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {prediction.point_by_point_data &&
                          prediction.point_by_point_data.length > 0 && (
                            <ProbabilityChart
                              data={prediction.point_by_point_data}
                              player1Name={player1?.display_name || player1?.name}
                              player2Name={player2?.display_name || player2?.name}
                            />
                          )}

                        <PredictionFeedback
                          prediction={prediction}
                          match={match}
                          player1={player1}
                          player2={player2}
                        />
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
              {predictions.length === 0 ? 'No Predictions Yet' : 'No Predictions Match Filters'}
            </h3>
            <p className="text-slate-500 mb-4">
              {predictions.length === 0
                ? 'Start analyzing matches to see predictions here'
                : 'Try adjusting your filters'}
            </p>
            {predictions.length > 0 && (
              <Button
                onClick={() => {
                  setModelFilter('all');
                  setConfidenceFilter('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
