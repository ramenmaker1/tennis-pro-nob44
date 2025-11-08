import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CalendarClock, Filter } from "lucide-react";
import { formatMatchTime } from "../utils/timezone.js";
import EmptyState from "../components/EmptyState.jsx";

export default function MatchHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSurface, setSelectedSurface] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState("all");
  const [activeMatch, setActiveMatch] = useState(null);

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => base44.entities.Player.list(),
    initialData: [],
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions', 'history'],
    queryFn: () => base44.entities.Prediction.list({ limit: 1000 }),
    initialData: [],
  });

  const playerMap = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  const matchFilters = useMemo(() => {
    const filters = { status: 'completed' };
    if (selectedSurface !== 'all') {
      filters.surface = selectedSurface;
    }
    if (searchTerm.trim()) {
      filters.tournament_name = { $contains: searchTerm.trim() };
    }
    if (selectedPlayer !== 'all') {
      filters.$or = [
        { player1_id: selectedPlayer },
        { player2_id: selectedPlayer },
      ];
    }
    return filters;
  }, [selectedSurface, searchTerm, selectedPlayer]);

  const {
    data: historicalMatches = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['matches', 'history', matchFilters],
    queryFn: async () => {
      return base44.entities.Match.list({
        filters: matchFilters,
        sort: '-utc_start',
        limit: 100,
      });
    },
    keepPreviousData: true,
    initialData: [],
  });

  const relatedPredictions = useMemo(() => {
    if (!activeMatch) return [];
    return predictions.filter((p) => p.match_id === activeMatch.id);
  }, [activeMatch, predictions]);

  const surfaces = ['all', 'hard', 'clay', 'grass'];

  const renderMatchCard = (match) => {
    const player1 = playerMap.get(match.player1_id);
    const player2 = playerMap.get(match.player2_id);
    const matchTime = match.utc_start ? formatMatchTime(match.utc_start) : 'Unknown time';

    return (
      <div key={match.id} className="relative flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 mt-2" />
          <div className="flex-1 w-px bg-slate-200" />
        </div>
        <Card className="flex-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">{matchTime}</p>
            <CardTitle className="text-lg">
              {(player1?.display_name || player1?.name || 'Player 1')} vs {player2?.display_name || player2?.name || 'Player 2'}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{match.tournament_name || 'Tournament'}</span>
              <Badge variant="outline" className="capitalize">{match.surface || 'surface'}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              Best of {match.best_of || 3} • {match.round || 'Round'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveMatch(match)}>
                View Predictions
              </Button>
              <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 flex items-center gap-3">
            <CalendarClock className="w-8 h-8 text-emerald-600" />
            Match History
          </h1>
          <p className="text-slate-500 mt-2">
            Explore completed matches, apply filters, and review model predictions at scale.
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <Input
            placeholder="Search tournament..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={selectedSurface} onValueChange={setSelectedSurface}>
            <SelectTrigger>
              <SelectValue placeholder="Surface" />
            </SelectTrigger>
            <SelectContent>
              {surfaces.map((surface) => (
                <SelectItem key={surface} value={surface}>
                  {surface === 'all' ? 'All Surfaces' : surface.charAt(0).toUpperCase() + surface.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Players</SelectItem>
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.display_name || player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSelectedSurface("all");
              setSelectedPlayer("all");
            }}>
              Reset
            </Button>
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <AlertError message="Unable to load historical matches. Please try again." />
      ) : historicalMatches.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="w-6 h-6 text-emerald-600" />}
          title="No historical matches"
          description="Adjust your filters or add completed matches to view history."
        />
      ) : (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Completed Matches</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Showing up to 100 matches. Narrow filters to focus your review.</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[600px] pr-4">
              <div className="space-y-4">
                {historicalMatches.map(renderMatchCard)}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(activeMatch)} onOpenChange={(open) => !open && setActiveMatch(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Predictions for {activeMatch?.tournament_name}</DialogTitle>
          </DialogHeader>
          {activeMatch ? (
            <div className="space-y-4">
              {relatedPredictions.length > 0 ? (
                relatedPredictions.map((prediction) => {
                  const winner = playerMap.get(prediction.predicted_winner_id);
                  return (
                    <Card key={prediction.id} className="border border-slate-200">
                      <CardContent className="py-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-slate-500">Model</div>
                          <div className="font-semibold capitalize">{prediction.model_type}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-500">Predicted Winner</div>
                          <div className="font-semibold">{winner?.display_name || winner?.name || 'Pending'}</div>
                          <div className="text-xs text-slate-500">
                            {prediction.player1_win_probability?.toFixed(1)}% / {prediction.player2_win_probability?.toFixed(1)}%
                          </div>
                        </div>
                        <Badge className={
                          prediction.was_correct === true ? 'bg-emerald-100 text-emerald-700' :
                          prediction.was_correct === false ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-600'
                        }>
                          {prediction.was_correct === null || prediction.was_correct === undefined
                            ? 'Pending'
                            : prediction.was_correct
                              ? 'Correct'
                              : 'Incorrect'}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No predictions stored for this match yet.</p>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AlertError({ message }) {
  return (
    <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
      {message}
    </div>
  );
}
