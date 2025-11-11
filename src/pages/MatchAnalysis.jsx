import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, TrendingUp, AlertCircle, Brain } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { generateAllPredictions } from '../utils/predictionGenerator.js';
import { generateMLPrediction } from '../utils/mlPrediction.js';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentClient } from '@/data/dataSourceStore';

export default function MatchAnalysis() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    player1_id: '',
    player2_id: '',
    tournament_name: '',
    round: 'QF',
    surface: 'hard',
    best_of: 3,
    tour_level: 'ATP',
    utc_start: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [mlEnhanced, setMlEnhanced] = useState(false);
  const [error, setError] = useState('');

  // Get available players
  const { data: players } = useQuery({
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

  // Query active model weights for ML prediction
  const { data: activeWeights } = useQuery({
    queryKey: ['model-weights', 'active'],
    queryFn: async () => {
      try {
        const client = getCurrentClient();
        if (!client?.modelWeights?.list) return [];
        return await client.modelWeights.list({ filters: { is_active: true } });
      } catch (error) {
        console.warn('Failed to load model weights:', error);
        return [];
      }
    },
    initialData: [],
    retry: false,
  });

  // Mutation for creating match
  const createMatchMutation = useMutation({
    mutationFn: async (matchData) => {
      const client = getCurrentClient();
      const match = await client.matches.create(matchData);
      const player1 = players.find((p) => p.id === match.player1_id);
      const player2 = players.find((p) => p.id === match.player2_id);

      let predictions = [];
      if (mlEnhanced) {
        const weights = activeWeights[0];
        const mlPrediction = generateMLPrediction(match, player1, player2, weights);
        predictions = [await client.predictions.create(mlPrediction)];
      } else {
        const standardPredictions = generateAllPredictions(match, player1, player2);
        predictions = await Promise.all(
          standardPredictions.map((p) => client.predictions.create(p)),
        );
      }

      return { match, predictions };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['matches']);
      queryClient.invalidateQueries(['predictions']);
      // Navigate to predictions view
      navigate(createPageUrl('Predictions'));
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create match analysis',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.player1_id || !formData.player2_id) {
      setError('Please select both players');
      return;
    }

    if (formData.player1_id === formData.player2_id) {
      setError('Please select different players');
      return;
    }

    createMatchMutation.mutate(formData);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Match Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="player1">Player 1</Label>
                <Select
                  value={formData.player1_id}
                  onValueChange={(v) => setFormData({ ...formData, player1_id: v })}
                >
                  <SelectTrigger id="player1">
                    <SelectValue placeholder="Select player 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.display_name || p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="player2">Player 2</Label>
                <Select
                  value={formData.player2_id}
                  onValueChange={(v) => setFormData({ ...formData, player2_id: v })}
                >
                  <SelectTrigger id="player2">
                    <SelectValue placeholder="Select player 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.display_name || p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMatchMutation.isLoading}>
                {createMatchMutation.isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  'Create'
                )}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setFormData({ ...formData, player1_id: '', player2_id: '' })}
              >
                Reset
              </Button>
            </div>

            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
