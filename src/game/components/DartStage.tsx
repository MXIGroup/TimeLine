'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Dartboard } from './Dartboard';
import { resultLabel, scoringRadiusPx, scorePoint } from '../lib/board';
import {
  sfxAim,
  sfxCrowd,
  sfxFanfare,
  sfxMiss,
  sfxScore,
  sfxThud,
  sfxTick,
  unlockAudio,
} from '../lib/sound';
import type { Character, ChaosModifier, ThrowResult } from '../types';
import type { ReactionTier } from '../data/reactions';
import { pickReaction } from '../data/reactions';

export interface ResolveInfo {
  special: Character['id'] | null;
  isLastDart: boolean;
}

export interface ResolvedThrow {
  points: number;
  tier: ReactionTier;
  label?: string;
}

interface DartStageProps {
  character: Character;
  chaos?: ChaosModifier | null;
  dartColor: string;
  boardColor: string;
  landed: ThrowResult[];
  dartsRemaining: number;
  dartsPerRound: number;
  specialAvailable: boolean;
  onUseSpecial: () => void;
  resolve: (raw: ThrowResult, info: ResolveInfo) => ResolvedThrow;
  onThrow: (raw: ThrowResult, resolved: ResolvedThrow) => void;
  hud?: React.ReactNode;
  disabled?: boolean;
  showDarts?: boolean;
}

type Mode = 'idle' | 'aiming' | 'accuracy';

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

/** Residual scatter even on a perfect tap, so aim still matters. */
const RESIDUAL = 0.02;

