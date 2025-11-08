import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";

const WEIGHT_FEATURE_KEYS = [
  "ranking_delta",
  "serve_delta",
  "return_delta",
  "surface_delta",
  "form_delta",
  "fatigue_delta",
  "injury_delta",
];

export function PredictionFeedback({ prediction, match = {}, player1, player2 }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [actualWinner, setActualWinner] = useState("");

  const submitFeedback = useMutation({
    mutationFn: async () => {
      if (!prediction?.id || !actualWinner) return;

      const isCorrect = prediction.predicted_winner_id === actualWinner;

      await base44.entities.Prediction.update(prediction.id, {
        actual_winner_id: actualWinner,
        was_correct: isCorrect,
        completed_at: new Date().toISOString(),
      });

      await base44.entities.ModelFeedback.create({
        prediction_id: prediction.id,
        match_id: match?.id || prediction.match_id,
        model_type: prediction.model_type,
        was_correct: isCorrect,
        confidence_level: prediction.confidence_level,
        feedback_date: new Date().toISOString(),
        surface: match?.surface,
        player1_id: match?.player1_id,
        player2_id: match?.player2_id,
        feature_snapshot: buildFeatureSnapshot(match, player1, player2),
        metadata: {
          predicted_winner_id: prediction.predicted_winner_id,
          actual_winner_id: actualWinner,
          player1_win_probability: prediction.player1_win_probability,
          player2_win_probability: prediction.player2_win_probability,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback recorded",
        description: "Model will learn from this result.",
      });
      setActualWinner("");
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["model-feedback"] });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Failed to record result",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const player1Name = player1?.display_name || player1?.name || "Player 1";
  const player2Name = player2?.display_name || player2?.name || "Player 2";
  const resultAlreadyCaptured = Boolean(prediction?.actual_winner_id);

  return (
    <Card className="shadow-sm border-emerald-100">
      <CardHeader>
        <CardTitle className="text-base">Record Match Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resultAlreadyCaptured ? (
          <p className="text-sm text-slate-600">
            Result recorded:{" "}
            {prediction.actual_winner_id === player1?.id ? player1Name : player2Name}.
          </p>
        ) : (
          <>
            <RadioGroup value={actualWinner} onValueChange={setActualWinner} className="space-y-3">
              <div className="flex items-center space-x-3 rounded-lg border border-slate-200 p-3">
                <RadioGroupItem value={match?.player1_id || player1?.id || "player1"} id={`p1-${prediction.id}`} />
                <Label htmlFor={`p1-${prediction.id}`} className="flex-1 cursor-pointer">
                  <div className="font-medium text-slate-900">{player1Name}</div>
                  <p className="text-xs text-slate-500">Player 1 Actual Winner</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-slate-200 p-3">
                <RadioGroupItem value={match?.player2_id || player2?.id || "player2"} id={`p2-${prediction.id}`} />
                <Label htmlFor={`p2-${prediction.id}`} className="flex-1 cursor-pointer">
                  <div className="font-medium text-slate-900">{player2Name}</div>
                  <p className="text-xs text-slate-500">Player 2 Actual Winner</p>
                </Label>
              </div>
            </RadioGroup>
            <Button
              onClick={() => submitFeedback.mutate()}
              disabled={!actualWinner || submitFeedback.isPending}
              className="w-full"
            >
              {submitFeedback.isPending ? "Recording..." : "Submit Result"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function buildFeatureSnapshot(match, player1, player2) {
  const snapshot = {
    ranking_delta: calculateDelta(player1?.current_rank, player2?.current_rank, true),
    serve_delta: calculateDelta(player1?.first_serve_win_pct, player2?.first_serve_win_pct),
    return_delta: calculateDelta(player1?.first_return_win_pct, player2?.first_return_win_pct),
    surface_delta: calculateSurfaceDelta(match?.surface, player1, player2),
    form_delta: calculateDelta(player1?.recent_form, player2?.recent_form),
    fatigue_delta: calculateDelta(player2?.fatigue_index, player1?.fatigue_index), // lower fatigue is better
    injury_delta: calculateDelta(player2?.injury_risk, player1?.injury_risk),
  };

  WEIGHT_FEATURE_KEYS.forEach((key) => {
    if (snapshot[key] === null || snapshot[key] === undefined || Number.isNaN(snapshot[key])) {
      snapshot[key] = 0;
    }
  });

  return snapshot;
}

function calculateDelta(valueA, valueB, invert = false) {
  if (valueA == null || valueB == null) return 0;
  const delta = Number(valueA) - Number(valueB);
  return invert ? delta * -1 : delta;
}

function calculateSurfaceDelta(surface, p1, p2) {
  if (!surface) return 0;
  const key = `${surface}_court_win_pct`;
  return calculateDelta(p1?.[key], p2?.[key]);
}

export default PredictionFeedback;
