import React, { useState } from 'react';
import { getCurrentClient } from '@/data/dataSourceStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function ComplianceForm({ source = null, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    data_source_name: source?.data_source_name || '',
    terms_url: source?.terms_url || '',
    compliance_status: source?.compliance_status || 'pending_review',
    notes: source?.notes || '',
    reviewer: source?.reviewer || '',
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      source
        ? getCurrentClient().compliance.update(source.id, {
            ...data,
            last_reviewed: new Date().toISOString(),
          })
        : getCurrentClient().compliance.create({
            ...data,
            last_reviewed: new Date().toISOString(),
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
      toast.success(source ? 'Source updated' : 'Source added');
      if (onSuccess) onSuccess();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="data_source_name">Data Source Name *</Label>
        <Input
          id="data_source_name"
          value={formData.data_source_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, data_source_name: e.target.value }))}
          placeholder="e.g., ATP Official, Tennis Abstract"
          required
        />
      </div>

      <div>
        <Label htmlFor="terms_url">Terms of Service URL</Label>
        <Input
          id="terms_url"
          type="url"
          value={formData.terms_url}
          onChange={(e) => setFormData((prev) => ({ ...prev, terms_url: e.target.value }))}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label htmlFor="compliance_status">Compliance Status</Label>
        <Select
          value={formData.compliance_status}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, compliance_status: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="violation">Violation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reviewer">Reviewer Name</Label>
        <Input
          id="reviewer"
          value={formData.reviewer}
          onChange={(e) => setFormData((prev) => ({ ...prev, reviewer: e.target.value }))}
          placeholder="Your name"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Compliance notes, licensing info, etc."
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="bg-emerald-600 hover:bg-emerald-700"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Saving...' : source ? 'Update Source' : 'Add Source'}
      </Button>
    </form>
  );
}
