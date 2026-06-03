'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RecipeDetail } from '@/components/RecipeDetail';
import { getRecipe } from '@/data/recipes';
import { useAppState } from '@/store/useAppStore';

export default function RecipePage() {
  const params = useParams<{ id: string }>();
  const recipe = getRecipe(params.id);
  const { preferences } = useAppState();

  if (!recipe) {
    return (
      <AppShell
        showBack
        footer={
          <Link href="/plan" className="block">
            <PrimaryButton>Back to plan</PrimaryButton>
          </Link>
        }
      >
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
          <div className="text-6xl">🤔</div>
          <h1 className="mt-4 text-2xl font-extrabold text-rossi-ink">Recipe not found</h1>
          <p className="mt-2 text-gray-500">It may have been removed from this week’s menu.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      showBack
      footer={
        <Link href="/shopping-list" className="block">
          <PrimaryButton variant="yellow">View shopping list</PrimaryButton>
        </Link>
      }
    >
      <RecipeDetail recipe={recipe} shop={preferences.shop ?? 'Tesco'} />
    </AppShell>
  );
}
