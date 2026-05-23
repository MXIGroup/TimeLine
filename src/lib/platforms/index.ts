import type { Platform, ProviderMetrics } from '@/types/db';
import { youtubeProvider } from './youtube';
import { tiktokProvider } from './tiktok';
import { instagramProvider } from './instagram';
import { twitterProvider } from './twitter';
import { facebookProvider } from './facebook';

export interface PlatformDetection {
  platform: Platform;
  external_post_id: string | null;
  normalised_url: string;
}

/** Detect platform and pull the post id from a pasted URL. */
export function detectPlatform(input: string): PlatformDetection {
  const url = safeUrl(input);
  if (!url) return { platform: 'other', external_post_id: null, normalised_url: input };

  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const path = url.pathname;

  // TikTok — /@user/video/<id>  or  vm.tiktok.com/<shortcode>
  if (host.endsWith('tiktok.com')) {
    const m = path.match(/\/video\/(\d+)/);
    if (m) return { platform: 'tiktok', external_post_id: m[1], normalised_url: url.toString() };
    const short = path.replace(/^\//, '').replace(/\/$/, '');
    return { platform: 'tiktok', external_post_id: short || null, normalised_url: url.toString() };
  }

  // Instagram — /reel/<code>, /p/<code>, /tv/<code>, /stories/<user>/<id>
  if (host.endsWith('instagram.com')) {
    const story = path.match(/\/stories\/[^/]+\/(\d+)/);
    if (story) return { platform: 'instagram_story', external_post_id: story[1], normalised_url: url.toString() };
    const m = path.match(/\/(reel|reels|p|tv)\/([^/]+)/);
    if (m) return { platform: 'instagram', external_post_id: m[2], normalised_url: url.toString() };
    return { platform: 'instagram', external_post_id: null, normalised_url: url.toString() };
  }

  // YouTube — youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/shorts/<id>
  if (host === 'youtu.be') {
    const id = path.replace(/^\//, '');
    return { platform: 'youtube', external_post_id: id || null, normalised_url: url.toString() };
  }
  if (host.endsWith('youtube.com')) {
    if (path.startsWith('/shorts/')) {
      return { platform: 'youtube_shorts', external_post_id: path.split('/')[2] || null, normalised_url: url.toString() };
    }
    const v = url.searchParams.get('v');
    return { platform: 'youtube', external_post_id: v, normalised_url: url.toString() };
  }

  // X / Twitter — /<user>/status/<id>
  if (host === 'x.com' || host.endsWith('twitter.com')) {
    const m = path.match(/\/status(?:es)?\/(\d+)/);
    return { platform: 'x', external_post_id: m?.[1] ?? null, normalised_url: url.toString() };
  }

  // Facebook — many URL shapes; capture the numeric id if present
  if (host.endsWith('facebook.com') || host === 'fb.watch') {
    const m = path.match(/\/(?:videos|posts|reel)\/(\d+)/) ?? path.match(/(\d{10,})/);
    return { platform: 'facebook', external_post_id: m?.[1] ?? null, normalised_url: url.toString() };
  }

  return { platform: 'other', external_post_id: null, normalised_url: url.toString() };
}

function safeUrl(s: string): URL | null {
  try {
    return new URL(s.trim());
  } catch {
    return null;
  }
}

export interface PlatformProvider {
  /** True if this provider can fetch metrics without manual input right now. */
  isAvailable(): boolean;
  /** Fetch latest metrics for a post. Throws on hard failure; returns null
   *  if the provider can't get this particular post (eg private). */
  fetchMetrics(args: {
    external_post_id: string;
    post_url: string;
    creator_handle?: string | null;
    creator_oauth_token?: string | null;
  }): Promise<ProviderMetrics | null>;
}

export function getProvider(platform: Platform): PlatformProvider | null {
  switch (platform) {
    case 'youtube':
    case 'youtube_shorts':
      return youtubeProvider;
    case 'tiktok':
      return tiktokProvider;
    case 'instagram':
    case 'instagram_story':
      return instagramProvider;
    case 'x':
      return twitterProvider;
    case 'facebook':
      return facebookProvider;
    default:
      return null;
  }
}
