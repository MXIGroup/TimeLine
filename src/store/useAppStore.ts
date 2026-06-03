'use client';

import { useSyncExternalStore } from 'react';
import type { Preferences, MealPlan, ShopName, Vibe, Dietary, Equipment } from '@/types';
import { DEFAULT_BUDGET, MAX_VIBES } from '@/data/options';
import { generateMealPlan } from '@/lib/generateMealPlan';

// ---------------------------------------------------------------------------
// A tiny dependency-free store: a plain object + subscribers, persisted to
// localStorage and read through React's useSyncExternalStore.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'rossi-food-state-v1';

export interface AppState {
  preferences: Preferences;
  plan: MealPlan | null;
  /** Ticked-off shopping list item ids. */
  checked: Record<string, boolean>;
}

const defaultState: AppState = {
  preferences: {
    shop: null,
    budget: DEFAULT_BUDGET,
    vibes: [],
    dietary: [],
    equipment: [],
  },
  plan: null,
  checked: {},
};

let state: AppState = defaultState;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / serialisation errors — persistence is best-effort.
  }
}

function setState(updater: (prev: AppState) => AppState) {
  state = updater(state);
  persist();
  emit();
}

/** Load persisted state on the client. Safe to call multiple times. */
function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = {
        preferences: { ...defaultState.preferences, ...parsed.preferences },
        plan: parsed.plan ?? null,
        checked: parsed.checked ?? {},
      };
    }
  } catch {
    state = defaultState;
  }
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AppState {
  return state;
}

function getServerSnapshot(): AppState {
  return defaultState;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const actions = {
  setShop(shop: ShopName) {
    setState((s) => ({ ...s, preferences: { ...s.preferences, shop } }));
  },
  setBudget(budget: number) {
    setState((s) => ({ ...s, preferences: { ...s.preferences, budget } }));
  },
  toggleVibe(vibe: Vibe) {
    setState((s) => {
      const has = s.preferences.vibes.includes(vibe);
      let vibes: Vibe[];
      if (has) {
        vibes = s.preferences.vibes.filter((v) => v !== vibe);
      } else if (s.preferences.vibes.length >= MAX_VIBES) {
        return s; // at the limit — ignore
      } else {
        vibes = [...s.preferences.vibes, vibe];
      }
      return { ...s, preferences: { ...s.preferences, vibes } };
    });
  },
  toggleDietary(item: Dietary) {
    setState((s) => {
      let dietary = s.preferences.dietary;
      if (item === 'None') {
        // Selecting None clears everything else.
        dietary = dietary.includes('None') ? [] : ['None'];
      } else if (dietary.includes(item)) {
        dietary = dietary.filter((d) => d !== item);
      } else {
        // Selecting any other option removes None.
        dietary = [...dietary.filter((d) => d !== 'None'), item];
      }
      return { ...s, preferences: { ...s.preferences, dietary } };
    });
  },
  toggleEquipment(item: Equipment) {
    setState((s) => {
      let equipment = s.preferences.equipment;
      if (item === 'No special equipment') {
        equipment = equipment.includes('No special equipment') ? [] : ['No special equipment'];
      } else if (equipment.includes(item)) {
        equipment = equipment.filter((e) => e !== item);
      } else {
        equipment = [...equipment.filter((e) => e !== 'No special equipment'), item];
      }
      return { ...s, preferences: { ...s.preferences, equipment } };
    });
  },
  generatePlan() {
    setState((s) => {
      const plan = generateMealPlan(s.preferences);
      return { ...s, plan, checked: {} };
    });
  },
  regeneratePlan() {
    setState((s) => {
      const plan = generateMealPlan(s.preferences);
      return { ...s, plan, checked: {} };
    });
  },
  toggleChecked(id: string) {
    setState((s) => ({ ...s, checked: { ...s.checked, [id]: !s.checked[id] } }));
  },
  resetAll() {
    setState(() => ({ ...defaultState, preferences: { ...defaultState.preferences } }));
  },
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** True once persisted state has been read on the client (avoids hydration flashes). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (l) => {
      hydrate();
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => hydrated,
    () => false,
  );
}
