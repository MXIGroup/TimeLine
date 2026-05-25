import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Bullhitters Darts Bonanza',
  description: 'Swipe-to-throw darts chaos with the Bullhitters. One more go.',
  applicationName: 'Bullhitters Darts Bonanza',
  appleWebApp: {
    capable: true,
    title: 'Bullhitters',
    statusBarStyle: 'black',
  },
  openGraph: {
    title: 'Bullhitters Darts Bonanza',
    description: 'Swipe-to-throw darts chaos with the Bullhitters. One more go.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bullhitters Darts Bonanza',
    description: 'Swipe-to-throw darts chaos with the Bullhitters. One more go.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0c0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bull-black text-bull-chalk antialiased select-none overscroll-none">
        {children}
      </body>
    </html>
  );
}
