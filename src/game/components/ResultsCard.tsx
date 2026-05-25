'use client';

interface ResultsCardProps {
  title: string;
  subtitle?: string;
  grade?: string;
  gradeColor?: string;
  stats: { label: string; value: string | number }[];
  coinsEarned: number;
  isBest?: boolean;
  banter?: string;
  primaryLabel?: string;
  onPlayAgain: () => void;
  onChangeCharacter: () => void;
  onHome: () => void;
}

export function ResultsCard({
  title,
  subtitle,
  grade,
  gradeColor = '#22e36b',
  stats,
  coinsEarned,
  isBest,
  banter,
  primaryLabel = 'Play Again',
  onPlayAgain,
  onChangeCharacter,
  onHome,
}: ResultsCardProps) {
  return (
    <div className="screen felt-bg items-center justify-center p-5">
      <div className="animate-slideUp panel w-full max-w-sm p-6 text-center">
        <h2 className="heading text-2xl text-shadow-hard">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-bull-mute">{subtitle}</p>}

        {grade && (
          <div className="my-4 flex items-center justify-center">
            <span
              className="heading animate-pop text-7xl text-shadow-hard"
              style={{ color: gradeColor }}
            >
              {grade}
            </span>
          </div>
        )}

        {isBest && (
          <div className="pill mx-auto my-2 w-fit bg-bull-gold text-bull-black">
            ★ New Best!
          </div>
        )}

        <div className="my-4 space-y-2">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-sm">
              <span className="text-bull-mute">{s.label}</span>
              <span className="font-bold">{s.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-white/10 pt-2 text-sm">
            <span className="text-bull-gold">Coins earned</span>
            <span className="font-bold text-bull-gold">🪙 +{coinsEarned}</span>
          </div>
        </div>

        {banter && (
          <p className="mb-4 rounded-lg bg-bull-panel2 px-3 py-2 text-sm font-bold italic">
            {banter}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button className="btn-green w-full text-lg" onClick={onPlayAgain}>
            ↻ {primaryLabel}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-ghost text-sm" onClick={onChangeCharacter}>
              Change Character
            </button>
            <button className="btn-ghost text-sm" onClick={onHome}>
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
