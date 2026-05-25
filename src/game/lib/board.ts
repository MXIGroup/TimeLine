import type { Ring, ThrowResult } from '../types';

/** Numbers clockwise from the top (12 o'clock) on a regulation board. */
export const SEGMENT_ORDER = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

/** Normalised ring radii (1 = outer edge of the double ring). */
export const RADII = {
  innerBull: 0.0375, // 50
  outerBull: 0.094, // 25
  tripleInner: 0.582,
  tripleOuter: 0.629,
  doubleInner: 0.953,
  doubleOuter: 1.0,
};

const SEG_DEG = 360 / 20; // 18°

/** Fraction of the SVG size reserved around the board for the number ring. */
export const BOARD_INSET = 0.11;

/** Pixel radius of the scoring area (normalised 1.0) for a given SVG size. */
export function scoringRadiusPx(svgSize: number): number {
  return (svgSize * (1 - 2 * BOARD_INSET)) / 2;
}

/** Convert a polar point (radius, angle clockwise-from-top in degrees) to x/y. */
export function polarToXY(r: number, angleDeg: number): { x: number; y: number } {
  const a = (angleDeg * Math.PI) / 180;
  return { x: r * Math.sin(a), y: -r * Math.cos(a) };
}

/**
 * Resolve a normalised landing point ([-1,1], y positive = downward in screen
 * space) into the dartboard score for that single dart.
 */
export function scorePoint(x: number, y: number): ThrowResult {
  const r = Math.hypot(x, y);

  if (r <= RADII.innerBull) {
    return { x, y, base: 50, ring: 'bull', score: 50 };
  }
  if (r <= RADII.outerBull) {
    return { x, y, base: 25, ring: 'outerbull', score: 25 };
  }
  if (r > RADII.doubleOuter) {
    return { x, y, base: 0, ring: 'miss', score: 0 };
  }

  // Angle clockwise from the top, in [0, 360).
  let angle = (Math.atan2(x, -y) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  const index = Math.round(angle / SEG_DEG) % 20;
  const base = SEGMENT_ORDER[index];

  let ring: Ring = 'single';
  let mult = 1;
  if (r >= RADII.tripleInner && r <= RADII.tripleOuter) {
    ring = 'triple';
    mult = 3;
  } else if (r >= RADII.doubleInner) {
    ring = 'double';
    mult = 2;
  }

  return { x, y, base, ring, score: base * mult };
}

export interface SegmentPath {
  d: string;
  fill: string;
}

/** Colour palette mirroring a regulation board. */
const SINGLE_DARK = '#0e1311';
const SINGLE_LIGHT = '#e9e2c8';

/**
 * Build the SVG path data for the whole board at a given pixel size.
 * Returns the segment wedges plus bull circle radii so the caller can render
 * the bulls on top.
 */
export function buildBoardPaths(
  size: number,
  ringGreen = '#22e36b',
  ringRed = '#ff2d4b',
) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2;

  const pt = (rNorm: number, angleDeg: number) => {
    const { x, y } = polarToXY(rNorm * R, angleDeg);
    return { x: cx + x, y: cy + y };
  };

  const sector = (rInner: number, rOuter: number, a0: number, a1: number) => {
    const oStart = pt(rOuter, a0);
    const oEnd = pt(rOuter, a1);
    const iEnd = pt(rInner, a1);
    const iStart = pt(rInner, a0);
    const ro = rOuter * R;
    const ri = rInner * R;
    return (
      `M ${oStart.x.toFixed(2)} ${oStart.y.toFixed(2)} ` +
      `A ${ro.toFixed(2)} ${ro.toFixed(2)} 0 0 1 ${oEnd.x.toFixed(2)} ${oEnd.y.toFixed(2)} ` +
      `L ${iEnd.x.toFixed(2)} ${iEnd.y.toFixed(2)} ` +
      `A ${ri.toFixed(2)} ${ri.toFixed(2)} 0 0 0 ${iStart.x.toFixed(2)} ${iStart.y.toFixed(2)} Z`
    );
  };

  const segments: SegmentPath[] = [];

  for (let i = 0; i < 20; i++) {
    const a0 = i * SEG_DEG - SEG_DEG / 2;
    const a1 = a0 + SEG_DEG;
    const dark = i % 2 === 0;
    const singleFill = dark ? SINGLE_DARK : SINGLE_LIGHT;
    const ringFill = dark ? ringRed : ringGreen;

    // Inner single (outer bull → triple inner)
    segments.push({ d: sector(RADII.outerBull, RADII.tripleInner, a0, a1), fill: singleFill });
    // Triple ring
    segments.push({ d: sector(RADII.tripleInner, RADII.tripleOuter, a0, a1), fill: ringFill });
    // Outer single (triple outer → double inner)
    segments.push({ d: sector(RADII.tripleOuter, RADII.doubleInner, a0, a1), fill: singleFill });
    // Double ring
    segments.push({ d: sector(RADII.doubleInner, RADII.doubleOuter, a0, a1), fill: ringFill });
  }

  return {
    cx,
    cy,
    R,
    segments,
    bulls: {
      inner: RADII.innerBull * R,
      outer: RADII.outerBull * R,
      innerFill: ringRed,
      outerFill: ringGreen,
    },
    /** Position (px) for the ring of number labels just outside the board. */
    numbers: SEGMENT_ORDER.map((n, i) => {
      const angle = i * SEG_DEG;
      const { x, y } = polarToXY(1.085 * R, angle);
      return { n, x: cx + x, y: cy + y };
    }),
  };
}

/** Human label for a result, e.g. "T20", "D16", "BULL", "25", "MISS". */
export function resultLabel(res: ThrowResult): string {
  switch (res.ring) {
    case 'miss':
      return 'MISS';
    case 'bull':
      return 'BULL';
    case 'outerbull':
      return '25';
    case 'triple':
      return `T${res.base}`;
    case 'double':
      return `D${res.base}`;
    default:
      return `${res.base}`;
  }
}
