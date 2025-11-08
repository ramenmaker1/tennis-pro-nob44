import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import {
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
  slug: pgText('slug').notNull().unique(),
  rank: pgInteger('rank'),
  elo: pgInteger('elo'),
  hardElo: pgInteger('hard_elo'),
  clayElo: pgInteger('clay_elo'),
  grassElo: pgInteger('grass_elo'),
  hand: pgText('hand'),
  age: pgInteger('age'),
  nationality: pgText('nationality'),
  updatedAt: pgTimestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

const sqlitePlayers = sqliteTable('players', {
  id: sqliteText('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  canonicalName: sqliteText('canonical_name').notNull(),
  slug: sqliteText('slug').notNull().unique(),
  rank: sqliteInteger('rank'),
  elo: sqliteInteger('elo'),
  hardElo: sqliteInteger('hard_elo'),
  clayElo: sqliteInteger('clay_elo'),
  grassElo: sqliteInteger('grass_elo'),
  hand: sqliteText('hand'),
  age: sqliteInteger('age'),
  nationality: sqliteText('nationality'),
  updatedAt: sqliteText('updated_at')
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
  winProbA: pgProbability('win_prob_a').notNull(),
  winProbB: pgProbability('win_prob_b').notNull(),
  deuceTendency: pgProbability('deuce_tendency'),
  pressureIndex: pgProbability('pressure_index'),
  notes: pgText('notes'),
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
  winProbA: sqliteProbability('win_prob_a').notNull(),
  winProbB: sqliteProbability('win_prob_b').notNull(),
  deuceTendency: sqliteProbability('deuce_tendency'),
  pressureIndex: sqliteProbability('pressure_index'),
  notes: sqliteText('notes'),
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
