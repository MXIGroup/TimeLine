-- ============================================================================
-- MXI Campaign Tracking & Reporting — initial schema
-- ============================================================================
-- Conventions:
--   * Every table has id (uuid pk), created_at, updated_at.
--   * Money/rates stored as numeric(12,4); percentages as numeric(6,3).
--   * Metric values stored as bigint (views can exceed int32).
--   * One metric snapshot per (post, captured_at). The post row carries the
--     LATEST snapshot's values denormalised for fast list queries; full
--     history lives in post_metric_snapshots.
--   * Demographics + screenshots are separate tables, optional per post.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Enums ──────────────────────────────────────────────────────────────────
create type platform as enum (
  'tiktok',
  'instagram',          -- covers reels / posts / carousels
  'instagram_story',
  'youtube',
  'youtube_shorts',
  'x',                  -- twitter
  'facebook',
  'other'
);

create type deliverable_type as enum (
  'in_feed_video',
  'reel',
  'short',
  'long_form_video',
  'story',
  'static_post',
  'carousel',
  'tweet',
  'live',
  'watchalong',
  'match_preview',
  'social_clip',
  'other'
);

create type snapshot_source as enum (
  'api',                -- official platform API
  'creator_oauth',      -- creator-authorised API (eg Instagram Graph API)
  'aggregator',         -- third-party like Click Analytic
  'scrape',             -- ToS-permitting public scrape
  'manual'              -- typed in by an account manager
);

create type post_status as enum (
  'live',               -- 🟢 Live
  'in_progress',        -- 🟡 In Progress
  'requested',          -- ⏳ Requested
  'archived'
);

create type refresh_reason as enum (
  't_plus_24h',
  't_plus_48h',
  't_plus_7d',
  'manual',
  'custom_schedule',
  'campaign_wrap'
);

