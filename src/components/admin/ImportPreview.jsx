import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportPreview({ rows }) {
  if (!rows || rows.length === 0) return null;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Preview (first 10 rows)</CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Review the data before importing {rows.length}+ players
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 font-semibold text-slate-700">#</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-700">Name</th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700">Rank</th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700">Age</th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700">Nationality</th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((row, idx) => {
                const hasName = row.display_name || (row.first_name && row.last_name);
                const age = row.birth_year
                  ? new Date().getFullYear() - parseInt(row.birth_year)
                  : null;

                return (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 px-2 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-2">
                      <div className="font-medium text-slate-900">
                        {row.display_name ||
                          `${row.first_name || ''} ${row.last_name || ''}`.trim() ||
                          'N/A'}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600">
                      {row.current_rank || '-'}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600">{age || '-'}</td>
                    <td className="py-2 px-2 text-center">
                      {row.nationality ? (
                        <Badge variant="outline" className="text-xs">
                          {row.nationality}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {hasName ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 inline" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length > 10 && (
          <div className="mt-4 text-center text-sm text-slate-500">
            ... and {rows.length - 10} more rows
          </div>
        )}
      </CardContent>
    </Card>
  );
}
