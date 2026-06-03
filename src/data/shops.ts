import type { ShopName, CostByShop } from '@/types';

export interface ShopInfo {
  name: ShopName;
  /** Tailwind background + text colour classes for the tile. */
  bg: string;
  text: string;
  ring: string;
  /**
   * Price multiplier relative to the Tesco baseline (1.0).
   * NOTE: These are static, illustrative UK price indices for the MVP.
   * ───────────────────────────────────────────────────────────────────
   * 🔌 INTEGRATION POINT: replace this static multiplier with live pricing
   * from a real supermarket price API (e.g. a basket-pricing provider)
   * to compute true per-shop ingredient costs.
   * ───────────────────────────────────────────────────────────────────
   */
  priceMultiplier: number;
}

export const SHOPS: ShopInfo[] = [
  { name: 'Tesco', bg: 'bg-rossi-blue', text: 'text-blue-900', ring: 'ring-blue-400', priceMultiplier: 1.0 },
  { name: "Sainsbury's", bg: 'bg-rossi-orange', text: 'text-orange-900', ring: 'ring-orange-400', priceMultiplier: 1.04 },
  { name: 'ASDA', bg: 'bg-rossi-mint', text: 'text-emerald-900', ring: 'ring-emerald-400', priceMultiplier: 0.97 },
  { name: 'Morrisons', bg: 'bg-rossi-yellow', text: 'text-yellow-900', ring: 'ring-yellow-400', priceMultiplier: 0.99 },
  { name: 'Lidl', bg: 'bg-rossi-lavender', text: 'text-violet-900', ring: 'ring-violet-400', priceMultiplier: 0.88 },
  { name: 'Aldi', bg: 'bg-rossi-pink', text: 'text-pink-900', ring: 'ring-pink-400', priceMultiplier: 0.86 },
  { name: 'Co-op', bg: 'bg-lime-100', text: 'text-lime-800', ring: 'ring-lime-400', priceMultiplier: 1.08 },
  { name: 'M&S', bg: 'bg-emerald-100', text: 'text-emerald-900', ring: 'ring-emerald-500', priceMultiplier: 1.18 },
  { name: 'Waitrose', bg: 'bg-green-100', text: 'text-green-900', ring: 'ring-green-500', priceMultiplier: 1.15 },
];

export const SHOP_NAMES: ShopName[] = SHOPS.map((s) => s.name);

export function getShop(name: ShopName): ShopInfo {
  return SHOPS.find((s) => s.name === name) ?? SHOPS[0];
}

/** Build a per-shop cost object from a Tesco-baseline cost. */
export function buildCostByShop(baseCost: number): CostByShop {
  const out = {} as CostByShop;
  for (const shop of SHOPS) {
    out[shop.name] = Math.round(baseCost * shop.priceMultiplier * 100) / 100;
  }
  return out;
}
