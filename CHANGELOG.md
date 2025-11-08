# Changelog

## [Unreleased]

### Added
- Supabase-ready data schema with Drizzle migrations and seeds for both SQLite and Postgres.
- Supabase data client and runtime data source switcher (Supabase / Local / Offline).
- Basic PWA support (manifest, service worker, Inter font) and service-worker registration.
- Vitest test harness with React Testing Library, plus initial smoke/integration tests for the data layer and selector UI.
- GitHub Actions pipeline running lint, tests, and build on every push/PR.
- Documentation updates covering migrations, Supabase setup, PWA behavior, and testing workflow.

### Changed
- `base44` proxy now routes through the active data source on every call.
- Layout header includes the new data source pill on desktop and mobile top bars.

### Pending
- Vercel + Tauri deployment automation once environment credentials are available.
- Full UI refresh pass (Midnight Slate spec) and desktop sync engine.
