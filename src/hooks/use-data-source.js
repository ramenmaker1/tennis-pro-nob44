import { useSyncExternalStore } from 'react';
import { getCurrentSource, subscribeToDataSource } from '@/data/dataSourceStore';

export const useDataSource = () =>
  useSyncExternalStore(subscribeToDataSource, getCurrentSource);
