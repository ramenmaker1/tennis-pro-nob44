
import React, { memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Zap, Edit, Eye } from "lucide-react";
import { calculateDataCompleteness, getDataQualityBadge } from "../../utils/sampleData.js";

function PlayerCard({ player, onClick, onEdit, onMouseEnter }) {
  const age = useMemo(
    () => (player.birth_year ? new Date().getFullYear() - player.birth_year : null),
    [player.birth_year]
  );
  const completeness = useMemo(() => calculateDataCompleteness(player), [player]);
  const qualityBadge = useMemo(() => getDataQualityBadge(completeness), [completeness]);

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 bg-white border-slate-200 group relative overflow-hidden"
      onMouseEnter={onMouseEnter}
    >
      {/* Data Quality Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className={`${qualityBadge.color} text-xs font-medium`}>
          {qualityBadge.icon} {completeness}%
        </Badge>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div 
            className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            onClick={onClick}
          >
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.display_name || player.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-slate-600">
                {(player.display_name || player.name)?.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 
              className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors cursor-pointer"
              onClick={onClick}
            >
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

        <div className="grid grid-cols-3 gap-3 mb-4">
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
          <div className="mb-4 pb-4 border-b border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">ELO Rating</span>
              <span className="font-semibold text-slate-900">{player.elo_rating}</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            View Stats
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(player);
              }}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(PlayerCard);
