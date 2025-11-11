import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CalendarClock, Filter } from 'lucide-react';
import { formatMatchTime } from '../utils/timezone.js';
import EmptyState from '../components/EmptyState.jsx';
import { getCurrentClient } from '@/data/dataSourceStore';

export default function MatchHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurface, setSelectedSurface] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState('all');
  const [activeMatch, setActiveMatch] = useState(null);

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      try {
        const client = getCurrentClient();
        if (!client?.players?.list) return [];
        return await client.players.list();
      } catch (error) {
        console.warn('Failed to load players:', error);
        return [];
      }
    },
    initialData: [],
    retry: false,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      try {
        const client = getCurrentClient();
        if (!client?.matches?.list) return [];
        return await client.matches.list('-utc_start');
      } catch (error) {
        console.warn('Failed to load matches:', error);
        return [];
      }
    },
    initialData: [],
    retry: false,
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      try {
        const client = getCurrentClient();
        if (!client?.predictions?.list) return [];
        return await client.predictions.list();
      } catch (error) {
        console.warn('Failed to load predictions:', error);
        return [];
      }
    },
    initialData: [],
    retry: false,
  });

  const getMatchPlayer = (id) => players.find((p) => p.id === id);
  const getMatchPredictions = (id) => predictions.filter((p) => p.match_id === id);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const p1 = getMatchPlayer(match.player1_id);
      const p2 = getMatchPlayer(match.player2_id);

      const matchesSearch =
        !searchTerm ||
        (p1?.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p2?.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (match.tournament_name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSurface = selectedSurface === 'all' || match.surface === selectedSurface;

      const matchesPlayer =
        selectedPlayer === 'all' ||
        match.player1_id === selectedPlayer ||
        match.player2_id === selectedPlayer;

      return matchesSearch && matchesSurface && matchesPlayer;
    });
  }, [matches, players, searchTerm, selectedSurface, selectedPlayer]);

  const surfaceBadgeColor = (surface) => {
    switch (surface?.toLowerCase()) {
      case 'hard':
        return 'bg-blue-100 text-blue-700';
      case 'clay':
        return 'bg-orange-100 text-orange-700';
      case 'grass':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const playerOptions = useMemo(() => {
    return players
      .sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''))
      .map((player) => ({
        value: player.id,
        label: player.display_name,
      }));
  }, [players]);

  if (!matchesLoading && matches.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No matches yet"
        description="Create your first match to see it appear here."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 flex items-center space-x-2">
          <Input
            placeholder="Search matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={selectedSurface} onValueChange={setSelectedSurface}>
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
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Players</SelectItem>
              {playerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Match list */}
      <div className="space-y-4">
        {filteredMatches.map((match) => {
          const player1 = getMatchPlayer(match.player1_id);
          const player2 = getMatchPlayer(match.player2_id);
          const matchPredictions = getMatchPredictions(match.id);

          return (
            <Card key={match.id} className="overflow-hidden">
              <CardHeader className="p-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">{match.tournament_name}</CardTitle>
                  <div className="text-sm text-slate-500">{formatMatchTime(match.utc_start)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={surfaceBadgeColor(match.surface)}>
                    {match.surface}
                  </Badge>
                  <Button variant="ghost" onClick={() => setActiveMatch(match)}>
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Players */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{player1?.display_name}</div>
                    <div className="text-xs text-slate-500">
                      Rank: {player1?.current_rank || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{player2?.display_name}</div>
                    <div className="text-xs text-slate-500">
                      Rank: {player2?.current_rank || 'N/A'}
                    </div>
                  </div>
                </div>
                {/* Predictions */}
                <div className="space-y-2">
                  {matchPredictions.map((prediction) => {
                    const winner = getMatchPlayer(prediction.predicted_winner_id);
                    return (
                      <div
                        key={prediction.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <Badge
                            variant="secondary"
                            className={`capitalize ${
                              prediction.model_type === 'ml'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100'
                            }`}
                          >
                            {prediction.model_type}
                          </Badge>
                          <span className="ml-2">{winner?.display_name}</span>
                        </div>
                        <Badge
                          className={
                            prediction.was_correct === true
                              ? 'bg-emerald-100 text-emerald-700'
                              : prediction.was_correct === false
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                          }
                        >
                          {prediction.was_correct === null || prediction.was_correct === undefined
                            ? 'Pending'
                            : prediction.was_correct
                            ? 'Correct'
                            : 'Incorrect'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Match details dialog */}
      {activeMatch && (
        <Dialog open onOpenChange={() => setActiveMatch(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Match Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Tournament</h3>
                <p className="text-sm text-slate-500">{activeMatch.tournament_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Surface</h3>
                <Badge variant="secondary" className={surfaceBadgeColor(activeMatch.surface)}>
                  {activeMatch.surface}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium">Date & Time</h3>
                <p className="text-sm text-slate-500">{formatMatchTime(activeMatch.utc_start)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Format</h3>
                <p className="text-sm text-slate-500">Best of {activeMatch.best_of}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Players</h3>
                <div className="space-y-2 mt-2">
                  {[activeMatch.player1_id, activeMatch.player2_id].map((playerId) => {
                    const player = getMatchPlayer(playerId);
                    return (
                      <div key={playerId} className="text-sm">
                        <div className="font-medium">{player?.display_name}</div>
                        <div className="text-slate-500">
                          Rank: {player?.current_rank || 'N/A'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}