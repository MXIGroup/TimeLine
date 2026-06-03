import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Rossi Food — Your week. Deliciously sorted.',
  description:
    'Rossi Food plans your weekly dinners around your supermarket, budget, tastes and kitchen. UK weekly dinner planning without the faff.',
};

export const viewport: Viewport = {
  themeColor: '#84cc16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="font-sans">{children}</body>
    </html>
  );
}
