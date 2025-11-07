
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Download, AlertCircle, CheckCircle, FileText } from "lucide-react";
import ImportPreview from "../components/admin/ImportPreview";
import { parseCSV, validatePlayerImportRow, generateCSVTemplate } from "../utils/csvParser.js";
import { generatePlayerAliases } from "../utils/aliasGenerator.js";
import { toast } from "sonner";

export default function BulkImport() {
  const queryClient = useQueryClient();
  const [csvFile, setCsvFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importStatus, setImportStatus] = useState('idle'); // idle, processing, complete
  const [results, setResults] = useState({ success: 0, errors: 0, errorDetails: [] });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      setPreview(rows);
      toast.success(`Loaded ${rows.length} rows from CSV`);
    } catch (error) {
      toast.error('Failed to parse CSV file');
      console.error(error);
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'player-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const handleImport = async () => {
    if (!csvFile || preview.length === 0) return;

    setImportStatus('processing');
    setResults({ success: 0, errors: 0, errorDetails: [] });

    let success = 0;
    let errors = 0;
    const errorDetails = [];

    for (let i = 0; i < preview.length; i++) {
      const row = preview[i];
      
      try {
        // Validate row
        const validatedData = validatePlayerImportRow(row);

        // Check for duplicates by slug
        const existing = await base44.entities.Player.list();
        const duplicate = existing.find(p => p.slug === validatedData.slug);

        if (duplicate) {
          errorDetails.push({
            row: i + 1,
            player: validatedData.display_name,
            error: 'Player with this name already exists',
          });
          errors++;
          continue;
        }

        // Create player
        const player = await base44.entities.Player.create(validatedData);

        // Generate and create aliases
        const aliases = generatePlayerAliases(player);
        for (const alias of aliases) {
          try {
            await base44.entities.Alias.create({
              player_id: player.id,
              ...alias,
              is_auto_generated: true,
            });
          } catch (aliasError) {
            // Continue even if alias creation fails
            console.error('Failed to create alias:', aliasError);
          }
        }

        success++;

      } catch (error) {
        errorDetails.push({
          row: i + 1,
          player: row.display_name || `${row.first_name} ${row.last_name}` || 'Unknown',
          error: error.message,
        });
        errors++;
      }
    }

    setResults({ success, errors, errorDetails });
    setImportStatus('complete');
    queryClient.invalidateQueries({ queryKey: ['players'] });

    if (success > 0) {
      toast.success(`Successfully imported ${success} players`);
    }
    if (errors > 0) {
      toast.error(`${errors} errors occurred during import`);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Bulk Player Import</h1>
        <p className="text-slate-500 mt-2">Import multiple players from a CSV file</p>
      </div>

      {/* File Upload Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Upload a CSV file with player data. Maximum 1000 rows.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>

          {/* CSV Format Guide */}
          <details className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <summary className="font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
              <FileText className="w-4 h-4" />
              CSV Format Guide
            </summary>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Required columns:</p>
              <ul className="list-disc list-inside pl-4">
                <li><code className="bg-slate-200 px-1 rounded">display_name</code> or <code className="bg-slate-200 px-1 rounded">first_name</code> + <code className="bg-slate-200 px-1 rounded">last_name</code></li>
              </ul>
              
              <p className="mt-3">Optional columns:</p>
              <ul className="list-disc list-inside pl-4 text-xs">
                <li>birth_year, nationality, height_cm, plays, current_rank, peak_rank, elo_rating</li>
                <li>first_serve_pct, first_serve_win_pct, second_serve_win_pct</li>
                <li>first_return_win_pct, break_points_converted_pct</li>
                <li>hard_court_win_pct, clay_court_win_pct, grass_court_win_pct</li>
                <li>data_source (to track where stats came from)</li>
              </ul>

              <div className="mt-3 p-3 bg-white rounded border border-slate-200 overflow-x-auto">
                <pre className="text-xs">
{`first_name,last_name,birth_year,nationality,current_rank,first_serve_win_pct
Roger,Federer,1981,SUI,5,78.5
Rafael,Nadal,1986,ESP,2,72.3`}
                </pre>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview.length > 0 && importStatus === 'idle' && (
        <>
          <ImportPreview rows={preview} />

          <Card className="shadow-md bg-emerald-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-emerald-900">Ready to Import</h3>
                  <p className="text-sm text-emerald-700 mt-1">
                    {preview.length} players will be imported with auto-generated aliases
                  </p>
                </div>
                <Button
                  onClick={handleImport}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import {preview.length} Players
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Import Progress */}
      {importStatus === 'processing' && (
        <Card className="shadow-md">
          <CardContent className="py-16 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-emerald-600" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Importing Players...
            </h3>
            <p className="text-slate-500">
              This may take a few moments. Please don't close this page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importStatus === 'complete' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md bg-emerald-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-900">
                      {results.success}
                    </div>
                    <div className="text-sm text-emerald-700">Successfully Imported</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-900">
                      {results.errors}
                    </div>
                    <div className="text-sm text-red-700">Errors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Details */}
          {results.errorDetails.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-red-900">Error Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.errorDetails.map((error, idx) => (
                    <Alert key={idx} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Row {error.row} ({error.player}):</strong> {error.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setImportStatus('idle');
                setPreview([]);
                setCsvFile(null);
                setResults({ success: 0, errors: 0, errorDetails: [] });
              }}
              variant="outline"
            >
              Import Another File
            </Button>
            <Button
              onClick={() => window.location.href = '/players'}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              View Players
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
