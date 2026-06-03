'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProgressBar } from '@/components/ProgressBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BudgetSlider } from '@/components/BudgetSlider';
import { useAppState, actions } from '@/store/useAppStore';

export default function BudgetPage() {
  const router = useRouter();
  const { preferences } = useAppState();

  return (
    <AppShell
      showBack
      topSlot={<ProgressBar step={2} total={5} />}
      footer={
        <PrimaryButton onClick={() => router.push('/onboarding/vibe')}>Continue</PrimaryButton>
      }
    >
      <h1 className="mt-2 text-3xl font-extrabold lowercase text-rossi-ink">give us your budget</h1>
      <p className="mt-1 text-gray-500">we’ll keep your dinners under it</p>

      <div className="mt-12">
        <BudgetSlider value={preferences.budget} onChange={actions.setBudget} />
      </div>
    </AppShell>
  );
}
