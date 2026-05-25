'use client';

import { useGame } from '../GameProvider';
import { getCharacter } from '../data/characters';
import type { ScreenId } from '../types';
import { MuteButton } from '../components/MuteButton';

interface HomeScreenProps {
  go: (screen: ScreenId) => void;
}

export function HomeScreen({ go }: HomeScreenProps) {
  const { state } = useGame();
  const character = getCharacter(state.selectedCharacter);

  return (
    <div className="screen felt-bg stripe-bg justify-between p-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="pill bg-bull-panel text-bull-gold">🪙 {state.coins}</div>
        <MuteButton />
      </div>

      {/* Logo */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="text-6xl">🎯</div>
        <h1 className="heading mt-2 text-4xl leading-none text-shadow-hard">
          <span className="text-bull-green">BULLHITTERS</span>
          <br />
          <span className="text-bull-red">DARTS</span>{' '}
          <span className="text-bull-chalk">BONANZA</span>
        </h1>
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-bull-mute">
          Swipe. Throw. Cause chaos.
        </p>

        <button
          onClick={() => go('characters')}
          className="mt-5 flex items-center gap-3 rounded-full border border-white/10 bg-bull-panel px-4 py-2"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-bull-black"
            style={{ background: character.color }}
          >
            {character.initials}
          </span>
          <span className="text-left">
            <span className="block text-sm font-bold">{character.name}</span>
            <span className="block text-[10px] uppercase tracking-wide text-bull-mute">
              {character.style} • tap to change
            </span>
          </span>
        </button>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-3">
        <button className="btn-green w-full text-lg" onClick={() => go('gauntlet')}>
          ▶ Play Gauntlet
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-red" onClick={() => go('quick')}>
            Quick Challenge
          </button>
          <button className="btn-ghost" onClick={() => go('characters')}>
            Characters
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-gold" onClick={() => go('rewards')}>
            🪙 Rewards
          </button>
          <button className="btn-ghost" onClick={() => go('tutorial')}>
            How to Play
          </button>
        </div>
      </div>
    </div>
  );
}
