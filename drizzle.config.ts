import { defineConfig } from 'drizzle-kit';

const schemaPath = './src/db/schema.ts';
const sqliteOut = './drizzle/sqlite';
const postgresOut = './drizzle/postgres';

const dialectEnv = (process.env.DB_DIALECT || '').toLowerCase();
const isPostgres = dialectEnv === 'postgres' || dialectEnv === 'postgresql';

const baseConfig = {
  schema: schemaPath,
  dialect: isPostgres ? 'postgresql' : 'sqlite',
  out: isPostgres ? postgresOut : sqliteOut,
  dbCredentials: isPostgres
    ? {
        url:
          process.env.DATABASE_URL ||
          'postgres://postgres:postgres@localhost:5432/tennis_pro_local',
      }
    : {
        url: './.data/local.db',
      },
  verbose: true,
};

export default defineConfig(baseConfig);
