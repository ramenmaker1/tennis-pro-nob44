import { randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { players, matches, predictions } from '../src/db/schema';

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();

const samplePlayers = [
  {
    canonicalName: 'Carlos Alcaraz',
    displayName: 'Carlos Alcaraz',
    slug: 'carlos-alcaraz',
    rank: 2,
    elo: 2100,
    hardElo: 2080,
    clayElo: 2150,
    grassElo: 2050,
    plays: 'Right',
    nationality: 'ESP',
    dataSource: 'seed',
  },
  {
    canonicalName: 'Jannik Sinner',
    displayName: 'Jannik Sinner',
    slug: 'jannik-sinner',
    rank: 1,
    elo: 2140,
    hardElo: 2160,
    clayElo: 2085,
    grassElo: 2100,
    plays: 'Right',
    nationality: 'ITA',
    dataSource: 'seed',
  },
];

async function seedSqlite() {
  const sqlite = new Database('./.data/local.db');
  const db = drizzleSqlite(sqlite);

  await db.delete(predictions);
  await db.delete(matches);
  await db.delete(players);

  const insertedPlayers = await Promise.all(
    samplePlayers.map((player) =>
      db
        .insert(players)
        .values({
          id: randomUUID(),
          ...player,
        })
        .returning(),
    ),
  );

  const playerA = insertedPlayers[0][0];
  const playerB = insertedPlayers[1][0];

  const matchId = randomUUID();
  await db.insert(matches).values({
    id: matchId,
    playerAId: playerA.id,
    playerBId: playerB.id,
    tournament: 'ATP Finals',
    round: 'Final',
    surface: 'indoor-hard',
    startTimeUtc: new Date().toISOString(),
    bestOf: 3,
    status: 'scheduled',
  });

  await db.insert(predictions).values({
    id: randomUUID(),
    matchId,
    modelVersion: 'v1.0.0',
    modelType: 'balanced',
    winProbA: 0.58,
    winProbB: 0.42,
    deuceTendency: 0.21,
    pressureIndex: 0.65,
    notes: 'Baseline-heavy matchup, slight edge to Alcaraz.',
    createdAt: new Date().toISOString(),
  });

  sqlite.close();
}

async function seedPostgres() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/tennis_pro_local',
  });
  const db = drizzlePostgres(pool);

  await db.delete(predictions);
  await db.delete(matches);
  await db.delete(players);

  const inserted = await db
    .insert(players)
    .values(samplePlayers.map((player) => ({ id: randomUUID(), ...player })))
    .returning();

  const [playerA, playerB] = inserted;
  const matchId = randomUUID();

  await db.insert(matches).values({
    id: matchId,
    playerAId: playerA.id,
    playerBId: playerB.id,
    tournament: 'ATP Finals',
    round: 'Final',
    surface: 'indoor-hard',
    startTimeUtc: new Date().toISOString(),
    bestOf: 3,
    status: 'scheduled',
  });

  await db.insert(predictions).values({
    id: randomUUID(),
    matchId,
    modelVersion: 'v1.0.0',
    modelType: 'balanced',
    winProbA: 0.58,
    winProbB: 0.42,
    deuceTendency: 0.21,
    pressureIndex: 0.65,
    notes: 'Baseline-heavy matchup, slight edge to Alcaraz.',
  });

  await pool.end();
}

async function run() {
  if (dialect === 'postgres' || dialect === 'postgresql') {
    await seedPostgres();
    console.log('Seeded Postgres database.');
  } else {
    await seedSqlite();
    console.log('Seeded SQLite database.');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
