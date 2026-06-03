'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { AppShell } from '@/components/AppShell';
import { LoadingChecklist } from '@/components/LoadingChecklist';

export default function LoadingPage() {
  const router = useRouter();
  const onComplete = useCallback(() => router.replace('/plan'), [router]);

  return (
    <AppShell hideHeader>
      <div className="flex min-h-[80vh] flex-col">
        <LoadingChecklist onComplete={onComplete} />
      </div>
    </AppShell>
  );
}
