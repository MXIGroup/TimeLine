# Rossi Food 🥗

**Your week. Deliciously sorted.**

Rossi Food is a UK-focused, mobile-first weekly **dinner planning** web app. Answer a
few quick questions — your supermarket, weekly budget, meal vibes, dietary needs and
kitchen equipment — and Rossi Food generates a full Monday–Friday dinner plan that
stays under budget, complete with a combined shopping list and full recipe pages.

> Dinner planning without the faff.

---

## ✨ Features

- **Guided onboarding** — shop → budget → vibe → dietary → kitchen, with a smooth
  progress bar and sticky bottom CTAs.
- **Smart meal plan generator** — filters 79 realistic UK recipes by diet and
  equipment, scores them against your chosen vibes, adjusts prices for your shop, and
  builds a varied 5-dinner week that fits your budget.
- **Combined shopping list** — ingredients merged across recipes, grouped by aisle,
  tickable, with native share / clipboard fallback.
- **Recipe detail pages** — cost, time, servings, macros, ingredients, method,
  required equipment, allergens and dietary tags.
- **Regenerate** any time for a fresh combination.
- **LocalStorage persistence** — refresh and your plan is still there. No login, no
  database, no backend.

## 🧱 Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19
- TypeScript
- Tailwind CSS
- A tiny dependency-free store built on `useSyncExternalStore` + `localStorage`

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
# open http://localhost:3000

# 3. Production build
npm run build && npm start

# Type-check only
npm run typecheck
```

No environment variables are required.

## 🗺️ Routes

| Route                  | Screen                                  |
| ---------------------- | --------------------------------------- |
| `/`                    | Landing                                 |
| `/onboarding/shop`     | Choose your shop                        |
| `/onboarding/budget`   | Weekly dinner budget                    |
| `/onboarding/vibe`     | Meal vibes (up to 3)                    |
| `/onboarding/dietary`  | Dietary needs                           |
| `/onboarding/kitchen`  | Kitchen equipment                       |
| `/loading`             | "Leave it with us…" generating screen   |
| `/plan`                | Weekly dinner plan + cost summary       |
| `/shopping-list`       | Combined, tickable shopping list        |
| `/recipe/[id]`         | Full recipe detail                      |

## 📁 Project structure

```
src/
├── app/                # Next.js App Router routes
├── components/         # Reusable UI (AppShell, MealCard, ShoppingList, …)
├── data/
│   ├── recipes.ts      # 79 recipes (costs derived from ingredients + shop multipliers)
│   ├── shops.ts        # Supermarkets, colours and static price multipliers
│   └── options.ts      # Vibes, dietary needs, equipment, constants
├── lib/
│   ├── generateMealPlan.ts  # The meal plan algorithm
│   ├── shoppingList.ts      # Ingredient aggregation + grouping + sharing
│   └── format.ts            # Currency / time helpers
├── store/
│   └── useAppStore.ts  # Dependency-free persisted state store
└── types/              # Shared TypeScript types
```

## 🧮 How the meal plan generator works

`generateMealPlan(preferences)` in `src/lib/generateMealPlan.ts`:

1. **Filter** recipes by dietary needs (e.g. vegan recipes are valid for veggie users).
2. **Filter** by available equipment, relaxing the rule with a friendly warning if too
   few recipes match.
3. **Score** each recipe by how many chosen vibes it matches, with a gentle nudge
   toward cheaper meals.
4. **Adjust** every recipe's cost using the selected shop's price multiplier.
5. **Build** hundreds of random 5-meal combinations, preferring distinct main
   ingredients for variety.
6. **Pick** the highest-scoring combination that fits the budget — or, if nothing fits,
   the cheapest best-matching set plus a clear over-budget warning. If a full week
   genuinely can't be built, a friendly error suggests loosening filters.

## 💷 Pricing data

Supermarket prices in this MVP are **static, illustrative UK estimates**. Each recipe's
cost is derived from its ingredient costs, then scaled per shop by a price multiplier in
`src/data/shops.ts`.

> 🔌 **Integration point:** to use live pricing, replace `priceMultiplier` /
> `buildCostByShop` in `src/data/shops.ts` (and the per-ingredient costs) with calls to a
> real supermarket price API. The data flow downstream (meal plan + shopping list totals)
> already reads from these values, so no UI changes are needed.

## 📝 MVP limitations

- Static estimated prices — no live supermarket APIs yet.
- No authentication, no payments, no database.
- Recipe images are represented by emoji/gradient placeholders.
