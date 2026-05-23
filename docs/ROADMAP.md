# Roadmap

The MVP that ships today covers: URL input → tagging → DB storage → automatic
24h/48h/7d refresh schedule → manual refresh → Google Sheet sync. The items
below are what's queued next, ordered by likely value to MXI.

## Phase 1 — close the metric gaps (1–2 weeks)

1. **Meta OAuth + Instagram Graph API provider**
   - Route: `/api/oauth/meta/callback`
   - Wires up `instagramProvider` with creator OAuth tokens
   - Unlocks: Reels (plays, reach, saves, shares), Stories, account-level audience demographics
2. **TikTok Display API provider**
   - Route: `/api/oauth/tiktok/callback`
   - Same shape as Meta; one creator-onboarding flow
3. **YouTube Analytics API (creator OAuth)**
   - Adds watch time, average view duration, audience age/gender/geo
   - Same OAuth library as YouTube Data API; minimal extra work
4. **Click Analytic provider** (if MXI subscribes)
   - Cuts the creator-OAuth dance for already-onboarded creators

## Phase 2 — reporting outputs (2–3 weeks)

5. **PDF/deck report generator**
   - React templates rendered headlessly with Puppeteer → PDF
   - One template per client template (Zilch / BoyleSports / EA-Xbox / Hyperice / General)
   - Sections: campaign overview · totals · per-creator breakdown · platform breakdown · demographic charts · hero stats · CPM/CPV table · screenshots appendix
   - Output uploaded to the campaign's Drive folder; link saved to `evidence_files`
6. **Weekly email summary**
   - Resend or Postmark; cron-triggered Mondays for each client whose
     `reporting_cadence='weekly'`
7. **CPM / CPV calculations**
   - `client_rate_cards` already in schema; rate × deliverable count → fee
   - CPM = fee / (impressions / 1000); CPV = fee / views
   - Editable per-client rate cards page (`/clients/[slug]/rates`)
8. **Screenshot evidence handling**
   - Drag-drop upload component on the post detail page
   - Files go to Supabase Storage bucket `evidence`, optionally mirrored to Drive
   - Surfaced in PDF report's screenshots appendix
9. **Demographic charts component**
   - Stacked bar (age) + donut (gender) + map (geo) using a lightweight chart lib
   - Reused between dashboard and PDF templates

## Phase 3 — workflow polish (2–4 weeks)

10. **Audience verification pre-campaign**
    - Pull creator-level demographics once at campaign kick-off via IG Graph / TikTok / Click Analytic
    - Store snapshot tied to `campaigns` + show on a pre-campaign report
    - Used by Opera / HelloFresh / general template
11. **Brand exclusivity checker** (EA / Xbox priority)
    - At report time, scan `posts` for the same `creator_id` whose `posted_at`
      falls in another campaign's `exclusivity_window`
    - Flag in the report and on the campaign dashboard
12. **Benchmarks dashboard**
    - Visual flag (🟢/🟡/🔴) on each post against `campaigns.benchmark_config`
    - Out-the-box for BoyleSports' 300k/200k/80k targets
13. **Status workflow**
    - Auto-flip status: `requested` → `in_progress` when post URL added, →
      `live` when first non-zero snapshot lands, → `archived` 30 days post-campaign
14. **Client read-only portal**
    - New `client_users` table, RLS scoped by it
    - One read-only dashboard per client with their live posts + last week's deltas
15. **Pre-campaign brief intake form**
    - Public form (shareable link) for clients to submit campaign briefs
    - Creates a `campaigns` row + sends a Slack notification to MXI

## Phase 4 — scale (4+ weeks)

16. **Multi-team support** for if MXI ever runs separate pods or sub-agencies
17. **Conversion attribution feed**
    - Per-client CSV/webhook ingestion into `post_conversions`
    - Tie registrations / sales back to the originating post via UTM
18. **Anomaly alerts**
    - Slack ping when a snapshot shows >50% view drop (likely takedown)
    - Slack ping when a post hits a benchmark
19. **Mobile capture**
    - PWA that account managers use on phones during creator check-ins
    - Quick screenshot upload + auto-paste of post URL from clipboard

## Explicitly not on the roadmap

- General-purpose scraping outside platform-official APIs (legal/ToS exposure)
- Predictive performance modelling — not enough data signal at MVP volume
- White-label dashboards for resale
