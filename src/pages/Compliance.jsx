import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, ExternalLink, Plus, Edit, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import ComplianceForm from "../components/admin/ComplianceForm";

export default function Compliance() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState(null);

  const { data: sources, isLoading } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.SourceCompliance.list('-last_reviewed'),
    initialData: [],
  });

  const handleEdit = (source) => {
    setEditingSource(source);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingSource(null);
  };

  const statusColors = {
    compliant: 'bg-emerald-100 text-emerald-700',
    pending_review: 'bg-yellow-100 text-yellow-700',
    violation: 'bg-red-100 text-red-700',
  };

  const statusGlyphs = {
    compliant: '✓',
    pending_review: '⏳',
    violation: '⚠️',
  };

  const statusIcons = {
    compliant: '✓',
    pending_review: '⏱',
    violation: '⚠',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Source Compliance Dashboard</h1>
          <p className="text-slate-500 mt-2">Track data sources and licensing compliance</p>
        </div>
        <Button
          onClick={() => {
            setEditingSource(null);
            setShowForm(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Data Source
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-slate-500">Total Sources</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{sources.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-slate-500">Compliant</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {sources.filter(s => s.compliance_status === 'compliant').length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-slate-500">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">
              {sources.filter(s => s.compliance_status === 'pending_review').length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-slate-500">Violations</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {sources.filter(s => s.compliance_status === 'violation').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : sources.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Source</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Last Reviewed</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Reviewer</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => (
                    <tr key={source.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-medium text-slate-900">{source.data_source_name}</div>
                        {source.terms_url && (
                          <a
                            href={source.terms_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                          >
                            View Terms <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {source.notes && (
                          <p className="text-xs text-slate-500 mt-1">{source.notes}</p>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={statusColors[source.compliance_status]}>
                          {statusGlyphs[source.compliance_status]} {source.compliance_status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center text-sm text-slate-600">
                        {source.last_reviewed
                          ? format(new Date(source.last_reviewed), 'MMM d, yyyy')
                          : 'Never'}
                      </td>
                      <td className="py-3 px-2 text-center text-sm text-slate-600">
                        {source.reviewer || '-'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(source)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data Sources</h3>
              <p className="text-slate-500 mb-4">Start tracking your data sources for compliance</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Source
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Info */}
      <Card className="shadow-md bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Compliance Best Practices</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Always review terms of service before using data from external sources</li>
                <li>Track data source in the <code className="bg-blue-100 px-1 rounded">data_source</code> field when adding players</li>
                <li>Review compliance status regularly (at least quarterly)</li>
                <li>Mark sources as "violation" if terms change or access is revoked</li>
                <li>Keep notes on licensing agreements and data usage restrictions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSource ? 'Review Data Source' : 'Add Data Source'}
            </DialogTitle>
          </DialogHeader>
          <ComplianceForm source={editingSource} onSuccess={handleClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
