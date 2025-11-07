import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Upload, 
  Shield, 
  CheckCircle,
  HelpCircle,
  Zap
} from "lucide-react";

export default function Help() {
  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Help & Documentation</h1>
        <p className="text-slate-500 mt-2">Learn how to use TennisPro Match Analytics</p>
      </div>

      {/* Quick Start Guide */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <QuickStartCard
              icon={Users}
              title="1. Add Players"
              description="Start by adding tennis players with their statistics"
              link="#players"
            />
            <QuickStartCard
              icon={TrendingUp}
              title="2. Analyze Matches"
              description="Generate predictions using three different models"
              link="#analysis"
            />
            <QuickStartCard
              icon={BarChart3}
              title="3. View Results"
              description="Track prediction accuracy and model performance"
              link="#results"
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Documentation */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Feature Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="players">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Player Management
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Adding a Player</h4>
                    <ol className="list-decimal list-inside pl-2 space-y-1">
                      <li>Navigate to the Players page</li>
                      <li>Click "Add Player" button</li>
                      <li>Fill in required fields:
                        <ul className="list-disc list-inside pl-6 mt-1">
                          <li>First Name & Last Name (or Display Name)</li>
                          <li>Current Rank (optional but recommended)</li>
                          <li>Serve Statistics (first serve %, points won, etc.)</li>
                          <li>Return Statistics</li>
                          <li>Surface-specific win percentages</li>
                        </ul>
                      </li>
                      <li>Click "Add Player" to save</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Quick Mode vs Full Profile</h4>
                    <p>
                      Quick Mode: Add essential info to get started quickly. Perfect for testing.
                    </p>
                    <p className="mt-1">
                      Full Profile: Enter comprehensive statistics for more accurate predictions.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Data Quality</h4>
                    <p>
                      Players with complete serve, return, and surface statistics will produce the most accurate predictions.
                      Aim for at least 70% data completeness.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="analysis">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  Match Analysis & Predictions
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Generating Predictions</h4>
                    <ol className="list-decimal list-inside pl-2 space-y-1">
                      <li>Go to Match Analysis page</li>
                      <li>Select Player 1 from dropdown</li>
                      <li>Select Player 2 from dropdown</li>
                      <li>Enter tournament details (name, round)</li>
                      <li>Choose court surface (hard, clay, grass, or indoor)</li>
                      <li>Select Best Of (3 or 5 sets)</li>
                      <li>Click "Analyze Match"</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Understanding the Three Models</h4>
                    <div className="space-y-2 mt-2">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-semibold text-blue-900">Conservative Model</div>
                        <p className="text-blue-800 text-xs mt-1">
                          Heavily favors higher-ranked players. Lower variance, more predictable outcomes.
                          Best for: Matches with clear favorites.
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="font-semibold text-yellow-900">Balanced Model</div>
                        <p className="text-yellow-800 text-xs mt-1">
                          Uses realistic ATP statistics with moderate variance. Most accurate representation.
                          Best for: General use, most reliable predictions.
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="font-semibold text-red-900">Aggressive Model</div>
                        <p className="text-red-800 text-xs mt-1">
                          Higher variance allows for upsets and momentum swings. Captures unpredictable matches.
                          Best for: Matches between evenly-matched players.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Reading the Results</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                      <li>Win Probabilities: Percentage chance each player will win</li>
                      <li>Confidence Level: High/Medium/Low based on how decisive the prediction is</li>
                      <li>Predicted Sets: Expected final set score</li>
                      <li>Straight Sets Probability: Chance of a 2-0 (or 3-0) victory</li>
                      <li>Deciding Set Probability: Chance of going to a third (or fifth) set</li>
                      <li>Key Factors: AI-generated insights explaining the prediction</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="predictions">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  Viewing & Tracking Predictions
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Predictions Page</h4>
                    <p>View all generated predictions with filters:</p>
                    <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                      <li>Filter by Model Type (Conservative/Balanced/Aggressive)</li>
                      <li>Filter by Confidence Level (High/Medium/Low)</li>
                      <li>Click on a prediction to expand full details</li>
                      <li>View point-by-point probability charts</li>
                      <li>Export predictions to JSON or CSV</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Dashboard Analytics</h4>
                    <p>Track performance metrics:</p>
                    <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                      <li>Overall accuracy across all models</li>
                      <li>Model-specific accuracy rates</li>
                      <li>Confidence distribution (high/medium/low predictions)</li>
                      <li>Recent trends and performance</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bulk-import">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-green-600" />
                  Bulk Import Players
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">CSV Import Process</h4>
                    <ol className="list-decimal list-inside pl-2 space-y-1">
                      <li>Go to Bulk Import page (Admin Tools)</li>
                      <li>Download the CSV template</li>
                      <li>Fill in player data (one row per player)</li>
                      <li>Upload your completed CSV file</li>
                      <li>Review the preview (first 10 rows shown)</li>
                      <li>Click "Import" to add all players</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">CSV Format</h4>
                    <p>Required columns:</p>
                    <ul className="list-disc list-inside pl-2 mt-1">
                      <li><code className="bg-slate-100 px-1 rounded">display_name</code> OR <code className="bg-slate-100 px-1 rounded">first_name</code> + <code className="bg-slate-100 px-1 rounded">last_name</code></li>
                    </ul>
                    <p className="mt-2">Optional but recommended:</p>
                    <ul className="list-disc list-inside pl-2 text-xs">
                      <li>current_rank, nationality, birth_year</li>
                      <li>first_serve_pct, first_serve_win_pct, second_serve_win_pct</li>
                      <li>first_return_win_pct, break_points_converted_pct</li>
                      <li>hard_court_win_pct, clay_court_win_pct, grass_court_win_pct</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Auto-Generated Aliases</h4>
                    <p>
                      The system automatically creates name variations (e.g., "R. Federer", "Federer") to help with search and matching.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="compliance">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  Data Source Compliance
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Tracking Data Sources</h4>
                    <p>
                      Use the Compliance dashboard to track where your player statistics come from and ensure
                      you have proper licensing/permissions.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Best Practices</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                      <li>Always add a data source when creating players</li>
                      <li>Include links to terms of service</li>
                      <li>Review compliance status quarterly</li>
                      <li>Mark sources as "violation" if access is revoked</li>
                      <li>Keep notes on licensing agreements</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-quality">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  Data Quality Dashboard
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Monitoring Data Quality</h4>
                    <p>
                      The Data Quality page helps you identify players with incomplete statistics that
                      may affect prediction accuracy.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Completeness Metrics</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                      <li>Missing Rank: Players without ranking data</li>
                      <li>No Serve Stats: Missing first/second serve statistics</li>
                      <li>No Return Stats: Missing return game data</li>
                      <li>No Surface Stats: Missing hard/clay/grass win percentages</li>
                      <li>No Source: Players without data_source attribution</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Improving Data Quality</h4>
                    <p>Focus on completing serve and return statistics first, as these have the biggest impact on prediction accuracy.
                    Surface-specific win percentages are also crucial for accurate surface-based predictions.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Card className="shadow-md bg-emerald-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <HelpCircle className="w-5 h-5" />
            Tips & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-emerald-800">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Start with the Balanced model for most accurate general predictions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Use Conservative model when there's a clear ranking difference (e.g., Top 10 vs Top 50)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Use Aggressive model for matches between similarly-ranked players</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Complete serve and return stats have the biggest impact on accuracy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Surface-specific win percentages significantly improve surface-based predictions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Use the Bulk Import feature for adding multiple players efficiently</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Always set the data_source field to track where statistics came from</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Export predictions to CSV for external analysis or record-keeping</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickStartCard({ icon: Icon, title, description, link }) {
  return (
    <a href={link} className="block p-4 rounded-lg border-2 border-slate-200 hover:border-emerald-300 transition-colors bg-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </a>
  );
}