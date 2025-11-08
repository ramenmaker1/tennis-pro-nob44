import { createPlayerSlug } from './aliasGenerator';

/**
 * Creates an array of sample player payloads
 */
export const buildSamplePlayers = (count = 12) => {
  const firstNames = [
    'Carlos',
    'Novak',
    'Rafael',
    'Roger',
    'Daniil',
    'Stefanos',
    'Alexander',
    'Andrey',
    'Jannik',
    'Holger',
    'Taylor',
    'Tommy',
  ];
  const lastNames = [
    'Alcaraz',
    'Djokovic',
    'Nadal',
    'Federer',
    'Medvedev',
    'Tsitsipas',
    'Zverev',
    'Rublev',
    'Sinner',
    'Rune',
    'Fritz',
    'Paul',
  ];
  const surfaces = ['hard', 'clay', 'grass'];
  const players = [];

  for (let i = 0; i < count; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const display = `${first} ${last}`;
    players.push({
      display_name: display,
      slug: createPlayerSlug(display),
      current_rank: i + 1,
      nationality: 'ESP',
      plays: Math.random() > 0.8 ? 'left' : 'right',
      birth_year: 1986 + Math.floor(Math.random() * 12),
      height_cm: 180 + Math.floor(Math.random() * 15),
      first_serve_pct: Math.round(55 + Math.random() * 20),
      first_serve_win_pct: Math.round(60 + Math.random() * 20),
      second_serve_win_pct: Math.round(45 + Math.random() * 15),
      first_return_win_pct: Math.round(30 + Math.random() * 15),
      second_return_win_pct: Math.round(40 + Math.random() * 15),
      break_points_converted_pct: Math.round(30 + Math.random() * 20),
      hard_court_win_pct: Math.round(55 + Math.random() * 25),
      clay_court_win_pct: Math.round(55 + Math.random() * 25),
      grass_court_win_pct: Math.round(55 + Math.random() * 25),
      preferred_surface: surfaces[Math.floor(Math.random() * surfaces.length)],
      elo_rating: 1800 + Math.floor(Math.random() * 300),
      data_source: 'sample',
    });
  }
  return players;
};

export const generateSamplePlayers = async (createPlayerFn, count = 12) => {
  const players = buildSamplePlayers(count);
  const created = [];
  for (const player of players) {
    try {
      const createdPlayer = await createPlayerFn(player);
      created.push(createdPlayer);
    } catch (error) {
      console.error('Sample player creation failed', error);
    }
  }
  return created;
};

/**
 * Calculates data completeness percentage (0-100)
 * Uses fields referenced throughout the app UI
 */
export const calculateDataCompleteness = (player) => {
  if (!player) return 0;
  const fields = [
    'current_rank',
    'first_serve_pct',
    'first_serve_win_pct',
    'second_serve_win_pct',
    'first_return_win_pct',
    'second_return_win_pct',
    'break_points_converted_pct',
    'hard_court_win_pct',
    'clay_court_win_pct',
    'grass_court_win_pct',
  ];
  let completed = 0;
  fields.forEach((f) => {
    if (player[f] !== null && player[f] !== undefined) completed += 1;
  });
  return Math.round((completed / fields.length) * 100);
};

/**
 * Returns UI badge config based on completeness percentage
 */
export const getDataQualityBadge = (percent) => {
  if (percent >= 85) return { color: 'bg-emerald-100 text-emerald-700', icon: '✓' };
  if (percent >= 70) return { color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' };
  if (percent >= 50) return { color: 'bg-orange-100 text-orange-700', icon: '!' };
  return { color: 'bg-red-100 text-red-700', icon: '!' };
};
