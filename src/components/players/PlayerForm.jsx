import React, { useState } from 'react';
import React from 'react';
import { getCurrentClient } from '@/data/dataSourceStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, Zap, User } from 'lucide-react';
import {
  validatePercentage,
  validateRanking,
  validateEloRating,
  validateBirthYear,
  validateHeight,
  validateMomentum,
  generateSlug,
  getValidationError,
} from '../../utils/validation';

export default function PlayerForm({ open, onClose, player = null }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState('quick'); // 'quick' or 'full'
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Basic Info
    first_name: player?.first_name || '',
    last_name: player?.last_name || '',
    display_name: player?.display_name || '',
    slug: player?.slug || '',
    birth_year: player?.birth_year || '',
    nationality: player?.nationality || '',
    height_cm: player?.height_cm || '',
    plays: player?.plays || 'Right',
    photo_url: player?.photo_url || '',

    // Rankings & Ratings
    current_rank: player?.current_rank || '',
    peak_rank: player?.peak_rank || '',
    elo_rating: player?.elo_rating || '',

    // Serve Stats
    first_serve_pct: player?.first_serve_pct || '',
    first_serve_win_pct: player?.first_serve_win_pct || '',
    second_serve_win_pct: player?.second_serve_win_pct || '',
    aces_per_match: player?.aces_per_match || '',
    double_faults_per_match: player?.double_faults_per_match || '',

    // Return Stats
    first_return_win_pct: player?.first_return_win_pct || '',
    second_return_win_pct: player?.second_return_win_pct || '',
    break_points_converted_pct: player?.break_points_converted_pct || '',
    return_games_won_pct: player?.return_games_won_pct || '',

    // Advanced Metrics
    clutch_factor: player?.clutch_factor || '',
    consistency_rating: player?.consistency_rating || '',
    tiebreak_win_pct: player?.tiebreak_win_pct || '',
    deuce_win_pct: player?.deuce_win_pct || '',

    // Surface Performance
    hard_court_win_pct: player?.hard_court_win_pct || '',
    clay_court_win_pct: player?.clay_court_win_pct || '',
    grass_court_win_pct: player?.grass_court_win_pct || '',

    // Physical/Mental
    fitness_rating: player?.fitness_rating || '',
    momentum_rating: player?.momentum_rating || '',

    // Admin
    data_source: player?.data_source || '',
    notes: player?.notes || '',
  });

  const createPlayerMutation = useMutation({
    mutationFn: (data) =>
      player ? base44.entities.Player.update(player.id, data) : base44.entities.Player.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      display_name: '',
      slug: '',
      birth_year: '',
      nationality: '',
      height_cm: '',
      plays: 'Right',
      photo_url: '',
      current_rank: '',
      peak_rank: '',
      elo_rating: '',
      first_serve_pct: '',
      first_serve_win_pct: '',
      second_serve_win_pct: '',
      aces_per_match: '',
      double_faults_per_match: '',
      first_return_win_pct: '',
      second_return_win_pct: '',
      break_points_converted_pct: '',
      return_games_won_pct: '',
      clutch_factor: '',
      consistency_rating: '',
      tiebreak_win_pct: '',
      deuce_win_pct: '',
      hard_court_win_pct: '',
      clay_court_win_pct: '',
      grass_court_win_pct: '',
      fitness_rating: '',
      momentum_rating: '',
      data_source: '',
      notes: '',
    });
    setErrors({});
    setMode('quick');
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug and display_name
    if (field === 'first_name' || field === 'last_name') {
      const firstName = field === 'first_name' ? value : formData.first_name;
      const lastName = field === 'last_name' ? value : formData.last_name;
      const fullName = `${firstName} ${lastName}`.trim();

      if (fullName) {
        setFormData((prev) => ({
          ...prev,
          display_name: fullName,
          slug: generateSlug(fullName),
        }));
      }
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field
    if (!formData.display_name) {
      newErrors.display_name = 'Display name is required';
    }

    // Validate percentage fields
    const percentageFields = [
      'first_serve_pct',
      'first_serve_win_pct',
      'second_serve_win_pct',
      'first_return_win_pct',
      'second_return_win_pct',
      'break_points_converted_pct',
      'return_games_won_pct',
      'clutch_factor',
      'consistency_rating',
      'tiebreak_win_pct',
      'deuce_win_pct',
      'hard_court_win_pct',
      'clay_court_win_pct',
      'grass_court_win_pct',
      'fitness_rating',
    ];

    percentageFields.forEach((field) => {
      if (formData[field] !== '') {
        const validationResult = validatePercentage(formData[field]);
        if (validationResult !== true) {
          newErrors[field] = validationResult;
        }
      }
    });

    // Validate other fields
    if (formData.current_rank) {
      const rankingResult = validateRanking(formData.current_rank);
      if (rankingResult !== true) {
        newErrors.current_rank = rankingResult;
      }
    }
    if (formData.peak_rank) {
      const rankingResult = validateRanking(formData.peak_rank);
      if (rankingResult !== true) {
        newErrors.peak_rank = rankingResult;
      }
    }
    if (formData.elo_rating) {
      const eloResult = validateEloRating(formData.elo_rating);
      if (eloResult !== true) {
        newErrors.elo_rating = eloResult;
      }
    }
    if (formData.birth_year && !validateBirthYear(formData.birth_year)) {
      newErrors.birth_year = getValidationError('birth_year', formData.birth_year);
    }
    if (formData.height_cm && !validateHeight(formData.height_cm)) {
      newErrors.height_cm = getValidationError('height_cm', formData.height_cm);
    }
    if (formData.momentum_rating && !validateMomentum(formData.momentum_rating)) {
      newErrors.momentum_rating = getValidationError('momentum_rating', formData.momentum_rating);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const processedData = { ...formData };

    // Convert numeric fields and remove empty strings
    Object.keys(processedData).forEach((key) => {
      if (processedData[key] === '') {
        delete processedData[key];
      } else if (
        typeof processedData[key] === 'string' &&
        !isNaN(processedData[key]) &&
        key !== 'slug'
      ) {
        if (key.includes('_pct') || key.includes('rating') || key.includes('factor')) {
          processedData[key] = parseFloat(processedData[key]);
        } else if (
          key.includes('rank') ||
          key === 'birth_year' ||
          key === 'height_cm' ||
          key === 'elo_rating'
        ) {
          processedData[key] = parseInt(processedData[key]);
        } else if (key.includes('per_match')) {
          processedData[key] = parseFloat(processedData[key]);
        }
      }
    });

    createPlayerMutation.mutate(processedData);
  };

  const quickModeFields = (
    <div className="space-y-4">
      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-2">
        <Zap className="w-4 h-4 text-emerald-600 mt-0.5" />
        <div className="text-sm text-emerald-800">
          Quick mode - Add essential info to get started. You can add detailed stats later.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            placeholder="Roger"
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            placeholder="Federer"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="display_name">
          Display Name *<span className="text-xs text-slate-500 ml-2">(auto-generated)</span>
        </Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => handleChange('display_name', e.target.value)}
          required
        />
        {errors.display_name && <p className="text-sm text-red-600 mt-1">{errors.display_name}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            value={formData.nationality}
            onChange={(e) => handleChange('nationality', e.target.value)}
            placeholder="SUI or Switzerland"
          />
        </div>
        <div>
          <Label htmlFor="current_rank">Current Rank</Label>
          <Input
            id="current_rank"
            type="number"
            value={formData.current_rank}
            onChange={(e) => handleChange('current_rank', e.target.value)}
            placeholder="1-1000"
          />
          {errors.current_rank && (
            <p className="text-sm text-red-600 mt-1">{errors.current_rank}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="photo_url">Photo URL</Label>
        <Input
          id="photo_url"
          value={formData.photo_url}
          onChange={(e) => handleChange('photo_url', e.target.value)}
          placeholder="https://..."
        />
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={() => setMode('full')}>
        <User className="w-4 h-4 mr-2" />
        Switch to Full Profile Mode
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{player ? 'Edit Player' : 'Add New Player'}</DialogTitle>
            <div className="flex gap-2">
              <Badge variant={mode === 'quick' ? 'default' : 'outline'}>
                {mode === 'quick' ? 'Quick' : 'Full'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {mode === 'quick' ? (
            quickModeFields
          ) : (
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="serve">Serve</TabsTrigger>
                <TabsTrigger value="return">Return</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="surface">Surface</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name_full">First Name</Label>
                    <Input
                      id="first_name_full"
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name_full">Last Name</Label>
                    <Input
                      id="last_name_full"
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="display_name_full">Display Name *</Label>
                  <Input
                    id="display_name_full"
                    value={formData.display_name}
                    onChange={(e) => handleChange('display_name', e.target.value)}
                    required
                  />
                  {errors.display_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.display_name}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="birth_year">Birth Year</Label>
                    <Input
                      id="birth_year"
                      type="number"
                      value={formData.birth_year}
                      onChange={(e) => handleChange('birth_year', e.target.value)}
                      placeholder="1970-2010"
                    />
                    {errors.birth_year && (
                      <p className="text-sm text-red-600 mt-1">{errors.birth_year}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="height_cm">Height (cm)</Label>
                    <Input
                      id="height_cm"
                      type="number"
                      value={formData.height_cm}
                      onChange={(e) => handleChange('height_cm', e.target.value)}
                      placeholder="150-220"
                    />
                    {errors.height_cm && (
                      <p className="text-sm text-red-600 mt-1">{errors.height_cm}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="plays">Plays</Label>
                    <Select
                      value={formData.plays}
                      onValueChange={(value) => handleChange('plays', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Right">Right-handed</SelectItem>
                        <SelectItem value="Left">Left-handed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nationality_full">Nationality</Label>
                    <Input
                      id="nationality_full"
                      value={formData.nationality}
                      onChange={(e) => handleChange('nationality', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="photo_url_full">Photo URL</Label>
                    <Input
                      id="photo_url_full"
                      value={formData.photo_url}
                      onChange={(e) => handleChange('photo_url', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current_rank_full">Current Rank</Label>
                    <Input
                      id="current_rank_full"
                      type="number"
                      value={formData.current_rank}
                      onChange={(e) => handleChange('current_rank', e.target.value)}
                    />
                    {errors.current_rank && (
                      <p className="text-sm text-red-600 mt-1">{errors.current_rank}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="peak_rank">Peak Rank</Label>
                    <Input
                      id="peak_rank"
                      type="number"
                      value={formData.peak_rank}
                      onChange={(e) => handleChange('peak_rank', e.target.value)}
                    />
                    {errors.peak_rank && (
                      <p className="text-sm text-red-600 mt-1">{errors.peak_rank}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="elo_rating">ELO Rating</Label>
                    <Input
                      id="elo_rating"
                      type="number"
                      value={formData.elo_rating}
                      onChange={(e) => handleChange('elo_rating', e.target.value)}
                      placeholder="1000-3000"
                    />
                    {errors.elo_rating && (
                      <p className="text-sm text-red-600 mt-1">{errors.elo_rating}</p>
                    )}
                  </div>
                </div>

                <Button type="button" variant="outline" size="sm" onClick={() => setMode('quick')}>
                  Switch to Quick Mode
                </Button>
              </TabsContent>

              <TabsContent value="serve" className="space-y-4 mt-4">
                <FieldWithHelper
                  id="first_serve_pct"
                  label="First Serve %"
                  value={formData.first_serve_pct}
                  onChange={handleChange}
                  error={errors.first_serve_pct}
                  helper="Percentage of first serves that land in (0-100)"
                />
                <FieldWithHelper
                  id="first_serve_win_pct"
                  label="1st Serve Points Won %"
                  value={formData.first_serve_win_pct}
                  onChange={handleChange}
                  error={errors.first_serve_win_pct}
                  helper="Percentage of points won on first serve (0-100)"
                />
                <FieldWithHelper
                  id="second_serve_win_pct"
                  label="2nd Serve Points Won %"
                  value={formData.second_serve_win_pct}
                  onChange={handleChange}
                  error={errors.second_serve_win_pct}
                  helper="Percentage of points won on second serve (0-100)"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <FieldWithHelper
                    id="aces_per_match"
                    label="Aces per Match"
                    value={formData.aces_per_match}
                    onChange={handleChange}
                    helper="Average number of aces per match"
                  />
                  <FieldWithHelper
                    id="double_faults_per_match"
                    label="Double Faults per Match"
                    value={formData.double_faults_per_match}
                    onChange={handleChange}
                    helper="Average number of double faults per match"
                  />
                </div>
              </TabsContent>

              <TabsContent value="return" className="space-y-4 mt-4">
                <FieldWithHelper
                  id="first_return_win_pct"
                  label="1st Serve Return Points Won %"
                  value={formData.first_return_win_pct}
                  onChange={handleChange}
                  error={errors.first_return_win_pct}
                  helper="Points won returning first serves (0-100)"
                />
                <FieldWithHelper
                  id="second_return_win_pct"
                  label="2nd Serve Return Points Won %"
                  value={formData.second_return_win_pct}
                  onChange={handleChange}
                  error={errors.second_return_win_pct}
                  helper="Points won returning second serves (0-100)"
                />
                <FieldWithHelper
                  id="break_points_converted_pct"
                  label="Break Points Converted %"
                  value={formData.break_points_converted_pct}
                  onChange={handleChange}
                  error={errors.break_points_converted_pct}
                  helper="Percentage of break points converted (0-100)"
                />
                <FieldWithHelper
                  id="return_games_won_pct"
                  label="Return Games Won %"
                  value={formData.return_games_won_pct}
                  onChange={handleChange}
                  error={errors.return_games_won_pct}
                  helper="Percentage of return games won (0-100)"
                />
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Advanced metrics for detailed analysis. Leave blank to use defaults.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-4">
                  <FieldWithHelper
                    id="clutch_factor"
                    label="Clutch Factor"
                    value={formData.clutch_factor}
                    onChange={handleChange}
                    error={errors.clutch_factor}
                    helper="Performance in high-pressure situations (0-100)"
                  />
                  <FieldWithHelper
                    id="consistency_rating"
                    label="Consistency Rating"
                    value={formData.consistency_rating}
                    onChange={handleChange}
                    error={errors.consistency_rating}
                    helper="Overall consistency of performance (0-100)"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FieldWithHelper
                    id="tiebreak_win_pct"
                    label="Tiebreak Win %"
                    value={formData.tiebreak_win_pct}
                    onChange={handleChange}
                    error={errors.tiebreak_win_pct}
                    helper="Tiebreak win percentage (0-100)"
                  />
                  <FieldWithHelper
                    id="deuce_win_pct"
                    label="Deuce Point Win %"
                    value={formData.deuce_win_pct}
                    onChange={handleChange}
                    error={errors.deuce_win_pct}
                    helper="Deuce point win percentage (0-100)"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FieldWithHelper
                    id="fitness_rating"
                    label="Fitness Rating"
                    value={formData.fitness_rating}
                    onChange={handleChange}
                    error={errors.fitness_rating}
                    helper="Current fitness level (0-100)"
                  />
                  <FieldWithHelper
                    id="momentum_rating"
                    label="Momentum Rating"
                    value={formData.momentum_rating}
                    onChange={handleChange}
                    error={errors.momentum_rating}
                    helper="Current momentum (-100 to 100)"
                  />
                </div>
              </TabsContent>

              <TabsContent value="surface" className="space-y-4 mt-4">
                <FieldWithHelper
                  id="hard_court_win_pct"
                  label="Hard Court Win %"
                  value={formData.hard_court_win_pct}
                  onChange={handleChange}
                  error={errors.hard_court_win_pct}
                  helper="Win percentage on hard courts (0-100)"
                />
                <FieldWithHelper
                  id="clay_court_win_pct"
                  label="Clay Court Win %"
                  value={formData.clay_court_win_pct}
                  onChange={handleChange}
                  error={errors.clay_court_win_pct}
                  helper="Win percentage on clay courts (0-100)"
                />
                <FieldWithHelper
                  id="grass_court_win_pct"
                  label="Grass Court Win %"
                  value={formData.grass_court_win_pct}
                  onChange={handleChange}
                  error={errors.grass_court_win_pct}
                  helper="Win percentage on grass courts (0-100)"
                />
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="data_source">Data Source</Label>
                  <Input
                    id="data_source"
                    value={formData.data_source}
                    onChange={(e) => handleChange('data_source', e.target.value)}
                    placeholder="e.g., ATP Official, Tennis Abstract"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Track where this player's statistics came from
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Internal notes about this player..."
                    rows={4}
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 mb-2">Generated Fields</div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div>
                      <span className="font-medium">Slug:</span>{' '}
                      {formData.slug || '(auto-generated)'}
                    </div>
                    <div>
                      <span className="font-medium">Display Name:</span>{' '}
                      {formData.display_name || '(required)'}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix {Object.keys(errors).length} validation error
                {Object.keys(errors).length > 1 ? 's' : ''} before submitting.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={createPlayerMutation.isPending}
            >
              {createPlayerMutation.isPending
                ? 'Saving...'
                : player
                ? 'Update Player'
                : 'Add Player'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldWithHelper({ id, label, value, onChange, error, helper, type = 'number' }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        step="0.1"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
      />
      {helper && <p className="text-xs text-slate-500 mt-1">{helper}</p>}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
