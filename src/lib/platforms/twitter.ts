import type { PlatformProvider } from './index';
import type { ProviderMetrics } from '@/types/db';

// X / Twitter API v2 — GET /2/tweets?ids=<id>&tweet.fields=public_metrics
// Returns: retweet_count, reply_count, like_count, quote_count, bookmark_count,
//          impression_count (if the requesting account owns the tweet OR has
//          a paid tier that includes it).
//
// Tier reality:
//   Free  — read access is essentially gone for app-level metric pulls
//   Basic — $200/mo, ~15k tweet lookups / month
//   Pro   — $5,000/mo, much higher caps + filtered stream
//
// Until X_BEARER_TOKEN is set the provider opts out and refreshes go manual.

const API = 'https://api.twitter.com/2/tweets';

export const twitterProvider: PlatformProvider = {
  isAvailable() {
    return Boolean(process.env.X_BEARER_TOKEN);
  },

  async fetchMetrics({ external_post_id }): Promise<ProviderMetrics | null> {
    const token = process.env.X_BEARER_TOKEN;
    if (!token || !external_post_id) return null;

    const url = new URL(API);
    url.searchParams.set('ids', external_post_id);
    url.searchParams.set('tweet.fields', 'public_metrics,non_public_metrics,organic_metrics');

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      // 401/403 if metrics aren't accessible; treat as "can't fetch" not fatal
      if (res.status === 401 || res.status === 403) return null;
      throw new Error(`X API ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const t = data.data?.[0];
    if (!t) return null;
    const pm = t.public_metrics ?? {};
    const om = t.organic_metrics ?? {};
    return {
      source: 'api',
      external_post_id,
      views: om.impression_count ?? pm.impression_count,
      likes: pm.like_count,
      comments: pm.reply_count,
      shares: (pm.retweet_count ?? 0) + (pm.quote_count ?? 0),
      saves: pm.bookmark_count,
      raw_payload: t,
    };
  },
};
