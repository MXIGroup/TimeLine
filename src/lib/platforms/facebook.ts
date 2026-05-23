import type { PlatformProvider } from './index';

// Facebook Graph API — Page posts/videos insights
//   GET /{video-id}?fields=views,length,...
//   GET /{post-id}/insights?metric=post_impressions,post_reactions_by_type_total
// Requires a Page Access Token belonging to the Page that owns the post,
// plus pages_read_engagement / read_insights scopes.
//
// MVP status: STUB. Same OAuth machinery as Instagram (both via Meta Login);
// once a creator has linked their FB Page we can call this on their behalf.

export const facebookProvider: PlatformProvider = {
  isAvailable() {
    return false;
  },
  async fetchMetrics() {
    return null;
  },
};
