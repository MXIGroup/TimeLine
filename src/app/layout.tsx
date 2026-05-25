import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Bullhitters Darts Bonanza',
  description: 'Swipe-to-throw darts chaos with the Bullhitters. One more go.',
  applicationName: 'Bullhitters Darts Bonanza',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
