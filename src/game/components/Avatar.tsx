'use client';

import { useState } from 'react';
import type { Character } from '../types';

interface AvatarProps {
  character: Character;
  /** Sizing + extra classes (e.g. "h-12 w-12"). */
  className?: string;
  /** Draw a coloured ring in the member's accent colour. */
  ring?: boolean;
}

/**
 * Circular member portrait. Uses the character photo when present and falls
 * back to coloured initials if the image is missing or fails to load.
 */
export function Avatar({ character, className = '', ring = false }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full font-black text-bull-black ${className}`;
  const ringStyle = ring ? { boxShadow: `0 0 0 2px ${character.color}` } : undefined;

  if (character.image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={character.image}
        alt={character.name}
        onError={() => setFailed(true)}
        className={`${base} object-cover`}
        style={ringStyle}
      />
    );
  }

  return (
    <span className={base} style={{ background: character.color, ...ringStyle }}>
      {character.initials}
    </span>
  );
}
