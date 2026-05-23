import type { PlatformProvider } from './index';

// Instagram metric pathways:
//
//   1. Instagram Graph API  (creator OAuth, professional accounts only)
//      Endpoint:  GET /{ig-media-id}/insights
//      Reel metrics: plays, reach, likes, comments, shares, saves, total_interactions
//      Story metrics: reach, impressions, replies, exits, taps_forward/back
//      Requires:
//        - The creator's IG account is Business or Creator (not Personal)
//        - It is linked to a Facebook Page
//        - The creator signs in via Facebook Login with scopes:
//            instagram_basic, instagram_manage_insights,
//            pages_show_list, pages_read_engagement
//      Tokens stored in creator_platform_accounts.oauth_*
//
//      MVP status: STUB. Build the OAuth callback at /api/oauth/meta/callback
//      and wire creator_oauth_token through to here.
//
//   2. oEmbed / public scrape
//      Public IG pages no longer expose reliable counts. Don't rely on it.
//
// Until creator-OAuth is connected, IG refreshes route to manual entry.

export const instagramProvider: PlatformProvider = {
  isAvailable() {
    return false;
  },
  async fetchMetrics() {
    return null;
  },
};
