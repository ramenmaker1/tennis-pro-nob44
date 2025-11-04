import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function ProbabilityChart({ data, player1Name, player2Name }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match Flow Probability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500">
            No probability data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Flow Probability</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Point-by-point win probability throughout the match</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPlayer1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPlayer2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="game" 
              label={{ value: 'Game Number', position: 'insideBottom', offset: -5 }}
              stroke="#64748b"
            />
            <YAxis 
              label={{ value: 'Win Probability (%)', angle: -90, position: 'insideLeft' }}
              stroke="#64748b"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="player1_probability"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorPlayer1)"
              name={player1Name || "Player 1"}
            />
            <Area
              type="monotone"
              dataKey="player2_probability"
              stroke="#F97316"
              strokeWidth={2}
              fill="url(#colorPlayer2)"
              name={player2Name || "Player 2"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}