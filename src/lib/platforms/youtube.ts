import type { PlatformProvider } from './index';
import type { ProviderMetrics } from '@/types/db';

// YouTube Data API v3 — videos.list with part=statistics,contentDetails
// Quota cost: 1 unit per call. Default project quota is 10,000 units/day,
// so this can refresh thousands of videos a day without an increase request.
// Docs: https://developers.google.com/youtube/v3/docs/videos/list

const API = 'https://www.googleapis.com/youtube/v3/videos';

export const youtubeProvider: PlatformProvider = {
  isAvailable() {
    return Boolean(process.env.YOUTUBE_API_KEY);
  },

  async fetchMetrics({ external_post_id }): Promise<ProviderMetrics | null> {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) throw new Error('YOUTUBE_API_KEY missing');
    if (!external_post_id) return null;

    const url = new URL(API);
    url.searchParams.set('part', 'statistics,contentDetails,snippet');
    url.searchParams.set('id', external_post_id);
    url.searchParams.set('key', key);

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    const stats = item.statistics ?? {};
    return {
      source: 'api',
      external_post_id,
      views: numeric(stats.viewCount),
      likes: numeric(stats.likeCount),
      comments: numeric(stats.commentCount),
      // YouTube's public API does not expose watch time or unique reach —
      // those require YouTube Analytics API (creator OAuth). See roadmap.
      raw_payload: item,
    };
  },
};

function numeric(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
