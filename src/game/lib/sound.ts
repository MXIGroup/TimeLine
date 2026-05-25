'use client';

/**
 * Tiny Web Audio synth so the game ships with no audio assets. Every sound is
 * generated on the fly. All calls are no-ops until the first user gesture
 * unlocks the AudioContext (mobile autoplay policy), and respect a mute flag.
 */

let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function unlockAudio(): void {
  ac();
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  gain: number,
) {
  const a = ac();
  if (!a || muted) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime + start);
  g.gain.setValueAtTime(0, a.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  osc.connect(g).connect(a.destination);
  osc.start(a.currentTime + start);
  osc.stop(a.currentTime + start + dur + 0.02);
}

function noiseBurst(start: number, dur: number, gain: number, lowpass = 1800) {
  const a = ac();
  if (!a || muted) return;
  const frames = Math.floor(a.sampleRate * dur);
  const buffer = a.createBuffer(1, frames, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = a.createBufferSource();
  src.buffer = buffer;
  const filter = a.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass;
  const g = a.createGain();
  g.gain.setValueAtTime(gain, a.currentTime + start);
  src.connect(filter).connect(g).connect(a.destination);
  src.start(a.currentTime + start);
}

/** Soft tick while dragging to aim. */
export function sfxAim(): void {
  tone(220, 0, 0.05, 'sine', 0.04);
}

/** The thud of a dart hitting the board. */
export function sfxThud(): void {
  noiseBurst(0, 0.09, 0.25, 1200);
  tone(140, 0, 0.08, 'triangle', 0.12);
}

/** Score blip whose pitch rises with how good the hit was. */
export function sfxScore(value: number): void {
  const f = 320 + Math.min(value, 60) * 8;
  tone(f, 0, 0.12, 'square', 0.08);
  tone(f * 1.5, 0.05, 0.12, 'square', 0.05);
}

/** A miss / weak throw. */
export function sfxMiss(): void {
  tone(180, 0, 0.18, 'sawtooth', 0.06);
  tone(120, 0.06, 0.2, 'sawtooth', 0.05);
}

/** Quick crowd "ooh/cheer" using filtered noise swells. */
export function sfxCrowd(big = false): void {
  noiseBurst(0, big ? 0.7 : 0.35, big ? 0.18 : 0.1, big ? 2600 : 1600);
  if (big) noiseBurst(0.15, 0.6, 0.12, 3200);
}

/** Big celebratory fanfare for 180s / round wins. */
export function sfxFanfare(): void {
  const notes = [392, 523, 659, 784];
  notes.forEach((n, i) => tone(n, i * 0.09, 0.3, 'square', 0.09));
  sfxCrowd(true);
}

/** Wheel ratchet tick. */
export function sfxTick(): void {
  tone(660, 0, 0.03, 'square', 0.05);
}
