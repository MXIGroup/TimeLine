'use client';

import { MIN_BUDGET, MAX_BUDGET } from '@/data/options';
import { gbpShort } from '@/lib/format';

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
}

/** Large budget slider with a headline "£X this week" display. */
export function BudgetSlider({ value, onChange }: BudgetSliderProps) {
  const pct = ((value - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-center">
        <div className="text-6xl font-extrabold text-rossi-ink">{gbpShort(value)}</div>
        <div className="mt-1 text-base font-semibold text-gray-400">this week</div>
      </div>

      <div className="mt-8 w-full">
        <input
          type="range"
          className="rossi-slider w-full"
          min={MIN_BUDGET}
          max={MAX_BUDGET}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #84cc16 ${pct}%, #e5e7eb ${pct}%)`,
          }}
          aria-label="Weekly dinner budget"
        />
        <div className="mt-3 flex justify-between text-sm font-semibold text-gray-400">
          <span>{gbpShort(MIN_BUDGET)}</span>
          <span>{gbpShort(MAX_BUDGET)}</span>
        </div>
      </div>

      <p className="mt-8 rounded-2xl bg-lime-50 px-4 py-3 text-center text-sm font-semibold text-lime-700">
        That’s about {gbpShort(value / 5)} per dinner across 5 nights.
      </p>
    </div>
  );
}