/** Triangle (ping-pong) wave in [-1, 1] with constant speed. */
function tri(x: number): number {
  const u = ((x % 1) + 1) % 1;
  return u < 0.5 ? 4 * u - 1 : 3 - 4 * u;
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
  const wobbleAmp = (chaos?.wobble ?? 0) * 0.03;

  const [pendingSpecial, setPendingSpecial] = useState<Character['id'] | null>(null);

  const [mode, setMode] = useState<Mode>('idle');
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [reticle, setReticle] = useState<{ x: number; y: number; spread: number } | null>(null);

  // Accuracy-bar state.
  const [marker, setMarker] = useState(0);
  const markerRef = useRef(0);
  const markerStartRef = useRef(0);
  const speedRef = useRef(0.9);
  const maxOffsetRef = useRef(0.5);
  const lockedAimRef = useRef<{ x: number; y: number } | null>(null);

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

  // ── Animate the accuracy marker while it's live ───────────────────────
  useEffect(() => {
    if (mode !== 'accuracy') return;
    let raf = 0;
    let lastTick = 0;
    const loop = () => {
      const t = (performance.now() - markerStartRef.current) / 1000;
      const pos = tri(t * speedRef.current);
      markerRef.current = pos;
      setMarker(pos);
      // Light tick as it crosses the centre.
      if (Math.abs(pos) < 0.06 && performance.now() - lastTick > 180) {
        lastTick = performance.now();
        sfxTick();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // Board layout in surface pixels.
  const boardSvg = Math.min(size.w * 0.94, size.h * 0.52) * boardScale;
  const boardTop = size.h * 0.04;
  const boardCenter = { x: size.w / 2, y: boardTop + boardSvg / 2 };
  const radiusPx = scoringRadiusPx(boardSvg);
  const anchor = { x: size.w / 2, y: size.h - size.h * 0.085 };
  const gain = Math.max(1.4, (anchor.y - boardCenter.y) / (size.h * 0.3));

  const canThrow = !disabled && dartsRemaining > 0;

  function screenToNorm(clientX: number, clientY: number) {
    const start = startRef.current!;
    const dragX = clientX - start.x;
    const dragY = clientY - start.y;
    const rx = anchor.x + dragX * gain;
    const ry = anchor.y + dragY * gain;
    let nx = (rx - boardCenter.x) / radiusPx;
    let ny = (ry - boardCenter.y) / radiusPx;
    const amp = pendingSpecial === 'dc' ? 0 : wobbleAmp;
    if (amp) {
      const ph = performance.now() / 120;
      nx += Math.sin(ph) * amp;
      ny += Math.cos(ph * 1.3) * amp;
    }
    nx = Math.max(-1.35, Math.min(1.35, nx));
    ny = Math.max(-1.35, Math.min(1.35, ny));
    return { nx, ny, dragY };
  }

  /** Difficulty of the accuracy bar for this dart. */
  function accuracyParams() {
    let speed = 0.9 + (chaos?.wobble ?? 0) * 0.5 + (chaos?.extraSpread ?? 0) * 3;
    let maxOffset = 0.5 / character.aimFactor + (chaos?.extraSpread ?? 0);
    switch (pendingSpecial) {
      case 'dc': // Ice Cold — slows the meter
        speed *= 0.5;
        maxOffset *= 0.8;
        break;
      case 'dan': // Clutch Mode — pin-tight
        speed *= 0.8;
        maxOffset *= 0.45;
        break;
      case 'bailey': // Send It — fast + wild
        speed *= 1.4;
        maxOffset *= 1.45;
        break;
      case 'ollie': // Chaos Shot — random
        speed *= 0.6 + Math.random() * 1.2;
        maxOffset *= 0.7 + Math.random() * 0.8;
        break;
    }
    return { speed, maxOffset };
  }

  function startAiming(e: React.PointerEvent) {
    unlockAudio();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setMode('aiming');
    setReticle({ x: 0, y: 0.35, spread: 0.5 / character.aimFactor });
  }

  function enterAccuracy(nx: number, ny: number) {
    const { speed, maxOffset } = accuracyParams();
    speedRef.current = speed;
    maxOffsetRef.current = maxOffset;
    lockedAimRef.current = { x: nx, y: ny };
    setReticle({ x: nx, y: ny, spread: maxOffset });
    markerStartRef.current = performance.now();
    markerRef.current = -1;
    setMarker(-1);
    setMode('accuracy');
  }

  function commitThrow(lx: number, ly: number) {
    const raw = scorePoint(lx, ly);
    const isLastDart = dartsRemaining <= 1;
    const resolved = resolve(raw, { special: pendingSpecial, isLastDart });
    showFeedback(raw, resolved);
    setPendingSpecial(null);
    onThrow(raw, resolved);
  }

  function lockAccuracy() {
    const m = markerRef.current;
    const maxOffset = maxOffsetRef.current;
    const aim = lockedAimRef.current!;
    const residual = RESIDUAL / character.aimFactor;
    const ang = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random()) * residual;
    // Mistiming pushes the dart off the target — sideways most of all.
    const lx = aim.x + m * maxOffset + Math.cos(ang) * rad;
    const ly = aim.y + (Math.random() * 2 - 1) * Math.abs(m) * maxOffset * 0.5 + Math.sin(ang) * rad;
    setReticle(null);
    setMode('idle');
    commitThrow(lx, ly);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (mode === 'accuracy') {
      lockAccuracy();
      return;
    }
    if (mode === 'idle' && canThrow) startAiming(e);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (mode !== 'aiming' || !startRef.current) return;
    const { nx, ny } = screenToNorm(e.clientX, e.clientY);
    setReticle({ x: nx, y: ny, spread: 0.5 / character.aimFactor });
    if (Math.random() < 0.12) sfxAim();
  }

  function onPointerUp(e: React.PointerEvent) {
    if (mode !== 'aiming' || !startRef.current) return;
    const { nx, ny, dragY } = screenToNorm(e.clientX, e.clientY);
    const minUp = size.h * 0.04;
    startRef.current = null;
    // Require a deliberate upward swipe to lock the aim; otherwise cancel.
    if (dragY > -minUp) {
      setReticle(null);
      setMode('idle');
      return;
    }
    enterAccuracy(nx, ny);
  }

  function showFeedback(raw: ThrowResult, resolved: ResolvedThrow) {
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

    sfxThud();
    if (raw.ring === 'miss') sfxMiss();
    else sfxScore(raw.score);

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
  }

  function handleSpecial() {
    if (!specialAvailable || pendingSpecial || mode !== 'idle') return;
    unlockAudio();
    setPendingSpecial(character.id);
    onUseSpecial();
    sfxCrowd(false);
  }

  const markerPct = ((marker + 1) / 2) * 100;
  const markerColor =
    Math.abs(marker) < 0.12 ? '#22e36b' : Math.abs(marker) < 0.3 ? '#ffd23f' : '#ff2d4b';
  const hint =
    mode === 'accuracy'
      ? 'TAP to set accuracy!'
      : mode === 'aiming'
        ? 'Release to lock your aim'
        : canThrow
          ? 'Drag up to aim'
          : '—';

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

      {/* Floating score pops */}
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

      {/* Bottom control zone */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <button
            onClick={handleSpecial}
            disabled={!specialAvailable || !!pendingSpecial || disabled || mode !== 'idle'}
            className={`btn px-3 py-2 text-xs ${
              pendingSpecial
                ? 'bg-bull-gold text-bull-black shadow-glowGold animate-pulse'
                : specialAvailable && mode === 'idle'
                  ? 'bg-bull-red text-white shadow-glowRed'
                  : 'border-2 border-bull-panel2 bg-bull-panel text-bull-mute'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            ⚡ {character.specialName}
          </button>
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

        {/* Accuracy bar (only while a throw is being timed) */}
        <div className="relative h-5 w-full overflow-hidden rounded-full bg-bull-panel2">
          {/* Centre target zone */}
          <div className="absolute inset-y-0 left-1/2 w-[18%] -translate-x-1/2 rounded-full bg-bull-green/25" />
          <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-bull-gold/70" />
          {mode === 'accuracy' && (
            <div
              className="absolute top-1/2 h-7 w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${markerPct}%`, background: markerColor, boxShadow: `0 0 10px ${markerColor}` }}
            />
          )}
        </div>
        <p
          className={`mt-1 text-center text-xs font-bold uppercase tracking-widest ${
            mode === 'accuracy' ? 'animate-pulse text-bull-gold' : 'text-bull-mute'
          }`}
        >
          {hint}
        </p>
      </div>
    </div>
  );
}
