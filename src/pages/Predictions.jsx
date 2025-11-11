import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3, Download } from 'lucide-react';
import { format } from 'date-fns';
import ProbabilityChart from '../components/match/ProbabilityChart';
import { exportPredictionsToJSON, exportPredictionsToCSV } from '../utils/exportData';
import { toast } from 'sonner';
import { PredictionFeedback } from '../components/ml/PredictionFeedback';
import { getCurrentClient } from '../data/dataSourceStore';

export default function Predictions() {
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [modelFilter, setModelFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      try {
        const client = getCurrentClient();
        if (!client?.predictions?.list) return [];
        return await client.predictions.list('-created_date');
      } catch (error) {
        console.warn('Failed to load predictions:', error);
        return [];
      }
    },
    initialData: [],
    retry: false,
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      try {
        const client = getCurrentClient();
        if (!client?.matches?.list) return [];
        return await client.matches.list();
      } catch (error) {
        console.warn('Failed to load matches:', error);
        return [];
      }
    },
    initialData: [],
    retry: false,
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      try {
        const client = getCurrentClient();
        if (!client?.players?.list) return [];
        return await client.players.list();
      } catch (error) {
        console.warn('Failed to load players:', error);
        return [];
      }
    },
    initialData: [],
    retry: false,
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

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-10 bg-slate-200 rounded w-1/3 mb-2" />
          <div className="h-6 bg-slate-200 rounded w-1/2" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white shadow-sm rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Predictions</h1>
        <p className="text-slate-500 mt-2">
          View and analyze all match predictions across different models
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter Predictions</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('json')}>
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="model-filter">Model Type</Label>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger id="model-filter">
                  <SelectValue placeholder="All Models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="ml">Machine Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="confidence-filter">Confidence Level</Label>
              <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                <SelectTrigger id="confidence-filter">
                  <SelectValue placeholder="All Confidence Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredPredictions.length > 0 ? (
        <div className="space-y-6">
          {filteredPredictions.map((prediction) => {
            const { match, player1, player2, winner } = getPredictionDetails(prediction);
            if (!match || !player1 || !player2) return null;

            return (
              <div key={prediction.id}>
                <Card
                  className={`shadow-md transition-all cursor-pointer ${
                    selectedPrediction?.id === prediction.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div onClick={() => setSelectedPrediction(prediction)}>
                    <CardHeader className="pb-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {player1.display_name || player1.name} vs{' '}
                            {player2.display_name || player2.name}
                            {prediction.was_correct === true && (
                              <Badge variant="success">Correct</Badge>
                            )}
                            {prediction.was_correct === false && (
                              <Badge variant="destructive">Incorrect</Badge>
                            )}
                          </CardTitle>
                          <div className="text-sm text-slate-500 mt-1">
                            {match.tournament_name} • {match.surface} •{' '}
                            {format(new Date(match.scheduled_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="capitalize">
                            {prediction.model_type}
                          </Badge>
                          <Badge
                            variant={
                              prediction.confidence_level === 'high'
                                ? 'success'
                                : prediction.confidence_level === 'medium'
                                ? 'warning'
                                : 'info'
                            }
                          >
                            {prediction.confidence_level} Confidence
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-2">Win Probabilities</div>
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="text-sm font-medium">
                                  {player1.display_name || player1.name}
                                </div>
                                <div className="text-2xl font-bold text-emerald-600">
                                  {prediction.player1_win_probability?.toFixed(1)}%
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">
                                  {player2.display_name || player2.name}
                                </div>
                                <div className="text-2xl font-bold text-orange-600">
                                  {prediction.player2_win_probability?.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-2">Predicted Winner</div>
                            <div className="text-lg font-medium text-slate-900">
                              {winner?.display_name || winner?.name}
                            </div>
                            {prediction.key_factors && (
                              <div className="text-sm text-slate-500 mt-1">
                                {prediction.key_factors}
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedPrediction?.id === prediction.id && (
                          <>
                            <ProbabilityChart
                              data={prediction.probability_chart_data || []}
                              player1Name={player1.display_name || player1.name}
                              player2Name={player2.display_name || player2.name}
                            />
                            <PredictionFeedback
                              prediction={prediction}
                              match={match}
                              player1={player1}
                              player2={player2}
                            />
                          </>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mt-4">No predictions found</h3>
            <p className="text-slate-500 mt-1">
              {predictions.length === 0
                ? 'Start by analyzing some matches to generate predictions'
                : 'Try adjusting your filters to see more predictions'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
