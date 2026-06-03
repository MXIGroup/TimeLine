'use client';

import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TagBadge } from '@/components/TagBadge';
import { useAppState, useHydrated } from '@/store/useAppStore';

export default function LandingPage() {
  const hydrated = useHydrated();
  const { plan } = useAppState();
  const hasPlan = hydrated && plan && plan.recipeIds.length > 0;

  return (
    <AppShell
      footer={
        <div className="space-y-2">
          <Link href="/onboarding/shop" className="block">
            <PrimaryButton>Get started</PrimaryButton>
          </Link>
          {hasPlan && (
            <Link href="/plan" className="block">
              <PrimaryButton variant="secondary">View this week’s plan</PrimaryButton>
            </Link>
          )}
        </div>
      }
    >
      <div className="flex flex-col items-center pt-4 text-center">
        {/* Hero example meal card */}
        <div className="w-full overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-lg animate-pop-in">
          <div className="flex h-40 items-center justify-center bg-gradient-to-br from-rossi-yellow to-rossi-orange">
            <span className="text-7xl drop-shadow">🍗</span>
          </div>
          <div className="p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-rossi-ink px-2.5 py-1 text-xs font-extrabold text-white">
                Tonight
              </span>
              <span className="text-sm font-extrabold text-lime-600">£4.80</span>
            </div>
            <h3 className="mt-2 text-lg font-extrabold text-rossi-ink">
              Creamy Peri-Peri Chicken Rice Bowls
            </h3>
            <div className="mt-1 text-sm font-semibold text-gray-400">⏱ 30 min · 🍽 2 servings</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <TagBadge label="High Protein" />
              <TagBadge label="Fakeaway" />
            </div>
          </div>
        </div>

        <h1 className="mt-8 text-4xl font-extrabold leading-tight text-rossi-ink">
          Your week.
          <br />
          <span className="text-lime-500">Deliciously sorted.</span>
        </h1>
        <p className="mt-3 px-2 text-gray-500">
          Tell us your budget, tastes and kitchen. We’ll create a plan for dinners this week.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          <TagBadge label="UK supermarkets" color="bg-lime-100 text-lime-700" emoji="🛒" />
          <TagBadge label="5 dinners" color="bg-rossi-blue text-blue-900" emoji="📅" />
          <TagBadge label="Shopping list" color="bg-rossi-yellow text-yellow-900" emoji="🧾" />
        </div>
      </div>
    </AppShell>
  );
}
