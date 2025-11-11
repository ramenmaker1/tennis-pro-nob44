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
import { BarChart3, Download, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import ProbabilityChart from '../components/match/ProbabilityChart';
import { exportPredictionsToJSON, exportPredictionsToCSV } from '../utils/exportData';
import { toast } from 'sonner';
import { PredictionFeedback } from '../components/ml/PredictionFeedback';
import { getCurrentClient } from '../data/dataSourceStore';
import { getLiveMatches } from '../services/tennisDataService';
import { predictMatches } from '../services/predictionService';
import DeprecationNotice from '../components/DeprecationNotice';

export default function Predictions() {
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [modelFilter, setModelFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [dataSource, setDataSource] = useState('live'); // 'live' or 'database'
  const [predictionModel, setPredictionModel] = useState('ensemble'); // Model selector

  // Fetch live matches for predictions
  const { data: liveMatches = [], isLoading: liveLoading } = useQuery({
    queryKey: ['live-matches'],
    queryFn: async () => {
      try {
        return await getLiveMatches();
      } catch (error) {
        console.warn('Failed to load live matches:', error);
        return [];
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    initialData: [],
    retry: false,
  });

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['predictions', 'database'],
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
    enabled: dataSource === 'database',
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

  // Generate predictions for live matches
  const livePredictions = useMemo(() => {
    if (dataSource !== 'live' || liveMatches.length === 0 || players.length === 0) {
      return [];
    }
    return predictMatches(liveMatches, players, predictionModel);
  }, [liveMatches, players, dataSource, predictionModel]);

  // Combine database and live predictions
  const allPredictions = dataSource === 'live' ? livePredictions : predictions;

  const filteredPredictions = useMemo(() => {
    return allPredictions.filter((pred) => {
      if (modelFilter !== 'all' && pred.model_type !== modelFilter) return false;
      if (confidenceFilter !== 'all' && pred.confidence_level !== confidenceFilter) return false;
      return true;
    });
  }, [allPredictions, modelFilter, confidenceFilter]);

  const getPredictionDetails = (prediction) => {
    // For live predictions, data is already embedded
    if (dataSource === 'live') {
      return {
        match: prediction.match,
        player1: prediction.player1,
        player2: prediction.player2,
        winner: prediction.player1_win_probability > prediction.player2_win_probability 
          ? prediction.player1 
          : prediction.player2,
      };
    }
    
    // For database predictions, look up related data
    const match = matches.find((m) => m.id === prediction.match_id);
    if (!match) return { match: null, player1: null, player2: null, winner: null };
    
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

  if (isLoading || liveLoading) {
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
          {dataSource === 'live' 
            ? 'AI-powered predictions for live and upcoming matches'
            : 'View and analyze all match predictions across different models'}
        </p>
      </div>

      <DeprecationNotice 
        newPage="Simulator"
        newPageName="Simulator"
        message="Live match predictions are now available in the Simulator and Live & Analysis tabs with an improved interface."
      />

      <Card className="shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-slate-900">
                  {dataSource === 'live' ? 'Live Match Predictions' : 'Database Predictions'}
                </div>
                <div className="text-sm text-slate-600">
                  {dataSource === 'live' 
                    ? `${livePredictions.length} predictions generated from ${liveMatches.length} matches`
                    : `${predictions.length} stored predictions`}
                  {dataSource === 'live' && livePredictions.some(p => !p.has_player_data) && (
                    <span className="ml-2 text-amber-600">
                      • Some predictions use estimated player data
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live Matches</SelectItem>
                <SelectItem value="database">Database</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Info banner for estimated predictions */}
      {dataSource === 'live' && livePredictions.some(p => !p.has_player_data) && (
        <Card className="shadow-sm bg-amber-50 border-amber-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-lg">💡</span>
              <div>
                <div className="font-medium text-amber-900">Predictions with Estimated Data</div>
                <div className="text-amber-700 mt-1">
                  Some players aren't in your database yet. Predictions marked with "📊 Estimated" use default rankings and stats. 
                  For more accurate predictions, import these players from the Players page or consider these predictions as lower confidence.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          {dataSource === 'live' && (
            <div className="mb-4 pb-4 border-b">
              <Label htmlFor="prediction-model">Prediction Model</Label>
              <Select value={predictionModel} onValueChange={setPredictionModel}>
                <SelectTrigger id="prediction-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ensemble">🎯 Ensemble (Most Accurate)</SelectItem>
                  <SelectItem value="elo">📊 ELO Rating</SelectItem>
                  <SelectItem value="surface_expert">🎾 Surface Expert</SelectItem>
                  <SelectItem value="balanced">⚖️ Balanced</SelectItem>
                  <SelectItem value="conservative">🛡️ Conservative</SelectItem>
                  <SelectItem value="ml">🤖 Machine Learning</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {predictionModel === 'ensemble' && 'Combines ELO, surface expertise, odds, and stats for highest accuracy'}
                {predictionModel === 'elo' && 'Chess-style rating system with form adjustments'}
                {predictionModel === 'surface_expert' && 'Focuses on surface-specific performance'}
                {predictionModel === 'balanced' && 'Multi-factor approach using ranking, surface, and odds'}
                {predictionModel === 'conservative' && 'Higher confidence threshold, fewer risky predictions'}
                {predictionModel === 'ml' && 'Machine learning enhanced predictions'}
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="model-filter">Filter by Model</Label>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger id="model-filter">
                  <SelectValue placeholder="All Models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="ensemble">Ensemble</SelectItem>
                  <SelectItem value="elo">ELO</SelectItem>
                  <SelectItem value="surface_expert">Surface Expert</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="conservative">Conservative</SelectItem>
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
                            {player1?.display_name || player1?.name || 'Player 1'} vs{' '}
                            {player2?.display_name || player2?.name || 'Player 2'}
                            {prediction.was_correct === true && (
                              <Badge variant="success">Correct</Badge>
                            )}
                            {prediction.was_correct === false && (
                              <Badge variant="destructive">Incorrect</Badge>
                            )}
                          </CardTitle>
                          <div className="text-sm text-slate-500 mt-1">
                            {match?.tournament_name || 'Tournament'} • {match?.surface || 'Unknown'} •{' '}
                            {match?.scheduled_date ? format(new Date(match.scheduled_date), 'MMM d, yyyy') : 'Date TBD'}
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
                          {!prediction.has_player_data && (
                            <Badge variant="secondary" className="text-xs">
                              📊 Estimated
                            </Badge>
                          )}
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
                                  {player1?.display_name || player1?.name || 'Player 1'}
                                </div>
                                <div className="text-2xl font-bold text-emerald-600">
                                  {prediction.player1_win_probability?.toFixed(1) || 0}%
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">
                                  {player2?.display_name || player2?.name || 'Player 2'}
                                </div>
                                <div className="text-2xl font-bold text-orange-600">
                                  {prediction.player2_win_probability?.toFixed(1) || 0}%
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
                              player1Name={player1?.display_name || player1?.name || 'Player 1'}
                              player2Name={player2?.display_name || player2?.name || 'Player 2'}
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
              {dataSource === 'live' && liveMatches.length === 0
                ? 'No live matches available. Check back during tournament hours.'
                : dataSource === 'live' && players.length === 0
                ? 'Import players first to generate predictions for live matches.'
                : allPredictions.length === 0
                ? 'Start by analyzing some matches to generate predictions'
                : 'Try adjusting your filters to see more predictions'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
