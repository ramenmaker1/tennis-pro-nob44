import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Database, Sliders, Brain } from 'lucide-react';
import { DataSourceSelector } from '../components/DataSourceSelector';
import ApiUsageStats from '../components/ApiUsageStats';

// Import existing components that will be reused
import Players from './Players';
import BulkImport from './BulkImport';
import DataQuality from './DataQuality';

const cardClasses = "bg-gray-900 rounded-2xl p-6 border-2 border-yellow-400 border-opacity-30";
const headerClasses = "text-yellow-400 font-black text-xl mb-4";

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState('players');

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
            <Settings className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-yellow-400">Settings</h1>
            <p className="text-gray-400">Configure players, models & data sources</p>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="max-w-7xl">
        <TabsList className="bg-gray-900 border-2 border-gray-800 mb-6">
          <TabsTrigger value="players" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Users className="w-4 h-4 mr-2" />
            Players
          </TabsTrigger>
          <TabsTrigger value="datasources" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Database className="w-4 h-4 mr-2" />
            Data Sources
          </TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Brain className="w-4 h-4 mr-2" />
            Models
          </TabsTrigger>
          <TabsTrigger value="import" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Sliders className="w-4 h-4 mr-2" />
            Data Management
          </TabsTrigger>
        </TabsList>

        {/* Players Management Tab */}
        <TabsContent value="players">
          <Players />
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="datasources">
          <div className="space-y-6">
            {/* Data Source Selector */}
            <Card className={cardClasses}>
              <CardHeader>
                <CardTitle className={headerClasses}>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Configure Data Sources
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataSourceSelector />
              </CardContent>
            </Card>

            {/* API Usage Stats */}
            <Card className={cardClasses}>
              <CardHeader>
                <CardTitle className={headerClasses}>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    API Usage Statistics
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ApiUsageStats />
              </CardContent>
            </Card>

            {/* Data Source Priority Info */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold text-yellow-400 mb-4">Data Source Fallback Order</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Pinnacle API (if configured)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>RapidAPI Tennis (if enabled)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Sofascore (web scraping)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span>TheSportsDB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <span>TennisLive.net (web scraping)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">6</span>
                    <span>Mock Data (fallback)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models">
          <Card className={cardClasses}>
            <CardHeader>
              <CardTitle className={headerClasses}>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Prediction Models
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Model Descriptions */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎯</span>
                      <h3 className="font-bold text-yellow-400">Ensemble (Recommended)</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Combines multiple models for highest accuracy:
                    </p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>• ELO Rating: 40%</li>
                      <li>• Surface Expert: 30%</li>
                      <li>• Betting Odds: 20%</li>
                      <li>• Basic Stats: 10%</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📊</span>
                      <h3 className="font-bold text-yellow-400">ELO Rating</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Chess-style rating system with dynamic K-factors based on tournament tier and player form.
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎾</span>
                      <h3 className="font-bold text-yellow-400">Surface Expert</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Specialized for surface-specific performance. Focuses on clay/grass/hard court expertise.
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">⚖️</span>
                      <h3 className="font-bold text-yellow-400">Balanced</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Equal weighting of stats, rankings, and recent form. Good for general predictions.
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🛡️</span>
                      <h3 className="font-bold text-yellow-400">Conservative</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Favors favorites, reduces upset predictions. Uses heavily weighted rankings.
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🤖</span>
                      <h3 className="font-bold text-yellow-400">ML Enhanced</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Machine learning with expanded features including momentum and injury history.
                    </p>
                  </div>
                </div>

                {/* Model Performance (Coming Soon) */}
                <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4">
                  <div className="text-sm text-amber-400">
                    <span className="font-bold">Coming Soon:</span> Live model performance tracking, accuracy metrics, and auto-optimization based on results.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management Tab */}
        <TabsContent value="import">
          <div className="space-y-6">
            {/* Bulk Import */}
            <Card className={cardClasses}>
              <CardHeader>
                <CardTitle className={headerClasses}>
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5" />
                    Bulk Data Import
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BulkImport />
              </CardContent>
            </Card>

            {/* Data Quality */}
            <Card className={cardClasses}>
              <CardHeader>
                <CardTitle className={headerClasses}>
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5" />
                    Data Quality & Validation
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataQuality />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
