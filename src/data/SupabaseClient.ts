/// <reference types="../types/env.d.ts" />
import { createClient } from '@supabase/supabase-js';
import type {
  DataClient,
  ListOptions,
  Match,
  Player,
  Prediction,
  ConfidenceLevel,
} from './DataClient';
import { localDataClient } from './LocalClient';

type SortDirection = 'asc' | 'desc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseAvailable = Boolean(supabaseUrl && supabaseAnonKey);

const supabase =
  supabaseAvailable && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;

type FilterValue = string | number | boolean | null | { $contains?: string; $in?: unknown[] };
type FilterCondition = Record<string, FilterValue>;
type Filters = Record<string, FilterValue | FilterCondition[]>;

type NormalizedOptions = {
  filters?: Filters;
  sort?: { field: string; direction: SortDirection; original: string };
  limit?: number;
};

const normalizeOptions = (options?: string | ListOptions): NormalizedOptions => {
  if (!options) return {};

  let normalized: NormalizedOptions = {};

  if (typeof options === 'string') {
    const field = options.replace(/^[-+]/, '');
    const direction: SortDirection = options.startsWith('-') ? 'desc' : 'asc';
    normalized.sort = { field, direction, original: options };
  } else {
    if (options.filters) {
      normalized.filters = options.filters as Filters;
    }
    if (options.sort) {
      const field = options.sort.replace(/^[-+]/, '');
      const direction: SortDirection = options.sort.startsWith('-') ? 'desc' : 'asc';
      normalized.sort = { field, direction, original: options.sort };
    }
    if (options.limit) {
      normalized.limit = options.limit;
    }
  }

  return normalized;
};

const sortRecords = <T>(records: T[], sort?: string) => {
  if (!sort) return records;
  const direction = sort.startsWith('-') ? -1 : 1;
  const key = sort.replace(/^[-+]/, '');
  return [...records].sort((a: any, b: any) => {
    const valueA = a?.[key];
    const valueB = b?.[key];
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1;
    if (valueB == null) return -1;
    if (valueA === valueB) return 0;
    return valueA > valueB ? direction : -direction;
  });
};

const matchesCondition = <T extends Record<string, unknown>>(
  record: T,
  condition: Record<string, unknown>,
): boolean => {
  return Object.entries(condition).every(([key, value]) => {
    if (value == null) return true;
    if (typeof value === 'object') {
      if ('$contains' in value) {
        const needle = String(value.$contains).toLowerCase();
        return String(record[key] ?? '')
          .toLowerCase()
          .includes(needle);
      }
      if ('$in' in value) {
        return Array.isArray(value.$in) ? value.$in.includes(record[key]) : true;
      }
    }
    return record[key] === value;
  });
};

const applyFilters = <T extends Record<string, unknown>>(records: T[], filters?: Filters) => {
  if (!filters) return records;
  return records.filter((record) => {
    return Object.entries(filters).every(([key, value]) => {
      if (key === '$or' && Array.isArray(value)) {
        return value.some((group) => matchesCondition(record as Record<string, unknown>, group));
      }
      if (typeof value === 'object' && value !== null) {
        return matchesCondition(record as Record<string, unknown>, { [key]: value });
      }
      return record[key] === value;
    });
  });
};

const playerSortMap: Readonly<Record<string, string>> = {
  created_date: 'created_at',
  created_at: 'created_at',
  display_name: 'display_name',
  canonical_name: 'canonical_name',
  current_rank: 'rank',
  rank: 'rank',
};

const matchSortMap: Readonly<Record<string, string>> = {
  created_date: 'created_at',
  created_at: 'created_at',
  utc_start: 'start_time_utc',
};

const predictionSortMap: Readonly<Record<string, string>> = {
  created_date: 'created_at',
  created_at: 'created_at',
};

