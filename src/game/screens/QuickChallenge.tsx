'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../GameProvider';
import { getCharacter } from '../data/characters';
import { QUICK_CHALLENGES, getQuickChallenge } from '../data/challenges';
import type { BestScores, QuickChallengeId, ScreenId, ThrowResult } from '../types';
import type { ReactionTier } from '../data/reactions';
import { pickRivalBanter } from '../data/reactions';
import { DartStage, type ResolveInfo, type ResolvedThrow } from '../components/DartStage';
import { ResultsCard } from '../components/ResultsCard';
import { rewardColor } from '../data/rewards';

interface QuickChallengeProps {
  go: (screen: ScreenId) => void;
}

type Phase = 'menu' | 'playing' | 'over';

const BEST_KEY: Record<QuickChallengeId, keyof BestScores> = {
  trebleHunt: 'trebleHunt',
  bullseyeBlitz: 'bullseyeBlitz',
  chase180: 'chase180',
};

export function QuickChallenge({ go }: QuickChallengeProps) {
  const { state, addCoins, recordBest, bumpThrows, bump180s } = useGame();
  const character = getCharacter(state.selectedCharacter);
  const dartColor = rewardColor(state.equipped.dart, '#eef2ee');
  const boardColor = rewardColor(state.equipped.board, '#3a2a1a');

  const [phase, setPhase] = useState<Phase>('menu');
  const [selectedId, setSelectedId] = useState<QuickChallengeId>('trebleHunt');
  const challenge = getQuickChallenge(selectedId);

  const [darts, setDarts] = useState<ThrowResult[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [specialUsed, setSpecialUsed] = useState(false);
  const [summary, setSummary] = useState<{
    score: number;
    grade: string;
    coins: number;
    isBest: boolean;
  } | null>(null);

  const scoreRef = useRef(0);
  const rawTotalRef = useRef(0);
  const settled = useRef(false);

  const endChallenge = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    const finalScore = scoreRef.current;
    const coins = Math.floor(rawTotalRef.current / 5) + 5;
    addCoins(coins);
    const isBest = recordBest(BEST_KEY[selectedId], finalScore);
    if (selectedId === 'chase180' && finalScore >= 180) bump180s();
    setSummary({ score: finalScore, grade: challenge.grade(finalScore), coins, isBest });
    setPhase('over');
  }, [addCoins, recordBest, selectedId, challenge, bump180s]);

  const start = useCallback(
    (id: QuickChallengeId) => {
      const c = getQuickChallenge(id);
      setSelectedId(id);
      setDarts([]);
      setScore(0);
      scoreRef.current = 0;
      rawTotalRef.current = 0;
      settled.current = false;
      setSpecialUsed(false);
      setSummary(null);
      if (c.mode === 'timed') setTimeLeft(c.duration ?? 30);
      setPhase('playing');
    },
    [],
  );

  // Countdown for timed challenges.
  useEffect(() => {
    if (phase !== 'playing' || challenge.mode !== 'timed') return;
    if (timeLeft <= 0) {
      endChallenge();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, challenge.mode, timeLeft, endChallenge]);

  const resolve = useCallback(
    (raw: ThrowResult, _info: ResolveInfo): ResolvedThrow => {
      const pts = challenge.scoreOf(raw);
      const counted = pts > 0;
      let tier: ReactionTier;
      if (raw.ring === 'miss') tier = 'bad';
      else if (counted && raw.score >= 50) tier = 'huge';
      else if (counted) tier = 'good';
      else if (raw.score > 0) tier = 'ok';
      else tier = 'bad';
      const label = challenge.countHits
        ? counted
          ? 'TREBLE!'
          : 'no count'
        : `+${pts}`;
      return { points: pts, tier, label };
    },
    [challenge],
  );

  const onThrow = useCallback(
    (raw: ThrowResult, resolved: ResolvedThrow) => {
      bumpThrows();
      rawTotalRef.current += raw.score;
      scoreRef.current += resolved.points;
      setScore(scoreRef.current);
      setDarts((prev) => {
        const next = [...prev, raw];
        // Keep the board readable in timed modes.
        return challenge.mode === 'timed' ? next.slice(-6) : next;
      });

      if (challenge.mode === 'darts') {
        const thrown = darts.length + 1;
        if (thrown >= (challenge.darts ?? 3)) {
          setTimeout(endChallenge, 1300);
        }
      }
    },
    [bumpThrows, challenge, darts.length, endChallenge],
  );

  // ── Menu ──────────────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <div className="screen felt-bg p-4">
        <div className="mb-3 flex items-center justify-between">
          <button className="btn-ghost px-4 py-2 text-sm" onClick={() => go('home')}>
            ‹ Back
          </button>
          <h2 className="heading text-xl">Quick Challenge</h2>
          <span className="w-14" />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-3">
          {QUICK_CHALLENGES.map((c) => (
            <button
              key={c.id}
              onClick={() => start(c.id)}
              className="panel flex items-center gap-3 p-4 text-left active:scale-[0.98]"
              style={{ borderLeft: `5px solid ${c.accent}` }}
            >
              <div className="flex-1">
                <h3 className="heading text-lg" style={{ color: c.accent }}>
                  {c.name}
                </h3>
                <p className="text-xs text-bull-mute">{c.tagline}</p>
                <p className="mt-1 text-[11px] text-bull-mute">
                  Best: <span className="font-bold text-bull-chalk">{state.best[BEST_KEY[c.id]]}</span>
                </p>
              </div>
              <span className="text-2xl">▶</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'over' && summary) {
    return (
      <ResultsCard
        title={challenge.name}
        subtitle={challenge.rules}
        grade={summary.grade}
        gradeColor={challenge.accent}
        stats={[
          { label: challenge.countHits ? 'Trebles hit' : 'Score', value: summary.score },
          { label: 'Best', value: Math.max(summary.score, state.best[BEST_KEY[selectedId]]) },
        ]}
        coinsEarned={summary.coins}
        isBest={summary.isBest}
        banter={pickRivalBanter(character.id)}
        onPlayAgain={() => start(selectedId)}
        onChangeCharacter={() => go('characters')}
        onHome={() => setPhase('menu')}
      />
    );
  }

  // ── Playing ─────────────────────────────────────────────────────────────
  const timed = challenge.mode === 'timed';
  const remaining = timed ? (timeLeft > 0 ? 99 : 0) : (challenge.darts ?? 3) - darts.length;

  const hud = (
    <div className="flex items-start justify-between gap-2">
      <button
        className="pill pointer-events-auto bg-bull-panel/90 text-bull-chalk"
        onClick={() => go('home')}
      >
        ‹ Quit
      </button>
      <div className="rounded-xl bg-black/55 px-3 py-1.5 text-center backdrop-blur">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: challenge.accent }}>
          {challenge.name}
        </p>
        {timed ? (
          <p className={`heading text-xl ${timeLeft <= 5 ? 'text-bull-red' : 'text-bull-chalk'}`}>
            ⏱ {timeLeft}s
          </p>
        ) : (
          <p className="text-xs font-bold">{challenge.rules}</p>
        )}
      </div>
      <div className="pill bg-bull-panel/90 text-bull-gold">{score}</div>
    </div>
  );

  return (
    <DartStage
      character={character}
      dartColor={dartColor}
      boardColor={boardColor}
      landed={darts}
      dartsRemaining={remaining}
      dartsPerRound={challenge.darts ?? 3}
      showDarts={!timed}
      specialAvailable={!specialUsed}
      onUseSpecial={() => setSpecialUsed(true)}
      resolve={resolve}
      onThrow={onThrow}
      hud={hud}
    />
  );
}
