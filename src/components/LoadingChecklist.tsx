'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  'Analysing budget + preferences',
  'Building your meal plan',
  'Generating shopping list',
];

/**
 * The "leave it with us..." loading screen. Animates a checklist, then calls
 * onComplete after a short delay.
 */
export function LoadingChecklist({ onComplete }: { onComplete: () => void }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setDone(i + 1), 400 * (i + 1)));
    });
    timers.push(setTimeout(onComplete, 1500));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-4xl bg-gradient-to-br from-lime-100 to-rossi-yellow/60 text-6xl shadow-inner animate-pop-in">
        🛍️
      </div>
      <h1 className="text-3xl font-extrabold text-rossi-ink">leave it with us...</h1>
      <p className="mt-2 text-gray-400">Sorting your week, one dinner at a time.</p>

      <ul className="mt-10 w-full max-w-xs space-y-3 text-left">
        {STEPS.map((step, i) => {
          const isDone = i < done;
          const isActive = i === done;
          return (
            <li
              key={step}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                isDone ? 'bg-lime-50' : 'bg-gray-50'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                  isDone ? 'bg-lime-500 text-white animate-check-pop' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : isActive ? (
                  <span className="h-2 w-2 animate-ping rounded-full bg-lime-400" />
                ) : null}
              </span>
              <span
                className={`text-sm font-bold ${isDone ? 'text-lime-700' : 'text-gray-500'}`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
