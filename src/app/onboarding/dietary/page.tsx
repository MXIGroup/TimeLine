'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProgressBar } from '@/components/ProgressBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { DietarySelector } from '@/components/DietarySelector';

export default function DietaryPage() {
  const router = useRouter();

  return (
    <AppShell
      showBack
      topSlot={<ProgressBar step={4} total={5} />}
      footer={
        <PrimaryButton onClick={() => router.push('/onboarding/kitchen')}>Continue</PrimaryButton>
      }
    >
      <h1 className="mt-2 text-3xl font-extrabold lowercase text-rossi-ink">any dietary needs?</h1>
      <p className="mt-1 text-gray-500">pick all that apply</p>

      <div className="mt-6">
        <DietarySelector />
      </div>
    </AppShell>
  );
}
