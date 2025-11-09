import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Settings, Save, RotateCcw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentClient } from '@/data/dataSourceStore';

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
      const client = getCurrentClient();
      // Deactivate current weights if they exist
      if (currentWeights.id) {
        await client.modelWeights.update(currentWeights.id, { is_active: false });
      }

      // Create new active weights
      await client.modelWeights.create({
        ...newWeights,
        is_active: true,
        model_version: 'v1.0',
        last_updated: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['model-weights']);
      toast.success('Model weights updated');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update weights: ' + (error.message || 'Unknown error'));
    },
  });

  const handleSave = () => {
    if (!isValidTotal) {
      toast.error('Weights must sum to 1.0');
      return;
    }
    saveWeightsMutation.mutate(weights);
  };

  const updateWeight = (key, value) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  const resetWeights = () => {
    setWeights(getDefaultWeights());
    toast('Reset to default weights');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5" /> Model Weights Editor
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Feature Weights ({(totalWeight * 100).toFixed(1)}%)</Label>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  onClick={resetWeights}
                  title="Reset to defaults"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </Button>
                <Button
                  size="sm"
                  className="px-3"
                  onClick={handleSave}
                  disabled={!isValidTotal || saveWeightsMutation.isPending}
                >
                  {saveWeightsMutation.isPending ? (
                    <>
                      <Zap className="w-4 h-4 mr-1 animate-pulse" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
            {!isValidTotal && (
              <p className="text-sm text-yellow-600">
                Total weight must equal 100%. Adjust sliders to reach target.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function initializeWeights(current) {
  if (!current) return getDefaultWeights();
  return {
    ranking_weight: current.ranking_weight ?? 0.3,
    serve_weight: current.serve_weight ?? 0.15,
    return_weight: current.return_weight ?? 0.15,
    surface_weight: current.surface_weight ?? 0.1,
    h2h_weight: current.h2h_weight ?? 0.1,
    form_weight: current.form_weight ?? 0.1,
    fatigue_weight: current.fatigue_weight ?? 0.05,
    injury_weight: current.injury_weight ?? 0.05,
    notes: current.notes ?? '',
  };
}

function getDefaultWeights() {
  return {
    ranking_weight: 0.3,
    serve_weight: 0.15,
    return_weight: 0.15,
    surface_weight: 0.1,
    h2h_weight: 0.1,
    form_weight: 0.1,
    fatigue_weight: 0.05,
    injury_weight: 0.05,
    notes: '',
  };
}