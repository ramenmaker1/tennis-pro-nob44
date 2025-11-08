import type { DataClient } from './DataClient';
import { localDataClient } from './LocalClient';
import { supabaseAvailable, supabaseDataClient } from './SupabaseClient';

export type DataSourceMode = 'supabase' | 'local' | 'offline';

let currentSource: DataSourceMode = supabaseAvailable && supabaseDataClient ? 'supabase' : 'local';
let currentClient: DataClient =
  currentSource === 'supabase' && supabaseDataClient ? supabaseDataClient : localDataClient;

const listeners = new Set<() => void>();

export const getCurrentClient = () => currentClient;

export const getCurrentSource = () => currentSource;

export const subscribeToDataSource = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

export const isSupabaseReady = () => Boolean(supabaseDataClient);

export const setDataSource = (source: DataSourceMode) => {
  if (source === 'supabase' && !supabaseDataClient) {
    console.warn('Supabase is not configured; falling back to local data.');
    return;
  }
  if (currentSource === source) return;

  currentSource = source;
  if (source === 'supabase' && supabaseDataClient) {
    currentClient = supabaseDataClient;
  } else {
    currentClient = localDataClient;
  }

  listeners.forEach((listener) => listener());
};
