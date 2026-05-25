import type { Character, CharacterId } from '../types';

export const CHARACTERS: Character[] = [
  {
    id: 'ollie',
    name: 'Ollie Howard',
    handle: 'TBD Darts',
    style: 'Trick Shot King',
    personality: 'Lives for the outrageous. If it’s risky, he’s already throwing it.',
    bonusLabel: 'Higher multiplier on risky targets',
    specialName: 'Chaos Shot',
    specialDesc: 'Random high-risk / high-reward boost on your next dart.',
    color: '#22e36b',
    initials: 'OH',
    aimFactor: 0.92,
    riskMultiplier: 1.6,
  },
  {
    id: 'bailey',
    name: 'Bailey McNamara',
    handle: 'McDarts',
    style: 'Power Player',
    personality: 'Sends every dart like it owes him money. Subtlety is for cowards.',
    bonusLabel: 'Faster, punchier throws',
    specialName: 'Send It',
    specialDesc: 'Huge power boost — massive score, shakier aim.',
    color: '#ff2d4b',
    initials: 'BM',
    aimFactor: 0.96,
    riskMultiplier: 1.35,
  },
  {
    id: 'dan',
    name: 'Dan McNamara',
    handle: 'McDarts',
    style: 'Balanced Finisher',
    personality: 'Cool head, steady hand. The one you want on the last dart.',
    bonusLabel: 'Stable, reliable aim',
    specialName: 'Clutch Mode',
    specialDesc: 'Pin-tight accuracy on your final dart of the round.',
    color: '#ffd23f',
    initials: 'DM',
    aimFactor: 1.12,
    riskMultiplier: 1.25,
  },
  {
    id: 'dc',
    name: 'Daniel Coates',
    handle: 'Darts With DC',
    style: 'Precision Merchant',
    personality: 'Filthy with it. Calls the shot before the dart’s even left his hand.',
    bonusLabel: 'Tighter aim control',
    specialName: 'Ice Cold',
    specialDesc: 'Steadies the board and shrinks your spread for one throw.',
    color: '#56c2ff',
    initials: 'DC',
    aimFactor: 1.2,
    riskMultiplier: 1.2,
  },
];

export const CHARACTER_MAP: Record<CharacterId, Character> = CHARACTERS.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CharacterId, Character>,
);

export function getCharacter(id: CharacterId): Character {
  return CHARACTER_MAP[id] ?? CHARACTERS[0];
}
