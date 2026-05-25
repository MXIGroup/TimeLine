/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  ...(isPages
    ? {
        output: 'export',
        basePath: '/TimeLine',
        images: { unoptimized: true },
      }
    : {}),
};

module.exports = nextConfig;
