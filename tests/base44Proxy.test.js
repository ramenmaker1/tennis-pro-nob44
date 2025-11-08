import { describe, it, expect } from 'vitest';
import { base44 } from '@/api/base44Client';
import { setDataSource } from '@/data/dataSourceStore';

describe('base44 proxy', () => {
  it('creates a player through the active data client', async () => {
    setDataSource('local');
    const created = await base44.entities.Player.create({
      display_name: 'Proxy Player',
      canonical_name: 'Proxy Player',
      slug: 'proxy-player',
    });

    expect(created.display_name).toBe('Proxy Player');
    const list = await base44.entities.Player.list();
    const found = list.find((p) => p.id === created.id);
    expect(found).toBeDefined();
  });
});
