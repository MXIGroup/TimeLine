'use client';

import Link from 'next/link';
import type { Recipe, ShopName } from '@/types';
import { TagBadge } from './TagBadge';
import { gbp, minutes } from '@/lib/format';

interface MealCardProps {
  recipe: Recipe;
  day: string;
  shop: ShopName;
}

// A pool of soft gradients used for the image placeholder, picked by recipe id.
const GRADIENTS = [
  'from-rossi-yellow to-rossi-orange',
  'from-rossi-mint to-rossi-blue',
  'from-rossi-pink to-rossi-lavender',
  'from-lime-200 to-rossi-mint',
  'from-rossi-blue to-rossi-lavender',
  'from-rossi-orange to-rossi-yellow',
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

/** Tappable meal card shown in the weekly plan list. */
export function MealCard({ recipe, day, shop }: MealCardProps) {
  const cost = recipe.costByShop[shop];

  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition active:scale-[0.99] hover:shadow-md animate-fade-up"
    >
      <div
        className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${gradientFor(
          recipe.id,
        )}`}
      >
        <span className="text-6xl drop-shadow-sm">{recipe.emoji}</span>
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-rossi-ink shadow-sm">
          {day}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-rossi-ink/80 px-3 py-1 text-xs font-extrabold text-white">
          {gbp(cost)}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-extrabold leading-tight text-rossi-ink">{recipe.title}</h3>
        <div className="mt-1 flex items-center gap-3 text-sm font-semibold text-gray-400">
          <span>⏱ {minutes(recipe.timeMinutes)}</span>
          <span>🍽 {recipe.servings} servings</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>
      </div>
    </Link>
  );
}
