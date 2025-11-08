<<<<<<< HEAD
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

=======
import { base44 } from "@/api/base44Client";
import { createPlayerSlug } from "./aliasGenerator";

/**
 * Generates and persists sample players via Base44
 * @param {number} count
 * @returns {Promise<Array>} created players
 */
export const generateSamplePlayers = async (count = 12) => {
  const firstNames = [
    "Carlos",
    "Novak",
    "Rafael",
    "Roger",
    "Daniil",
    "Stefanos",
    "Alexander",
    "Andrey",
    "Jannik",
    "Holger",
    "Taylor",
    "Tommy",
  ];
  const lastNames = [
    "Alcaraz",
    "Djokovic",
    "Nadal",
    "Federer",
    "Medvedev",
    "Tsitsipas",
    "Zverev",
    "Rublev",
    "Sinner",
    "Rune",
    "Fritz",
    "Paul",
  ];
  const surfaces = ["hard", "clay", "grass"];

  const created = [];
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  for (let i = 0; i < count; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const display = `${first} ${last}`;
<<<<<<< HEAD
    players.push({
      display_name: display,
      slug: createPlayerSlug(display),
      current_rank: i + 1,
      nationality: 'ESP',
      plays: Math.random() > 0.8 ? 'left' : 'right',
      birth_year: 1986 + Math.floor(Math.random() * 12),
      height_cm: 180 + Math.floor(Math.random() * 15),
=======
    const payload = {
      display_name: display,
      slug: createPlayerSlug(display),
      current_rank: i + 1,
      nationality: "ESP",
      plays: Math.random() > 0.8 ? "left" : "right",
      birth_year: 1986 + Math.floor(Math.random() * 12),
      height_cm: 180 + Math.floor(Math.random() * 15),
      // serve & return stats (%) stored as numbers 0-100 where used
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
      first_serve_pct: Math.round(55 + Math.random() * 20),
      first_serve_win_pct: Math.round(60 + Math.random() * 20),
      second_serve_win_pct: Math.round(45 + Math.random() * 15),
      first_return_win_pct: Math.round(30 + Math.random() * 15),
      second_return_win_pct: Math.round(40 + Math.random() * 15),
      break_points_converted_pct: Math.round(30 + Math.random() * 20),
<<<<<<< HEAD
=======
      // surface win rates as %
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
      hard_court_win_pct: Math.round(55 + Math.random() * 25),
      clay_court_win_pct: Math.round(55 + Math.random() * 25),
      grass_court_win_pct: Math.round(55 + Math.random() * 25),
      preferred_surface: surfaces[Math.floor(Math.random() * surfaces.length)],
      elo_rating: 1800 + Math.floor(Math.random() * 300),
<<<<<<< HEAD
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
=======
      data_source: "sample",
    };
    try {
      const player = await base44.entities.Player.create(payload);
      created.push(player);
    } catch (e) {
      // continue
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
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
<<<<<<< HEAD
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
=======
    "current_rank",
    "first_serve_pct",
    "first_serve_win_pct",
    "second_serve_win_pct",
    "first_return_win_pct",
    "second_return_win_pct",
    "break_points_converted_pct",
    "hard_court_win_pct",
    "clay_court_win_pct",
    "grass_court_win_pct",
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
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
<<<<<<< HEAD
  if (percent >= 85) return { color: 'bg-emerald-100 text-emerald-700', icon: '✓' };
  if (percent >= 70) return { color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' };
  if (percent >= 50) return { color: 'bg-orange-100 text-orange-700', icon: '!' };
  return { color: 'bg-red-100 text-red-700', icon: '!' };
};
=======
  if (percent >= 85) return { color: "bg-emerald-100 text-emerald-700", icon: "✓" };
  if (percent >= 70) return { color: "bg-yellow-100 text-yellow-700", icon: "⚠️" };
  if (percent >= 50) return { color: "bg-orange-100 text-orange-700", icon: "!" };
  return { color: "bg-red-100 text-red-700", icon: "!" };
};

>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
