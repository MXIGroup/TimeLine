# Platform integrations

Per-platform matrix of what's automatable, what needs creator authentication,
what falls back to manual upload, plus the API/account each path needs.

## Summary matrix

| Platform | Public API path | Creator OAuth path | Scrape fallback | MVP status |
|---|---|---|---|---|
| **YouTube / YouTube Shorts** | ✅ YouTube Data API v3 (views, likes, comments) | YouTube Analytics API (watch time, audience) — creator OAuth | n/a | **Wired** (public API) |
| **Instagram (Reels/Posts)** | ❌ no public path | ✅ Instagram Graph API — required | Brittle, ToS-grey | Stub → manual entry |
| **Instagram Stories** | ❌ | ✅ Instagram Graph API (`/insights` on story media) | n/a (24h ephemeral) | Stub → manual entry |
| **TikTok** | ❌ Research API needs academic affil | ✅ TikTok Display API + Login Kit | ToS-grey, brittle | Stub → manual entry |
| **X / Twitter** | ⚠️ API v2 Basic ($200/mo) | n/a | ToS-prohibited | Wired (opts out if no `X_BEARER_TOKEN`) |
| **Facebook** | ❌ | ✅ Page Access Token via Meta Login | n/a | Stub → manual entry |
| **Other** | n/a | n/a | n/a | Manual only |

## Automation tiers

**Tier 1 — fully automated:** YouTube (views/likes/comments via API key). No
creator action needed. Set `YOUTUBE_API_KEY` and refreshes Just Work.

**Tier 2 — automated once creator authorises:** Instagram (Reels/Stories),
TikTok, Facebook. Each creator runs through an OAuth flow once; we store
their token in `creator_platform_accounts.oauth_*` and refresh on a schedule.
Token expiry handled by `oauth_expires_at` + a refresh job.

**Tier 3 — manual upload only:** TikTok (without Display API auth), Instagram
(without Graph API auth), bespoke platforms. The account manager pastes
view/like/comment counts from a screenshot the creator shared, and uploads
the screenshot itself to `evidence_files` for client proof.

## YouTube — what we get and what we don't

- Public API:
  - viewCount, likeCount, commentCount, video length
  - No watch time, no audience demographics, no impressions
- YouTube Analytics API (creator OAuth, **roadmap**):
  - watch time, average view duration, audience age/gender/geo
  - Adds a step to creator onboarding, but unlocks the metrics Hyperice and EA care about
- Quota: 10,000 units/day by default. `videos.list` costs 1 unit per call.
  We can refresh ~10k videos a day before hitting the cap. Request an
  increase via the Cloud Console if needed (Google approves these within ~3
  business days for legitimate use).

## Instagram Graph API — onboarding cost

The creator must:
1. Convert their account to **Business or Creator** (not Personal).
2. Link the IG account to a Facebook Page they admin.
3. Sign in via Facebook Login on a Connect-Account page in this app.
4. Grant: `instagram_basic`, `instagram_manage_insights`,
   `pages_show_list`, `pages_read_engagement`.

Once that's done we can call `/{ig-media-id}/insights` for:
- Reels: `plays`, `reach`, `likes`, `comments`, `shares`, `saves`, `total_interactions`
- Stories: `reach`, `impressions`, `replies`, `exits`, `taps_forward`, `taps_back`
- Audience demographics for the **account** (not per post): age, gender, top countries/cities

Token rotates every ~60 days; we re-issue via the refresh token automatically.

## TikTok — the awkward one

- **Display API** (creator OAuth) returns per-video `view_count`, `like_count`,
  `comment_count`, `share_count`. Requires creator's `video.list` scope.
  Requires app approval from TikTok (typically 1–2 weeks).
- **Research API** would let us pull public data without per-creator OAuth, but
  it requires academic-institution affiliation. Not viable for an agency.
- **Public scrape** — works for view counts on some pages but breaks frequently
  and violates ToS. Recommend not relying on it; keep ScraperAPI off by default.

Until creator OAuth is wired up, all TikTok refreshes route to manual entry,
and the workflow is:
1. Creator screenshots their analytics view
2. Account manager uploads screenshot to the post + pastes the numbers
3. The snapshot is tagged `source='manual'` so reports show it as creator-supplied

## X / Twitter — cost/coverage trade-off

| Tier | Cost | Tweet-lookup cap | Notes |
|---|---|---|---|
| Free | $0 | ~0 useful for app metrics | Not viable |
| Basic | $200/mo | 15k tweet lookups / month | Probably enough for MVP |
| Pro | $5,000/mo | 1M | Only worth it if X is a major channel |

Recommend Basic if any client (mostly BoyleSports, EA, Xbox) regularly briefs
X posts. Otherwise leave `X_BEARER_TOKEN` blank and use manual entry.

## ScraperAPI — when (not) to use

ScraperAPI is documented as an env var but **off by default**. Reasonable only
for: publicly viewable pages where the platform's ToS doesn't forbid third-
party scraping (essentially: nowhere except some YouTube channel pages). We do
not recommend turning it on without legal sign-off.

## Click Analytic

If MXI subscribes to [Click Analytic](https://clickanalytic.com/), it can stand
in for some platform APIs (notably TikTok and IG audience demographics) since
it's already paying the OAuth dance for creators on its roster. Wire it up as
an additional provider in `src/lib/platforms/clickAnalytic.ts` and add it to
the `getProvider` chain ahead of the per-platform stub.
