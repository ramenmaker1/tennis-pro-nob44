
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import PlayerCard from "../components/players/PlayerCard";
import PlayerStatsModal from "../components/players/PlayerStatsModal";
import PlayerForm from "../components/players/PlayerForm";

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: players, isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list('-created_date'),
    initialData: [],
  });

  const filteredPlayers = players.filter(player => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (player.display_name || player.name || '').toLowerCase().includes(searchLower) ||
      (player.first_name || '').toLowerCase().includes(searchLower) ||
      (player.last_name || '').toLowerCase().includes(searchLower) ||
      (player.nationality || player.country || '').toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setShowForm(true);
    setSelectedPlayer(null); // Ensure stats modal is closed when editing
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Player Database</h1>
          <p className="text-slate-500 mt-2">Manage player profiles and comprehensive statistics</p>
        </div>
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => {
            setEditingPlayer(null); // Clear any player being edited
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search players by name or nationality..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-sm text-slate-500">Total Players</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{players.length}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-sm text-slate-500">With Stats</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {players.filter(p => p.first_serve_pct || p.second_serve_pct || p.aces || p.double_faults).length}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-sm text-slate-500">Top 100</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {players.filter(p => p.current_rank && p.current_rank <= 100).length}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="text-sm text-slate-500">Search Results</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{filteredPlayers.length}</div>
        </div>
      </div>

      {/* Players Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => ( // Render more skeletons for better UX
            <div key={i} className="h-48 bg-white rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredPlayers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => setSelectedPlayer(player)}
              onEdit={() => handleEdit(player)} // Assuming PlayerCard has an onEdit prop now
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No players found</h3>
          <p className="text-slate-500 mb-4">
            {searchQuery ? "Try adjusting your search" : "Start by adding your first player"}
          </p>
          <Button onClick={() => {
            setEditingPlayer(null); // Clear any player being edited
            setShowForm(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </div>
      )}

      {/* Modals */}
      <PlayerStatsModal
        player={selectedPlayer}
        open={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />

      <PlayerForm
        player={editingPlayer} // Pass the player object if editing
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPlayer(null); // Clear editing player when form closes
        }}
      />
    </div>
  );
}
