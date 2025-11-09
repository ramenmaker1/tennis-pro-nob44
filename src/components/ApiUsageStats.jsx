import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

export default function ApiUsageStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const updateStats = () => {
      try {
        const saved = localStorage.getItem('tennis_api_stats');
        if (saved) {
          setStats(JSON.parse(saved));
        }
      } catch (e) {
        // ignore
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const dailyPercent = (stats.today / stats.dailyLimit) * 100;
  const monthlyPercent = (stats.total / stats.monthlyLimit) * 100;

  const getDailyColor = () => {
    if (dailyPercent >= 90) return 'text-red-600 dark:text-red-400';
    if (dailyPercent >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getMonthlyColor = () => {
    if (monthlyPercent >= 90) return 'text-red-600 dark:text-red-400';
    if (monthlyPercent >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-xs max-w-xs z-50">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-slate-100">API Usage</span>
      </div>

      <div className="space-y-2">
        {/* Daily Usage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-600 dark:text-slate-400">Today</span>
            <span className={`font-semibold ${getDailyColor()}`}>
              {stats.today}/{stats.dailyLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                dailyPercent >= 90
                  ? 'bg-red-500'
                  : dailyPercent >= 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(dailyPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Monthly Usage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-600 dark:text-slate-400">Monthly</span>
            <span className={`font-semibold ${getMonthlyColor()}`}>
              {stats.total}/{stats.monthlyLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                monthlyPercent >= 90
                  ? 'bg-red-500'
                  : monthlyPercent >= 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(monthlyPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        {stats.today >= stats.dailyLimit && (
          <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 dark:text-red-400">
              Daily limit reached. Using cached data.
            </span>
          </div>
        )}

        {stats.today < stats.dailyLimit && stats.today > 0 && (
          <div className="flex items-start gap-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-green-700 dark:text-green-400">
              {stats.dailyLimit - stats.today} calls remaining today
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
