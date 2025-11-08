import React from 'react';
import { useDataSource } from '@/hooks/use-data-source';
import { isSupabaseReady, setDataSource } from '@/data/dataSourceStore';

const options = [
  { label: 'Supabase', value: 'supabase' },
  { label: 'Local', value: 'local' },
  { label: 'Offline', value: 'offline' },
];

export function DataSourceSelector() {
  const activeSource = useDataSource();
  const supabaseReady = isSupabaseReady();

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Data Source
      </span>
      <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1 text-xs font-medium">
        {options.map((option) => {
          const isActive = option.value === activeSource;
          const isDisabled = option.value === 'supabase' && !supabaseReady;
          return (
            <button
              key={option.value}
              disabled={isDisabled}
              onClick={() => !isDisabled && setDataSource(option.value)}
              className={`px-3 py-1 rounded-full transition-colors ${
                isActive
                  ? option.value === 'supabase'
                    ? 'bg-emerald-600 text-white'
                    : option.value === 'offline'
                    ? 'bg-slate-700 text-white'
                    : 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
