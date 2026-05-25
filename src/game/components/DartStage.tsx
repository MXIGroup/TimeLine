'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Dartboard } from './Dartboard';
import { resultLabel, scoringRadiusPx, scorePoint } from '../lib/board';
import {
  sfxAim,
  sfxCrowd,
  sfxFanfare,
  sfxMiss,
  sfxScore,
  sfxThud,
  unlockAudio,
} from '../lib/sound';
import type { Character, ChaosModifier, ThrowResult } from '../types';
import type { ReactionTier } from '../data/reactions';
import { pickReaction } from '../data/reactions';

export interface ResolveInfo {
  /** The character special active for this dart, if any. */
  special: Character['id'] | null;
  isLastDart: boolean;
}

export interface ResolvedThrow {
  /** Points to award (mode-specific). */
  points: number;
  /** Reaction tier, drives banter + sound + shake. */
  tier: ReactionTier;
  /** Optional override for the floating label (defaults to board label). */
  label?: string;
}

interface DartStageProps {
  character: Character;
  chaos?: ChaosModifier | null;
  dartColor: string;
  boardColor: string;
  /** Darts already landed and shown on the board this round. */
  landed: ThrowResult[];
  /** Darts the player may still throw (0 = input locked). */
  dartsRemaining: number;
  /** Total darts this round (for last-dart detection). */
  dartsPerRound: number;
  specialAvailable: boolean;
  onUseSpecial: () => void;
  /** Parent-owned scoring. Returns points + reaction tier for the dart. */
  resolve: (raw: ThrowResult, info: ResolveInfo) => ResolvedThrow;
  /** Fires after the dart lands and is scored. */
  onThrow: (raw: ThrowResult, resolved: ResolvedThrow) => void;
  hud?: React.ReactNode;
  disabled?: boolean;
  /** Show the per-round dart dots (hidden for timed modes). */
  showDarts?: boolean;
}

const BASE_SPREAD = 0.062;

interface Size {
  w: number;
  h: number;
}

interface FloatPop {
  id: number;
  text: string;
  color: string;
  big: boolean;
}

