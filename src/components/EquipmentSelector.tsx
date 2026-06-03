'use client';

import { OptionTile } from './OptionTile';
import { EQUIPMENT } from '@/data/options';
import { useAppState, actions } from '@/store/useAppStore';

/** Icon grid for choosing available kitchen equipment. */
export function EquipmentSelector() {
  const { preferences } = useAppState();
  const selected = preferences.equipment;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-lime-50 to-rossi-mint/40 p-5 text-center">
        <div className="text-5xl">🧑‍🍳</div>
        <p className="mt-2 text-sm font-semibold text-lime-700">
          Tap everything you’ve got — we’ll only plan meals you can actually cook.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {EQUIPMENT.map((e) => (
          <OptionTile
            key={e.value}
            label={e.value}
            emoji={e.emoji}
            color={e.color}
            selected={selected.includes(e.value)}
            onClick={() => actions.toggleEquipment(e.value)}
          />
        ))}
      </div>
    </div>
  );
}
