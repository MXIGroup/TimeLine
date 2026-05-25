'use client';

import { useGame } from '../GameProvider';
import { REWARDS } from '../data/rewards';
import type { RewardItem, RewardKind, ScreenId } from '../types';
import { sfxScore } from '../lib/sound';

interface RewardsScreenProps {
  go: (screen: ScreenId) => void;
}

const SECTIONS: { kind: RewardKind; title: string }[] = [
  { kind: 'dart', title: 'Dart Skins' },
  { kind: 'board', title: 'Board Skins' },
  { kind: 'celebration', title: 'Celebrations' },
  { kind: 'reaction', title: 'Reaction Lines' },
];

export function RewardsScreen({ go }: RewardsScreenProps) {
  const { state, buy, equip } = useGame();

  const equippedFor = (kind: RewardKind): string | null => {
    if (kind === 'dart') return state.equipped.dart;
    if (kind === 'board') return state.equipped.board;
    if (kind === 'celebration') return state.equipped.celebration;
    return null;
  };

  const renderItem = (item: RewardItem) => {
    const owned = state.unlocked.includes(item.id);
    const equippedId = equippedFor(item.kind);
    const isEquipped = equippedId === item.id;
    const canEquip = item.kind !== 'reaction';
    const affordable = state.coins >= item.cost;

    return (
      <div
        key={item.id}
        className="panel flex items-center gap-3 p-3"
        style={{ borderLeft: `4px solid ${item.color}` }}
      >
        <span
          className="h-8 w-8 shrink-0 rounded-full border border-white/20"
          style={{ background: item.color }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{item.name}</p>
          <p className="truncate text-[11px] text-bull-mute">{item.desc}</p>
        </div>
        {!owned ? (
          <button
            disabled={!affordable}
            onClick={() => {
              if (buy(item.id)) sfxScore(30);
            }}
            className={`btn px-3 py-2 text-xs ${affordable ? 'btn-gold' : 'border-2 border-bull-panel2 bg-bull-panel text-bull-mute'}`}
          >
            🪙 {item.cost}
          </button>
        ) : canEquip ? (
          <button
            disabled={isEquipped}
            onClick={() => equip(item.id)}
            className={`btn px-3 py-2 text-xs ${isEquipped ? 'border-2 border-bull-green bg-transparent text-bull-green' : 'btn-green'}`}
          >
            {isEquipped ? '✓ On' : 'Equip'}
          </button>
        ) : (
          <span className="pill bg-bull-panel2 text-bull-green">Unlocked</span>
        )}
      </div>
    );
  };

  return (
    <div className="screen felt-bg p-4">
      <div className="mb-3 flex items-center justify-between">
        <button className="btn-ghost px-4 py-2 text-sm" onClick={() => go('home')}>
          ‹ Back
        </button>
        <h2 className="heading text-xl">Rewards</h2>
        <span className="pill bg-bull-panel text-bull-gold">🪙 {state.coins}</span>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pb-4 no-scrollbar">
        {SECTIONS.map((section) => (
          <div key={section.kind}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-bull-mute">
              {section.title}
            </h3>
            <div className="space-y-2">
              {REWARDS.filter((r) => r.kind === section.kind).map(renderItem)}
            </div>
          </div>
        ))}
        <p className="pt-2 text-center text-[11px] text-bull-mute">
          Play Gauntlet & Quick Challenges to earn coins. No pay-to-win — just bragging rights.
        </p>
      </div>
    </div>
  );
}
