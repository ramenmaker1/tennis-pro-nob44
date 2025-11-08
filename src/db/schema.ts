import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import {
  boolean as pgBoolean,
  integer as pgInteger,
  numeric,
  pgTable,
  text as pgText,
  timestamp as pgTimestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  integer as sqliteInteger,
  real as sqliteReal,
  sqliteTable,
  text as sqliteText,
} from 'drizzle-orm/sqlite-core';

const dialectEnv = (process.env.DB_DIALECT || '').toLowerCase();
const isPostgres = dialectEnv === 'postgres' || dialectEnv === 'postgresql';

const pgPlayers = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  canonicalName: pgText('canonical_name').notNull(),
  displayName: pgText('display_name').notNull(),
  firstName: pgText('first_name'),
  lastName: pgText('last_name'),
  slug: pgText('slug').notNull().unique(),
  rank: pgInteger('rank'),
  peakRank: pgInteger('peak_rank'),
  elo: pgInteger('elo'),
  hardElo: pgInteger('hard_elo'),
  clayElo: pgInteger('clay_elo'),
  grassElo: pgInteger('grass_elo'),
  plays: pgText('plays'),
  hand: pgText('hand'),
  photoUrl: pgText('photo_url'),
  birthYear: pgInteger('birth_year'),
  heightCm: pgInteger('height_cm'),
  firstServePct: pgInteger('first_serve_pct'),
  firstServeWinPct: pgInteger('first_serve_win_pct'),
  secondServeWinPct: pgInteger('second_serve_win_pct'),
  acesPerMatch: numeric('aces_per_match', { precision: 6, scale: 2 }),
  doubleFaultsPerMatch: numeric('double_faults_per_match', { precision: 6, scale: 2 }),
  firstReturnWinPct: pgInteger('first_return_win_pct'),
  secondReturnWinPct: pgInteger('second_return_win_pct'),
  breakPointsConvertedPct: pgInteger('break_points_converted_pct'),
  returnGamesWonPct: pgInteger('return_games_won_pct'),
  clutchFactor: pgInteger('clutch_factor'),
  consistencyRating: pgInteger('consistency_rating'),
  tiebreakWinPct: pgInteger('tiebreak_win_pct'),
  deuceWinPct: pgInteger('deuce_win_pct'),
  hardCourtWinPct: pgInteger('hard_court_win_pct'),
  clayCourtWinPct: pgInteger('clay_court_win_pct'),
  grassCourtWinPct: pgInteger('grass_court_win_pct'),
  fitnessRating: pgInteger('fitness_rating'),
  momentumRating: numeric('momentum_rating', { precision: 5, scale: 2 }),
  dataSource: pgText('data_source'),
  nationality: pgText('nationality'),
  updatedAt: pgTimestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: pgTimestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