const mapPlayerFromRow = (row: any): Player => ({
  id: row.id,
  display_name: row.display_name ?? row.canonical_name,
  first_name: row.first_name ?? undefined,
  last_name: row.last_name ?? undefined,
  slug: row.slug,
  current_rank: row.rank ?? undefined,
  peak_rank: row.peak_rank ?? undefined,
  elo_rating: row.elo ?? undefined,
  hard_elo: row.hard_elo ?? undefined,
  clay_elo: row.clay_elo ?? undefined,
  grass_elo: row.grass_elo ?? undefined,
  plays: row.plays ?? row.hand ?? undefined,
  hand: row.hand ?? undefined,
  photo_url: row.photo_url ?? undefined,
  birth_year: row.birth_year ?? undefined,
  height_cm: row.height_cm ?? undefined,
  first_serve_pct: row.first_serve_pct ?? undefined,
  first_serve_win_pct: row.first_serve_win_pct ?? undefined,
  second_serve_win_pct: row.second_serve_win_pct ?? undefined,
  aces_per_match: row.aces_per_match ?? undefined,
  double_faults_per_match: row.double_faults_per_match ?? undefined,
  first_return_win_pct: row.first_return_win_pct ?? undefined,
  second_return_win_pct: row.second_return_win_pct ?? undefined,
  break_points_converted_pct: row.break_points_converted_pct ?? undefined,
  return_games_won_pct: row.return_games_won_pct ?? undefined,
  clutch_factor: row.clutch_factor ?? undefined,
  consistency_rating: row.consistency_rating ?? undefined,
  tiebreak_win_pct: row.tiebreak_win_pct ?? undefined,
  deuce_win_pct: row.deuce_win_pct ?? undefined,
  hard_court_win_pct: row.hard_court_win_pct ?? row.hard_elo ?? undefined,
  clay_court_win_pct: row.clay_court_win_pct ?? row.clay_elo ?? undefined,
  grass_court_win_pct: row.grass_court_win_pct ?? row.grass_elo ?? undefined,
  fitness_rating: row.fitness_rating ?? undefined,
  momentum_rating: row.momentum_rating ?? undefined,
  data_source: row.data_source ?? undefined,
  nationality: row.nationality ?? undefined,
  created_at: row.created_at ?? undefined,
  created_date: row.created_at ?? undefined,
  updated_at: row.updated_at ?? undefined,
});

const mapPlayerToRow = (payload: Partial<Player>) => {
  const raw = payload as Record<string, any>;
  const canonicalName =
    raw.canonical_name ??
    payload.display_name ??
    payload.first_name ??
    raw.firstName ??
    'Unknown Player';

  return {
    canonical_name: canonicalName,
    display_name: payload.display_name ?? canonicalName,
    first_name: payload.first_name ?? null,
    last_name: payload.last_name ?? null,
    slug: payload.slug ?? canonicalName.toLowerCase().replace(/\s+/g, '-'),
    rank: payload.current_rank ?? raw.rank ?? null,
    peak_rank: payload.peak_rank ?? null,
    elo: payload.elo_rating ?? raw.elo ?? null,
    hard_elo: payload.hard_court_win_pct ?? raw.hard_elo ?? null,
    clay_elo: payload.clay_court_win_pct ?? raw.clay_elo ?? null,
    grass_elo: payload.grass_court_win_pct ?? raw.grass_elo ?? null,
    plays: payload.plays ?? null,
    hand: payload.hand ?? payload.plays ?? null,
    photo_url: payload.photo_url ?? null,
    birth_year: payload.birth_year ?? null,
    height_cm: payload.height_cm ?? null,
    first_serve_pct: payload.first_serve_pct ?? null,
    first_serve_win_pct: payload.first_serve_win_pct ?? null,
    second_serve_win_pct: payload.second_serve_win_pct ?? null,
    aces_per_match: payload.aces_per_match ?? null,
    double_faults_per_match: payload.double_faults_per_match ?? null,
    first_return_win_pct: payload.first_return_win_pct ?? null,
    second_return_win_pct: payload.second_return_win_pct ?? null,
    break_points_converted_pct: payload.break_points_converted_pct ?? null,
    return_games_won_pct: payload.return_games_won_pct ?? null,
    clutch_factor: payload.clutch_factor ?? null,
    consistency_rating: payload.consistency_rating ?? null,
    tiebreak_win_pct: payload.tiebreak_win_pct ?? null,
    deuce_win_pct: payload.deuce_win_pct ?? null,
    hard_court_win_pct: payload.hard_court_win_pct ?? null,
    clay_court_win_pct: payload.clay_court_win_pct ?? null,
    grass_court_win_pct: payload.grass_court_win_pct ?? null,
    fitness_rating: payload.fitness_rating ?? null,
    momentum_rating: payload.momentum_rating ?? null,
    data_source: payload.data_source ?? 'manual',
    nationality: payload.nationality ?? null,
    updated_at: new Date().toISOString(),
  };
};

