'use client';

import { useMemo } from 'react';
import { BOARD_INSET, buildBoardPaths } from '../lib/board';

interface DartboardProps {
  size: number;
  /** Surround / backing colour (board skin). */
  boardColor: string;
  /** Colour of landed dart markers (dart skin). */
  dartColor: string;
  /** Already-landed darts (normalised coords). */
  darts: { x: number; y: number }[];
  /** Live aim reticle (normalised coords) + spread radius (normalised). */
  reticle?: { x: number; y: number; spread: number } | null;
  showNumbers?: boolean;
}

export function Dartboard({
  size,
  boardColor,
  dartColor,
  darts,
  reticle,
  showNumbers = true,
}: DartboardProps) {
  // Board geometry lives inside an inset so the number ring + surround fit.
  const inset = showNumbers ? size * BOARD_INSET : size * 0.04;
  const boardSize = size - inset * 2;
  const geo = useMemo(() => buildBoardPaths(boardSize), [boardSize]);

  const toPx = (n: number) => inset + (n + 1) * (boardSize / 2);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="block touch-none"
      aria-hidden
    >
      {/* Surround / wire backing */}
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={boardColor} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 2}
        fill="none"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth={2}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={boardSize / 2 + inset * 0.45}
        fill="#08110c"
      />

      {/* Number ring */}
      {showNumbers &&
        geo.numbers.map(({ n, x, y }) => (
          <text
            key={n}
            x={x + inset}
            y={y + inset}
            fill="#e9e2c8"
            fontSize={Math.max(9, size * 0.034)}
            fontWeight={800}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Arial, sans-serif"
          >
            {n}
          </text>
        ))}

      <g transform={`translate(${inset}, ${inset})`}>
        {/* Segment wedges */}
        {geo.segments.map((s, i) => (
          <path key={i} d={s.d} fill={s.fill} stroke="rgba(0,0,0,0.45)" strokeWidth={0.6} />
        ))}
        {/* Spider wire between rings (thin overlay rings) */}
        <circle cx={geo.cx} cy={geo.cy} r={geo.R} fill="none" stroke="rgba(180,180,180,0.25)" strokeWidth={1} />
        {/* Bulls */}
        <circle cx={geo.cx} cy={geo.cy} r={geo.bulls.outer} fill={geo.bulls.outerFill} stroke="rgba(0,0,0,0.5)" strokeWidth={0.8} />
        <circle cx={geo.cx} cy={geo.cy} r={geo.bulls.inner} fill={geo.bulls.innerFill} stroke="rgba(0,0,0,0.5)" strokeWidth={0.8} />
      </g>

      {/* Live aim reticle + spread */}
      {reticle && (
        <g>
          <circle
            cx={toPx(reticle.x)}
            cy={toPx(reticle.y)}
            r={Math.max(6, reticle.spread * (boardSize / 2))}
            fill="rgba(34,227,107,0.12)"
            stroke="rgba(34,227,107,0.8)"
            strokeWidth={1.5}
          />
          <line
            x1={toPx(reticle.x) - 9}
            y1={toPx(reticle.y)}
            x2={toPx(reticle.x) + 9}
            y2={toPx(reticle.y)}
            stroke="#22e36b"
            strokeWidth={2}
          />
          <line
            x1={toPx(reticle.x)}
            y1={toPx(reticle.y) - 9}
            x2={toPx(reticle.x)}
            y2={toPx(reticle.y) + 9}
            stroke="#22e36b"
            strokeWidth={2}
          />
        </g>
      )}

      {/* Landed darts */}
      {darts.map((d, i) => (
        <g key={i} className="animate-pop">
          <circle cx={toPx(d.x)} cy={toPx(d.y)} r={size * 0.012} fill="#0a0c0a" />
          <circle cx={toPx(d.x)} cy={toPx(d.y)} r={size * 0.008} fill={dartColor} />
          <circle cx={toPx(d.x)} cy={toPx(d.y)} r={size * 0.02} fill="none" stroke={dartColor} strokeWidth={1} opacity={0.5} />
        </g>
      ))}
    </svg>
  );
}
