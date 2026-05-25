import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bullhitters Darts Bonanza',
    short_name: 'Bullhitters',
    description: 'Swipe-to-throw darts chaos with the Bullhitters. One more go.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0c0a',
    theme_color: '#0a0c0a',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
