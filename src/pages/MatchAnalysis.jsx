
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, AlertCircle, Brain } from "lucide-react"; // Added Brain
import { Alert, AlertDescription } from "@/components/ui/alert";
// import ProbabilityChart from "../components/match/ProbabilityChart"; // Removed as predictions are navigated away
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { generateAllPredictions } from "../utils/predictionGenerator.js";
import { generateMLPrediction } from "../utils/mlPrediction.js"; // Added ML Prediction
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast for toasts

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
  // Removed 'analyzing', 'predictions', 'selectedModel' states as the component now redirects
  const [mlEnhanced, setMlEnhanced] = useState(false); // New state for ML enhancement
  const [error, setError] = useState(null);

  const { data: players } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list(),
    initialData: [],
  });

  // Removed createMatchMutation and createPredictionMutation as they are now encapsulated
  // within the new generatePredictionsMutation

  const generatePredictionsMutation = useMutation({
    mutationFn: async (matchData) => {
      // Create the match with enhanced fields
      const match = await base44.entities.Match.create(matchData);

      const player1 = players.find(p => p.id === matchData.player1_id);
      const player2 = players.find(p => p.id === matchData.player2_id);

      let predictions;
      if (mlEnhanced) {
        // Generate ML-enhanced prediction
        const mlPred = await generateMLPrediction(match, player1, player2);
        predictions = [mlPred];
      } else {
        // Generate traditional 3 predictions
        predictions = await generateAllPredictions(match, player1, player2);
      }

      // Save all predictions to database
      const createdPredictions = await Promise.all(
        predictions.map(pred => base44.entities.Prediction.create(pred))
      );

      return { match, predictions: createdPredictions };
    },
    onSuccess: ({ match, predictions }) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      toast.success(mlEnhanced ? 'ML-enhanced prediction generated!' : `Generated ${predictions.length} predictions successfully!`);
      navigate(createPageUrl("Predictions"));
    },
    onError: (error) => {
      toast.error("Failed to generate predictions. Please try again.");
      console.error(error);
      setError("Failed to generate predictions. Please check your inputs and try again.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!formData.player1_id || !formData.player2_id) {
      setError("Please select both players");
      return;
    }

    if (formData.player1_id === formData.player2_id) {
      setError("Please select different players");
      return;
    }

    setError(null);

    try {
      await generatePredictionsMutation.mutateAsync({
        ...formData,
        status: 'scheduled'
      });
    } catch (err) {
      // Error handled by the mutation's onError callback
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Match Analysis</h1>
        <p className="text-slate-500 mt-2">Generate probability predictions using advanced statistical models</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-6">
            <CardHeader className="border-b border-slate-200">
              <CardTitle>Match Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6"> {/* Wrapped form fields in <form> */}
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

                {/* ML Enhancement Toggle */}
                <div className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="ml-enhanced"
                      checked={mlEnhanced}
                      onChange={(e) => setMlEnhanced(e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="ml-enhanced" className="font-semibold text-purple-900 flex items-center gap-2 cursor-pointer">
                        <Brain className="w-5 h-5" />
                        Use ML-Enhanced Prediction
                        <Badge className="bg-purple-600 text-white">NEW</Badge>
                      </label>
                      <p className="text-sm text-purple-700 mt-1">
                        Leverages machine learning with head-to-head data, recent form, fatigue indicators, and injury status for improved accuracy.
                        {mlEnhanced ? ' Will generate 1 comprehensive ML prediction.' : ' Unchecked will generate 3 traditional model predictions.'}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit" // Changed to type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={generatePredictionsMutation.isPending} // Use mutation's pending state
                >
                  {generatePredictionsMutation.isPending ? (
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
                {/* Removed 'View All Predictions' button as we navigate on success */}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results / Status message (adapted for new redirection flow) */}
        <div className="lg:col-span-2 space-y-6">
          {generatePredictionsMutation.isPending && (
            <Card className="shadow-md">
              <CardContent className="py-16 text-center">
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-emerald-400 animate-spin" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Generating Predictions...
                </h3>
                <p className="text-slate-500 mb-4">
                  This might take a moment. You will be redirected to the predictions page shortly.
                </p>
              </CardContent>
            </Card>
          )}

          {generatePredictionsMutation.isSuccess && (
            <Card className="shadow-md">
              <CardContent className="py-16 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Predictions Generated!
                </h3>
                <p className="text-slate-500 mb-4">
                  Redirecting you to view the predictions...
                </p>
                <Button onClick={() => navigate(createPageUrl("Predictions"))}>
                  Go to Predictions Now
                </Button>
              </CardContent>
            </Card>
          )}

          {generatePredictionsMutation.isError && (
            <Card className="shadow-md">
              <CardContent className="py-16 text-center">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Failed to Generate Predictions
                </h3>
                <p className="text-slate-500 mb-4">
                  An error occurred: {generatePredictionsMutation.error?.message || "Please try again."}
                </p>
                <Button onClick={handleSubmit} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {!generatePredictionsMutation.isPending && !generatePredictionsMutation.isSuccess && !generatePredictionsMutation.isError && (
            <Card className="shadow-md">
              <CardContent className="py-16 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-slate-500 mb-4">
                  Fill in the match details and click "Analyze Match" to generate predictions using three different models, or an ML-enhanced model.
                </p>
                <div className="max-w-md mx-auto mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-sm text-emerald-800 font-medium mb-2">What you'll get:</div>
                  <ul className="text-sm text-emerald-700 space-y-1 text-left">
                    <li>• Three prediction models (Conservative, Balanced, Aggressive) or one ML-enhanced model</li>
                    <li>• Probability analysis using advanced tennis statistics</li>
                    <li>• AI-powered insights and key factors</li>
                    <li>• Predictions viewable on a dedicated page</li>
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
