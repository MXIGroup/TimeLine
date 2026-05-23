import type { PlatformProvider } from './index';

// TikTok metric pathways and which the MVP wires up:
//
//   1. TikTok Display API + Login Kit  (creator OAuth)
//      Per-video stats including views, likes, comments, shares.
//      Requires the creator to authorise our app with video.list scope.
//      MVP status: STUB. Wire up once creator-OAuth flow is built — see
//      docs/PLATFORMS.md for the OAuth implementation steps.
//
//   2. TikTok Research API
//      Public-video stats. Requires academic affiliation; not viable for MVP.
//
//   3. Public-page scrape (last resort)
//      Brittle and ToS-grey. Use ScraperAPI fallback in production only with
//      legal sign-off. MVP status: NOT WIRED.
//
// Until creator-OAuth is connected, the app routes TikTok refreshes to manual
// entry (paste view count from creator's screenshot).

export const tiktokProvider: PlatformProvider = {
  isAvailable() {
    return false;
  },
  async fetchMetrics() {
    return null;
  },
};