const mapMatchFromRow = (row: any): Match => ({
  id: row.id,
  player1_id: row.player_a_id,
  player2_id: row.player_b_id,
  tournament_name: row.tournament ?? undefined,
  round: row.round ?? undefined,
  surface: row.surface ?? undefined,
  best_of: row.best_of ?? undefined,
  status: row.status ?? undefined,
  utc_start: row.start_time_utc ?? undefined,
  created_at: row.created_at ?? undefined,
  created_date: row.created_at ?? undefined,
});

const mapMatchToRow = (payload: Partial<Match>) => {
  const raw = payload as Record<string, any>;
  return {
    player_a_id: payload.player1_id ?? raw.player_a_id ?? null,
    player_b_id: payload.player2_id ?? raw.player_b_id ?? null,
    tournament: payload.tournament_name ?? raw.tournament ?? null,
    round: payload.round ?? null,
    surface: payload.surface ?? null,
    start_time_utc: payload.utc_start ?? raw.start_time_utc ?? new Date().toISOString(),
    best_of: payload.best_of ?? raw.best_of ?? 3,
    status: payload.status ?? raw.status ?? 'scheduled',
  };
};

const mapPredictionFromRow = (row: any): Prediction => ({
  id: row.id,
  match_id: row.match_id,
  model_version: row.model_version,
  model_type: row.model_type,
  player1_win_probability: Number(row.win_prob_a ?? 0),
  player2_win_probability: Number(row.win_prob_b ?? 0),
  confidence_level: row.confidence_level ?? undefined,
  deuce_tendency: row.deuce_tendency ?? undefined,
  pressure_index: row.pressure_index ?? undefined,
  predicted_winner_id: row.predicted_winner_id ?? undefined,
  actual_winner_id: row.actual_winner_id ?? undefined,
  was_correct: typeof row.was_correct === 'boolean' ? row.was_correct : !!row.was_correct,
  completed_at: row.completed_at ?? undefined,
  notes: row.notes ?? undefined,
  metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  point_by_point_data: row.point_by_point_data ? JSON.parse(row.point_by_point_data) : undefined,
  created_at: row.created_at ?? undefined,
  created_date: row.created_at ?? undefined,
});

const mapPredictionToRow = (payload: Partial<Prediction>) => {
  const raw = payload as Record<string, any>;
  return {
    match_id: payload.match_id ?? raw.match_id ?? null,
    model_version: payload.model_version ?? payload.model_type ?? 'custom',
    model_type: payload.model_type ?? payload.model_version ?? 'balanced',
    win_prob_a: payload.player1_win_probability ?? raw.winProbA ?? raw.win_prob_a ?? 0.5,
    win_prob_b: payload.player2_win_probability ?? raw.winProbB ?? raw.win_prob_b ?? 0.5,
    confidence_level: payload.confidence_level ?? raw.confidence_level ?? null,
    deuce_tendency: payload.deuce_tendency ?? raw.deuce_tendency ?? null,
    pressure_index: payload.pressure_index ?? raw.pressure_index ?? null,
    predicted_winner_id: payload.predicted_winner_id ?? raw.predicted_winner_id ?? null,
    actual_winner_id: payload.actual_winner_id ?? raw.actual_winner_id ?? null,
    was_correct: payload.was_correct ?? raw.was_correct ?? null,
    completed_at: payload.completed_at ?? raw.completed_at ?? null,
    notes: payload.notes ?? raw.notes ?? null,
    metadata: payload.metadata ? JSON.stringify(payload.metadata) : raw.metadata ?? null,
    point_by_point_data: payload.point_by_point_data
      ? JSON.stringify(payload.point_by_point_data)
      : raw.point_by_point_data ?? null,
  };
};

const mapSortColumn = (sortField: string, map: Readonly<Record<string, string>>) =>
  map[sortField] ?? sortField;

