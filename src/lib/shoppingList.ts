import type { Recipe, ShoppingListItem, ShopName, IngredientCategory } from '@/types';
import { getShop } from '@/data/shops';
import { slugify } from './format';

// Order categories appear in on the shopping list.
export const CATEGORY_ORDER: IngredientCategory[] = [
  'Fruit & Veg',
  'Meat & Fish',
  'Dairy & Eggs',
  'Bakery',
  'Frozen',
  'Store Cupboard',
  'Herbs & Spices',
  'Other',
];

export const CATEGORY_EMOJI: Record<IngredientCategory, string> = {
  'Fruit & Veg': '🥦',
  'Meat & Fish': '🥩',
  'Dairy & Eggs': '🧀',
  'Store Cupboard': '🥫',
  Bakery: '🍞',
  Frozen: '❄️',
  'Herbs & Spices': '🌿',
  Other: '🛒',
};

// Per-ingredient emoji overrides for a friendlier list (falls back to category).
const NAME_EMOJI: Record<string, string> = {
  chicken: '🍗',
  beef: '🥩',
  turkey: '🦃',
  salmon: '🐟',
  cod: '🐟',
  tuna: '🐟',
  prawn: '🦐',
  sausage: '🌭',
  gammon: '🥓',
  chorizo: '🌭',
  egg: '🥚',
  tofu: '🧊',
  paneer: '🧀',
  halloumi: '🧀',
  feta: '🧀',
  mozzarella: '🧀',
  cheddar: '🧀',
  cheese: '🧀',
  milk: '🥛',
  cream: '🥛',
  yoghurt: '🥛',
  rice: '🍚',
  pasta: '🍝',
  spaghetti: '🍝',
  noodle: '🍜',
  gnocchi: '🥟',
  orzo: '🍚',
  couscous: '🍚',
  potato: '🥔',
  tomato: '🍅',
  pepper: '🫑',
  onion: '🧅',
  garlic: '🧄',
  carrot: '🥕',
  courgette: '🥒',
  cucumber: '🥒',
  aubergine: '🍆',
  mushroom: '🍄',
  broccoli: '🥦',
  spinach: '🥬',
  lettuce: '🥬',
  cabbage: '🥬',
  pea: '🫛',
  sweetcorn: '🌽',
  corn: '🌽',
  lemon: '🍋',
  lime: '🍋',
  lentil: '🫘',
  bean: '🫘',
  chickpea: '🫘',
  avocado: '🥑',
  pineapple: '🍍',
  coconut: '🥥',
  bread: '🍞',
  bun: '🍔',
  flatbread: '🫓',
  tortilla: '🌯',
  wrap: '🌯',
  squash: '🎃',
  leek: '🥬',
  ginger: '🫚',
  jackfruit: '🥭',
};

function emojiFor(name: string, category: IngredientCategory): string {
  const lower = name.toLowerCase();
  for (const key of Object.keys(NAME_EMOJI)) {
    if (lower.includes(key)) return NAME_EMOJI[key];
  }
  return CATEGORY_EMOJI[category];
}

/**
 * Combine all ingredients across the chosen recipes into a single shopping list.
 * Ingredients with the same name + unit are merged (quantities + costs summed).
 * Different units of the same item are listed separately, as requested.
 * Costs are adjusted for the selected shop.
 */
export function buildShoppingList(recipes: Recipe[], shop: ShopName): ShoppingListItem[] {
  const multiplier = getShop(shop).priceMultiplier;
  const map = new Map<string, ShoppingListItem>();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}__${ing.unit.toLowerCase()}`;
      const adjustedCost = ing.estimatedCost * multiplier;
      const existing = map.get(key);
      if (existing) {
        existing.quantity = Math.round((existing.quantity + ing.quantity) * 100) / 100;
        existing.estimatedCost = Math.round((existing.estimatedCost + adjustedCost) * 100) / 100;
      } else {
        map.set(key, {
          id: `${slugify(ing.name)}-${slugify(ing.unit)}`,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          category: ing.category,
          estimatedCost: Math.round(adjustedCost * 100) / 100,
          emoji: emojiFor(ing.name, ing.category),
        });
      }
    }
  }

  // Sort by category order, then alphabetically within a category.
  return Array.from(map.values()).sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name);
  });
}

/** Group a flat shopping list into its categories, preserving the canonical order. */
export function groupByCategory(
  items: ShoppingListItem[],
): { category: IngredientCategory; items: ShoppingListItem[] }[] {
  const groups: { category: IngredientCategory; items: ShoppingListItem[] }[] = [];
  for (const category of CATEGORY_ORDER) {
    const inCategory = items.filter((i) => i.category === category);
    if (inCategory.length) groups.push({ category, items: inCategory });
  }
  return groups;
}

/** Plain-text version of the shopping list for sharing/clipboard. */
export function shoppingListToText(items: ShoppingListItem[], shop: ShopName): string {
  const lines: string[] = [`🛒 Rossi Food shopping list — ${shop}`, ''];
  for (const { category, items: group } of groupByCategory(items)) {
    lines.push(`${CATEGORY_EMOJI[category]} ${category}`);
    for (const item of group) {
      lines.push(`  • ${item.name} — ${item.quantity} ${item.unit}`);
    }
    lines.push('');
  }
  lines.push('Made with Rossi Food — your week, deliciously sorted.');
  return lines.join('\n');
}
