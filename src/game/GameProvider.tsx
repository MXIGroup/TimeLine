'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { BestScores, CharacterId, PersistedState } from './types';
import { DEFAULT_STATE, loadState, saveState } from './lib/storage';
import { getReward } from './data/rewards';

interface GameContextValue {
  state: PersistedState;
  ready: boolean;
  addCoins: (n: number) => void;
  selectCharacter: (id: CharacterId) => void;
  buy: (id: string) => boolean;
  equip: (id: string) => void;
  recordBest: (key: keyof BestScores, score: number) => boolean;
  setCompletedGauntlet: () => void;
  markTutorialSeen: () => void;
  bumpThrows: (n?: number) => void;
  bump180s: (n?: number) => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const firstLoad = useRef(true);

  // Hydrate from localStorage on the client only.
  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (ready) saveState(state);
  }, [state, ready]);

  const addCoins = useCallback((n: number) => {
    setState((s) => ({ ...s, coins: Math.max(0, s.coins + n) }));
  }, []);

  const selectCharacter = useCallback((id: CharacterId) => {
    setState((s) => ({ ...s, selectedCharacter: id }));
  }, []);

  const buy = useCallback((id: string) => {
    const reward = getReward(id);
    if (!reward) return false;
    let ok = false;
    setState((s) => {
      if (s.unlocked.includes(id)) return s;
      if (s.coins < reward.cost) return s;
      ok = true;
      return { ...s, coins: s.coins - reward.cost, unlocked: [...s.unlocked, id] };
    });
    return ok;
  }, []);

  const equip = useCallback((id: string) => {
    const reward = getReward(id);
    if (!reward) return;
    setState((s) => {
      if (!s.unlocked.includes(id)) return s;
      if (reward.kind === 'dart') return { ...s, equipped: { ...s.equipped, dart: id } };
      if (reward.kind === 'board') return { ...s, equipped: { ...s.equipped, board: id } };
      if (reward.kind === 'celebration') {
        return { ...s, equipped: { ...s.equipped, celebration: id } };
      }
      return s;
    });
  }, []);

  const recordBest = useCallback((key: keyof BestScores, score: number) => {
    let isBest = false;
    setState((s) => {
      if (score <= s.best[key]) return s;
      isBest = true;
      return { ...s, best: { ...s.best, [key]: score } };
    });
    return isBest;
  }, []);

  const setCompletedGauntlet = useCallback(() => {
    setState((s) => (s.completedGauntlet ? s : { ...s, completedGauntlet: true }));
  }, []);

  const markTutorialSeen = useCallback(() => {
    setState((s) => (s.seenTutorial ? s : { ...s, seenTutorial: true }));
  }, []);

  const bumpThrows = useCallback((n = 1) => {
    setState((s) => ({ ...s, totalThrows: s.totalThrows + n }));
  }, []);

  const bump180s = useCallback((n = 1) => {
    setState((s) => ({ ...s, total180s: s.total180s + n }));
  }, []);

  const resetProgress = useCallback(() => {
    setState({ ...DEFAULT_STATE });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      ready,
      addCoins,
      selectCharacter,
      buy,
      equip,
      recordBest,
      setCompletedGauntlet,
      markTutorialSeen,
      bumpThrows,
      bump180s,
      resetProgress,
    }),
    [
      state,
      ready,
      addCoins,
      selectCharacter,
      buy,
      equip,
      recordBest,
      setCompletedGauntlet,
      markTutorialSeen,
      bumpThrows,
      bump180s,
      resetProgress,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
