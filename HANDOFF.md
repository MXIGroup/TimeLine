# Rossi Food — Launch Guide 🥗

Everything you need to get **Rossi Food** running locally. It's a Next.js
(React + TypeScript + Tailwind) mobile-first weekly **dinner planning** web app.

**No database, API keys, or environment variables are required** — it runs
entirely on local data.

---

## 1. Get the code

- **Repo:** https://github.com/MXIGroup/TimeLine
- **Branch:** `claude/rossi-food-mvp-s7HzT` ← use this exact branch

**With git:**

```bash
git clone https://github.com/MXIGroup/TimeLine.git
cd TimeLine
git checkout claude/rossi-food-mvp-s7HzT
```

**Without git (ZIP):** on the GitHub repo page, switch the branch dropdown to
`claude/rossi-food-mvp-s7HzT` → green **Code** button → **Download ZIP** →
unzip → `cd` into the folder.

## 2. Prerequisites

- **Node.js 20 or 22** — check with `node -v`. Install from https://nodejs.org
  if needed. (This bundles `npm`.)

## 3. Install & run

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

For a production build instead of dev mode:

```bash
npm run build
npm start
```

## 4. What you should see

Landing screen → tap **Get started** → answer the onboarding questions
(shop, budget, vibe, dietary needs, kitchen equipment) → the app generates a
5-dinner weekly plan with a combined shopping list and full recipe pages.
Your selections persist in the browser, so a refresh keeps your plan.

## 5. Handy scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the dev server (hot reload)     |
| `npm run build`     | Production build                      |
| `npm start`         | Serve the production build            |
| `npm run typecheck` | TypeScript check (no output = passing)|

## 6. Troubleshooting

- **`npm install` errors** — make sure `node -v` shows 20.x or 22.x, then try
  again. Send me the terminal output if it persists.
- **Port 3000 in use** — run `npm run dev -- -p 3001` and open
  http://localhost:3001.

More detail (routes, how the meal-plan generator works, project structure) is
in [`README.md`](./README.md).
