'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProgressBar } from '@/components/ProgressBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ShopTile } from '@/components/ShopTile';
import { SHOPS } from '@/data/shops';
import { useAppState, actions } from '@/store/useAppStore';

export default function ShopPage() {
  const router = useRouter();
  const { preferences } = useAppState();

  return (
    <AppShell
      showBack
      topSlot={<ProgressBar step={1} total={5} />}
      footer={
        <PrimaryButton
          disabled={!preferences.shop}
          onClick={() => router.push('/onboarding/budget')}
        >
          Continue
        </PrimaryButton>
      }
    >
      <h1 className="mt-2 text-3xl font-extrabold lowercase text-rossi-ink">choose your shop</h1>
      <p className="mt-1 text-gray-500">we’ll sort dinner for the week</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {SHOPS.map((shop) => (
          <ShopTile
            key={shop.name}
            shop={shop}
            selected={preferences.shop === shop.name}
            onClick={() => actions.setShop(shop.name)}
          />
        ))}
      </div>
    </AppShell>
  );
}
