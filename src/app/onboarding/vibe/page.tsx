'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProgressBar } from '@/components/ProgressBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { VibeSelector } from '@/components/VibeSelector';

export default function VibePage() {
  const router = useRouter();

  return (
    <AppShell
      showBack
      topSlot={<ProgressBar step={3} total={5} />}
      footer={
        <PrimaryButton onClick={() => router.push('/onboarding/dietary')}>Continue</PrimaryButton>
      }
    >
      <h1 className="mt-2 text-3xl font-extrabold lowercase text-rossi-ink">what kind of vibe?</h1>
      <p className="mt-1 text-gray-500">choose up to 3 options for this week’s meals</p>

      <div className="mt-6">
        <VibeSelector />
      </div>
    </AppShell>
  );
}
