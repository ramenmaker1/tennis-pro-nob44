import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Radio, Activity, TrendingUp, Clock, Target } from 'lucide-react';
import { getCurrentClient } from '../data/dataSourceStore';
import { predictMatches } from '../services/predictionService';
import { getLiveMatches } from '../services/tennisDataService';

const cardClasses = "bg-gray-900 rounded-2xl p-6 border-2 border-yellow-400 border-opacity-30";
const headerClasses = "text-yellow-400 font-black text-xl mb-4";

export default function LiveAnalysis() {
  const [selectedTab, setSelectedTab] = useState('live');

  // Fetch live matches directly from tennis data service
  const { data: liveMatches = [], isLoading: loadingMatches, error: matchesError } = useQuery({
    queryKey: ['live-matches'],
    queryFn: async () => {
      console.log('🎾 Fetching live matches...');
      const matches = await getLiveMatches();
      console.log('✅ Live matches fetched:', matches.length, matches);
      return matches;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2,
  });

  // Fetch players
  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const client = getCurrentClient();
      if (!client?.players?.list) return [];
      return await client.players.list();
    },
  });

  // Generate predictions for live matches
  const { data: predictions = [] } = useQuery({
    queryKey: ['live-predictions', liveMatches],
    queryFn: () => {
      if (!liveMatches.length || !players.length) return [];
      return predictMatches(liveMatches, players, 'ensemble');
    },
    enabled: liveMatches.length > 0 && players.length > 0,
  });

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
            <Radio className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-yellow-400">Live & Analysis</h1>
            <p className="text-gray-400">Real-time tracking & performance insights</p>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="max-w-7xl">
        <TabsList className="bg-gray-900 border-2 border-gray-800 mb-6">
          <TabsTrigger value="live" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Radio className="w-4 h-4 mr-2" />
            Live Matches
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Activity className="w-4 h-4 mr-2" />
            Post-Match Analysis
          </TabsTrigger>
          <TabsTrigger value="learning" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <TrendingUp className="w-4 h-4 mr-2" />
            Learning Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Live Matches Tab */}
        <TabsContent value="live">
          <div className="grid gap-6">
            {/* Stats Row */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-yellow-400">
                        {liveMatches.length}
                      </div>
                      <div className="text-sm text-gray-400">Live Matches</div>
                    </div>
                    <Radio className="w-8 h-8 text-yellow-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-yellow-400">
                        {predictions.filter(p => p.has_player_data).length}
                      </div>
                      <div className="text-sm text-gray-400">With Predictions</div>
                    </div>
                    <Target className="w-8 h-8 text-yellow-400 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-yellow-400">
                        <Clock className="w-6 h-6 inline animate-pulse" />
                      </div>
                      <div className="text-sm text-gray-400">Auto-refresh: 30s</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Matches List */}
            {matchesError && (
              <Card className="bg-red-900/30 border-red-700 border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">❌</span>
                    <div>
                      <h3 className="text-lg font-bold text-red-400 mb-2">Error Fetching Live Matches</h3>
                      <p className="text-red-200 text-sm">
                        {matchesError.message || 'Failed to load live matches. Please try again.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {loadingMatches ? (
              <Card className={cardClasses}>
                <CardContent className="p-12 text-center text-gray-500">
                  Loading live matches...
                </CardContent>
              </Card>
            ) : liveMatches.length === 0 ? (
              <Card className={cardClasses}>
                <CardContent className="p-12 text-center text-gray-500">
                  <Radio className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No live matches at the moment</p>
                  <p className="text-sm mt-2">Check back during tournament hours</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {predictions.map((prediction, idx) => (
                  <Card key={idx} className="bg-gray-900 border-gray-800 hover:border-yellow-400/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Match Info */}
                        <div className="md:col-span-2">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <Badge variant="success" className="mb-2">
                                🔴 LIVE
                              </Badge>
                              <div className="text-sm text-gray-400">
                                {prediction.tournament_name} • {prediction.surface}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{prediction.player1_name}</span>
                              <span className="text-yellow-400 font-black">
                                {prediction.player1_win_probability?.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                                style={{ width: `${prediction.player1_win_probability}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <span className="font-bold text-white">{prediction.player2_name}</span>
                              <span className="text-blue-400 font-black">
                                {prediction.player2_win_probability?.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                                style={{ width: `${prediction.player2_win_probability}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Prediction Stats */}
                        <div className="space-y-3">
                          <div className="bg-gray-800 rounded-lg p-3">
                            <div className="text-xs text-gray-400 mb-1">Confidence</div>
                            <Badge
                              variant={
                                prediction.confidence_level === 'high' ? 'success' :
                                prediction.confidence_level === 'medium' ? 'warning' : 'default'
                              }
                            >
                              {prediction.confidence_level?.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="bg-gray-800 rounded-lg p-3">
                            <div className="text-xs text-gray-400 mb-1">Predicted Winner</div>
                            <div className="text-white font-bold text-sm truncate">
                              {prediction.predicted_winner_name}
                            </div>
                          </div>

                          {!prediction.has_player_data && (
                            <Badge variant="secondary" className="text-xs">
                              📊 Estimated
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Post-Match Analysis Tab */}
        <TabsContent value="analysis">
          <Card className={cardClasses}>
            <CardHeader>
              <CardTitle className={headerClasses}>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Post-Match Analysis
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-bold mb-2">Coming Soon</p>
                <p>Detailed analysis of completed matches</p>
                <p className="text-sm mt-2">Track prediction accuracy and performance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Dashboard Tab */}
        <TabsContent value="learning">
          <Card className={cardClasses}>
            <CardHeader>
              <CardTitle className={headerClasses}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Learning Dashboard
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-bold mb-2">Coming Soon</p>
                <p>Model performance and learning insights</p>
                <p className="text-sm mt-2">Track how predictions improve over time</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