const playersService = supabase
  ? {
      list: async (options?: string | ListOptions) => {
        const normalized = normalizeOptions(options);
        let query = supabase.from('players').select('*');
        if (normalized.sort) {
          const column = mapSortColumn(normalized.sort.field, playerSortMap);
          query = query.order(column, { ascending: normalized.sort.direction === 'asc' });
        }
        if (normalized.limit) {
          query = query.limit(normalized.limit);
        }
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        let results = (data ?? []).map(mapPlayerFromRow);
        results = applyFilters(results, normalized.filters);
        results = sortRecords(results, normalized.sort?.original);
        if (normalized.limit && results.length > normalized.limit) {
          results = results.slice(0, normalized.limit);
        }
        return results;
      },
      get: async (id: string) => {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw new Error(error.message);
        return data ? mapPlayerFromRow(data) : undefined;
      },
      create: async (data: Partial<Player>) => {
        const payload = mapPlayerToRow(data);
        const { data: inserted, error } = await supabase
          .from('players')
          .insert(payload)
          .select('*')
          .single();
        if (error) throw new Error(error.message);
        return mapPlayerFromRow(inserted);
      },
      update: async (id: string, data: Partial<Player>) => {
        const payload = mapPlayerToRow(data);
        const { data: updated, error } = await supabase
          .from('players')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single();
        if (error) throw new Error(error.message);
        return mapPlayerFromRow(updated);
      },
      remove: async (id: string) => {
        const { error } = await supabase.from('players').delete().eq('id', id);
        if (error) throw new Error(error.message);
      },
    }
  : null;

const matchesService = supabase
  ? {
      list: async (options?: string | ListOptions) => {
        const normalized = normalizeOptions(options);
        let query = supabase.from('matches').select('*');
        if (normalized.sort) {
          const column = mapSortColumn(normalized.sort.field, matchSortMap);
          query = query.order(column, { ascending: normalized.sort.direction === 'asc' });
        }
        if (normalized.limit) {
          query = query.limit(normalized.limit);
        }
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        let results = (data ?? []).map(mapMatchFromRow);
        results = applyFilters(results, normalized.filters);
        results = sortRecords(results, normalized.sort?.original);
        if (normalized.limit && results.length > normalized.limit) {
          results = results.slice(0, normalized.limit);
        }
        return results;
      },
      create: async (data: Partial<Match>) => {
        const payload = mapMatchToRow(data);
        const { data: inserted, error } = await supabase
          .from('matches')
          .insert(payload)
          .select('*')
          .single();
        if (error) throw new Error(error.message);
        return mapMatchFromRow(inserted);
      },
    }
  : null;

const predictionsService = supabase
  ? {
      list: async (options?: string | ListOptions) => {
        const normalized = normalizeOptions(options);
        let query = supabase.from('predictions').select('*');
        if (normalized.sort) {
          const column = mapSortColumn(normalized.sort.field, predictionSortMap);
          query = query.order(column, { ascending: normalized.sort.direction === 'asc' });
        }
        if (normalized.limit) {
          query = query.limit(normalized.limit);
        }
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        let results = (data ?? []).map(mapPredictionFromRow);
        results = applyFilters(results, normalized.filters);
        results = sortRecords(results, normalized.sort?.original);
        if (normalized.limit && results.length > normalized.limit) {
          results = results.slice(0, normalized.limit);
        }
        return results;
      },
      create: async (data: Partial<Prediction>) => {
        const payload = mapPredictionToRow(data);
        const { data: inserted, error } = await supabase
          .from('predictions')
          .insert(payload)
          .select('*')
          .single();
        if (error) throw new Error(error.message);
        return mapPredictionFromRow(inserted);
      },
      update: async (id: string, data: Partial<Prediction>) => {
        const payload = mapPredictionToRow(data);
        const { data: updated, error } = await supabase
          .from('predictions')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single();
        if (error) throw new Error(error.message);
        return mapPredictionFromRow(updated);
      },
    }
  : null;

export const supabaseDataClient: DataClient | null =
  playersService && matchesService && predictionsService
    ? {
        players: playersService,
        matches: matchesService,
        predictions: predictionsService,
        compliance: localDataClient.compliance,
        modelWeights: localDataClient.modelWeights,
        modelFeedback: localDataClient.modelFeedback,
        alias: localDataClient.alias,
        auth: localDataClient.auth,
        appLogs: localDataClient.appLogs,
      }
    : null;
