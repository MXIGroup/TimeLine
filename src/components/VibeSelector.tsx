'use client';

import { OptionTile } from './OptionTile';
import { VIBES, MAX_VIBES } from '@/data/options';
import { useAppState, actions } from '@/store/useAppStore';

/** Lets the user pick up to MAX_VIBES meal vibes. */
export function VibeSelector() {
  const { preferences } = useAppState();
  const selected = preferences.vibes;
  const atLimit = selected.length >= MAX_VIBES;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {VIBES.map((v) => (
          <OptionTile
            key={v.value}
            label={v.value}
            emoji={v.emoji}
            color={v.color}
            selected={selected.includes(v.value)}
            disabled={atLimit}
            onClick={() => actions.toggleVibe(v.value)}
          />
        ))}
      </div>
      <p className="text-center text-sm font-semibold text-gray-400">
        {selected.length}/{MAX_VIBES} selected
      </p>
    </div>
  );
}
