'use client';

import { useState } from 'react';

/**
 * Shows the official Bullhitters logo from /public if present, otherwise falls
 * back to a styled text wordmark. Drop the artwork at
 * `public/bullhitters-logo.png` and it appears automatically.
 */
export function Logo({ className = '' }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/bullhitters-logo.png"
        alt="Bullhitters Darts Bonanza"
        onError={() => setFailed(true)}
        className={`mx-auto h-auto w-[80%] max-w-[320px] drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] ${className}`}
      />
    );
  }

  return (
    <div className={className}>
      <div className="text-6xl">🎯</div>
      <h1 className="heading mt-2 text-4xl leading-none text-shadow-hard">
        <span className="text-bull-green">BULLHITTERS</span>
        <br />
        <span className="text-bull-red">DARTS</span> <span className="text-bull-chalk">BONANZA</span>
      </h1>
    </div>
  );
}
