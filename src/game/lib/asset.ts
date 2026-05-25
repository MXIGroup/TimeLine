/**
 * Prefixes root-relative public asset paths (e.g. "/characters/ollie.jpg") with
 * the deploy base path. Needed because Next's basePath does NOT rewrite plain
 * <img src="/..."> URLs, so on GitHub Pages (served under /TimeLine) those would
 * 404. NEXT_PUBLIC_BASE_PATH is set from the GITHUB_PAGES flag in next.config.js
 * ("" locally / on Vercel, "/TimeLine" for the Pages build).
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string): string {
  if (!path) return path;
  return path.startsWith('/') ? `${BASE_PATH}${path}` : path;
}
