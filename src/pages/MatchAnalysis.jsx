
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProbabilityChart from "../components/match/ProbabilityChart";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { generateAllPredictions } from "../utils/predictionGenerator.js";
import { Badge } from "@/components/ui/badge";

export default function MatchAnalysis() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    player1_id: "",
    player2_id: "",
    tournament_name: "",
    round: "QF",
    surface: "hard",
    best_of: 3,
    tour_level: "ATP",
    utc_start: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [selectedModel, setSelectedModel] = useState('balanced');
  const [error, setError] = useState(null);

  const { data: players } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list(),
    initialData: [],
  });

  const createMatchMutation = useMutation({
    mutationFn: (data) => base44.entities.Match.create(data),
  });

  const createPredictionMutation = useMutation({
    mutationFn: (data) => base44.entities.Prediction.create(data),
  });

  const handleAnalyze = async () => {
    if (!formData.player1_id || !formData.player2_id) {
      setError("Please select both players");
      return;
    }

    if (formData.player1_id === formData.player2_id) {
      setError("Please select different players");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      // Create the match with enhanced fields
      const match = await createMatchMutation.mutateAsync({
        ...formData,
        status: 'scheduled'
      });

      const player1 = players.find(p => p.id === formData.player1_id);
      const player2 = players.find(p => p.id === formData.player2_id);

      // Generate all three predictions using the math engine
      const allPredictions = await generateAllPredictions(match, player1, player2);

      // Save all predictions to database
      const savedPredictions = [];
      for (const predictionData of allPredictions) {
        const saved = await createPredictionMutation.mutateAsync(predictionData);
        savedPredictions.push({
          ...predictionData,
          id: saved.id,
          player1,
          player2
        });
      }

      setPredictions(savedPredictions);

      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    } catch (err) {
      setError("Failed to analyze match. Please try again.");
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const currentPrediction = predictions?.find(p => p.model_type === selectedModel);

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Match Analysis</h1>
        <p className="text-slate-500 mt-2">Generate probability predictions using advanced statistical models</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card className="shadow-md sticky top-6">
            <CardHeader>
              <CardTitle>Match Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="player1">Player 1</Label>
                <Select
                  value={formData.player1_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, player1_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.display_name || player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="player2">Player 2</Label>
                <Select
                  value={formData.player2_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, player2_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.display_name || player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tournament_name">Tournament</Label>
                <Input
                  id="tournament_name"
                  value={formData.tournament_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, tournament_name: e.target.value }))}
                  placeholder="e.g., Australian Open"
                />
              </div>

              <div>
                <Label htmlFor="round">Round</Label>
                <Select
                  value={formData.round}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, round: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="R128">Round of 128</SelectItem>
                    <SelectItem value="R64">Round of 64</SelectItem>
                    <SelectItem value="R32">Round of 32</SelectItem>
                    <SelectItem value="R16">Round of 16</SelectItem>
                    <SelectItem value="QF">Quarterfinals</SelectItem>
                    <SelectItem value="SF">Semifinals</SelectItem>
                    <SelectItem value="F">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="surface">Surface</Label>
                <Select
                  value={formData.surface}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, surface: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hard">Hard Court</SelectItem>
                    <SelectItem value="clay">Clay Court</SelectItem>
                    <SelectItem value="grass">Grass Court</SelectItem>
                    <SelectItem value="indoor">Indoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="best_of">Best Of</Label>
                <Select
                  value={formData.best_of.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, best_of: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Best of 3</SelectItem>
                    <SelectItem value="5">Best of 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>

              {predictions && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(createPageUrl("Predictions"))}
                >
                  View All Predictions
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {currentPrediction ? (
            <>
              {/* Model Selector */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Prediction Models</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Compare predictions from three different analytical models
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {predictions.map((pred) => (
                      <button
                        key={pred.model_type}
                        onClick={() => setSelectedModel(pred.model_type)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedModel === pred.model_type
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 mb-1 capitalize">
                          {pred.model_type}
                        </div>
                        <div className="text-xs text-slate-500 mb-3">
                          {pred.model_type === 'conservative' && 'Lower variance, favors favorites'}
                          {pred.model_type === 'balanced' && 'Standard statistical model'}
                          {pred.model_type === 'aggressive' && 'Higher variance, favors underdogs'}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">
                            {pred.player1_win_probability > pred.player2_win_probability ? 'P1' : 'P2'}
                          </span>
                          <span className="text-lg font-bold text-emerald-600">
                            {Math.max(pred.player1_win_probability, pred.player2_win_probability).toFixed(1)}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Win Probabilities */}
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Match Prediction</CardTitle>
                    <Badge className={
                      currentPrediction.confidence_level === 'high' ? 'bg-emerald-100 text-emerald-700' :
                      currentPrediction.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {currentPrediction.confidence_level} confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 capitalize">
                    {currentPrediction.model_type} Model (v{currentPrediction.model_version})
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
                      <div className="text-sm text-slate-600 mb-2">
                        {currentPrediction.player1.display_name || currentPrediction.player1.name}
                      </div>
                      <div className="text-5xl font-bold text-emerald-600">
                        {currentPrediction.player1_win_probability.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500 mt-2">Win Probability</div>
                    </div>

                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
                      <div className="text-sm text-slate-600 mb-2">
                        {currentPrediction.player2.display_name || currentPrediction.player2.name}
                      </div>
                      <div className="text-5xl font-bold text-orange-600">
                        {currentPrediction.player2_win_probability.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500 mt-2">Win Probability</div>
                    </div>
                  </div>

                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-50">
                      <div className="text-xs text-slate-500 mb-1">Predicted Sets</div>
                      <div className="font-semibold text-slate-900">{currentPrediction.predicted_sets}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50">
                      <div className="text-xs text-slate-500 mb-1">Straight Sets Probability</div>
                      <div className="font-semibold text-slate-900">
                        {currentPrediction.prob_straight_sets?.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50">
                      <div className="text-xs text-slate-500 mb-1">Deciding Set Probability</div>
                      <div className="font-semibold text-slate-900">
                        {currentPrediction.prob_deciding_set?.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50">
                      <div className="text-xs text-slate-500 mb-1">Avg Deuce Probability</div>
                      <div className="font-semibold text-slate-900">
                        {currentPrediction.prob_40_40?.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reasoning */}
              {currentPrediction.reasoning && (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed">
                      {currentPrediction.reasoning}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Key Factors */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Key Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentPrediction.key_factors?.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="flex-1 text-slate-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Probability Chart */}
              <ProbabilityChart
                data={currentPrediction.point_by_point_data}
                player1Name={currentPrediction.player1.display_name || currentPrediction.player1.name}
                player2Name={currentPrediction.player2.display_name || currentPrediction.player2.name}
              />
            </>
          ) : (
            <Card className="shadow-md">
              <CardContent className="py-16 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-slate-500 mb-4">
                  Fill in the match details and click "Analyze Match" to generate predictions using three different models
                </p>
                <div className="max-w-md mx-auto mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-sm text-emerald-800 font-medium mb-2">What you'll get:</div>
                  <ul className="text-sm text-emerald-700 space-y-1 text-left">
                    <li>• Three prediction models (Conservative, Balanced, Aggressive)</li>
                    <li>• Probability analysis using advanced tennis statistics</li>
                    <li>• Point-by-point match flow visualization</li>
                    <li>• AI-powered insights and key factors</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
