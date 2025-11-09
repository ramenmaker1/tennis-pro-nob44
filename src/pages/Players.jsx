import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Download, Sparkles } from 'lucide-react';
import PlayerCard from '../components/players/PlayerCard';
import PlayerStatsModal from '../components/players/PlayerStatsModal';
import PlayerForm from '../components/players/PlayerForm';
import { generateSamplePlayers } from '../utils/sampleData.js';
import { toast } from 'sonner';
import { getCurrentClient } from '@/data/dataSourceStore';

export default function Players() {
  const [searchQuery, setSearchQuery] = useState('');
  const [surfaceFilter, setSurfaceFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => getCurrentClient().players.list('-created_date'),
    initialData: [],
  });

  const handleGenerateSampleData = async () => {
    if (generating) return;
    setGenerating(true);

    try {
      const samplePlayers = generateSamplePlayers(5);
      await Promise.all(
        samplePlayers.map((player) => getCurrentClient().players.create(player))
      );
      queryClient.invalidateQueries(['players']);
      toast.success('Generated sample player data');
    } catch (error) {
      toast.error('Failed to generate sample data');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreatePlayer = async (data) => {
    try {
      await getCurrentClient().players.create(data);
      queryClient.invalidateQueries(['players']);
      setShowForm(false);
      toast.success('Player created successfully');
    } catch (error) {
      toast.error('Failed to create player');
    }
  };

  const handleUpdatePlayer = async (id, data) => {
    try {
      await getCurrentClient().players.update(id, data);
      queryClient.invalidateQueries(['players']);
      setEditingPlayer(null);
      toast.success('Player updated successfully');
    } catch (error) {
      toast.error('Failed to update player');
    }
  };

  const handleDeletePlayer = async (id) => {
    try {
      await getCurrentClient().players.remove(id);
      queryClient.invalidateQueries(['players']);
      setSelectedPlayer(null);
      toast.success('Player deleted successfully');
    } catch (error) {
      toast.error('Failed to delete player');
    }
  };

  const filterPlayers = useCallback(
    (players) => {
      return players.filter((player) => {
        const matchesSearch = player.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSurface =
          surfaceFilter === 'all' ||
          player[`${surfaceFilter}_court_win_pct`] !== null;
        return matchesSearch && matchesSurface;
      });
    },
    [searchQuery, surfaceFilter]
  );

  const filteredPlayers = useMemo(() => {
    return filterPlayers(players);
  }, [players, filterPlayers]);

  return (
    <div className="space-y-8">
      {/* Header with search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={surfaceFilter} onValueChange={setSurfaceFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Surface" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Surfaces</SelectItem>
              <SelectItem value="hard">Hard Court</SelectItem>
              <SelectItem value="clay">Clay Court</SelectItem>
              <SelectItem value="grass">Grass Court</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-x-2">
          <Button onClick={() => setShowForm(true)} className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
          {players.length === 0 && (
            <Button onClick={handleGenerateSampleData} variant="outline" disabled={generating}>
              <Sparkles className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate Sample Data'}
            </Button>
          )}
        </div>
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onSelect={() => setSelectedPlayer(player)}
            onEdit={() => setEditingPlayer(player)}
            onDelete={() => handleDeletePlayer(player.id)}
          />
        ))}
      </div>

      {/* Player stats modal */}
      {selectedPlayer && (
        <PlayerStatsModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {/* Player form modal */}
      {(showForm || editingPlayer) && (
        <PlayerForm
          player={editingPlayer}
          onSubmit={editingPlayer ? handleUpdatePlayer : handleCreatePlayer}
          onClose={() => {
            setShowForm(false);
            setEditingPlayer(null);
          }}
        />
      )}
    </div>
  );
}