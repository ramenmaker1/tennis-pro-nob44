# Base44 App

## Branches & CI

- `main` stays as the release branch while `develop` collects work-in-progress changes.
- Every push/PR targeting those branches runs the `npm install`, `npm run lint`, and `npm run build` jobs defined in `.github/workflows/ci.yml`, so use Node 20 and keep your lockfile committed.

## Database & Seeds

1. Generate migrations:
   - SQLite (desktop): `DB_DIALECT=sqlite npx drizzle-kit generate`
   - Postgres/Supabase: `DB_DIALECT=postgres npx drizzle-kit generate`
2. Apply migrations with the matching `db:migrate:*` script.
3. Load smoke-data players/matches:
   - `npm run seed:sqlite` (writes to `./.data/local.db`)
   - `npm run seed:pg` (uses `DATABASE_URL` or `postgres://postgres:postgres@localhost:5432/tennis_pro_local`)
