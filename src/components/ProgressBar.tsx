'use client';

interface ProgressBarProps {
  /** Current step (1-indexed). */
  step: number;
  /** Total number of steps. */
  total: number;
}

/** Smooth progress bar shown across the onboarding flow. */
export function ProgressBar({ step, total }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (step / total) * 100));
  return (
    <div className="px-5 pb-2 pt-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-lime-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
