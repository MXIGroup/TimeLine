'use client';

import { useState } from 'react';
import { useGame } from '../GameProvider';
import { CHARACTERS } from '../data/characters';
import type { CharacterId, ScreenId } from '../types';

interface CharacterSelectProps {
  go: (screen: ScreenId) => void;
}

export function CharacterSelect({ go }: CharacterSelectProps) {
  const { state, selectCharacter } = useGame();
  const [focus, setFocus] = useState<CharacterId>(state.selectedCharacter);
  const active = CHARACTERS.find((c) => c.id === focus) ?? CHARACTERS[0];

  return (
    <div className="screen felt-bg p-4">
      <div className="mb-3 flex items-center justify-between">
        <button className="btn-ghost px-4 py-2 text-sm" onClick={() => go('home')}>
          ‹ Back
        </button>
        <h2 className="heading text-xl">Pick Your Bullhitter</h2>
        <span className="w-14" />
      </div>

      {/* Roster */}
      <div className="grid grid-cols-4 gap-2">
        {CHARACTERS.map((c) => {
          const selected = c.id === focus;
          return (
            <button
              key={c.id}
              onClick={() => setFocus(c.id)}
              className={`flex flex-col items-center rounded-xl border-2 p-2 transition-transform active:scale-95 ${
                selected ? 'scale-105 bg-bull-panel2' : 'border-transparent bg-bull-panel'
              }`}
              style={selected ? { borderColor: c.color } : undefined}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-base font-black text-bull-black"
                style={{ background: c.color }}
              >
                {c.initials}
              </span>
              <span className="mt-1 text-[10px] font-bold leading-tight">{c.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Detail card */}
      <div className="panel mt-4 flex-1 overflow-y-auto p-5 no-scrollbar">
        <div className="flex items-center gap-3">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-bull-black"
            style={{ background: active.color }}
          >
            {active.initials}
          </span>
          <div>
            <h3 className="heading text-2xl" style={{ color: active.color }}>
              {active.name}
            </h3>
            <p className="text-xs uppercase tracking-widest text-bull-mute">@{active.handle}</p>
          </div>
        </div>

        <p className="mt-4 text-sm italic text-bull-chalk/80">“{active.personality}”</p>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <dt className="pill bg-bull-panel2 text-bull-chalk">Style</dt>
            <dd className="flex-1 pt-0.5 font-bold">{active.style}</dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="pill bg-bull-panel2 text-bull-green">Bonus</dt>
            <dd className="flex-1 pt-0.5">{active.bonusLabel}</dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="pill bg-bull-panel2 text-bull-red">Special</dt>
            <dd className="flex-1 pt-0.5">
              <span className="font-bold">⚡ {active.specialName}</span>
              <br />
              <span className="text-bull-mute">{active.specialDesc}</span>
            </dd>
          </div>
        </dl>
      </div>

      <button
        className="btn-green mt-4 w-full text-lg"
        style={{ background: active.color }}
        onClick={() => {
          selectCharacter(active.id);
          go('home');
        }}
      >
        Lock In {active.name.split(' ')[0]}
      </button>
    </div>
  );
}
