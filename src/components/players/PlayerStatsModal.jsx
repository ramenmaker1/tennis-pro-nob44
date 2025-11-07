
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PlayerStatsModal({ player, open, onClose }) {
  if (!player) return null;

  const age = player.birth_year ? new Date().getFullYear() - player.birth_year : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
              {player.photo_url ? (
                <img src={player.photo_url} alt={player.display_name || player.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-slate-600">
                  {(player.display_name || player.name)?.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl">{player.display_name || player.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {player.nationality && (
                  <span className="text-slate-500">{player.nationality}</span>
                )}
                {age && (
                  <span className="text-slate-400">• {age} years old</span>
                )}
                {player.height_cm && (
                  <span className="text-slate-400">• {player.height_cm} cm</span>
                )}
                {player.current_rank && (
                  <Badge variant="outline">Rank #{player.current_rank}</Badge>
                )}
                {player.peak_rank && (
                  <Badge variant="outline">Peak #{player.peak_rank}</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="serve" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="serve">Serve</TabsTrigger>
            <TabsTrigger value="return">Return</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="surface">Surface</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="serve" className="space-y-4 mt-4">
            <StatRow label="First Serve %" value={player.first_serve_pct} />
            <StatRow label="1st Serve Points Won" value={player.first_serve_win_pct} />
            <StatRow label="2nd Serve Points Won" value={player.second_serve_win_pct} />
            <StatRow label="Aces per Match" value={player.aces_per_match} unit="" />
            <StatRow label="Double Faults per Match" value={player.double_faults_per_match} unit="" />
          </TabsContent>

          <TabsContent value="return" className="space-y-4 mt-4">
            <StatRow label="1st Return Points Won" value={player.first_return_win_pct} />
            <StatRow label="2nd Return Points Won" value={player.second_return_win_pct} />
            <StatRow label="Break Points Converted" value={player.break_points_converted_pct} />
            <StatRow label="Return Games Won" value={player.return_games_won_pct} />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <StatRow label="Clutch Factor" value={player.clutch_factor} color="purple" />
            <StatRow label="Consistency Rating" value={player.consistency_rating} color="blue" />
            <StatRow label="Tiebreak Win %" value={player.tiebreak_win_pct} color="orange" />
            <StatRow label="Deuce Point Win %" value={player.deuce_win_pct} color="orange" />
            <StatRow label="Fitness Rating" value={player.fitness_rating} color="green" />
            {player.momentum_rating !== null && player.momentum_rating !== undefined && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Momentum Rating</span>
                  <span className="text-lg font-bold text-slate-900">
                    {player.momentum_rating > 0 ? '+' : ''}{player.momentum_rating}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className={`absolute h-full transition-all duration-500 ${
                      player.momentum_rating >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.abs(player.momentum_rating)}%`,
                      left: player.momentum_rating >= 0 ? '50%' : `${50 - Math.abs(player.momentum_rating)}%`
                    }}
                  />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300" />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="surface" className="space-y-4 mt-4">
            <StatRow label="Hard Court Win Rate" value={player.hard_court_win_pct} color="blue" />
            <StatRow label="Clay Court Win Rate" value={player.clay_court_win_pct} color="orange" />
            <StatRow label="Grass Court Win Rate" value={player.grass_court_win_pct} color="green" />
          </TabsContent>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem label="Full Name" value={`${player.first_name || ''} ${player.last_name || ''}`.trim() || 'N/A'} />
              <InfoItem label="Plays" value={player.plays} />
              <InfoItem label="Birth Year" value={player.birth_year} />
              <InfoItem label="Height" value={player.height_cm ? `${player.height_cm} cm` : null} />
              <InfoItem label="Current Rank" value={player.current_rank ? `#${player.current_rank}` : null} />
              <InfoItem label="Peak Rank" value={player.peak_rank ? `#${player.peak_rank}` : null} />
              <InfoItem label="ELO Rating" value={player.elo_rating} />
              <InfoItem label="Data Source" value={player.data_source} />
            </div>
            
            {player.notes && (
              <div className="mt-4">
                <div className="text-sm font-medium text-slate-700 mb-2">Admin Notes</div>
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                  {player.notes}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function StatRow({ label, value, unit = "%", color = "emerald" }) {
  const colorClasses = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
    purple: "bg-purple-500"
  };

  const displayValue = value !== null && value !== undefined ? value : '-';
  const percentage = value || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-lg font-bold text-slate-900">
          {displayValue !== '-' ? displayValue.toFixed(1) : displayValue}{displayValue !== '-' ? unit : ''}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="font-medium text-slate-900">{value || 'N/A'}</div>
    </div>
  );
}
