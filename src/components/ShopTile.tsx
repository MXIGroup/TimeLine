'use client';

import type { ShopInfo } from '@/data/shops';

interface ShopTileProps {
  shop: ShopInfo;
  selected: boolean;
  onClick: () => void;
}

/** Colourful supermarket tile shown in a grid on the "choose your shop" screen. */
export function ShopTile({ shop, selected, onClick }: ShopTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex aspect-[5/3] flex-col items-center justify-center rounded-3xl border-2 px-2 text-center font-extrabold transition ${
        shop.bg
      } ${shop.text} ${
        selected
          ? `border-lime-500 ring-2 ${shop.ring} scale-[1.02] shadow-md animate-pop-in`
          : 'border-transparent hover:scale-[1.01]'
      }`}
    >
      <span className="text-base leading-tight">{shop.name}</span>
      {selected && (
        <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-lime-500 text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}
    </button>
  );
}
