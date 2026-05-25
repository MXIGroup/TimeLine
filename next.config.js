/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_PAGES === 'true';
const basePath = isPages ? '/TimeLine' : '';

const nextConfig = {
  reactStrictMode: true,
  // Exposed to the client so <img> src paths can be prefixed (basePath does
  // not rewrite raw <img> URLs).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(isPages
    ? {
        output: 'export',
        basePath,
        images: { unoptimized: true },
      }
    : {}),
};

module.exports = nextConfig;
