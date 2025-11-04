import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PlayerForm({ open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    ranking: "",
    first_serve_percentage: "",
    first_serve_points_won: "",
    second_serve_points_won: "",
    return_points_won: "",
    break_points_converted: "",
    hard_court_win_rate: "",
    clay_court_win_rate: "",
    grass_court_win_rate: "",
    aces_per_match: "",
    double_faults_per_match: "",
    photo_url: "",
  });

  const createPlayerMutation = useMutation({
    mutationFn: (data) => base44.entities.Player.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      onClose();
      setFormData({
        name: "",
        country: "",
        ranking: "",
        first_serve_percentage: "",
        first_serve_points_won: "",
        second_serve_points_won: "",
        return_points_won: "",
        break_points_converted: "",
        hard_court_win_rate: "",
        clay_court_win_rate: "",
        grass_court_win_rate: "",
        aces_per_match: "",
        double_faults_per_match: "",
        photo_url: "",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = { ...formData };
    
    // Convert numeric fields
    const numericFields = [
      'ranking', 'first_serve_percentage', 'first_serve_points_won',
      'second_serve_points_won', 'return_points_won', 'break_points_converted',
      'hard_court_win_rate', 'clay_court_win_rate', 'grass_court_win_rate',
      'aces_per_match', 'double_faults_per_match'
    ];
    
    numericFields.forEach(field => {
      if (processedData[field] !== "") {
        processedData[field] = parseFloat(processedData[field]);
      } else {
        delete processedData[field];
      }
    });

    createPlayerMutation.mutate(processedData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="serve">Serve</TabsTrigger>
              <TabsTrigger value="return">Return</TabsTrigger>
              <TabsTrigger value="surface">Surface</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ranking">World Ranking</Label>
                <Input
                  id="ranking"
                  type="number"
                  value={formData.ranking}
                  onChange={(e) => handleChange('ranking', e.target.value)}
                />
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
            </TabsContent>

            <TabsContent value="serve" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="first_serve_percentage">First Serve % (0-100)</Label>
                <Input
                  id="first_serve_percentage"
                  type="number"
                  step="0.1"
                  value={formData.first_serve_percentage}
                  onChange={(e) => handleChange('first_serve_percentage', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="first_serve_points_won">1st Serve Points Won % (0-100)</Label>
                <Input
                  id="first_serve_points_won"
                  type="number"
                  step="0.1"
                  value={formData.first_serve_points_won}
                  onChange={(e) => handleChange('first_serve_points_won', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="second_serve_points_won">2nd Serve Points Won % (0-100)</Label>
                <Input
                  id="second_serve_points_won"
                  type="number"
                  step="0.1"
                  value={formData.second_serve_points_won}
                  onChange={(e) => handleChange('second_serve_points_won', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="aces_per_match">Aces per Match</Label>
                <Input
                  id="aces_per_match"
                  type="number"
                  step="0.1"
                  value={formData.aces_per_match}
                  onChange={(e) => handleChange('aces_per_match', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="double_faults_per_match">Double Faults per Match</Label>
                <Input
                  id="double_faults_per_match"
                  type="number"
                  step="0.1"
                  value={formData.double_faults_per_match}
                  onChange={(e) => handleChange('double_faults_per_match', e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="return" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="return_points_won">Return Points Won % (0-100)</Label>
                <Input
                  id="return_points_won"
                  type="number"
                  step="0.1"
                  value={formData.return_points_won}
                  onChange={(e) => handleChange('return_points_won', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="break_points_converted">Break Points Converted % (0-100)</Label>
                <Input
                  id="break_points_converted"
                  type="number"
                  step="0.1"
                  value={formData.break_points_converted}
                  onChange={(e) => handleChange('break_points_converted', e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="surface" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="hard_court_win_rate">Hard Court Win Rate % (0-100)</Label>
                <Input
                  id="hard_court_win_rate"
                  type="number"
                  step="0.1"
                  value={formData.hard_court_win_rate}
                  onChange={(e) => handleChange('hard_court_win_rate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="clay_court_win_rate">Clay Court Win Rate % (0-100)</Label>
                <Input
                  id="clay_court_win_rate"
                  type="number"
                  step="0.1"
                  value={formData.clay_court_win_rate}
                  onChange={(e) => handleChange('clay_court_win_rate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="grass_court_win_rate">Grass Court Win Rate % (0-100)</Label>
                <Input
                  id="grass_court_win_rate"
                  type="number"
                  step="0.1"
                  value={formData.grass_court_win_rate}
                  onChange={(e) => handleChange('grass_court_win_rate', e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={createPlayerMutation.isPending}
            >
              {createPlayerMutation.isPending ? "Adding..." : "Add Player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}