import type { CharacterId, QuickChallengeId, ThrowResult } from '../types';

// ─────────────────────────── Gauntlet rounds ───────────────────────────

export interface GauntletRound {
  index: number;
  title: string;
  objective: string;
  /** Darts allowed this round (chaos Sudden Death can override to 1). */
  darts: number;
  /** Whether to spin the Chaos Wheel before this round. */
  chaosBefore: boolean;
  /** Pass condition given the darts thrown this round and their round total. */
  passed: (darts: ThrowResult[], roundTotal: number) => boolean;
  /** Optional rival for the boss round. */
  boss?: { rival: CharacterId; target: number };
}

export const GAUNTLET_ROUNDS: GauntletRound[] = [
  {
    index: 0,
    title: 'Round 1 — Warm Up',
    objective: 'Land a single dart worth 20 or more.',
    darts: 3,
    chaosBefore: false,
    passed: (darts) => darts.some((d) => d.score >= 20),
  },
  {
    index: 1,
    title: 'Round 2 — Treble Trouble',
    objective: 'Hit any treble.',
    darts: 3,
    chaosBefore: false,
    passed: (darts) => darts.some((d) => d.ring === 'triple'),
  },
  {
    index: 2,
    title: 'Round 3 — Sixty Up',
    objective: 'Score 60 or more across your 3 darts.',
    darts: 3,
    chaosBefore: true,
    passed: (_d, total) => total >= 60,
  },
  {
    index: 3,
    title: 'Round 4 — Pressure Dart',
    objective: 'Hit the bullseye (inner or outer bull).',
    darts: 3,
    chaosBefore: false,
    passed: (darts) => darts.some((d) => d.ring === 'bull' || d.ring === 'outerbull'),
  },
  {
    index: 4,
    title: 'Round 5 — Boss: Beat the Rival',
    objective: 'Out-score the rival’s 90 with 3 darts.',
    darts: 3,
    chaosBefore: true,
    passed: (_d, total) => total > 90,
    boss: { rival: 'bailey', target: 90 },
  },
];

// ─────────────────────────── Quick challenges ───────────────────────────

export interface QuickChallenge {
  id: QuickChallengeId;
  name: string;
  tagline: string;
  rules: string;
  /** 'timed' = throw freely until the clock runs out; 'darts' = fixed darts. */
  mode: 'timed' | 'darts';
  duration?: number;
  darts?: number;
  /** Points a single dart contributes to the score (0 = doesn't count). */
  scoreOf: (res: ThrowResult) => number;
  /** Whether the headline score counts hits rather than points. */
  countHits?: boolean;
  /** Letter grade from a final score. */
  grade: (score: number) => string;
  accent: string;
}

export const QUICK_CHALLENGES: QuickChallenge[] = [
  {
    id: 'trebleHunt',
    name: 'Treble Hunt',
    tagline: 'Hit as many trebles as you can in 30 seconds.',
    rules: 'Only trebles count. Rapid-fire darts. Beat the clock.',
    mode: 'timed',
    duration: 30,
    scoreOf: (res) => (res.ring === 'triple' ? 1 : 0),
    countHits: true,
    grade: (s) => (s >= 10 ? 'S' : s >= 7 ? 'A' : s >= 5 ? 'B' : s >= 3 ? 'C' : 'D'),
    accent: '#22e36b',
  },
  {
    id: 'bullseyeBlitz',
    name: 'Bullseye Blitz',
    tagline: 'Score points only from the outer bull and bullseye.',
    rules: 'Bulls only. 30 seconds. Everything else is a zero.',
    mode: 'timed',
    duration: 30,
    scoreOf: (res) => (res.ring === 'bull' || res.ring === 'outerbull' ? res.score : 0),
    grade: (s) => (s >= 250 ? 'S' : s >= 175 ? 'A' : s >= 100 ? 'B' : s >= 50 ? 'C' : 'D'),
    accent: '#ff2d4b',
  },
  {
    id: 'chase180',
    name: '180 Chase',
    tagline: 'Highest possible 3-dart score. Chase the max.',
    rules: 'You get 3 darts. Everything counts. Can you find 180?',
    mode: 'darts',
    darts: 3,
    scoreOf: (res) => res.score,
    grade: (s) => (s >= 180 ? '180!' : s >= 140 ? 'S' : s >= 100 ? 'A' : s >= 60 ? 'B' : s >= 30 ? 'C' : 'D'),
    accent: '#ffd23f',
  },
];

export function getQuickChallenge(id: QuickChallengeId): QuickChallenge {
  return QUICK_CHALLENGES.find((c) => c.id === id) ?? QUICK_CHALLENGES[0];
}
