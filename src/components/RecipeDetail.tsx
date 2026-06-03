'use client';

import type { Recipe, ShopName } from '@/types';
import { TagBadge } from './TagBadge';
import { MacroCard } from './MacroCard';
import { gbp, minutes } from '@/lib/format';

interface RecipeDetailProps {
  recipe: Recipe;
  /** Shop used to show the relevant price; defaults to Tesco. */
  shop?: ShopName;
}

/** Full recipe view: cost, time, macros, ingredients, method, equipment, allergens. */
export function RecipeDetail({ recipe, shop = 'Tesco' }: RecipeDetailProps) {
  const cost = recipe.costByShop[shop];

  return (
    <div className="space-y-6 pb-4">
      {/* Hero */}
      <div className="-mx-5 flex h-44 items-center justify-center bg-gradient-to-br from-lime-200 to-rossi-mint">
        <span className="text-8xl drop-shadow">{recipe.emoji}</span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold leading-tight text-rossi-ink">{recipe.title}</h1>
        <p className="mt-2 text-gray-500">{recipe.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.tags.map((t) => (
            <TagBadge key={t} label={t} />
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Cost" value={gbp(cost)} sub={`at ${shop}`} />
        <Stat label="Time" value={minutes(recipe.timeMinutes)} sub="to cook" />
        <Stat label="Serves" value={`${recipe.servings}`} sub="people" />
      </div>

      {/* Macros */}
      <section>
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-gray-400">
          Per serving
        </h2>
        <MacroCard macros={recipe.macros} />
      </section>

      {/* Ingredients */}
      <section>
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-gray-400">
          Ingredients
        </h2>
        <ul className="overflow-hidden rounded-2xl border border-gray-100">
          {recipe.ingredients.map((ing, i) => (
            <li
              key={`${ing.name}-${i}`}
              className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-0"
            >
              <span className="font-bold text-rossi-ink">{ing.name}</span>
              <span className="text-sm font-semibold text-gray-400">
                {ing.quantity} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Method */}
      <section>
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-gray-400">Method</h2>
        <ol className="space-y-3">
          {recipe.method.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-lime-500 text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <p className="pt-0.5 text-rossi-ink">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Equipment */}
      <section>
        <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-gray-400">
          Equipment
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {recipe.equipment.map((eq) => (
            <span
              key={eq}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600"
            >
              {eq}
            </span>
          ))}
        </div>
      </section>

      {/* Dietary + allergens */}
      <section className="grid grid-cols-1 gap-4">
        <div>
          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-gray-400">
            Dietary
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {recipe.dietary.length ? (
              recipe.dietary.map((d) => <TagBadge key={d} label={d} />)
            ) : (
              <span className="text-sm text-gray-400">No specific dietary tags</span>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-gray-400">
            Allergens
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {recipe.allergens.length ? (
              recipe.allergens.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-rossi-orange px-3 py-1 text-xs font-bold text-orange-900"
                >
                  {a}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">None of the 14 major allergens</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-2 py-3 text-center">
      <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-1 text-lg font-extrabold text-rossi-ink">{value}</div>
      <div className="text-[10px] font-semibold text-gray-400">{sub}</div>
    </div>
  );
}