-- ─── Updated-at trigger helper ──────────────────────────────────────────────
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Clients ────────────────────────────────────────────────────────────────
create table clients (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null unique,
  slug                text not null unique,          -- 'zilch','boylesports','ea','xbox','hyperice','opera','hellofresh'
  template_key        text not null default 'general', -- maps to src/lib/clients/templates
  default_currency    text not null default 'GBP',
  reporting_cadence   text,                           -- 'weekly','biweekly','post_campaign'
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger trg_clients_updated before update on clients
  for each row execute function set_updated_at();

-- ─── Rate cards (per client; editable, used for CPM/CPV calcs) ──────────────
create table client_rate_cards (
  id                  uuid primary key default uuid_generate_v4(),
  client_id           uuid not null references clients(id) on delete cascade,
  deliverable         deliverable_type not null,
  platform            platform,                       -- null = any platform
  rate                numeric(12,4) not null,         -- per-deliverable fee
  currency            text not null default 'GBP',
  effective_from      date not null default current_date,
  effective_to        date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (client_id, deliverable, platform, effective_from)
);
create trigger trg_rate_cards_updated before update on client_rate_cards
  for each row execute function set_updated_at();

-- ─── Creators ───────────────────────────────────────────────────────────────
create table creators (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  email               text,
  agent_name          text,                           -- internal MXI manager
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (name)
);
create trigger trg_creators_updated before update on creators
  for each row execute function set_updated_at();

-- ─── Creator platform accounts (one row per creator × platform) ─────────────
-- Stores both the public handle (for display) and, if the creator has
-- authorised us, an OAuth token to pull authenticated insights.
create table creator_platform_accounts (
  id                  uuid primary key default uuid_generate_v4(),
  creator_id          uuid not null references creators(id) on delete cascade,
  platform            platform not null,
  handle              text not null,                  -- '@user' without the @
  external_id         text,                           -- platform's internal id
  follower_count      bigint,                         -- last-known; refresh job updates
  follower_count_at   timestamptz,
  -- OAuth (encrypted at rest by Supabase Vault; see docs/SETUP.md)
  oauth_access_token  text,
  oauth_refresh_token text,
  oauth_expires_at    timestamptz,
  oauth_scopes        text[],
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (platform, handle)
);
create trigger trg_cpa_updated before update on creator_platform_accounts
  for each row execute function set_updated_at();

-- ─── Campaigns ──────────────────────────────────────────────────────────────
create table campaigns (
  id                  uuid primary key default uuid_generate_v4(),
  client_id           uuid not null references clients(id) on delete restrict,
  name                text not null,
  starts_on           date,
  ends_on             date,
  brief_url           text,
  exclusivity_window  daterange,                      -- for brand-exclusivity checks
  benchmark_config    jsonb default '{}'::jsonb,      -- per-deliverable view targets
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (client_id, name)
);
create trigger trg_campaigns_updated before update on campaigns
  for each row execute function set_updated_at();
create index on campaigns(client_id);

-- ─── Posts ──────────────────────────────────────────────────────────────────
create table posts (
  id                  uuid primary key default uuid_generate_v4(),
  campaign_id         uuid not null references campaigns(id) on delete cascade,
  creator_id          uuid not null references creators(id) on delete restrict,
  platform            platform not null,
  deliverable         deliverable_type not null,
  post_url            text not null,
  external_post_id    text,                           -- platform's id, parsed from URL
  posted_at           timestamptz not null,           -- when the creator posted it
  status              post_status not null default 'requested',
  tracking_link_used  boolean,                        -- yes/no compliance flag
  tracking_link_url   text,                           -- UTM/affiliate/btag URL itself
  screenshot_uploaded boolean not null default false, -- mirrors evidence_files count
  follower_count_at_post bigint,                      -- snapshotted at first refresh

  -- Latest snapshot values, denormalised for fast list queries. Updated by
  -- the refresh job whenever a new snapshot is written.
  latest_views        bigint,
  latest_impressions  bigint,
  latest_reach        bigint,
  latest_likes        bigint,
  latest_comments     bigint,
  latest_shares       bigint,
  latest_saves        bigint,
  latest_watch_time_s bigint,
  latest_avg_view_duration_s numeric(10,2),
  latest_engagement_rate numeric(6,3),                -- (likes+comments)/followers*100
  latest_snapshot_at  timestamptz,

  notes               text,
  created_by          uuid,                           -- auth.users.id
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (platform, external_post_id),
  unique (post_url)
);
create trigger trg_posts_updated before update on posts
  for each row execute function set_updated_at();
create index on posts(campaign_id);
create index on posts(creator_id);
create index on posts(platform);
create index on posts(posted_at desc);
create index on posts(status);

-- ─── Metric snapshots (time-series; immutable rows) ─────────────────────────
create table post_metric_snapshots (
  id                  uuid primary key default uuid_generate_v4(),
  post_id             uuid not null references posts(id) on delete cascade,
  captured_at         timestamptz not null default now(),
  source              snapshot_source not null,
  refresh_reason      refresh_reason not null,

  views               bigint,
  impressions         bigint,
  reach               bigint,
  likes               bigint,
  comments            bigint,
  shares              bigint,
  saves               bigint,
  watch_time_s        bigint,
  avg_view_duration_s numeric(10,2),
  follower_count      bigint,
  engagement_rate     numeric(6,3),

  -- Anything platform-specific that doesn't fit the columns above
  raw_payload         jsonb,

  created_at          timestamptz not null default now(),
  unique (post_id, captured_at)
);
create index on post_metric_snapshots(post_id, captured_at desc);
create index on post_metric_snapshots(captured_at);

-- ─── Audience demographics (sparse; only when API/creator-auth gives it) ────
create table post_audience_demographics (
  id                  uuid primary key default uuid_generate_v4(),
  post_id             uuid not null references posts(id) on delete cascade,
  captured_at         timestamptz not null default now(),
  source              snapshot_source not null,
  -- Each is a jsonb map; eg gender = {"female": 62.1, "male": 37.5, "other": 0.4}
  gender              jsonb,                          -- pct breakdown
  age_brackets        jsonb,                          -- {"13-17": 4.2, "18-24": 38.1, ...}
  top_countries       jsonb,                          -- [{"code":"GB","pct":58.2}, ...]
  top_cities          jsonb,                          -- [{"name":"London","pct":12.4}, ...]
  raw_payload         jsonb,
  created_at          timestamptz not null default now()
);
create index on post_audience_demographics(post_id, captured_at desc);

-- ─── Evidence files (screenshots; PDF reports also live here) ───────────────
create type evidence_kind as enum (
  'screenshot_insights',   -- creator's analytics screen
  'screenshot_post',       -- the post itself
  'pdf_report',
  'other'
);

create table evidence_files (
  id                  uuid primary key default uuid_generate_v4(),
  post_id             uuid references posts(id) on delete cascade,
  campaign_id         uuid references campaigns(id) on delete cascade,
  kind                evidence_kind not null,
  storage_path        text not null,                  -- Supabase Storage path
  drive_file_id       text,                           -- Google Drive id if mirrored
  uploaded_by         uuid,                           -- auth.users.id
  notes               text,
  created_at          timestamptz not null default now(),
  -- Either post_id or campaign_id must be set
  check (post_id is not null or campaign_id is not null)
);
create index on evidence_files(post_id);
create index on evidence_files(campaign_id);

-- Keep posts.screenshot_uploaded in sync with evidence_files presence
create or replace function sync_post_screenshot_flag() returns trigger
language plpgsql as $$
declare
  pid uuid;
begin
  pid := coalesce(new.post_id, old.post_id);
  if pid is null then return coalesce(new, old); end if;
  update posts set screenshot_uploaded = exists (
    select 1 from evidence_files
    where post_id = pid and kind in ('screenshot_insights', 'screenshot_post')
  )
  where id = pid;
  return coalesce(new, old);
end;
$$;
create trigger trg_evidence_sync_post
  after insert or update or delete on evidence_files
  for each row execute function sync_post_screenshot_flag();

-- ─── Refresh schedule (which posts need refreshing when) ────────────────────
-- One row per planned refresh per post. The cron worker picks up rows where
-- scheduled_for <= now() and completed_at is null, runs the refresh, then
-- stamps completed_at.
create table post_refresh_schedule (
  id                  uuid primary key default uuid_generate_v4(),
  post_id             uuid not null references posts(id) on delete cascade,
  scheduled_for       timestamptz not null,
  reason              refresh_reason not null,
  completed_at        timestamptz,
  snapshot_id         uuid references post_metric_snapshots(id),
  error               text,
  attempts            int not null default 0,
  created_at          timestamptz not null default now()
);
create index on post_refresh_schedule(scheduled_for) where completed_at is null;
create index on post_refresh_schedule(post_id);

-- When a post is created, seed the standard 24h / 48h / 7d refreshes.
create or replace function seed_post_refresh_schedule() returns trigger
language plpgsql as $$
begin
  insert into post_refresh_schedule (post_id, scheduled_for, reason) values
    (new.id, new.posted_at + interval '24 hours', 't_plus_24h'),
    (new.id, new.posted_at + interval '48 hours', 't_plus_48h'),
    (new.id, new.posted_at + interval '7 days',   't_plus_7d');
  return new;
end;
$$;
create trigger trg_posts_seed_refresh
  after insert on posts
  for each row execute function seed_post_refresh_schedule();

-- ─── Google Sheet sync log ──────────────────────────────────────────────────
create table sheet_sync_log (
  id                  uuid primary key default uuid_generate_v4(),
  sheet_id            text not null,
  sheet_tab           text not null,
  client_id           uuid references clients(id) on delete set null,
  campaign_id         uuid references campaigns(id) on delete set null,
  rows_written        int,
  status              text not null,                  -- 'ok' | 'error'
  error               text,
  started_at          timestamptz not null default now(),
  finished_at         timestamptz
);

-- ─── Row-Level Security (RLS) ───────────────────────────────────────────────
-- For MVP every signed-in user from the allowed domain can read/write
-- everything; the app enforces the team boundary at the auth layer. Tighten
-- later if MXI wants per-client manager scoping.
alter table clients                     enable row level security;
alter table client_rate_cards           enable row level security;
alter table creators                    enable row level security;
alter table creator_platform_accounts   enable row level security;
alter table campaigns                   enable row level security;
alter table posts                       enable row level security;
alter table post_metric_snapshots       enable row level security;
alter table post_audience_demographics  enable row level security;
alter table evidence_files              enable row level security;
alter table post_refresh_schedule       enable row level security;
alter table sheet_sync_log              enable row level security;

create policy "signed-in read" on clients                    for select using (auth.uid() is not null);
create policy "signed-in write" on clients                   for all    using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "signed-in read" on client_rate_cards          for select using (auth.uid() is not null);
create policy "signed-in write" on client_rate_cards         for all    using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "signed-in read" on creators                   for select using (auth.uid() is not null);
create policy "signed-in write" on creators                  for all    using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "signed-in read" on creator_platform_accounts  for select using (auth.uid() is not null);
create policy "signed-in write" on creator_platform_accounts for all    using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "signed-in read" on campaigns                  for select using (auth.uid() is not null);
create policy "signed-in write" on campaigns                 for all    using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "signed-in read" on posts                      for select using (auth.uid() is not null);
create policy "signed-in write" on posts                     for all    using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "signed-in read" on post_metric_snapshots      for select using (auth.uid() is not null);
create policy "signed-in write" on post_metric_snapshots     for all    using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "signed-in read" on post_audience_demographics for select using (auth.uid() is not null);
create policy "signed-in write" on post_audience_demographics for all   using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "signed-in read" on evidence_files             for select using (auth.uid() is not null);
create policy "signed-in write" on evidence_files            for all    using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "signed-in read" on post_refresh_schedule      for select using (auth.uid() is not null);
create policy "signed-in write" on post_refresh_schedule     for all    using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "signed-in read" on sheet_sync_log             for select using (auth.uid() is not null);
create policy "signed-in write" on sheet_sync_log            for all    using (auth.uid() is not null) with check (auth.uid() is not null);

-- ─── Helpful views ──────────────────────────────────────────────────────────
-- Latest snapshot per post, joined for the Sheets sync / list views.
create or replace view v_posts_for_sheet as
select
  cl.name                                           as client,
  ca.name                                           as campaign,
  cr.name                                           as creator,
  p.id                                              as post_id,
  row_number() over (partition by ca.id order by p.posted_at) as post_number,
  p.posted_at                                       as post_date,
  p.platform                                        as platform,
  p.deliverable                                     as deliverable_type,
  p.post_url                                        as post_url,
  p.latest_views                                    as views,
  p.latest_watch_time_s                             as watch_time_s,
  p.latest_likes                                    as likes,
  p.latest_saves                                    as saves,
  p.latest_comments                                 as comments,
  p.latest_shares                                   as shares,
  p.latest_engagement_rate                          as engagement_rate,
  p.tracking_link_used                              as tracking_link_used,
  p.screenshot_uploaded                             as screenshot_uploaded,
  p.latest_snapshot_at                              as snapshot_date,
  p.status                                          as status,
  -- Demographics: most recent row
  (select gender         from post_audience_demographics d where d.post_id = p.id order by captured_at desc limit 1) as audience_gender,
  (select age_brackets   from post_audience_demographics d where d.post_id = p.id order by captured_at desc limit 1) as audience_age,
  (select top_countries  from post_audience_demographics d where d.post_id = p.id order by captured_at desc limit 1) as audience_location
from posts p
join campaigns ca on ca.id = p.campaign_id
join clients   cl on cl.id = ca.client_id
join creators  cr on cr.id = p.creator_id;
