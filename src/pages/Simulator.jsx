import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';
import { getCurrentClient } from '../data/dataSourceStore';
import { predictMatches } from '../services/predictionService';

// Card styling constants
const cardClasses = "bg-gray-900 rounded-2xl p-6 border-2 border-yellow-400 border-opacity-30";
const headerClasses = "text-yellow-400 font-black text-xl mb-4";
const ctaClasses = "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all";

export default function Simulator() {
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [surface, setSurface] = useState('hard');
  const [prediction, setPrediction] = useState(null);

  // Fetch players
  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const client = getCurrentClient();
      if (!client?.players?.list) return [];
      return await client.players.list();
    },
    initialData: [],
  });

  const handleRunPrediction = () => {
    if (!player1 || !player2) {
      alert('Please select both players');
      return;
    }

    // Create a mock match for prediction
    const mockMatch = {
      id: `sim-${Date.now()}`,
      player1_name: player1.name,
      player2_name: player2.name,
      player_a: player1.name,
      player_b: player2.name,
      surface: surface,
      tournament_name: 'Simulation',
      round: 'Simulation',
    };

    const predictions = predictMatches([mockMatch], players, selectedModel);
    if (predictions && predictions.length > 0) {
      setPrediction(predictions[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
            <Target className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-yellow-400">Match Simulator</h1>
            <p className="text-gray-400">AI-powered tennis match predictions</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-7xl">
        {/* Configuration Panel */}
        <Card className={cardClasses}>
          <CardHeader>
            <CardTitle className={headerClasses}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Configure Match
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Player 1 Selection */}
            <div>
              <label className="text-sm font-bold text-yellow-400 mb-2 block">
                Player 1
              </label>
              <Select value={player1?.id?.toString()} onValueChange={(value) => {
                const p = players.find(p => p.id.toString() === value);
                setPlayer1(p);
              }}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select player 1" />
                </SelectTrigger>
                <SelectContent>
                  {players.slice(0, 100).map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.display_name || p.name} {p.ranking && `(#${p.ranking})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Player 2 Selection */}
            <div>
              <label className="text-sm font-bold text-yellow-400 mb-2 block">
                Player 2
              </label>
              <Select value={player2?.id?.toString()} onValueChange={(value) => {
                const p = players.find(p => p.id.toString() === value);
                setPlayer2(p);
              }}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select player 2" />
                </SelectTrigger>
                <SelectContent>
                  {players.slice(0, 100).map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.display_name || p.name} {p.ranking && `(#${p.ranking})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Surface Selection */}
            <div>
              <label className="text-sm font-bold text-yellow-400 mb-2 block">
                Surface
              </label>
              <Select value={surface} onValueChange={setSurface}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hard">Hard Court</SelectItem>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="grass">Grass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-sm font-bold text-yellow-400 mb-2 block">
                Prediction Model
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ensemble">🎯 Ensemble (Recommended)</SelectItem>
                  <SelectItem value="elo">📊 ELO Rating</SelectItem>
                  <SelectItem value="surface_expert">🎾 Surface Expert</SelectItem>
                  <SelectItem value="balanced">⚖️ Balanced</SelectItem>
                  <SelectItem value="conservative">🛡️ Conservative</SelectItem>
                  <SelectItem value="ml">🤖 ML Enhanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Run Button */}
            <Button 
              onClick={handleRunPrediction}
              className={ctaClasses + " w-full"}
              disabled={!player1 || !player2}
            >
              <Target className="w-5 h-5 mr-2" />
              Run Prediction
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className={cardClasses}>
          <CardHeader>
            <CardTitle className={headerClasses}>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Prediction Results
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!prediction ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Configure match and click "Run Prediction"</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Match Info */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="text-center text-lg font-bold text-white mb-2">
                    {player1?.display_name || player1?.name}
                    <span className="text-yellow-400 mx-3">VS</span>
                    {player2?.display_name || player2?.name}
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    {surface.charAt(0).toUpperCase() + surface.slice(1)} • {selectedModel}
                  </div>
                </div>

                {/* Win Probabilities */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold">{player1?.display_name || player1?.name}</span>
                      <span className="text-yellow-400 font-black text-xl">
                        {prediction.player1_win_probability?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all"
                        style={{ width: `${prediction.player1_win_probability}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold">{player2?.display_name || player2?.name}</span>
                      <span className="text-yellow-400 font-black text-xl">
                        {prediction.player2_win_probability?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${prediction.player2_win_probability}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Confidence & Winner */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Predicted Winner</div>
                    <div className="text-white font-bold truncate">
                      {prediction.predicted_winner_name}
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Confidence</div>
                    <Badge
                      variant={
                        prediction.confidence_level === 'high' ? 'success' :
                        prediction.confidence_level === 'medium' ? 'warning' : 'default'
                      }
                      className="text-sm font-bold"
                    >
                      {prediction.confidence_level?.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Key Factors */}
                {prediction.key_factors && (
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-2">Key Factors</div>
                    <div className="text-sm text-white">
                      {prediction.key_factors}
                    </div>
                  </div>
                )}

                {/* Data Quality Indicator */}
                {!prediction.has_player_data && (
                  <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-3">
                    <div className="text-xs text-amber-400 flex items-center gap-2">
                      <span>📊</span>
                      <span>Using estimated player data - import players for better accuracy</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Model Info */}
      <div className="mt-8 max-w-7xl">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">🎯 Ensemble Model</h3>
                <p className="text-gray-400">
                  Combines ELO (40%), Surface Expertise (30%), Odds (20%), and Stats (10%) for highest accuracy
                </p>
              </div>
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">📊 ELO Rating</h3>
                <p className="text-gray-400">
                  Chess-style rating system with tournament-specific K-factors and form adjustments
                </p>
              </div>
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">🎾 Surface Expert</h3>
                <p className="text-gray-400">
                  Focuses on surface-specific performance history and player specializations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
