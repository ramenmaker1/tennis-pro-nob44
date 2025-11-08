# TennisPro Predictor

Modern tennis analytics with Supabase sync, offline/local workflows, and an install-ready PWA shell.

---

## Quick Start

```bash
git clone <repo>
cd tennis-pro-8af1373f
npm install
npm run dev
```

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server (reads `.env.local`) |
| `npm run build` | Production bundle into `dist/` |
| `npm run preview` | Preview the production bundle |
| `npm run lint` | ESLint (flat config) |
| `npm run test` | Vitest smoke/integration tests |
| `npm run typecheck` | Optional TS project check via `jsconfig` |
| `npm run db:generate:sqlite` / `db:generate:pg` | Generate Drizzle migrations |
| `npm run db:migrate:sqlite` / `db:migrate:pg` | Apply migrations to local SQLite / Supabase |
| `npm run seed:sqlite` / `seed:pg` | Load sample players/matches into the target DB |
| `npm run format` | Project-wide Prettier pass |

Node 20+ is required (pinned via `.nvmrc`); CI uses Node 20. Git hooks are not configured so remember to run `npm run lint && npm run test` locally before pushing.

---

## Environment Variables

Create `.env.local` (already git-ignored) and supply the following:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | ✅ (for Supabase mode) | Supabase project URL (`https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon key (public) |
| `VITE_SENTRY_DSN` | optional | Enables Sentry in production |

Drizzle CLI commands default to SQLite (`.data/local.db`). For Supabase/Postgres migrations and seeds, export `DATABASE_URL` or rely on the default `postgres://postgres:postgres@localhost:5432/tennis_pro_local`.

---

## Data Workflow

1. **Schema & migrations** – `src/db/schema.ts` defines the shared schema. Run the `db:generate:*` scripts to create SQL under `drizzle/{sqlite,postgres}`.
2. **Apply migrations** – `npm run db:migrate:sqlite` initializes the local desktop database; `npm run db:migrate:pg` applies the same schema to Supabase.
3. **Seeding** – `npm run seed:sqlite` or `seed:pg` uses Drizzle to insert two flagship players, a sample match, and prediction rows.
4. **Runtime switching** – The data source pill (top quickbar + mobile header) lets you switch between Supabase, Local (in-memory), and Offline (read-only). `base44` is now a thin proxy that always targets the selected DataClient.

Supabase row-level security starter policies live in `supabase/policies.sql` (public read, unrestricted admin writes). Apply them via the Supabase SQL editor until auth is wired.

---

## Progressive Web App

- `public/manifest.webmanifest` + `pwa-icon.svg` define the install prompt and icon.
- A lightweight service worker (`public/sw.js`) caches the shell for offline viewing. It is registered automatically in production builds.
- Theme color and Inter font are loaded in `index.html`; the body defaults to the dark palette defined in `src/index.css`.

To test the install prompt: run `npm run build && npm run preview`, open `http://localhost:4173/`, and use Chrome DevTools → Application → Service Workers.

---

## Testing & QA

Vitest + React Testing Library are configured (`vitest.config.js`, `vitest.setup.js`). Existing suites cover:

- Local data client CRUD (`tests/localClient.test.js`)
- base44 proxy routing (`tests/base44Proxy.test.js`)
- Data source store + selector UI

Add page-level smoke tests under `tests/pages/` by wrapping components with React Query + Router providers. Run the suite with `npm run test` (CI executes lint, test, build on every push/PR via `.github/workflows/ci.yml`).

Manual QA checklist:

- Supabase mode: Players create/edit/delete; matches filters; predictions list; sync button toggles.
- Local/offline mode: Switch pill to ensure UIs keep functioning.
- PWA: Install prompt + offline reload with service worker.

---

## Deployment Notes

### Vercel (web)

1. Create a new project pointing to this repo.
2. Set production environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_SENTRY_DSN`).
3. Build command: `npm run build`. Output directory: `dist`.
4. Connect Supabase migrations beforehand (`npm run db:migrate:pg`) so the app has tables.

Smoke tests to run once deployed: landing, Players list, add/edit player, match filters, predictions list, PWA install prompt.

### Desktop / Tauri (future)

Tauri isn’t checked in yet (requires Rust + platform-specific toolchains). When ready:

1. `npm create tauri-app` or `npx tauri init` pointing to the existing Vite frontend.
2. Add the Tauri SQLite plugin and wire Drizzle SQL migrations to run on first launch (seed two players when DB empty).
3. Repoint `LocalDataClient` to invoke Tauri commands backed by SQLite instead of in-memory arrays.
4. Implement a sync command (pull → merge → push) with last-write-wins semantics and a conflict toast/log.
5. Use the official Tauri GitHub Action to produce installers when tagging releases.

---

## Logging, Telemetry & Security

- Sentry: set `VITE_SENTRY_DSN` to enable error + performance telemetry. Disable or sample aggressively for desktop builds.
- Supabase: rotate anon/service-role keys periodically, move to authenticated policies before broad release, and configure backups/export schedules.
- Roadmap items (Phase 9): Supabase Auth + roles, improved conflict resolution, CSV import/export, theming controls, and a hardened CHANGELOG-driven release cadence.

---

## Project Tracking

Master checklist (see issue template or GitHub Project for status):

1. **Env / Tooling** – Node pin, lint/test/build, CI skeleton ✅
2. **Data Layer** – Base44 removal, shared Drizzle schema, Supabase client ✅
3. **Supabase** – Project + envs + seeds ✅
4. **Web Deploy** – Pending (Vercel hookup + optional PWA polish)
5. **Desktop** – Pending (Tauri + sync + installer)
6. **UI Refresh** – Pending (Midnight Slate spec)
7. **QA Automation** – Partial (lint/tests done; expand coverage + offline manual set)
8. **CI/CD & Releases** – Pending (Vercel + Tauri release pipelines, semantic tags)
9. **Docs & Hardening** – README/CHANGELOG started; backups/auth hardening outstanding

Keep `CHANGELOG.md` updated with every notable change and tag releases (`v0.x.y`). When tagging `v0.1.0`, plan to publish both the Vercel deploy and desktop installers.
