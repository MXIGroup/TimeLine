# MXI Campaign Tracking & Reporting

Campaign tracking and client reporting platform for MXI Group. Paste in a post
URL, tag it with creator/campaign/client info, and the system pulls metrics,
schedules refreshes at 24h / 48h / 7d / custom intervals, syncs to a Google
Sheet, and (roadmap) generates client-ready PDF/deck reports.

## Quick start

```bash
# 1. Install
npm install

# 2. Copy env template and fill it in (see docs/SETUP.md for which keys you need first)
cp .env.example .env.local

# 3. Provision Supabase
#    - Create a project at https://supabase.com
#    - Run supabase/migrations/00001_initial_schema.sql in the SQL editor
#    - (optional) Run supabase/seed.sql to load Zilch/BoyleSports/EA/etc client templates

# 4. Run
npm run dev
```

## Repo layout

```
src/app                 Next.js App Router pages + API routes
src/lib/platforms       Platform detection + per-platform metric providers
src/lib/clients         Client-specific templates (Zilch, BoyleSports, etc.)
src/lib/sheets          Google Sheets sync
src/lib/snapshots       Snapshot scheduling logic
supabase/migrations     Postgres schema (one migration per change)
workers/python          Optional FastAPI scraping fallback (see docs/SCRAPERS.md)
docs                    Architecture, setup, API integration notes, roadmap
```

## Docs

- `docs/ARCHITECTURE.md` — recommended MVP architecture and why
- `docs/SETUP.md` — full environment setup, OAuth flows, service accounts
- `docs/PLATFORMS.md` — what's automatable per platform, what needs creator auth, what falls back to manual
- `docs/ROADMAP.md` — PDF/deck reports, demographics, CPM/CPV, screenshot evidence
- `docs/CLIENT_TEMPLATES.md` — client-specific reporting config

## Status

MVP scaffold. URL input → tagging → DB storage → Google Sheet push works.
Platform providers ship as stubs with manual-entry fallback; YouTube has a
working API implementation as a reference. See `docs/PLATFORMS.md` for the
matrix of what's wired up vs. stubbed vs. requires creator OAuth.
