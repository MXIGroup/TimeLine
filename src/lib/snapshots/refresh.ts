import { supabaseAdmin } from '@/lib/supabase';
import { getProvider } from '@/lib/platforms';
import type {
  Post,
  ProviderMetrics,
  RefreshReason,
  SnapshotSource,
} from '@/types/db';

interface RefreshResult {
  post_id: string;
  status: 'ok' | 'skipped_manual' | 'error';
  snapshot_id?: string;
  reason?: string;
  source?: SnapshotSource;
}

/** Refresh one post. Pulls metrics from the platform provider, writes a
 *  snapshot row, updates the denormalised latest_* columns on posts, and
 *  recomputes engagement rate. */
export async function refreshPost(
  post: Post,
  refresh_reason: RefreshReason,
  override?: ProviderMetrics, // manual entry path
): Promise<RefreshResult> {
  const db = supabaseAdmin();

  let metrics: ProviderMetrics | null = override ?? null;
  if (!metrics) {
    const provider = getProvider(post.platform);
    if (!provider || !provider.isAvailable()) {
      return { post_id: post.id, status: 'skipped_manual', reason: 'no_api_available' };
    }
    metrics = await provider.fetchMetrics({
      external_post_id: post.external_post_id ?? '',
      post_url: post.post_url,
    });
    if (!metrics) {
      return { post_id: post.id, status: 'skipped_manual', reason: 'provider_returned_null' };
    }
  }

  const followers = metrics.follower_count ?? post.follower_count_at_post ?? null;
  const engagement_rate = computeEngagementRate({
    likes: metrics.likes,
    comments: metrics.comments,
    followers,
  });

  const { data: snapshot, error: snapErr } = await db
    .from('post_metric_snapshots')
    .insert({
      post_id: post.id,
      source: metrics.source,
      refresh_reason,
      views: metrics.views ?? null,
      impressions: metrics.impressions ?? null,
      reach: metrics.reach ?? null,
      likes: metrics.likes ?? null,
      comments: metrics.comments ?? null,
      shares: metrics.shares ?? null,
      saves: metrics.saves ?? null,
      watch_time_s: metrics.watch_time_s ?? null,
      avg_view_duration_s: metrics.avg_view_duration_s ?? null,
      follower_count: followers,
      engagement_rate,
      raw_payload: metrics.raw_payload ?? null,
    })
    .select('id, captured_at')
    .single();

  if (snapErr || !snapshot) {
    return { post_id: post.id, status: 'error', reason: snapErr?.message ?? 'insert_failed' };
  }

  await db
    .from('posts')
    .update({
      latest_views: metrics.views ?? post.latest_views,
      latest_impressions: metrics.impressions ?? post.latest_impressions,
      latest_reach: metrics.reach ?? post.latest_reach,
      latest_likes: metrics.likes ?? post.latest_likes,
      latest_comments: metrics.comments ?? post.latest_comments,
      latest_shares: metrics.shares ?? post.latest_shares,
      latest_saves: metrics.saves ?? post.latest_saves,
      latest_watch_time_s: metrics.watch_time_s ?? post.latest_watch_time_s,
      latest_avg_view_duration_s: metrics.avg_view_duration_s ?? post.latest_avg_view_duration_s,
      latest_engagement_rate: engagement_rate ?? post.latest_engagement_rate,
      latest_snapshot_at: snapshot.captured_at,
      follower_count_at_post: post.follower_count_at_post ?? followers,
    })
    .eq('id', post.id);

  return {
    post_id: post.id,
    status: 'ok',
    snapshot_id: snapshot.id,
    source: metrics.source,
  };
}

/** Engagement rate per the brief: (likes + comments) / followers * 100.
 *  Returns null if any input is missing — we won't show a fake 0%. */
export function computeEngagementRate(args: {
  likes?: number | null;
  comments?: number | null;
  followers?: number | null;
}): number | null {
  const { likes, comments, followers } = args;
  if (likes == null || comments == null || !followers || followers <= 0) return null;
  return Number((((likes + comments) / followers) * 100).toFixed(3));
}

/** Schedule a one-off refresh at a custom time. Used by /api/posts/[id]/schedule. */
export async function scheduleCustomRefresh(post_id: string, scheduled_for: Date) {
  const db = supabaseAdmin();
  const { error } = await db.from('post_refresh_schedule').insert({
    post_id,
    scheduled_for: scheduled_for.toISOString(),
    reason: 'custom_schedule',
  });
  if (error) throw error;
}

/** Runs all due refreshes — called by the cron endpoint. */
export async function runDueRefreshes(limit = 50) {
  const db = supabaseAdmin();
  const { data: due } = await db
    .from('post_refresh_schedule')
    .select('id, post_id, reason, posts(*)')
    .is('completed_at', null)
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(limit);

  if (!due?.length) return { processed: 0, results: [] as RefreshResult[] };

  const results: RefreshResult[] = [];
  for (const row of due) {
    const post = (row as { posts: Post | Post[] }).posts;
    const postRow = Array.isArray(post) ? post[0] : post;
    if (!postRow) continue;
    try {
      const r = await refreshPost(postRow, row.reason as RefreshReason);
      results.push(r);
      await db
        .from('post_refresh_schedule')
        .update({
          completed_at: new Date().toISOString(),
          snapshot_id: r.snapshot_id ?? null,
          error: r.status === 'error' ? r.reason : null,
        })
        .eq('id', row.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ post_id: postRow.id, status: 'error', reason: message });
      await db
        .from('post_refresh_schedule')
        .update({
          attempts: 1,
          error: message,
        })
        .eq('id', row.id);
    }
  }
  return { processed: results.length, results };
}
