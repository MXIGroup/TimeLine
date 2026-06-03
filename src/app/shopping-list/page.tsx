'use client';

import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ShoppingList } from '@/components/ShoppingList';
import { useAppState, useHydrated } from '@/store/useAppStore';

export default function ShoppingListPage() {
  const hydrated = useHydrated();
  const { plan } = useAppState();

  if (!hydrated) {
    return (
      <AppShell showBack>
        <div className="flex h-[60vh] items-center justify-center text-gray-300">Loading…</div>
      </AppShell>
    );
  }

  if (!plan || plan.recipeIds.length === 0) {
    return (
      <AppShell
        showBack
        footer={
          <Link href="/onboarding/shop" className="block">
            <PrimaryButton>Create a plan first</PrimaryButton>
          </Link>
        }
      >
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
          <div className="text-6xl">🧾</div>
          <h1 className="mt-4 text-2xl font-extrabold text-rossi-ink">No shopping list yet</h1>
          <p className="mt-2 text-gray-500">Generate a meal plan and your list appears here.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showBack>
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold text-rossi-ink">Shopping list</h1>
        <p className="mt-1 text-gray-500">Mon – Fri</p>
      </div>
      <div className="mt-5">
        <ShoppingList plan={plan} />
      </div>
    </AppShell>
  );
}
