import type { Recipe, Preferences, MealPlan, Dietary, Equipment } from '@/types';
import { RECIPES } from '@/data/recipes';
import { getShop } from '@/data/shops';
import { buildShoppingList } from './shoppingList';
import { BASIC_EQUIPMENT } from '@/data/options';

const MEALS_PER_WEEK = 5;
const COMBO_ATTEMPTS = 400;

/**
 * Does a recipe satisfy a single dietary need?
 * 'None' is treated as no constraint by the caller.
 */
function meetsDietaryNeed(recipe: Recipe, need: Dietary): boolean {
  const d = recipe.dietary;
  switch (need) {
    case 'None':
      return true;
    case 'Veggie':
      return d.includes('Veggie') || d.includes('Vegan');
    case 'Vegan':
      return d.includes('Vegan');
    case 'Pescatarian':
      // Veggie/vegan meals are fine for pescatarians, plus explicitly pescatarian ones.
      return d.includes('Pescatarian') || d.includes('Veggie') || d.includes('Vegan');
    case 'Gluten free':
      return d.includes('Gluten free') && !recipe.allergens.includes('Gluten');
    case 'Dairy free':
      return (d.includes('Dairy free') || d.includes('Vegan')) && !recipe.allergens.includes('Dairy');
    case 'Nut free':
      return !recipe.allergens.includes('Nuts') && !recipe.allergens.includes('Peanuts');
    case 'High protein':
      return d.includes('High protein') || recipe.tags.includes('High Protein');
    case 'Low calorie':
      return d.includes('Low calorie') || recipe.tags.includes('Low Calorie');
    default:
      return true;
  }
}

function meetsAllDietary(recipe: Recipe, needs: Dietary[]): boolean {
  const active = needs.filter((n) => n !== 'None');
  return active.every((need) => meetsDietaryNeed(recipe, need));
}

/** All required equipment must be available to the user (basics are always allowed). */
function meetsEquipment(recipe: Recipe, available: Equipment[]): boolean {
  const allowed = new Set<Equipment>([...available, ...BASIC_EQUIPMENT]);
  return recipe.equipment.every((eq) => allowed.has(eq));
}

