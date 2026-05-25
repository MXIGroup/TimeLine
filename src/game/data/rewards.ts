import type { RewardItem } from '../types';

/** 5 dart skins, 3 board skins, 4 celebrations, 8 reaction lines. */
export const REWARDS: RewardItem[] = [
  // ─── Dart skins (the colour of thrown darts / flights) ───
  { id: 'dart-default', kind: 'dart', name: 'House Darts', desc: 'Standard issue. Free.', cost: 0, color: '#eef2ee' },
  { id: 'dart-green', kind: 'dart', name: 'Green Machine', desc: 'Bullhitters green flights.', cost: 60, color: '#22e36b' },
  { id: 'dart-scarlet', kind: 'dart', name: 'Scarlet Sender', desc: 'Bailey-approved red.', cost: 60, color: '#ff2d4b' },
  { id: 'dart-gold', kind: 'dart', name: 'Gold Tips', desc: 'Filthy gold finish.', cost: 140, color: '#ffd23f' },
  { id: 'dart-ice', kind: 'dart', name: 'Ice Cold', desc: 'DC’s frosty blue set.', cost: 140, color: '#56c2ff' },

  // ─── Board skins (the wood/backing ring colour) ───
  { id: 'board-default', kind: 'board', name: 'Classic Oche', desc: 'The pub regular. Free.', cost: 0, color: '#3a2a1a' },
  { id: 'board-neon', kind: 'board', name: 'Neon Night', desc: 'Glowing green surround.', cost: 100, color: '#0f7a3a' },
  { id: 'board-blood', kind: 'board', name: 'Blood Red', desc: 'Scarlet surround, no mercy.', cost: 100, color: '#8f1224' },

  // ─── Celebration animations ───
  { id: 'celeb-default', kind: 'celebration', name: 'Crowd Pop', desc: 'A classic score pop. Free.', cost: 0, color: '#eef2ee' },
  { id: 'celeb-fire', kind: 'celebration', name: 'On Fire', desc: 'Flames on a big hit.', cost: 120, color: '#ff7a1f' },
  { id: 'celeb-confetti', kind: 'celebration', name: 'Confetti Cannon', desc: 'Full pub party.', cost: 120, color: '#22e36b' },
  { id: 'celeb-shockwave', kind: 'celebration', name: 'Shockwave', desc: 'Screen-rattling boom.', cost: 180, color: '#ffd23f' },

  // ─── Reaction / voice lines (unlock extra banter flavour) ───
  { id: 'react-1', kind: 'reaction', name: '“Get in the bin!”', desc: 'Bonus celebration shout.', cost: 40, color: '#22e36b' },
  { id: 'react-2', kind: 'reaction', name: '“Filthy, filthy darts.”', desc: 'DC signature line.', cost: 40, color: '#56c2ff' },
  { id: 'react-3', kind: 'reaction', name: '“SEND IT!”', desc: 'Bailey’s war cry.', cost: 40, color: '#ff2d4b' },
  { id: 'react-4', kind: 'reaction', name: '“Pressure dart.”', desc: 'Dan’s clutch call.', cost: 40, color: '#ffd23f' },
  { id: 'react-5', kind: 'reaction', name: '“Outrageous scenes.”', desc: 'For the big ones.', cost: 70, color: '#22e36b' },
  { id: 'react-6', kind: 'reaction', name: '“Clip that.”', desc: 'Group-chat ready.', cost: 70, color: '#56c2ff' },
  { id: 'react-7', kind: 'reaction', name: '“Pub league.”', desc: 'For the stinkers.', cost: 70, color: '#ff2d4b' },
  { id: 'react-8', kind: 'reaction', name: '“Main man.”', desc: 'Reserved for legends.', cost: 90, color: '#ffd23f' },
];

/** Items granted for free at the start (cost 0). */
export const DEFAULT_UNLOCKED = REWARDS.filter((r) => r.cost === 0).map((r) => r.id);

export const DEFAULT_EQUIPPED = {
  dart: 'dart-default',
  board: 'board-default',
  celebration: 'celeb-default',
};

export function getReward(id: string): RewardItem | undefined {
  return REWARDS.find((r) => r.id === id);
}

export function rewardColor(id: string, fallback: string): string {
  return getReward(id)?.color ?? fallback;
}
