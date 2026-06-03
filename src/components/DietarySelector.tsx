'use client';

import { OptionTile } from './OptionTile';
import { DIETARY } from '@/data/options';
import { useAppState, actions } from '@/store/useAppStore';

/** Multi-select dietary needs with "None" mutually exclusive logic. */
export function DietarySelector() {
  const { preferences } = useAppState();
  const selected = preferences.dietary;

  return (
    <div className="grid grid-cols-2 gap-3">
      {DIETARY.map((d) => (
        <OptionTile
          key={d.value}
          label={d.value}
          emoji={d.emoji}
          color={d.color}
          selected={selected.includes(d.value)}
          onClick={() => actions.toggleDietary(d.value)}
        />
      ))}
    </div>
  );
}
