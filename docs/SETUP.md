# Setup

End-to-end checklist to take the repo from clone to "metrics syncing to a
Google Sheet". Order matters; you can stop at any step and the app will still
boot — features beyond that step degrade to manual entry.

## 1. Supabase project (required)

1. Create a project at https://supabase.com.
2. In **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY` (server-only)
3. In **SQL Editor**, run `supabase/migrations/00001_initial_schema.sql`.
4. (Optional) run `supabase/seed.sql` to load Zilch / BoyleSports / EA / Xbox /
   Hyperice / Opera / HelloFresh as clients.

## 2. Google SSO (recommended)

1. In Supabase **Authentication → Providers**, enable Google.
2. Create OAuth credentials in Google Cloud Console (`Web application`),
   add Supabase's callback URL as an authorised redirect URI.
3. Paste Client ID + Secret into Supabase.
4. Set `ALLOWED_EMAIL_DOMAIN=mxigroup.com` in `.env.local`; either:
   - Enforce in app code (block sign-ins from other domains in the layout), or
   - Use an [Auth Hook](https://supabase.com/docs/guides/auth/auth-hooks)
     to reject non-matching emails server-side.

## 3. Google Sheets + Drive (service account)

For pushing rows into the tracker Sheet and (roadmap) storing PDF reports.

1. In Google Cloud Console → **IAM & Admin → Service accounts**, create a
   service account. Generate a JSON key.
2. Enable **Google Sheets API** and **Google Drive API** for the project.
3. Open the tracker Google Sheet and **Share it** with the service account
   email (Editor access). Same for the Drive folder you'll store reports in.
4. Paste the entire JSON key into `GOOGLE_SERVICE_ACCOUNT_JSON` as a single
   line (escape newlines or use a tool like `jq -c .`).
5. Set `GOOGLE_SHEETS_TRACKER_ID` to the Sheet's id (the long string in the URL
   between `/d/` and `/edit`).
6. Set `GOOGLE_DRIVE_FOLDER_ID` to the folder id (same convention).

## 4. YouTube Data API (recommended, no creator action)

1. In Google Cloud Console → **APIs & Services → Library**, enable
   *YouTube Data API v3*.
2. Create an API key (Credentials → Create credentials → API key). Lock it
   down to YouTube Data API v3 only.
3. Set `YOUTUBE_API_KEY` in `.env.local`.

Quota: 10,000 units/day. `videos.list` is 1 unit/call. Plenty for MVP.

## 5. Cron secret

Generate a random string and set `CRON_SECRET`. Then in **Vercel** the
included `vercel.json` already configures a 15-minute cron hitting
`/api/refresh/cron`. Vercel passes the secret automatically when you
configure the env var.

If self-hosting, run any scheduler (GitHub Actions, cron-job.org, even
Supabase pg_cron with `net.http_post`) that calls:

```bash
curl -X POST https://your-app/api/refresh/cron \
  -H "Authorization: Bearer $CRON_SECRET"
```

## 6. Meta / Instagram (later)

Required for Reel / Story / Facebook metrics. See `docs/PLATFORMS.md` for the
creator onboarding flow. App-level setup:

1. Create a Meta Developer app (Business type).
2. Add Instagram + Facebook Login products.
3. Configure OAuth redirect: `https://your-app/api/oauth/meta/callback`
   (this route is roadmap; not yet implemented).
4. Set `META_APP_ID` + `META_APP_SECRET`.

## 7. TikTok (later)

1. Apply for TikTok for Developers Login Kit + Display API access. Approval
   takes 1–2 weeks.
2. Configure OAuth callback: `https://your-app/api/oauth/tiktok/callback`.
3. Set `TIKTOK_CLIENT_KEY` + `TIKTOK_CLIENT_SECRET`.

## 8. X / Twitter (later, optional)

1. Subscribe to X API v2 Basic tier ($200/mo) at developer.x.com.
2. Copy the Bearer Token → `X_BEARER_TOKEN`.

## Smoke test

1. `npm run dev`
2. Open `http://localhost:3000` (you should see the empty posts table)
3. Click **+ New Post**, paste a YouTube URL, fill in the form, save.
4. The detail page should immediately show view/like/comment counts pulled
   from the YouTube API, plus three pending refreshes at +24h / +48h / +7d.
5. Hit `POST /api/sheets/sync` with no body — your tracker Sheet's `All`
   tab should now have a row for the post.
