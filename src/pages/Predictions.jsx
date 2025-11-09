import React, { useMemo, useState } from 'react';
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
import { getCurrentClient } from '@/data/dataSourceStore';

export default function Predictions() {
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [modelFilter, setModelFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');

  const { data: predictions, isLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => getCurrentClient().predictions.list('-created_date'),
    initialData: [],
  });

  const { data: matches } = useQuery({
    queryKey: ['matches'],
    queryFn: () => getCurrentClient().matches.list(),
    initialData: [],
  });

  const { data: players } = useQuery({
    queryKey: ['players'],
    queryFn: () => getCurrentClient().players.list(),
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
      ml: predictions.filter((p) => p.model_type === 'ml' && p.was_correct === true).length,
    },
  };