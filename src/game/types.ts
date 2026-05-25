export type CharacterId = 'ollie' | 'bailey' | 'dan' | 'dc';

export type ScreenId =
  | 'home'
  | 'characters'
  | 'gauntlet'
  | 'quick'
  | 'rewards'
  | 'tutorial';

export interface Character {
  id: CharacterId;
  name: string;
  handle: string;
  style: string;
  personality: string;
  bonusLabel: string;
  specialName: string;
  specialDesc: string;
  /** Accent colour used across the UI for this member. */
  color: string;
  /** Initials shown on the avatar placeholder. */
  initials: string;
  /** Optional photo path (falls back to initials if missing). */
  image?: string;
  /** >1 tightens the throw spread (more accurate). */
  aimFactor: number;
  /** Score multiplier applied to risky targets (trebles, bull). */
  riskMultiplier: number;
}

export type Ring = 'miss' | 'single' | 'double' | 'triple' | 'outerbull' | 'bull';

export interface ThrowResult {
  /** Normalised landing point on the board ([-1,1] where 1 = outer double edge). */
  x: number;
  y: number;
  /** Base segment number hit (1-20), or 25 / 50 for the bulls, 0 for a miss. */
  base: number;
  ring: Ring;
  /** Points scored for this single dart (segment value, before game modifiers). */
  score: number;
}

export type RewardKind = 'dart' | 'board' | 'celebration' | 'reaction';

export interface RewardItem {
  id: string;
  kind: RewardKind;
  name: string;
  desc: string;
  cost: number;
  /** Hex colour used to preview / render the item. */
  color: string;
}

export type QuickChallengeId = 'trebleHunt' | 'bullseyeBlitz' | 'chase180';

export interface BestScores {
  gauntlet: number;
  trebleHunt: number;
  bullseyeBlitz: number;
  chase180: number;
}

export interface PersistedState {
  coins: number;
  selectedCharacter: CharacterId;
  unlocked: string[];
  equipped: {
    dart: string;
    board: string;
    celebration: string;
  };
  best: BestScores;
  completedGauntlet: boolean;
  seenTutorial: boolean;
  totalThrows: number;
  total180s: number;
}

export interface ChaosModifier {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  /** Multiplier applied to every dart's score. */
  scoreMult: number;
  /** Scales the on-screen board size (1 = normal, <1 = tiny board). */
  boardScale: number;
  /** Added to the base throw spread (harder to aim). */
  extraSpread: number;
  /** Continuous wobble applied to the board while aiming. */
  wobble: number;
  /** Only bull / outer-bull hits score. */
  bullsOnly?: boolean;
  /** Inner/outer bull pays a flat bonus. */
  redZoneBonus?: boolean;
}
