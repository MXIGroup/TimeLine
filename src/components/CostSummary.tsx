'use client';

import { gbp } from '@/lib/format';

interface CostSummaryProps {
  totalCost: number;
  budget: number;
}

/** Estimated cost card with a budget-usage progress bar. */
export function CostSummary({ totalCost, budget }: CostSummaryProps) {
  const pct = Math.min(100, (totalCost / budget) * 100);
  const over = totalCost > budget;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-400">Est. cost</div>
          <div className="text-3xl font-extrabold text-rossi-ink">
            {gbp(totalCost)}{' '}
            <span className="text-lg font-bold text-gray-300">/ {gbp(budget)}</span>
          </div>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-extrabold ${
            over ? 'bg-rossi-orange text-orange-900' : 'bg-lime-100 text-lime-700'
          }`}
        >
          {over ? 'Over budget' : `${Math.round(budget - totalCost)} to spare`}
        </div>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            over ? 'bg-rossi-orange' : 'bg-lime-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
