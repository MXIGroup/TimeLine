import type { PersistedState } from '../types';
import { DEFAULT_EQUIPPED, DEFAULT_UNLOCKED } from '../data/rewards';

const KEY = 'bullhitters-darts-v1';

export const DEFAULT_STATE: PersistedState = {
  coins: 0,
  selectedCharacter: 'ollie',
  unlocked: [...DEFAULT_UNLOCKED],
  equipped: { ...DEFAULT_EQUIPPED },
  best: { gauntlet: 0, trebleHunt: 0, bullseyeBlitz: 0, chase180: 0 },
  completedGauntlet: false,
  seenTutorial: false,
  totalThrows: 0,
  total180s: 0,
};

export function loadState(): PersistedState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    // Merge so new fields/unlocks survive across versions.
    return {
      ...DEFAULT_STATE,
      ...parsed,
      equipped: { ...DEFAULT_EQUIPPED, ...(parsed.equipped ?? {}) },
      best: { ...DEFAULT_STATE.best, ...(parsed.best ?? {}) },
      unlocked: Array.from(new Set([...DEFAULT_UNLOCKED, ...(parsed.unlocked ?? [])])),
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / disabled — fail silently, it's only a game */
  }
}
