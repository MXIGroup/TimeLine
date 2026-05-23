# Client templates

Each client gets a `template_key` (column on `clients`) that controls which
metrics are surfaced first, which compliance checks the dashboard runs, the
reporting cadence, and the eventual PDF/deck layout. Templates live in
`src/lib/clients/templates.ts` — add a new one by appending to the `TEMPLATES`
record.

## Out-of-the-box templates

### `zilch` — Zilch
- **Priority metrics:** saves, engagement rate, UK audience %, link/UTM usage
- **Compliance checks:** tracking link used, UK audience ≥ 70%
- **Cadence:** weekly
- **Output:** Google Sheet + weekly email summary
- **Status tags shown:** 🟢 Live · 🟡 In Progress · ⏳ Requested
- **Registrations:** trackable via the UTM parameters on the tracking link.
  When Zilch shares its conversion-attribution feed (CSV upload or webhook),
  wire it into a new `post_conversions` table — out of MVP scope.

### `boylesports` — BoyleSports
- **Priority metrics:** total branded views, UK/IE audience %, btag/affiliate compliance
- **Compliance checks:** tracking link (btag) used, UK+IE audience ≥ 70%
- **Cadence:** weekly + post-campaign wrap
- **Benchmarks** (per `campaigns.benchmark_config`):
  - Watchalong: 300,000 views
  - Match preview: 200,000 views
  - Social clip: 80,000 views
  Reporting marks each post as 🟢 over / 🟡 within 10% / 🔴 under benchmark.
- **Output:** Google Sheet + PDF deck

### `ea_xbox` — EA Sports / Xbox
- **Priority metrics:** impressions, reach, engagement rate, screenshot evidence
- **Compliance checks:** screenshot uploaded within 48h of `posted_at`
- **Brand exclusivity:** evaluated against `campaigns.exclusivity_window` — at
  report time we flag any other branded posts by the same creator in that range.
- **Cadence:** post-campaign
- **Output:** Screenshot-led PDF report

### `hyperice` — Hyperice
- **Priority metrics:** views, reach, engagement rate vs industry benchmark
- **Cadence:** bi-weekly
- **Output:** PDF deck
- **Industry benchmarks** (placeholder; replace with HypeAuditor pulls if MXI
  subscribes):
  - TikTok ER avg: 5.0%
  - IG Reels ER avg: 1.5%
  - YouTube Shorts ER avg: 2.0%

### `general` — Opera / HelloFresh / catch-all
- **Priority metrics:** views, engagement rate, audience breakdown
- **Cadence:** post-campaign
- **Output:** Pre-campaign audience-verification report + post-campaign wrap
- Use this for any new client until they need a bespoke template.

## Adding a new template

```ts
// src/lib/clients/templates.ts
const TEMPLATES = {
  // ...existing
  new_client: {
    key: 'new_client',
    label: 'New Client',
    priority_metrics: ['views', 'engagement_rate'],
    compliance_checks: [trackingLinkCheck],
    cadence: 'weekly',
    default_currency: 'GBP',
    target_geos: ['US'],
    outputs: { google_sheet: true, weekly_email: false, pdf_deck: true, screenshot_led: false },
  },
};
```

Then `update clients set template_key = 'new_client' where slug = 'new-client'`.
