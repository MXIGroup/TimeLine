'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  /** Sticky CTA content rendered at the bottom of the frame. */
  footer?: ReactNode;
  /** Show the back chevron in the header. */
  showBack?: boolean;
  /** Optional element rendered just below the header (e.g. ProgressBar). */
  topSlot?: ReactNode;
  /** Hide the logo header entirely (e.g. immersive landing). */
  hideHeader?: boolean;
}

/**
 * The mobile-first app frame: a max-430px white "phone" centred on a soft grey
 * background on larger screens. Everything in Rossi Food lives inside this.
 */
export function AppShell({ children, footer, showBack, topSlot, hideHeader }: AppShellProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-rossi-bg flex justify-center">
      <div className="relative flex min-h-screen w-full max-w-app flex-col bg-white shadow-xl sm:my-0">
        {!hideHeader && (
          <header className="sticky top-0 z-20 flex items-center gap-2 bg-white/90 px-5 py-4 backdrop-blur">
            {showBack ? (
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-rossi-ink transition hover:bg-gray-100"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            ) : (
              <span className="w-1" />
            )}
            <Link href="/" className="flex items-center gap-1.5 font-extrabold tracking-tight">
              <span className="text-xl">🥗</span>
              <span className="text-lg text-rossi-ink">
                Rossi<span className="text-lime-500"> Food</span>
              </span>
            </Link>
          </header>
        )}

        {topSlot}

        <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">{children}</main>

        {footer && <div className="cta-bar">{footer}</div>}
      </div>
    </div>
  );
}
