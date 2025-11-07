
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Zap } from "lucide-react";

export default function PlayerCard({ player, onClick }) {
  const age = player.birth_year ? new Date().getFullYear() - player.birth_year : null;
  
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-slate-200 group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.display_name || player.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-slate-600">
                {(player.display_name || player.name)?.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">
              {player.display_name || player.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {player.nationality && (
                <span className="text-sm text-slate-500">{player.nationality}</span>
              )}
              {age && (
                <span className="text-xs text-slate-400">• {age} yrs</span>
              )}
              {player.current_rank && (
                <Badge variant="outline" className="text-xs">
                  #{player.current_rank}
                </Badge>
              )}
              {player.plays && (
                <Badge variant="outline" className="text-xs">
                  {player.plays}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-2 rounded-lg bg-emerald-50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-emerald-700">
              {player.first_serve_pct?.toFixed(0) || player.first_serve_percentage || '-'}%
            </div>
            <div className="text-xs text-slate-600">1st Serve</div>
          </div>

          <div className="text-center p-2 rounded-lg bg-blue-50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-700">
              {player.first_return_win_pct?.toFixed(0) || player.return_points_won || '-'}%
            </div>
            <div className="text-xs text-slate-600">Return</div>
          </div>

          <div className="text-center p-2 rounded-lg bg-orange-50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-orange-700">
              {player.break_points_converted_pct?.toFixed(0) || player.break_points_converted || '-'}%
            </div>
            <div className="text-xs text-slate-600">BP Conv</div>
          </div>
        </div>

        {player.elo_rating && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">ELO Rating</span>
              <span className="font-semibold text-slate-900">{player.elo_rating}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
