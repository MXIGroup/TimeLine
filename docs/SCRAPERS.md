# Optional Python scraping worker

The Next.js app handles every supported flow on its own. The Python worker in
`workers/python/` exists for cases where we need a long-running, JS-rendered
scrape (typically Playwright) that doesn't fit a Vercel function's 60-second
limit or that needs a real browser to evaluate page-side analytics overlays.

**Use sparingly.** Every scrape is brittle and the legal grounding is shaky
for most major platforms — see `docs/PLATFORMS.md`. The MVP does not depend on
this worker; it's documented here for when a specific need arises.

## When to reach for this

| Situation | Use this worker? |
|---|---|
| Platform has an official API | No — wire it into `src/lib/platforms/*` instead |
| Creator authorised us via OAuth | No — call their authenticated API |
| Public page, ToS permits, short timeout | Maybe — try Next.js `fetch` first, fall back here |
| Public page, needs JS execution | Yes |
| Long screenshot capture (5+ seconds) | Yes |

## Contract

`POST /scrape/metrics`
```json
{ "post_url": "https://...", "platform": "tiktok" }
```
Returns the same shape as `ProviderMetrics` in `src/types/db.ts`.

The Next.js app should call this with `Authorization: Bearer <WORKER_SECRET>`
where `WORKER_SECRET` is shared via env var.

## Deploying

- Cloud Run / Fly / Railway all work. Use a container that has Playwright's
  browser deps preinstalled (`mcr.microsoft.com/playwright/python`).
- Set `WORKER_SECRET` env var in both the worker and the Next.js app.
- Add `WORKER_URL=https://...` in Next.js env and create
  `src/lib/platforms/scrapeWorker.ts` that dispatches to it.
