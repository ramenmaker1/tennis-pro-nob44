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

export default function MatchAnalysis() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    player1_id: "",
    player2_id: "",
    tournament: "",
    surface: "hard",
    match_date: new Date().toISOString().split('T')[0],
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);
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
      // Create the match
      const match = await createMatchMutation.mutateAsync({
        ...formData,
        status: 'upcoming'
      });

      const player1 = players.find(p => p.id === formData.player1_id);
      const player2 = players.find(p => p.id === formData.player2_id);

      // Calculate probabilities using LLM
      const analysisPrompt = `
You are a tennis match prediction expert. Analyze the following match and provide a detailed prediction.

Player 1: ${player1.name}
- First Serve %: ${player1.first_serve_percentage || 'N/A'}
- 1st Serve Points Won: ${player1.first_serve_points_won || 'N/A'}%
- 2nd Serve Points Won: ${player1.second_serve_points_won || 'N/A'}%
- Return Points Won: ${player1.return_points_won || 'N/A'}%
- Break Points Converted: ${player1.break_points_converted || 'N/A'}%
- ${formData.surface} Court Win Rate: ${
  formData.surface === 'hard' ? player1.hard_court_win_rate :
  formData.surface === 'clay' ? player1.clay_court_win_rate :
  player1.grass_court_win_rate || 'N/A'
}%

Player 2: ${player2.name}
- First Serve %: ${player2.first_serve_percentage || 'N/A'}
- 1st Serve Points Won: ${player2.first_serve_points_won || 'N/A'}%
- 2nd Serve Points Won: ${player2.second_serve_points_won || 'N/A'}%
- Return Points Won: ${player2.return_points_won || 'N/A'}%
- Break Points Converted: ${player2.break_points_converted || 'N/A'}%
- ${formData.surface} Court Win Rate: ${
  formData.surface === 'hard' ? player2.hard_court_win_rate :
  formData.surface === 'clay' ? player2.clay_court_win_rate :
  player2.grass_court_win_rate || 'N/A'
}%

Surface: ${formData.surface}
Tournament: ${formData.tournament}

Provide a prediction with:
1. Win probabilities for each player (must sum to 100)
2. Predicted set score
3. Key factors (3-5 bullet points)
4. Confidence level (low/medium/high)
5. Point-by-point probability data for visualization (15 data points showing probability shifts throughout the match)
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            player1_win_probability: { type: "number" },
            player2_win_probability: { type: "number" },
            predicted_sets: { type: "string" },
            key_factors: { 
              type: "array",
              items: { type: "string" }
            },
            confidence_level: { 
              type: "string",
              enum: ["low", "medium", "high"]
            },
            point_by_point_data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  game: { type: "number" },
                  player1_probability: { type: "number" },
                  player2_probability: { type: "number" }
                }
              }
            }
          }
        }
      });

      const predictedWinnerId = result.player1_win_probability > result.player2_win_probability 
        ? formData.player1_id 
        : formData.player2_id;

      // Create prediction
      const predictionData = {
        match_id: match.id,
        predicted_winner_id: predictedWinnerId,
        player1_win_probability: result.player1_win_probability,
        player2_win_probability: result.player2_win_probability,
        predicted_sets: result.predicted_sets,
        key_factors: result.key_factors,
        confidence_level: result.confidence_level,
        point_by_point_data: result.point_by_point_data
      };

      await createPredictionMutation.mutateAsync(predictionData);

      setPrediction({
        ...predictionData,
        player1,
        player2
      });

      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    } catch (err) {
      setError("Failed to analyze match. Please try again.");
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Match Analysis</h1>
        <p className="text-slate-500 mt-2">Generate probability predictions for upcoming matches</p>
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
                        {player.name}
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
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tournament">Tournament</Label>
                <Input
                  id="tournament"
                  value={formData.tournament}
                  onChange={(e) => setFormData(prev => ({ ...prev, tournament: e.target.value }))}
                  placeholder="e.g., Australian Open"
                />
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
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="match_date">Match Date</Label>
                <Input
                  id="match_date"
                  type="date"
                  value={formData.match_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, match_date: e.target.value }))}
                />
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

              {prediction && (
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
          {prediction ? (
            <>
              {/* Win Probabilities */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Match Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
                      <div className="text-sm text-slate-600 mb-2">{prediction.player1.name}</div>
                      <div className="text-5xl font-bold text-emerald-600">
                        {prediction.player1_win_probability.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500 mt-2">Win Probability</div>
                    </div>

                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
                      <div className="text-sm text-slate-600 mb-2">{prediction.player2.name}</div>
                      <div className="text-5xl font-bold text-orange-600">
                        {prediction.player2_win_probability.toFixed(1)}%
                      </div>
                      <div className="text-sm text-slate-500 mt-2">Win Probability</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-slate-50">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Predicted Sets:</span>
                        <span className="ml-2 font-semibold">{prediction.predicted_sets}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Confidence:</span>
                        <span className="ml-2 font-semibold capitalize">{prediction.confidence_level}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Factors */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Key Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prediction.key_factors?.map((factor, idx) => (
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
                data={prediction.point_by_point_data}
                player1Name={prediction.player1.name}
                player2Name={prediction.player2.name}
              />
            </>
          ) : (
            <Card className="shadow-md">
              <CardContent className="py-16 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-slate-500">
                  Fill in the match details and click "Analyze Match" to generate predictions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}