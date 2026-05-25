'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useGame } from '../GameProvider';
import { getCharacter } from '../data/characters';
import { GAUNTLET_ROUNDS } from '../data/challenges';
import { pickRivalBanter } from '../data/reactions';
import type { CharacterId, ChaosModifier, ScreenId, ThrowResult } from '../types';
import type { ReactionTier } from '../data/reactions';
import { DartStage, type ResolveInfo, type ResolvedThrow } from '../components/DartStage';
import { ChaosWheel } from '../components/ChaosWheel';
import { ResultsCard } from '../components/ResultsCard';
import { rewardColor } from '../data/rewards';

interface GauntletModeProps {
  go: (screen: ScreenId) => void;
}

type Phase = 'chaos' | 'intro' | 'playing' | 'result' | 'over';

function tierFor(rawScore: number, miss: boolean): ReactionTier {
  if (miss) return 'bad';
  if (rawScore >= 50) return 'huge';
  if (rawScore >= 18) return 'good';
  if (rawScore >= 8) return 'ok';
  return 'bad';
}

export function GauntletMode({ go }: GauntletModeProps) {
  const { state, addCoins, recordBest, setCompletedGauntlet, bumpThrows, bump180s } = useGame();
  const character = getCharacter(state.selectedCharacter);
  const dartColor = rewardColor(state.equipped.dart, '#eef2ee');
  const boardColor = rewardColor(state.equipped.board, '#3a2a1a');

  const [roundIdx, setRoundIdx] = useState(0);
  const round = GAUNTLET_ROUNDS[roundIdx];
  const [phase, setPhase] = useState<Phase>(round.chaosBefore ? 'chaos' : 'intro');
  const [chaos, setChaos] = useState<ChaosModifier | null>(null);
  const [darts, setDarts] = useState<ThrowResult[]>([]);
  const [roundPoints, setRoundPoints] = useState(0);
  const [total, setTotal] = useState(0);
  const [specialUsed, setSpecialUsed] = useState(false);
  const [lastPassed, setLastPassed] = useState(false);
  const [banter, setBanter] = useState('');
  const settled = useRef(false);

  const dartsThisRound = chaos?.id === 'sudden' ? 1 : round.darts;
  const remaining = dartsThisRound - darts.length;

  // Final summary (when phase === 'over').
  const [summary, setSummary] = useState<{
    won: boolean;
    reached: number;
    total: number;
    coins: number;
    isBest: boolean;
  } | null>(null);

  const startRound = useCallback(
    (idx: number) => {
      const r = GAUNTLET_ROUNDS[idx];
      setRoundIdx(idx);
      setDarts([]);
      setRoundPoints(0);
      setSpecialUsed(false);
      settled.current = false;
      if (r.chaosBefore) {
        setChaos(null);
        setPhase('chaos');
      } else {
        setChaos(null);
        setPhase('intro');
      }
    },
    [],
  );

  const resolve = useCallback(
    (raw: ThrowResult, _info: ResolveInfo): ResolvedThrow => {
      let pts = raw.score;
      if (raw.ring === 'triple' || raw.ring === 'bull') pts *= character.riskMultiplier;
      const sp = _info.special;
      if (sp === 'bailey') pts *= 2;
      else if (sp === 'ollie') pts *= 1.5 + Math.random() * 1.5;
      if (chaos) {
        if (chaos.bullsOnly && !(raw.ring === 'bull' || raw.ring === 'outerbull')) pts = 0;
        pts *= chaos.scoreMult;
        if (chaos.redZoneBonus && (raw.ring === 'bull' || raw.ring === 'outerbull')) pts += 50;
      }
      pts = Math.round(pts);
      return { points: pts, tier: tierFor(raw.score, raw.ring === 'miss') };
    },
    [character.riskMultiplier, chaos],
  );

  const finishGame = useCallback(
    (won: boolean, reachedIdx: number, finalTotal: number, passedRounds: number) => {
      const coins = Math.floor(finalTotal / 4) + passedRounds * 12 + (won ? 80 : 0);
      addCoins(coins);
      const isBest = recordBest('gauntlet', finalTotal);
      if (won) setCompletedGauntlet();
      setSummary({ won, reached: reachedIdx + 1, total: finalTotal, coins, isBest });
      setPhase('over');
    },
    [addCoins, recordBest, setCompletedGauntlet],
  );

  const onThrow = useCallback(
    (raw: ThrowResult, resolved: ResolvedThrow) => {
      bumpThrows();
      const nextDarts = [...darts, raw];
      const nextRoundPoints = roundPoints + resolved.points;
      const nextTotal = total + resolved.points;
      setDarts(nextDarts);
      setRoundPoints(nextRoundPoints);
      setTotal(nextTotal);

      if (nextDarts.length >= dartsThisRound && !settled.current) {
        settled.current = true;
        const rawTotal = nextDarts.reduce((s, d) => s + d.score, 0);
        if (rawTotal >= 180) bump180s();
        const passed = round.passed(nextDarts, rawTotal);
        setLastPassed(passed);
        setBanter(pickRivalBanter(character.id));
        // Let the dart land + reaction show before revealing the verdict.
        setTimeout(() => {
          if (!passed) {
            const passedRounds = roundIdx; // cleared rounds before this one
            finishGame(false, roundIdx, nextTotal, passedRounds);
          } else if (roundIdx >= GAUNTLET_ROUNDS.length - 1) {
            finishGame(true, roundIdx, nextTotal, GAUNTLET_ROUNDS.length);
          } else {
            setPhase('result');
          }
        }, 1300);
      }
    },
    [darts, roundPoints, total, dartsThisRound, round, character.id, roundIdx, bumpThrows, bump180s, finishGame],
  );

  const hud = useMemo(
    () => (
      <div className="flex items-start justify-between gap-2">
        <button
          className="pill pointer-events-auto bg-bull-panel/90 text-bull-chalk"
          onClick={() => go('home')}
        >
          ‹ Quit
        </button>
        <div className="rounded-xl bg-black/55 px-3 py-1.5 text-center backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-widest text-bull-green">
            Round {roundIdx + 1}/5 {chaos ? `• ${chaos.emoji}` : ''}
          </p>
          <p className="text-xs font-bold">{round.objective}</p>
        </div>
        <div className="pill bg-bull-panel/90 text-bull-gold">{total}</div>
      </div>
    ),
    [go, roundIdx, chaos, round.objective, total],
  );

  // ── Render by phase ───────────────────────────────────────────────────
  if (phase === 'chaos') {
    return (
      <ChaosWheel
        onResult={(m) => {
          setChaos(m);
          setPhase('intro');
        }}
      />
    );
  }

  if (phase === 'intro') {
    return (
      <div className="screen felt-bg items-center justify-center gap-4 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-bull-mute">Bullhitters Gauntlet</p>
        <h2 className="heading text-3xl text-bull-green">{round.title}</h2>
        <div className="panel w-full max-w-sm p-5">
          <p className="text-xs uppercase tracking-widest text-bull-mute">Objective</p>
          <p className="mt-1 text-lg font-bold">{round.objective}</p>
          {chaos && (
            <div className="mt-3 rounded-lg bg-bull-red/20 px-3 py-2 text-sm">
              <span className="font-black text-bull-red">CHAOS: {chaos.emoji} {chaos.name}</span>
              <br />
              <span className="text-bull-mute">{chaos.desc}</span>
            </div>
          )}
          {round.boss && (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-bull-panel2 px-3 py-2 text-sm">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-bull-black"
                style={{ background: getCharacter(round.boss.rival).color }}
              >
                {getCharacter(round.boss.rival).initials}
              </span>
              <span className="font-bold">
                {getCharacter(round.boss.rival).name.split(' ')[0]} set {round.boss.target}. Beat it.
              </span>
            </div>
          )}
          <p className="mt-3 text-xs text-bull-mute">
            {dartsThisRound} dart{dartsThisRound > 1 ? 's' : ''} this round
          </p>
        </div>
        <button className="btn-green w-full max-w-sm text-lg" onClick={() => setPhase('playing')}>
          Throw Darts
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="screen felt-bg items-center justify-center gap-4 p-6 text-center">
        <div className="animate-pop text-6xl">{lastPassed ? '✅' : '❌'}</div>
        <h2 className="heading text-3xl text-bull-green">Round {roundIdx + 1} Cleared!</h2>
        <p className="text-sm text-bull-mute">Round score: {roundPoints} • Total: {total}</p>
        <p className="rounded-lg bg-bull-panel2 px-4 py-2 text-sm font-bold italic">{banter}</p>
        <button
          className="btn-green w-full max-w-sm text-lg"
          onClick={() => startRound(roundIdx + 1)}
        >
          Next Round ›
        </button>
      </div>
    );
  }

  if (phase === 'over' && summary) {
    return (
      <ResultsCard
        title={summary.won ? 'GAUNTLET CLEARED!' : 'Gauntlet Over'}
        subtitle={
          summary.won
            ? 'You survived all five. Filthy.'
            : `Knocked out on Round ${summary.reached}/5`
        }
        grade={summary.won ? '🏆' : `${summary.reached}/5`}
        gradeColor={summary.won ? '#ffd23f' : '#ff2d4b'}
        stats={[
          { label: 'Total score', value: summary.total },
          { label: 'Best ever', value: Math.max(summary.total, state.best.gauntlet) },
        ]}
        coinsEarned={summary.coins}
        isBest={summary.isBest}
        banter={pickRivalBanter(character.id)}
        primaryLabel="Run It Back"
        onPlayAgain={() => {
          setTotal(0);
          setSummary(null);
          startRound(0);
        }}
        onChangeCharacter={() => go('characters')}
        onHome={() => go('home')}
      />
    );
  }

  // phase === 'playing'
  return (
    <DartStage
      character={character}
      chaos={chaos}
      dartColor={dartColor}
      boardColor={boardColor}
      landed={darts}
      dartsRemaining={remaining}
      dartsPerRound={dartsThisRound}
      specialAvailable={!specialUsed}
      onUseSpecial={() => setSpecialUsed(true)}
      resolve={resolve}
      onThrow={onThrow}
      hud={hud}
    />
  );
}
