'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CostSummary } from '@/components/CostSummary';
import { MealCard } from '@/components/MealCard';
import { DAYS } from '@/data/options';
import { getRecipe } from '@/data/recipes';
import { useAppState, useHydrated, actions } from '@/store/useAppStore';

export default function PlanPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { plan, checked } = useAppState();
  const [regenerating, setRegenerating] = useState(false);

  // Wait for client hydration before deciding what to show.
  if (!hydrated) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center text-gray-300">Loading…</div>
      </AppShell>
    );
  }

  // No plan yet — send the user into onboarding.
  if (!plan) {
    return (
      <AppShell footer={<Link href="/onboarding/shop"><PrimaryButton>Get started</PrimaryButton></Link>}>
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
          <div className="text-6xl">🍽️</div>
          <h1 className="mt-4 text-2xl font-extrabold text-rossi-ink">No plan yet</h1>
          <p className="mt-2 text-gray-500">Answer a few quick questions and we’ll sort your week.</p>
        </div>
      </AppShell>
    );
  }

  // Friendly error: we couldn't build a full plan.
  if (plan.recipeIds.length === 0) {
    return (
      <AppShell
        showBack
        footer={
          <div className="space-y-2">
            <Link href="/onboarding/budget" className="block">
              <PrimaryButton>Adjust budget &amp; filters</PrimaryButton>
            </Link>
          </div>
        }
      >
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
          <div className="text-6xl">😕</div>
          <h1 className="mt-4 text-2xl font-extrabold text-rossi-ink">We couldn’t build a plan</h1>
          <p className="mt-2 text-gray-500">
            {plan.warning ??
              'Try increasing your budget or reducing your dietary filters and equipment limits.'}
          </p>
        </div>
      </AppShell>
    );
  }

  const recipes = plan.recipeIds.map((id) => getRecipe(id)).filter(Boolean);
  const totalItems = plan.shoppingList.length;
  const doneItems = plan.shoppingList.filter((i) => checked[i.id]).length;

  function handleRegenerate() {
    setRegenerating(true);
    // Tiny delay so the button shows feedback, then build a fresh combination.
    setTimeout(() => {
      actions.regeneratePlan();
      setRegenerating(false);
    }, 250);
  }

  return (
    <AppShell
      footer={
        <PrimaryButton variant="primary" onClick={handleRegenerate} disabled={regenerating}>
          {regenerating ? 'Mixing things up…' : '↻ Regenerate plan'}
        </PrimaryButton>
      }
    >
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold lowercase text-rossi-ink">bon appétit!</h1>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-rossi-mint px-3 py-1 text-xs font-extrabold text-emerald-900">
          Planned for {plan.shop}
        </span>
      </div>

      {plan.warning && (
        <p className="mt-4 rounded-2xl bg-rossi-orange/60 px-4 py-3 text-sm font-semibold text-orange-900">
          ⚠️ {plan.warning}
        </p>
      )}

      <div className="mt-4">
        <CostSummary totalCost={plan.totalCost} budget={plan.budget} />
      </div>

      {/* Shopping list button */}
      <Link
        href="/shopping-list"
        className="mt-3 flex items-center justify-between rounded-3xl bg-rossi-yellow px-5 py-4 shadow-lg shadow-yellow-300/40 transition active:scale-[0.99]"
      >
        <span className="flex items-center gap-3">
          <span className="text-2xl">🧾</span>
          <span>
            <span className="block font-extrabold text-yellow-900">Shopping list</span>
            <span className="block text-xs font-semibold text-yellow-800/80">
              {totalItems} items · {doneItems} ticked off
            </span>
          </span>
        </span>
        <span className="text-yellow-900">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </Link>

      {/* Meal list Mon–Fri */}
      <div className="mt-6 space-y-4">
        {recipes.map((recipe, i) =>
          recipe ? (
            <MealCard key={recipe.id + i} recipe={recipe} day={DAYS[i]} shop={plan.shop} />
          ) : null,
        )}
      </div>

      <p className="mt-6 text-center text-xs text-gray-300">
        Prices are static UK estimates for this MVP.
      </p>
    </AppShell>
  );
}
