# Architecture

## Recommended MVP stack

| Concern | Choice | Why |
|---|---|---|
| Frontend + API | **Next.js 15 (App Router, TypeScript)** | One deploy unit; SSR for fast post lists; React Server Components keep the UI snappy without a separate API. |
| Database + Auth + Storage | **Supabase (Postgres + Auth + Storage)** | Single managed service for DB, Google SSO, and screenshot/PDF storage. RLS keeps the team boundary enforced at the DB. Postgres scales to hundreds of thousands of snapshots without trouble. |
| Background scraping | **Python FastAPI worker (optional)** | Only needed when a creator authorises TikTok/IG and we need long-running OAuth refresh, or when a platform's only path is browser-automation scraping (Playwright). The MVP runs without it; YouTube + manual entry cover the first week of usage. |
| Scheduler | **Vercel Cron** (every 15 min) hitting `/api/refresh/cron` | Free on the Vercel Pro plan we're already paying for. Same code path works under GitHub Actions or Supabase pg_cron if we move off Vercel. |
| Reporting (PDF/deck) | **Roadmap:** Puppeteer-based HTML→PDF, output to Google Drive | Re-uses the same React templates the dashboard renders. Avoids a parallel templating system. |
| Sheets integration | **googleapis npm + service account** | Service account JSON in env; share each target Sheet with the account email. |

### Why not Streamlit?
Streamlit is a faster prototype for a single internal user but doesn't ship the
client-facing surfaces well (PDFs, scheduled emails, multi-user access with
SSO). For an agency tool with non-technical users plus eventual client-shared
read views, Next.js wins.

### Why not all-Python (FastAPI + Jinja)?
Same reason — slower iteration on the UI, weaker ecosystem for SSR + email/PDF
templating that mirrors the screen view.

### Why Supabase over raw Postgres?
Three things we'd otherwise rebuild: Google SSO via the auth schema, signed
URLs for screenshot uploads via Storage, and RLS as our team-boundary enforcer.
Migrating off (to Neon + Auth.js + S3) is straightforward later if needed.

## Data flow

```
┌──────────┐  paste URL  ┌─────────────────────┐  insert post  ┌───────────┐
│ Manager  │ ──────────▶ │ /posts/new (Next.js)│ ────────────▶ │ Postgres  │
└──────────┘             └─────────────────────┘               │  posts    │
                                  │                            │  + trigger│
                                  │ POST /api/posts            │  seeds    │
                                  ▼                            │  refresh  │
                         detect platform                       │  schedule │
                                  │                            └─────┬─────┘
                                  ▼                                  │
                         immediate refresh                           │
                         (provider or skip)                          │
                                  │                                  │
                                  ▼                                  │
                         snapshot row written                        │
                                  │                                  │
   every 15 min ── /api/refresh/cron ── runDueRefreshes ─────────────┘
                                  │
                                  ▼
                         provider.fetchMetrics()  ───▶  YouTube API / TikTok / IG OAuth / manual
                                  │
                                  ▼
                         insert snapshot, update posts.latest_*
                                  │
                                  ▼
                         (on-demand or weekly cron)
                         /api/sheets/sync ── googleapis ──▶ Google Sheet tab per client
                                  │
                                  ▼
                         (roadmap) PDF generator ──▶ Drive folder
```

## Snapshot scheduling

- On `posts` insert, a Postgres trigger (`seed_post_refresh_schedule`) inserts
  three rows into `post_refresh_schedule`: `posted_at + 24h / 48h / 7d`.
- The cron route picks up due rows, calls the right platform provider, writes a
  snapshot, denormalises the latest values onto `posts`, and stamps the
  schedule row complete.
- Manual "Refresh now" hits `/api/refresh/[id]` and reuses the same code path
  with `reason='manual'`.
- Custom schedules (eg "refresh again on campaign end + 1 week"): insert a row
  directly via `scheduleCustomRefresh()` from the API or a UI control.

## Auth

- Supabase Auth with Google OAuth. Domain restricted to `ALLOWED_EMAIL_DOMAIN`
  (env) via an auth hook or a custom check in the layout.
- RLS policies grant signed-in users full read/write on all rows. The team
  boundary is enforced by Google SSO + domain restriction.
- When client-facing read access is needed later (eg sharing a campaign
  dashboard with the client), add a `client_users` table mapping
  `auth.users.id → client_id` and tighten RLS to scope `select` by that table.

## Local dev

```bash
npm install
cp .env.example .env.local
# Fill in Supabase URL + anon + service-role keys, plus YOUTUBE_API_KEY.
# Sheets/email/PDF integrations can be left blank — the UI still works.
npm run dev
```

The app boots without any platform API keys configured; metric refresh
falls back to manual entry in that case.
