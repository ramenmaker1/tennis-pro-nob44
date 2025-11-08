import { describe, it, expect, beforeEach } from 'vitest';
import { LocalDataClient } from '@/data/LocalClient';

describe('LocalDataClient', () => {
  let client;

  beforeEach(() => {
    client = new LocalDataClient();
  });

  it('seeds players on construction', async () => {
    const players = await client.players.list();
    expect(players.length).toBeGreaterThan(0);
  });

  it('creates and updates a player record', async () => {
    const created = await client.players.create({
      display_name: 'Test Player',
      canonical_name: 'Test Player',
      slug: 'test-player',
      current_rank: 150,
    });

    expect(created.display_name).toBe('Test Player');

    const updated = await client.players.update(created.id, {
      current_rank: 42,
      nationality: 'USA',
    });

    expect(updated.current_rank).toBe(42);
    expect(updated.nationality).toBe('USA');
  });

  it('creates a match and related predictions', async () => {
    const players = await client.players.list();
    const match = await client.matches.create({
      player1_id: players[0].id,
      player2_id: players[1].id,
      tournament_name: 'Integration Open',
      surface: 'hard',
    });

    expect(match.tournament_name).toBe('Integration Open');

    const prediction = await client.predictions.create({
      match_id: match.id,
      model_type: 'balanced',
      model_version: 'test',
      player1_win_probability: 0.55,
      player2_win_probability: 0.45,
    });

    expect(prediction.match_id).toBe(match.id);
    expect(prediction.player1_win_probability).toBe(0.55);
  });
});
