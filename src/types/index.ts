// ---------------------------------------------------------------------------
// Rossi Food — core domain types
// ---------------------------------------------------------------------------

/** Supermarkets supported by the MVP. */
export type ShopName =
  | 'Tesco'
  | "Sainsbury's"
  | 'ASDA'
  | 'Morrisons'
  | 'Lidl'
  | 'Aldi'
  | 'Co-op'
  | 'M&S'
  | 'Waitrose';

/** Per-shop estimated total cost of a recipe. */
export type CostByShop = Record<ShopName, number>;

/** Meal "vibe" goals the user can prioritise. */
export type Vibe =
  | 'Quick & Easy'
  | 'High Protein'
  | 'Healthy Comfort'
  | 'Family Favourites'
  | 'British Classics'
  | 'Low Calorie'
  | 'Gut Friendly'
  | 'Fakeaway'
  | 'Batch Cook'
  | 'One Pot'
  | 'Spicy'
  | 'Budget Hero';

/** Dietary needs the plan must satisfy. */
export type Dietary =
  | 'None'
  | 'Veggie'
  | 'Vegan'
  | 'Pescatarian'
  | 'Gluten free'
  | 'Dairy free'
  | 'Nut free'
  | 'High protein'
  | 'Low calorie';

/** Kitchen equipment a recipe may require. */
export type Equipment =
  | 'Hob'
  | 'Oven'
  | 'Air fryer'
  | 'Microwave'
  | 'Slow cooker'
  | 'Blender'
  | 'Grill'
  | 'Rice cooker'
  | 'Toaster'
  | 'No special equipment';

/** Shopping list categories. */
export type IngredientCategory =
  | 'Fruit & Veg'
  | 'Meat & Fish'
  | 'Dairy & Eggs'
  | 'Store Cupboard'
  | 'Bakery'
  | 'Frozen'
  | 'Herbs & Spices'
  | 'Other';

export type Allergen =
  | 'Gluten'
  | 'Dairy'
  | 'Egg'
  | 'Fish'
  | 'Shellfish'
  | 'Nuts'
  | 'Peanuts'
  | 'Soya'
  | 'Sesame'
  | 'Mustard'
  | 'Celery'
  | 'Sulphites';

export interface Macros {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  /** Estimated cost in GBP at the Tesco baseline. */
  estimatedCost: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  timeMinutes: number;
  /** Total estimated cost (GBP) at the Tesco baseline; derived from ingredients. */
  estimatedCost: number;
  costByShop: CostByShop;
  /** Primary ingredient — used to keep meal plans varied. */
  mainIngredient: string;
  emoji: string;
  tags: Vibe[];
  dietary: Dietary[];
  allergens: Allergen[];
  equipment: Equipment[];
  macros: Macros;
  ingredients: Ingredient[];
  method: string[];
}

/** Everything the user chooses during onboarding. */
export interface Preferences {
  shop: ShopName | null;
  budget: number;
  vibes: Vibe[];
  dietary: Dietary[];
  equipment: Equipment[];
}

/** A single ingredient line on the combined shopping list. */
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  /** Shop-adjusted cost for the combined quantity. */
  estimatedCost: number;
  emoji: string;
}

/** Output of the meal plan generator. */
export interface MealPlan {
  shop: ShopName;
  budget: number;
  /** Five recipe ids, Monday → Friday. */
  recipeIds: string[];
  totalCost: number;
  shoppingList: ShoppingListItem[];
  /** Optional friendly warning (e.g. over budget). */
  warning?: string;
  generatedAt: number;
}
