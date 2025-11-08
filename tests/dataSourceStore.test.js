import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCurrentSource,
  setDataSource,
  subscribeToDataSource,
  isSupabaseReady,
} from '@/data/dataSourceStore';

describe('dataSourceStore', () => {
  beforeEach(() => {
    setDataSource('local');
  });

  it('defaults to local data source', () => {
    expect(getCurrentSource()).toBe('local');
  });

  it('notifies subscribers when source changes', () => {
    let called = false;
    const unsubscribe = subscribeToDataSource(() => {
      called = true;
    });

    setDataSource(isSupabaseReady() ? 'supabase' : 'offline');
    unsubscribe();

    expect(called).toBe(true);
  });

  it('ignores supabase selection when not configured', () => {
    if (isSupabaseReady()) {
      setDataSource('supabase');
      expect(getCurrentSource()).toBe('supabase');
    } else {
      setDataSource('supabase');
      expect(getCurrentSource()).toBe('local');
    }
  });
});
