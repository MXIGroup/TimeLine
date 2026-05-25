'use client';

import { useState } from 'react';
import { isMuted, setMuted } from '../lib/sound';

export function MuteButton() {
  const [muted, setMutedState] = useState(isMuted());
  return (
    <button
      aria-label={muted ? 'Unmute' : 'Mute'}
      onClick={() => {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
      }}
      className="pill bg-bull-panel text-bull-chalk"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
