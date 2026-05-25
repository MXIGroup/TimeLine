'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CHAOS_MODIFIERS } from '../data/chaos';
import type { ChaosModifier } from '../types';
import { sfxFanfare, sfxTick } from '../lib/sound';

interface ChaosWheelProps {
  onResult: (modifier: ChaosModifier) => void;
}

export function ChaosWheel({ onResult }: ChaosWheelProps) {
  const result = useMemo(
    () => CHAOS_MODIFIERS[Math.floor(Math.random() * CHAOS_MODIFIERS.length)],
    [],
  );
  const [revealed, setRevealed] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const n = CHAOS_MODIFIERS.length;
  const seg = 360 / n;
  const resultIndex = CHAOS_MODIFIERS.findIndex((m) => m.id === result.id);
  // Land the chosen slice under the top pointer after several full spins.
  const spinTo = 360 * 4 + (360 - (resultIndex * seg + seg / 2));

  useEffect(() => {
    let count = 0;
    tickRef.current = setInterval(() => {
      count++;
      sfxTick();
      if (count > 18 && tickRef.current) clearInterval(tickRef.current);
    }, 110);
    const t = setTimeout(() => {
      setRevealed(true);
      sfxFanfare();
    }, 2300);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="screen felt-bg items-center justify-center gap-6 p-6">
      <h2 className="heading text-2xl text-bull-red">⚡ Chaos Wheel</h2>

      <div className="relative h-64 w-64">
        {/* Pointer */}
        <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2 text-2xl">🔻</div>
        <div
          className="absolute inset-0 rounded-full border-4 border-bull-panel2 bg-bull-panel"
          style={{
            transform: `rotate(${revealed ? spinTo : 0}deg)`,
            transition: 'transform 2.3s cubic-bezier(0.15, 0.9, 0.2, 1)',
          }}
        >
          {CHAOS_MODIFIERS.map((m, i) => {
            const angle = i * seg + seg / 2;
            return (
              <div
                key={m.id}
                className="absolute left-1/2 top-1/2 origin-top text-center"
                style={{
                  transform: `rotate(${angle}deg) translateY(8px)`,
                  height: '50%',
                }}
              >
                <div className="text-xl" style={{ transform: 'translateX(-50%)' }}>
                  {m.emoji}
                </div>
              </div>
            );
          })}
          <div className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-bull-red shadow-glowRed" />
        </div>
      </div>

      {revealed ? (
        <div className="animate-pop panel w-full max-w-sm p-5 text-center">
          <div className="text-4xl">{result.emoji}</div>
          <h3 className="heading mt-1 text-xl text-bull-gold">{result.name}</h3>
          <p className="mt-1 text-sm text-bull-mute">{result.desc}</p>
          <button className="btn-gold mt-4 w-full" onClick={() => onResult(result)}>
            Send It
          </button>
        </div>
      ) : (
        <p className="animate-pulse text-sm uppercase tracking-widest text-bull-mute">
          Spinning the chaos…
        </p>
      )}
    </div>
  );
}
