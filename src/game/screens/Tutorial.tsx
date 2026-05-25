'use client';

import { useGame } from '../GameProvider';
import type { ScreenId } from '../types';

interface TutorialProps {
  go: (screen: ScreenId) => void;
}

const STEPS = [
  { icon: '👆', title: '1. Drag to aim', text: 'Press anywhere and drag up to move the target onto the spot you want. Release to lock your aim.' },
  { icon: '🎚️', title: '2. Time the accuracy bar', text: 'A marker sweeps left↔right along the bar. Tap to stop it as close to the centre as you can — dead centre lands on target, off-centre and the dart drifts.' },
  { icon: '⚡', title: 'Use your Special', text: 'Each Bullhitter has a one-per-round special. e.g. DC’s Ice Cold slows the bar; Dan’s Clutch tightens it.' },
  { icon: '🌀', title: 'Survive the Chaos', text: 'The Chaos Wheel changes the rules mid-run. Roll with it — that’s the Bullhitters way.' },
];

export function Tutorial({ go }: TutorialProps) {
  const { markTutorialSeen } = useGame();
  return (
    <div className="screen felt-bg p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="heading text-2xl text-bull-green">How to Play</h2>
        <button className="btn-ghost px-4 py-2 text-sm" onClick={() => go('home')}>
          Skip
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
        {STEPS.map((s, i) => (
          <div key={i} className="panel flex items-start gap-3 p-4">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <h3 className="font-bold">{s.title}</h3>
              <p className="text-sm text-bull-mute">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn-green mt-4 w-full text-lg"
        onClick={() => {
          markTutorialSeen();
          go('home');
        }}
      >
        Got it — Let’s Throw
      </button>
    </div>
  );
}
