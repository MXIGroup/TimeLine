import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MXI Campaign Tracker',
  description: 'Campaign tracking and client reporting for MXI Group.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              MXI <span className="text-mxi-accent">Campaign Tracker</span>
            </Link>
            <nav className="flex gap-6 text-sm text-gray-700">
              <Link href="/" className="hover:text-mxi-ink">Posts</Link>
              <Link href="/campaigns" className="hover:text-mxi-ink">Campaigns</Link>
              <Link href="/clients" className="hover:text-mxi-ink">Clients</Link>
              <Link href="/posts/new" className="hover:text-mxi-ink font-medium text-mxi-accent">+ New Post</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