export function DartStage({
  character,
  chaos,
  dartColor,
  boardColor,
  landed,
  dartsRemaining,
  dartsPerRound,
  specialAvailable,
  onUseSpecial,
  resolve,
  onThrow,
  hud,
  disabled = false,
  showDarts = true,
}: DartStageProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size>({ w: 360, h: 640 });

  const boardScale = chaos?.boardScale ?? 1;
  const wobbleAmp = (chaos?.wobble ?? 0) * 0.035;

  // Pending one-shot special applied to the next dart.
  const [pendingSpecial, setPendingSpecial] = useState<Character['id'] | null>(null);

  // Aim state.
  const aimingRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [reticle, setReticle] = useState<{ x: number; y: number; spread: number } | null>(null);
  const [power, setPower] = useState(0);
  const [phase, setPhase] = useState(0);

  // Ephemeral feedback.
  const [pops, setPops] = useState<FloatPop[]>([]);
  const [reaction, setReaction] = useState<{ text: string; tier: ReactionTier } | null>(null);
  const [shake, setShake] = useState(false);
  const [bigBanner, setBigBanner] = useState<string | null>(null);
  const popId = useRef(0);

  // ── Measure the play surface ──────────────────────────────────────────
  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Wobble ticker while aiming ────────────────────────────────────────
  useEffect(() => {
    if (!wobbleAmp) return;
    let raf = 0;
    const loop = () => {
      if (aimingRef.current) setPhase((p) => p + 0.18);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [wobbleAmp]);

  // Board layout in surface pixels.
  const boardSvg = Math.min(size.w * 0.94, size.h * 0.52) * boardScale;
  const boardTop = size.h * 0.04;
  const boardCenter = { x: size.w / 2, y: boardTop + boardSvg / 2 };
  const radiusPx = scoringRadiusPx(boardSvg);
  const anchor = { x: size.w / 2, y: size.h - size.h * 0.085 };
  const gain = Math.max(1.4, (anchor.y - boardCenter.y) / (size.h * 0.3));

  const computeSpread = useCallback(() => {
    let spread = BASE_SPREAD / character.aimFactor + (chaos?.extraSpread ?? 0);
    const sp = pendingSpecial;
    if (sp === 'bailey') spread *= 1.85;
    else if (sp === 'dan') spread *= 0.35;
    else if (sp === 'dc') spread *= 0.45;
    else if (sp === 'ollie') spread *= 0.6 + Math.random() * 0.9;
    return spread;
  }, [character.aimFactor, chaos?.extraSpread, pendingSpecial]);

  const screenToNorm = useCallback(
    (clientX: number, clientY: number) => {
      const start = startRef.current!;
      const dragX = clientX - start.x;
      const dragY = clientY - start.y;
      const rx = anchor.x + dragX * gain;
      const ry = anchor.y + dragY * gain;
      let nx = (rx - boardCenter.x) / radiusPx;
      let ny = (ry - boardCenter.y) / radiusPx;
      // Apply DC ice-cold wobble cancel.
      const amp = pendingSpecial === 'dc' ? 0 : wobbleAmp;
      if (amp) {
        nx += Math.sin(phase) * amp;
        ny += Math.cos(phase * 1.3) * amp;
      }
      nx = Math.max(-1.35, Math.min(1.35, nx));
      ny = Math.max(-1.35, Math.min(1.35, ny));
      const dragLen = Math.hypot(dragX, dragY);
      return { nx, ny, dragLen, dragY };
    },
    [anchor.x, anchor.y, boardCenter.x, boardCenter.y, gain, radiusPx, phase, wobbleAmp, pendingSpecial],
  );

  const canThrow = !disabled && dartsRemaining > 0;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!canThrow) return;
      unlockAudio();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      aimingRef.current = true;
      startRef.current = { x: e.clientX, y: e.clientY };
      setReticle({ x: 0, y: 0.35, spread: computeSpread() });
      setPower(0);
    },
    [canThrow, computeSpread],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!aimingRef.current || !startRef.current) return;
      const { nx, ny, dragLen } = screenToNorm(e.clientX, e.clientY);
      const p = Math.min(1.5, dragLen / (size.h * 0.3));
      setPower(p);
      setReticle({ x: nx, y: ny, spread: computeSpread() });
      if (Math.random() < 0.15) sfxAim();
    },
    [screenToNorm, size.h, computeSpread],
  );

  const showFeedback = useCallback(
    (raw: ThrowResult, resolved: ResolvedThrow) => {
      const label = resolved.label ?? `${resultLabel(raw)}  +${resolved.points}`;
      const big = resolved.tier === 'huge';
      const id = ++popId.current;
      const color =
        resolved.tier === 'huge'
          ? '#ffd23f'
          : resolved.tier === 'good'
            ? '#22e36b'
            : resolved.tier === 'bad'
              ? '#ff2d4b'
              : '#eef2ee';
      setPops((prev) => [...prev.slice(-3), { id, text: label, color, big }]);
      setTimeout(() => setPops((prev) => prev.filter((p) => p.id !== id)), 1000);

      setReaction({ text: pickReaction(resolved.tier), tier: resolved.tier });
      setTimeout(() => setReaction(null), 2200);

      // Sound + shake.
      sfxThud();
      if (raw.ring === 'miss') {
        sfxMiss();
      } else {
        sfxScore(raw.score);
      }
      if (big) {
        const shouts = ['FILTHY!', 'OUTRAGEOUS!', 'GET IN!', 'MASSIVE!', 'BOSH!'];
        setBigBanner(shouts[Math.floor(Math.random() * shouts.length)]);
        setTimeout(() => setBigBanner(null), 1500);
        sfxFanfare();
        setShake(true);
        setTimeout(() => setShake(false), 420);
      } else if (resolved.tier === 'good') {
        sfxCrowd(false);
      }
    },
    [],
  );

  const throwDart = useCallback(
    (nx: number, ny: number) => {
      const spread = computeSpread();
      // Uniform random point within the spread disc.
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.sqrt(Math.random()) * spread;
      const lx = nx + Math.cos(ang) * rad;
      const ly = ny + Math.sin(ang) * rad;
      const raw = scorePoint(lx, ly);
      const isLastDart = dartsRemaining <= 1;
      const resolved = resolve(raw, { special: pendingSpecial, isLastDart });
      showFeedback(raw, resolved);
      setPendingSpecial(null);
      onThrow(raw, resolved);
    },
    [computeSpread, dartsRemaining, pendingSpecial, resolve, onThrow, showFeedback],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!aimingRef.current || !startRef.current) return;
      aimingRef.current = false;
      const { nx, ny, dragY } = screenToNorm(e.clientX, e.clientY);
      const minUp = size.h * 0.04;
      setReticle(null);
      setPower(0);
      // Require a deliberate upward swipe; otherwise cancel (no dart used).
      if (dragY > -minUp) {
        startRef.current = null;
        return;
      }
      startRef.current = null;
      throwDart(nx, ny);
    },
    [screenToNorm, size.h, throwDart],
  );

  const handleSpecial = () => {
    if (!specialAvailable || pendingSpecial) return;
    unlockAudio();
    setPendingSpecial(character.id);
    onUseSpecial();
    sfxCrowd(false);
  };

  const powerPct = Math.min(100, (power / 1.2) * 100);
  const inSweetSpot = power >= 0.55 && power <= 0.95;

  return (
    <div
      ref={surfaceRef}
      className={`relative h-full w-full touch-none overflow-hidden felt-bg ${shake ? 'animate-shake' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* HUD */}
      {hud && <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3">{hud}</div>}

      {/* Board */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: boardTop }}>
        <Dartboard
          size={boardSvg}
          boardColor={boardColor}
          dartColor={dartColor}
          darts={landed}
          reticle={reticle}
        />
      </div>

      {/* Floating score pops near the board centre */}
      <div
        className="pointer-events-none absolute z-30 flex flex-col items-center"
        style={{ left: 0, right: 0, top: boardCenter.y - 40 }}
      >
        {pops.map((p) => (
          <div
            key={p.id}
            className={`heading animate-floatUp text-shadow-hard ${p.big ? 'text-5xl' : 'text-3xl'}`}
            style={{ color: p.color }}
          >
            {p.text}
          </div>
        ))}
      </div>

      {/* Big banner */}
      {bigBanner && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <div className="heading animate-sweep180 text-center text-4xl text-bull-gold text-shadow-hard">
            {bigBanner}
          </div>
        </div>
      )}

      {/* Reaction card */}
      {reaction && (
        <div className="pointer-events-none absolute inset-x-0 z-30 flex justify-center" style={{ top: boardTop + boardSvg + 8 }}>
          <div
            className={`animate-slideInRight max-w-[88%] rounded-xl px-4 py-2 text-center text-sm font-bold text-shadow-hard ${
              reaction.tier === 'huge'
                ? 'bg-bull-gold/90 text-bull-black'
                : reaction.tier === 'good'
                  ? 'bg-bull-green/90 text-bull-black'
                  : reaction.tier === 'bad'
                    ? 'bg-bull-red/90 text-white'
                    : 'bg-bull-panel2 text-bull-chalk'
            }`}
          >
            {reaction.text}
          </div>
        </div>
      )}

      {/* Throw zone / power meter */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          {/* Special move */}
          <button
            onClick={handleSpecial}
            disabled={!specialAvailable || !!pendingSpecial || disabled}
            className={`btn px-3 py-2 text-xs ${
              pendingSpecial
                ? 'bg-bull-gold text-bull-black shadow-glowGold animate-pulse'
                : specialAvailable
                  ? 'bg-bull-red text-white shadow-glowRed'
                  : 'border-2 border-bull-panel2 bg-bull-panel text-bull-mute'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            ⚡ {character.specialName}
          </button>
          {/* Darts remaining dots */}
          {showDarts && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: dartsPerRound }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full ${
                    i < dartsRemaining ? 'bg-bull-green shadow-glowGreen' : 'bg-bull-panel2'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Power bar */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-bull-panel2">
          <div
            className={`h-full transition-[width] duration-75 ${inSweetSpot ? 'bg-bull-green' : 'bg-bull-red'}`}
            style={{ width: `${powerPct}%` }}
          />
          {/* Sweet-spot band */}
          <div className="absolute inset-y-0" style={{ left: '55%', width: '33%', boxShadow: 'inset 0 0 0 2px rgba(255,210,63,0.7)' }} />
        </div>
        <p className="mt-1 text-center text-xs font-bold uppercase tracking-widest text-bull-mute">
          {canThrow ? 'Drag up to throw' : '—'}
        </p>
      </div>
    </div>
  );
}
