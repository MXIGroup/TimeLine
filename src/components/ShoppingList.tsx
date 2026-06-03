'use client';

import { useState } from 'react';
import type { MealPlan } from '@/types';
import { groupByCategory, shoppingListToText, CATEGORY_EMOJI } from '@/lib/shoppingList';
import { useAppState, actions } from '@/store/useAppStore';
import { PrimaryButton } from './PrimaryButton';

/** The full shopping list view with tickable items and a share button. */
export function ShoppingList({ plan }: { plan: MealPlan }) {
  const { checked } = useAppState();
  const [shareNote, setShareNote] = useState<string | null>(null);

  const groups = groupByCategory(plan.shoppingList);
  const total = plan.shoppingList.length;
  const doneCount = plan.shoppingList.filter((i) => checked[i.id]).length;

  async function handleShare() {
    const text = shoppingListToText(plan.shoppingList, plan.shop);
    // Prefer the native share sheet on mobile; fall back to clipboard.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Rossi Food shopping list', text });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareNote('Copied to clipboard ✓');
    } catch {
      setShareNote('Couldn’t share automatically — select and copy manually.');
    }
    setTimeout(() => setShareNote(null), 2500);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-rossi-mint px-3 py-1 text-xs font-extrabold text-emerald-900">
          For {plan.shop}
        </span>
        <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-extrabold text-lime-700">
          {doneCount} / {total} done
        </span>
      </div>

      {groups.map(({ category, items }) => (
        <section key={category}>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-gray-400">
            <span>{CATEGORY_EMOJI[category]}</span>
            {category}
          </h2>
          <ul className="overflow-hidden rounded-2xl border border-gray-100">
            {items.map((item) => {
              const isChecked = !!checked[item.id];
              return (
                <li key={item.id} className="border-b border-gray-50 last:border-0">
                  <button
                    onClick={() => actions.toggleChecked(item.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      isChecked ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                        isChecked
                          ? 'border-lime-500 bg-lime-500 text-white animate-check-pop'
                          : 'border-gray-200 text-transparent'
                      }`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="text-xl">{item.emoji}</span>
                    <span className="flex-1">
                      <span
                        className={`block font-bold text-rossi-ink ${
                          isChecked ? 'text-gray-400 line-through' : ''
                        }`}
                      >
                        {item.name}
                      </span>
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isChecked ? 'text-gray-300 line-through' : 'text-gray-400'
                      }`}
                    >
                      {item.quantity} {item.unit}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {shareNote && (
        <p className="text-center text-sm font-semibold text-lime-700">{shareNote}</p>
      )}
      <PrimaryButton variant="primary" onClick={handleShare}>
        Share shopping list
      </PrimaryButton>
    </div>
  );
}
