'use client';

interface OptionTileProps {
  label: string;
  emoji: string;
  selected: boolean;
  onClick: () => void;
  /** Background colour class applied when selected. */
  color?: string;
  disabled?: boolean;
}

/**
 * Generic tappable tile used by the vibe, dietary and equipment selectors.
 * Selected tiles pop and gain a lime ring + pastel background.
 */
export function OptionTile({
  label,
  emoji,
  selected,
  onClick,
  color = 'bg-lime-100',
  disabled,
}: OptionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${
        selected
          ? `${color} border-lime-500 shadow-sm animate-pop-in`
          : 'border-gray-100 bg-white hover:border-gray-200'
      } ${disabled && !selected ? 'opacity-40' : ''}`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="flex-1 font-bold text-rossi-ink">{label}</span>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
          selected ? 'border-lime-500 bg-lime-500 text-white' : 'border-gray-200 text-transparent'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    </button>
  );
}
