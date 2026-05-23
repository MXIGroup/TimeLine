// Hand-written types mirroring supabase/migrations/00001_initial_schema.sql.
// Regenerate with `supabase gen types typescript` once you wire the CLI.

export type Platform =
  | 'tiktok'
  | 'instagram'
  | 'instagram_story'
  | 'youtube'
  | 'youtube_shorts'
  | 'x'
  | 'facebook'
  | 'other';

export type DeliverableType =
  | 'in_feed_video'
  | 'reel'
  | 'short'
  | 'long_form_video'
  | 'story'
  | 'static_post'
  | 'carousel'
  | 'tweet'
  | 'live'
  | 'watchalong'
  | 'match_preview'
  | 'social_clip'
  | 'other';

export type SnapshotSource =
  | 'api'
  | 'creator_oauth'
  | 'aggregator'
  | 'scrape'
  | 'manual';

export type PostStatus = 'live' | 'in_progress' | 'requested' | 'archived';

export type RefreshReason =
  | 't_plus_24h'
  | 't_plus_48h'
  | 't_plus_7d'
  | 'manual'
  | 'custom_schedule'
  | 'campaign_wrap';

export interface Client {
  id: string;
  name: string;
  slug: string;
  template_key: string;
  default_currency: string;
  reporting_cadence: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Creator {
  id: string;
  name: string;
  email: string | null;
  agent_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatorPlatformAccount {
  id: string;
  creator_id: string;
  platform: Platform;
  handle: string;
  external_id: string | null;
  follower_count: number | null;
  follower_count_at: string | null;
  oauth_access_token: string | null;
  oauth_refresh_token: string | null;
  oauth_expires_at: string | null;
  oauth_scopes: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  client_id: string;
  name: string;
  starts_on: string | null;
  ends_on: string | null;
  brief_url: string | null;
  benchmark_config: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  campaign_id: string;
  creator_id: string;
  platform: Platform;
  deliverable: DeliverableType;
  post_url: string;
  external_post_id: string | null;
  posted_at: string;
  status: PostStatus;
  tracking_link_used: boolean | null;
  tracking_link_url: string | null;
  screenshot_uploaded: boolean;
  follower_count_at_post: number | null;
  latest_views: number | null;
  latest_impressions: number | null;
  latest_reach: number | null;
  latest_likes: number | null;
  latest_comments: number | null;
  latest_shares: number | null;
  latest_saves: number | null;
  latest_watch_time_s: number | null;
  latest_avg_view_duration_s: number | null;
  latest_engagement_rate: number | null;
  latest_snapshot_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostMetricSnapshot {
  id: string;
  post_id: string;
  captured_at: string;
  source: SnapshotSource;
  refresh_reason: RefreshReason;
  views: number | null;
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  watch_time_s: number | null;
  avg_view_duration_s: number | null;
  follower_count: number | null;
  engagement_rate: number | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

/** Platform-agnostic shape every provider returns. */
export interface ProviderMetrics {
  source: SnapshotSource;
  external_post_id?: string;
  views?: number;
  impressions?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  watch_time_s?: number;
  avg_view_duration_s?: number;
  follower_count?: number;
  raw_payload?: Record<string, unknown>;
}