const sqlitePlayers = sqliteTable('players', {
  id: sqliteText('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  canonicalName: sqliteText('canonical_name').notNull(),
  displayName: sqliteText('display_name').notNull(),
  firstName: sqliteText('first_name'),
  lastName: sqliteText('last_name'),
  slug: sqliteText('slug').notNull().unique(),
  rank: sqliteInteger('rank'),
  peakRank: sqliteInteger('peak_rank'),
  elo: sqliteInteger('elo'),
  hardElo: sqliteInteger('hard_elo'),
  clayElo: sqliteInteger('clay_elo'),
  grassElo: sqliteInteger('grass_elo'),
  plays: sqliteText('plays'),
  hand: sqliteText('hand'),
  photoUrl: sqliteText('photo_url'),
  birthYear: sqliteInteger('birth_year'),
  heightCm: sqliteInteger('height_cm'),
  firstServePct: sqliteInteger('first_serve_pct'),
  firstServeWinPct: sqliteInteger('first_serve_win_pct'),
  secondServeWinPct: sqliteInteger('second_serve_win_pct'),
  acesPerMatch: sqliteReal('aces_per_match'),
  doubleFaultsPerMatch: sqliteReal('double_faults_per_match'),
  firstReturnWinPct: sqliteInteger('first_return_win_pct'),
  secondReturnWinPct: sqliteInteger('second_return_win_pct'),
  breakPointsConvertedPct: sqliteInteger('break_points_converted_pct'),
  returnGamesWonPct: sqliteInteger('return_games_won_pct'),
  clutchFactor: sqliteInteger('clutch_factor'),
  consistencyRating: sqliteInteger('consistency_rating'),
  tiebreakWinPct: sqliteInteger('tiebreak_win_pct'),
  deuceWinPct: sqliteInteger('deuce_win_pct'),
  hardCourtWinPct: sqliteInteger('hard_court_win_pct'),
  clayCourtWinPct: sqliteInteger('clay_court_win_pct'),
  grassCourtWinPct: sqliteInteger('grass_court_win_pct'),
  fitnessRating: sqliteInteger('fitness_rating'),
  momentumRating: sqliteReal('momentum_rating'),
  dataSource: sqliteText('data_source'),
  nationality: sqliteText('nationality'),
  updatedAt: sqliteText('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  createdAt: sqliteText('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const players = isPostgres ? pgPlayers : sqlitePlayers;

const pgMatches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerAId: uuid('player_a_id')
    .notNull()
    .references(() => pgPlayers.id, { onDelete: 'cascade' }),
  playerBId: uuid('player_b_id')
    .notNull()
    .references(() => pgPlayers.id, { onDelete: 'cascade' }),
  tournament: pgText('tournament'),
  round: pgText('round'),
  surface: pgText('surface'),
  startTimeUtc: pgTimestamp('start_time_utc', { withTimezone: true }).notNull(),
  bestOf: pgInteger('best_of').notNull().default(3),
  status: pgText('status').notNull().default('scheduled'),
  createdAt: pgTimestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

const sqliteMatches = sqliteTable('matches', {
  id: sqliteText('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  playerAId: sqliteText('player_a_id')
    .notNull()
    .references(() => sqlitePlayers.id, { onDelete: 'cascade' }),
  playerBId: sqliteText('player_b_id')
    .notNull()
    .references(() => sqlitePlayers.id, { onDelete: 'cascade' }),
  tournament: sqliteText('tournament'),
  round: sqliteText('round'),
  surface: sqliteText('surface'),
  startTimeUtc: sqliteText('start_time_utc').notNull(),
  bestOf: sqliteInteger('best_of').notNull().default(3),
  status: sqliteText('status').notNull().default('scheduled'),
  createdAt: sqliteText('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const matches = isPostgres ? pgMatches : sqliteMatches;

const pgProbability = (name: string) => numeric(name, { precision: 6, scale: 5 });
const sqliteProbability = (name: string) => sqliteReal(name);

const pgPredictions = pgTable('predictions', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id')
    .notNull()
    .references(() => pgMatches.id, { onDelete: 'cascade' }),
  modelVersion: pgText('model_version').notNull(),
  modelType: pgText('model_type').notNull(),
  winProbA: pgProbability('win_prob_a').notNull(),
  winProbB: pgProbability('win_prob_b').notNull(),
  confidenceLevel: pgText('confidence_level'),
  deuceTendency: pgProbability('deuce_tendency'),
  pressureIndex: pgProbability('pressure_index'),
  predictedWinnerId: uuid('predicted_winner_id'),
  actualWinnerId: uuid('actual_winner_id'),
  wasCorrect: pgBoolean('was_correct'),
  completedAt: pgTimestamp('completed_at', { withTimezone: true }),
  notes: pgText('notes'),
  metadata: pgText('metadata'),
  pointByPointData: pgText('point_by_point_data'),
  createdAt: pgTimestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

const sqlitePredictions = sqliteTable('predictions', {
  id: sqliteText('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  matchId: sqliteText('match_id')
    .notNull()
    .references(() => sqliteMatches.id, { onDelete: 'cascade' }),
  modelVersion: sqliteText('model_version').notNull(),
  modelType: sqliteText('model_type').notNull(),
  winProbA: sqliteProbability('win_prob_a').notNull(),
  winProbB: sqliteProbability('win_prob_b').notNull(),
  confidenceLevel: sqliteText('confidence_level'),
  deuceTendency: sqliteProbability('deuce_tendency'),
  pressureIndex: sqliteProbability('pressure_index'),
  predictedWinnerId: sqliteText('predicted_winner_id'),
  actualWinnerId: sqliteText('actual_winner_id'),
  wasCorrect: sqliteInteger('was_correct'),
  completedAt: sqliteText('completed_at'),
  notes: sqliteText('notes'),
  metadata: sqliteText('metadata'),
  pointByPointData: sqliteText('point_by_point_data'),
  createdAt: sqliteText('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const predictions = isPostgres ? pgPredictions : sqlitePredictions;

const pgSources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id')
    .notNull()
    .references(() => pgMatches.id, { onDelete: 'cascade' }),
  provider: pgText('provider').notNull(),
  url: pgText('url'),
  fetchedAt: pgTimestamp('fetched_at', { withTimezone: true }).defaultNow(),
});

const sqliteSources = sqliteTable('sources', {
  id: sqliteText('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  matchId: sqliteText('match_id')
    .notNull()
    .references(() => sqliteMatches.id, { onDelete: 'cascade' }),
  provider: sqliteText('provider').notNull(),
  url: sqliteText('url'),
  fetchedAt: sqliteText('fetched_at').default(sql`CURRENT_TIMESTAMP`),
});

export const sources = isPostgres ? pgSources : sqliteSources;
