import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Settings, Save, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";

export default function ModelWeightsEditor({ currentWeights, onClose }) {
  const queryClient = useQueryClient();
  const [weights, setWeights] = useState(() => initializeWeights(currentWeights));

  const totalWeight = 
    weights.ranking_weight + 
    weights.serve_weight + 
    weights.return_weight + 
    weights.surface_weight + 
    weights.h2h_weight + 
    weights.form_weight + 
    weights.fatigue_weight + 
    weights.injury_weight;

  const isValidTotal = Math.abs(totalWeight - 1.0) < 0.01;

  const saveWeightsMutation = useMutation({
    mutationFn: async (newWeights) => {
      // Deactivate current weights if they exist
      if (currentWeights.id) {
        await base44.entities.ModelWeights.update(currentWeights.id, { is_active: false });
      }
      
      // Create new active weights
      return base44.entities.ModelWeights.create({
        ...newWeights,
        is_active: true,
        last_updated: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-weights'] });
      toast.success('Model weights updated successfully!');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update weights');
      console.error(error);
    },
  });

  const trainWeights = useMutation({
    mutationFn: async () => {
      const feedback = await base44.entities.ModelFeedback.list({ limit: 1000 });
      if (!feedback || feedback.length === 0) {
        throw new Error("No feedback data available");
      }

      const optimizedWeights = optimizeWeights(feedback, weights);

      if (currentWeights.id) {
        await base44.entities.ModelWeights.update(currentWeights.id, { is_active: false });
      }

      return base44.entities.ModelWeights.create({
        ...optimizedWeights,
        is_active: true,
        training_date: new Date().toISOString(),
        training_samples: feedback.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-weights'] });
      queryClient.invalidateQueries({ queryKey: ['model-feedback'] });
      toast.success('Auto-training complete! New weights activated.');
      onClose();
    },
    onError: (error) => {
      console.error(error);
      toast.error(error?.message || 'Failed to auto-train weights');
    },
  });

  const handleWeightChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!isValidTotal) {
      toast.error('Total weights must sum to 1.0');
      return;
    }
    saveWeightsMutation.mutate(weights);
  };

  const resetToDefaults = () => {
    setWeights(initializeWeights());
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Model Weight Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Version */}
          <div>
            <Label>Model Version</Label>
            <Input
              value={weights.model_version}
              onChange={(e) => handleWeightChange('model_version', e.target.value)}
              placeholder="e.g., v4.1"
            />
          </div>

          {/* Weight Sliders */}
          <div className="space-y-4">
            <WeightSlider
              label="Ranking Weight"
              value={weights.ranking_weight}
              onChange={(v) => handleWeightChange('ranking_weight', v)}
              description="Impact of player rankings on prediction"
            />
            <WeightSlider
              label="Serve Weight"
              value={weights.serve_weight}
              onChange={(v) => handleWeightChange('serve_weight', v)}
              description="Impact of serve statistics"
            />
            <WeightSlider
              label="Return Weight"
              value={weights.return_weight}
              onChange={(v) => handleWeightChange('return_weight', v)}
              description="Impact of return game statistics"
            />
            <WeightSlider
              label="Surface Weight"
              value={weights.surface_weight}
              onChange={(v) => handleWeightChange('surface_weight', v)}
              description="Impact of surface-specific performance"
            />
            <WeightSlider
              label="Head-to-Head Weight"
              value={weights.h2h_weight}
              onChange={(v) => handleWeightChange('h2h_weight', v)}
              description="Impact of historical matchups"
            />
            <WeightSlider
              label="Form Weight"
              value={weights.form_weight}
              onChange={(v) => handleWeightChange('form_weight', v)}
              description="Impact of recent form and streaks"
            />
            <WeightSlider
              label="Fatigue Weight"
              value={weights.fatigue_weight}
              onChange={(v) => handleWeightChange('fatigue_weight', v)}
              description="Impact of rest days and match frequency"
            />
            <WeightSlider
              label="Injury Weight"
              value={weights.injury_weight}
              onChange={(v) => handleWeightChange('injury_weight', v)}
              description="Impact of active injuries"
            />
          </div>

          {/* Total Weight Display */}
          <div className={`p-4 rounded-lg border-2 ${isValidTotal ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Weight:</span>
              <span className={`text-2xl font-bold ${isValidTotal ? 'text-green-700' : 'text-red-700'}`}>
                {totalWeight.toFixed(3)}
              </span>
            </div>
            {!isValidTotal && (
              <p className="text-xs text-red-600 mt-1">
                Weights must sum to exactly 1.0
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={weights.notes}
              onChange={(e) => handleWeightChange('notes', e.target.value)}
              placeholder="Add notes about this configuration..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => trainWeights.mutate()}
              disabled={trainWeights.isPending}
              className="border-amber-400 text-amber-600 hover:bg-amber-50"
            >
              <Zap className="w-4 h-4 mr-2" />
              {trainWeights.isPending ? 'Training...' : 'Auto-Train'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValidTotal || saveWeightsMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveWeightsMutation.isPending ? 'Saving...' : 'Save Weights'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WeightSlider({ label, value, onChange, description }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm font-bold text-slate-900">{(value * 100).toFixed(1)}%</span>
      </div>
      <Slider
        value={[value * 100]}
        onValueChange={(v) => onChange(v[0] / 100)}
        min={0}
        max={50}
        step={0.5}
        className="w-full"
      />
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

function initializeWeights(existing = {}) {
  return {
    model_version: existing.model_version || 'v4.0',
    ranking_weight: existing.ranking_weight ?? 0.25,
    serve_weight: existing.serve_weight ?? 0.20,
    return_weight: existing.return_weight ?? 0.15,
    surface_weight: existing.surface_weight ?? 0.15,
    h2h_weight: existing.h2h_weight ?? 0.10,
    form_weight: existing.form_weight ?? 0.10,
    fatigue_weight: existing.fatigue_weight ?? 0.03,
    injury_weight: existing.injury_weight ?? 0.02,
    notes: existing.notes || '',
  };
}

const FEATURE_MAP = [
  { weightKey: 'ranking_weight', featureKey: 'ranking_delta', scale: 200 },
  { weightKey: 'serve_weight', featureKey: 'serve_delta', scale: 50 },
  { weightKey: 'return_weight', featureKey: 'return_delta', scale: 50 },
  { weightKey: 'surface_weight', featureKey: 'surface_delta', scale: 50 },
  { weightKey: 'h2h_weight', featureKey: 'h2h_delta', scale: 10 },
  { weightKey: 'form_weight', featureKey: 'form_delta', scale: 10 },
  { weightKey: 'fatigue_weight', featureKey: 'fatigue_delta', scale: 10 },
  { weightKey: 'injury_weight', featureKey: 'injury_delta', scale: 5 },
];

function optimizeWeights(feedback = [], baseWeights = initializeWeights()) {
  let weights = { ...baseWeights };
  const seedVersion = baseWeights.model_version || 'v4.0';
  if (!Array.isArray(feedback) || feedback.length === 0) {
    return weights;
  }

  const learningRate = 0.05;
  const iterations = 100;

  for (let i = 0; i < iterations; i++) {
    const gradients = FEATURE_MAP.reduce((acc, { weightKey }) => {
      acc[weightKey] = 0;
      return acc;
    }, {});

    feedback.forEach((entry) => {
      const snapshot = entry.feature_snapshot || {};
      const target = entry.was_correct ? 1 : 0;
      const score = FEATURE_MAP.reduce((sum, { weightKey, featureKey, scale }) => {
        const featureValue = normalizeFeature(snapshot[featureKey], scale);
        return sum + (weights[weightKey] || 0) * featureValue;
      }, 0);
      const prediction = sigmoid(score);
      const error = prediction - target;

      FEATURE_MAP.forEach(({ weightKey, featureKey, scale }) => {
        const featureValue = normalizeFeature(snapshot[featureKey], scale);
        gradients[weightKey] += error * featureValue;
      });
    });

    FEATURE_MAP.forEach(({ weightKey }) => {
      weights[weightKey] -= learningRate * (gradients[weightKey] / feedback.length);
      weights[weightKey] = clamp(weights[weightKey], 0.01, 0.4);
    });

    weights = renormalizeWeights(weights);
  }

  weights.model_version = generateAutoVersion(seedVersion);
  weights.notes = `Auto-trained on ${feedback.length} samples (${new Date().toLocaleDateString()})`;
  return weights;
}

function normalizeFeature(value, scale = 1) {
  if (value == null) return 0;
  return Math.tanh(Number(value) / scale);
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function renormalizeWeights(weights) {
  const total = FEATURE_MAP.reduce((sum, { weightKey }) => sum + (weights[weightKey] || 0), 0);
  if (total === 0) return weights;
  FEATURE_MAP.forEach(({ weightKey }) => {
    weights[weightKey] = (weights[weightKey] || 0) / total;
  });
  return weights;
}

function generateAutoVersion(currentVersion = 'v4.0') {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  if (!currentVersion) return `auto-${timestamp}`;
  return `${currentVersion}-auto-${timestamp}`;
}
