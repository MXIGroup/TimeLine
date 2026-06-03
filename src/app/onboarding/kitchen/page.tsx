'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProgressBar } from '@/components/ProgressBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EquipmentSelector } from '@/components/EquipmentSelector';
import { actions } from '@/store/useAppStore';

export default function KitchenPage() {
  const router = useRouter();

  function handleContinue() {
    // Generate the plan now, then show the loading screen before revealing it.
    actions.generatePlan();
    router.push('/loading');
  }

  return (
    <AppShell
      showBack
      topSlot={<ProgressBar step={5} total={5} />}
      footer={<PrimaryButton onClick={handleContinue}>Create my plan</PrimaryButton>}
    >
      <h1 className="mt-2 text-3xl font-extrabold lowercase text-rossi-ink">what’s in your kitchen?</h1>
      <p className="mt-1 text-gray-500">tap only what you’ve got or want to use</p>

      <div className="mt-6">
        <EquipmentSelector />
      </div>
    </AppShell>
  );
}