/** Score a recipe by how well it matches the chosen vibes (more matches = higher). */
function scoreRecipe(recipe: Recipe, prefs: Preferences): number {
  let score = 0;
  for (const vibe of prefs.vibes) {
    if (recipe.tags.includes(vibe)) score += 10;
  }
  // Gentle nudge toward cheaper meals so plans trend under budget.
  const cost = recipe.costByShop[prefs.shop ?? 'Tesco'];
  score += Math.max(0, 8 - cost) * 0.5;
  return score;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Combo {
  recipes: Recipe[];
  totalCost: number;
  totalScore: number;
}

/**
 * Build a single candidate plan of 5 meals using a randomised greedy approach,
 * preferring high-scoring recipes while keeping main ingredients varied.
 */
function buildCombo(candidates: Recipe[], shopMultKey: Preferences['shop']): Combo {
  const shop = shopMultKey ?? 'Tesco';
  // Weight the shuffle toward higher scores by sorting tiers then shuffling within.
  const pool = shuffle(candidates);
  const chosen: Recipe[] = [];
  const usedMains = new Set<string>();

  // First pass: pick distinct main ingredients.
  for (const recipe of pool) {
    if (chosen.length >= MEALS_PER_WEEK) break;
    const main = recipe.mainIngredient.toLowerCase();
    if (usedMains.has(main)) continue;
    chosen.push(recipe);
    usedMains.add(main);
  }

  // Second pass: if we couldn't fill 5 with distinct mains, allow repeats.
  if (chosen.length < MEALS_PER_WEEK) {
    for (const recipe of pool) {
      if (chosen.length >= MEALS_PER_WEEK) break;
      if (chosen.includes(recipe)) continue;
      chosen.push(recipe);
    }
  }

  const totalCost =
    Math.round(chosen.reduce((s, r) => s + r.costByShop[shop], 0) * 100) / 100;
  const totalScore = chosen.reduce((s, r) => s + r.tags.length, 0);
  return { recipes: chosen, totalCost, totalScore };
}

/**
 * Generate a weekly dinner plan from the user's preferences.
 *
 * Steps:
 *  1. Filter recipes by dietary needs.
 *  2. Filter recipes by available equipment (relaxed if too few remain).
 *  3. Score recipes by selected vibes and adjust cost by shop.
 *  4. Build many random 5-meal combinations, preferring variety.
 *  5. Keep the highest-scoring combination that fits the budget.
 *  6. If nothing fits the budget, return the cheapest best-matching set + a warning.
 */
export function generateMealPlan(prefs: Preferences, recipes: Recipe[] = RECIPES): MealPlan {
  const shop = prefs.shop ?? 'Tesco';
  let warning: string | undefined;

  // 1. Dietary filter
  let candidates = recipes.filter((r) => meetsAllDietary(r, prefs.dietary));

  // 2. Equipment filter (relax if it leaves too few options)
  const withEquipment = candidates.filter((r) => meetsEquipment(r, prefs.equipment));
  if (withEquipment.length >= MEALS_PER_WEEK) {
    candidates = withEquipment;
  } else if (withEquipment.length > 0) {
    candidates = withEquipment;
    warning = 'Limited recipes match your kitchen — add more equipment for greater variety.';
  } else {
    warning = 'We couldn’t match your kitchen exactly, so we’ve included some recipes that need a little more.';
  }

  // Hard fail: not enough recipes for a full week.
  if (candidates.length < MEALS_PER_WEEK) {
    return {
      shop,
      budget: prefs.budget,
      recipeIds: [],
      totalCost: 0,
      shoppingList: [],
      warning:
        'We couldn’t build a full week with those filters. Try reducing your dietary needs or selecting more equipment.',
      generatedAt: Date.now(),
    };
  }

  // 3. Sort by score so the randomised builder favours strong matches.
  const scored = [...candidates].sort((a, b) => scoreRecipe(b, prefs) - scoreRecipe(a, prefs));
  // Bias the pool: duplicate the top matches so they're more likely to be picked.
  const topMatches = scored.slice(0, Math.min(scored.length, 18));
  const weightedPool = [...scored, ...topMatches];

  // 4 + 5. Try many combos, track best-under-budget and cheapest overall.
  let bestUnderBudget: Combo | null = null;
  let cheapest: Combo | null = null;

  for (let i = 0; i < COMBO_ATTEMPTS; i++) {
    const combo = buildCombo(weightedPool, prefs.shop);
    if (combo.recipes.length < MEALS_PER_WEEK) continue;

    if (!cheapest || combo.totalCost < cheapest.totalCost) {
      cheapest = combo;
    }
    if (combo.totalCost <= prefs.budget) {
      // Prefer the best-scoring; tie-break by lower cost.
      if (
        !bestUnderBudget ||
        combo.totalScore > bestUnderBudget.totalScore ||
        (combo.totalScore === bestUnderBudget.totalScore &&
          combo.totalCost < bestUnderBudget.totalCost)
      ) {
        bestUnderBudget = combo;
      }
    }
  }

  // 6. Choose the result.
  const chosen = bestUnderBudget ?? cheapest!;
  if (!bestUnderBudget && cheapest) {
    warning = `The cheapest great-matching plan we found is ${formatOver(
      cheapest.totalCost,
      prefs.budget,
    )} over budget. Try raising your budget or loosening your filters.`;
  }

  const shoppingList = buildShoppingList(chosen.recipes, shop);

  return {
    shop,
    budget: prefs.budget,
    recipeIds: chosen.recipes.map((r) => r.id),
    totalCost: chosen.totalCost,
    shoppingList,
    warning,
    generatedAt: Date.now(),
  };
}

function formatOver(cost: number, budget: number): string {
  const over = Math.max(0, cost - budget);
  return `£${over.toFixed(2)}`;
}
