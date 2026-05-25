import type { CharacterId } from '../types';

export type ReactionTier = 'bad' | 'ok' | 'good' | 'huge';

export const REACTIONS: Record<ReactionTier, string[]> = {
  bad: [
    'You’ve absolutely stunk the place out.',
    'That’s pub league behaviour.',
    'Delete the app after that.',
    'Mate. My nan throws tidier than that.',
    'That dart’s gone for a pint.',
    'Embarrassing scenes, honestly.',
  ],
  ok: [
    'It’ll do. Barely.',
    'Points are points, I suppose.',
    'Not filthy, not foul. Middling.',
    'Keep the arm going.',
    'Workmanlike. Boring, but workmanlike.',
  ],
  good: [
    'That is outrageous.',
    'Filthy darts.',
    'That’s why you’re the main man.',
    'Oh that’s lovely, that.',
    'Get in the bin, brilliant throw.',
    'Class. Pure class.',
  ],
  huge: [
    'ONE HUNDRED AND EIGHTYYYYY!',
    'That’s going in the group chat.',
    'Clip that immediately.',
    'I’m shaking. Genuinely shaking.',
    'You cannot teach that.',
    'Frame it. Sell tickets.',
  ],
};

/** Short between-round needle from a rival member. */
export const BANTER: Record<CharacterId, string[]> = {
  ollie: [
    'Ollie: Go on then, big shot.',
    'Ollie: Risk it. You won’t.',
    'Ollie: Boring darts so far, liven it up.',
  ],
  bailey: [
    'Bailey: You’ve bottled that.',
    'Bailey: Send it or sit down.',
    'Bailey: My gran’s tighter than you.',
  ],
  dan: [
    'Dan: Pressure dart now.',
    'Dan: Steady. Don’t throw it away.',
    'Dan: This is the one that matters.',
  ],
  dc: [
    'DC: That was absolutely filthy.',
    'DC: Cold. Ice cold. Do it again.',
    'DC: Called it. Every time.',
  ],
};

export function pickReaction(tier: ReactionTier): string {
  const list = REACTIONS[tier];
  return list[Math.floor(Math.random() * list.length)];
}

export function pickBanter(from: CharacterId): string {
  const list = BANTER[from];
  return list[Math.floor(Math.random() * list.length)];
}

/** Pick a banter line from any member other than the player. */
export function pickRivalBanter(player: CharacterId): string {
  const rivals = (Object.keys(BANTER) as CharacterId[]).filter((c) => c !== player);
  const from = rivals[Math.floor(Math.random() * rivals.length)];
  return pickBanter(from);
}
