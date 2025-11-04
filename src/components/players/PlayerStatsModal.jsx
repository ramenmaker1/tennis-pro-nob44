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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
              {player.photo_url ? (
                <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-slate-600">
                  {player.name?.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl">{player.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500">{player.country}</span>
                {player.ranking && (
                  <Badge variant="outline">Rank #{player.ranking}</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="serve" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="serve">Serve</TabsTrigger>
            <TabsTrigger value="return">Return</TabsTrigger>
            <TabsTrigger value="surface">Surface</TabsTrigger>
          </TabsList>

          <TabsContent value="serve" className="space-y-4 mt-4">
            <StatRow label="First Serve %" value={player.first_serve_percentage} />
            <StatRow label="1st Serve Points Won" value={player.first_serve_points_won} />
            <StatRow label="2nd Serve Points Won" value={player.second_serve_points_won} />
            <StatRow label="Aces per Match" value={player.aces_per_match} unit="" />
            <StatRow label="Double Faults per Match" value={player.double_faults_per_match} unit="" />
          </TabsContent>

          <TabsContent value="return" className="space-y-4 mt-4">
            <StatRow label="Return Points Won" value={player.return_points_won} />
            <StatRow label="Break Points Converted" value={player.break_points_converted} />
          </TabsContent>

          <TabsContent value="surface" className="space-y-4 mt-4">
            <StatRow label="Hard Court Win Rate" value={player.hard_court_win_rate} color="blue" />
            <StatRow label="Clay Court Win Rate" value={player.clay_court_win_rate} color="orange" />
            <StatRow label="Grass Court Win Rate" value={player.grass_court_win_rate} color="green" />
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
    green: "bg-green-500"
  };

  const displayValue = value !== null && value !== undefined ? value : '-';
  const percentage = value || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-lg font-bold text-slate-900">
          {displayValue}{displayValue !== '-' ? unit : ''}
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