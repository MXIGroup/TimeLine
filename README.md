# Bullhitters Darts Bonanza

A mobile-first, swipe-to-throw darts game built around the four Bullhitters.
Fast, funny, replayable — play a round in under a minute, then go again.

> This branch (`claude/bullhitters-darts-game-*`) is dedicated to the game.
> The MXI Campaign Tracker lives on its own branch.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000 — open on a phone or a narrow window
```

```bash
npm run build    # production build
npm run typecheck
```

No backend, no accounts, no database. All progress (coins, unlocks, best
scores, selected character) is saved to `localStorage`.

## How to play

- **Drag up to throw.** Press anywhere, drag up toward the board, release.
  Direction aims, distance sets power, and the green ring shows your spread.
- **Play Gauntlet** — the flagship mode: 5 escalating rounds, Chaos Wheel
  twists, rival banter, and a boss finale. Fail an objective and the run ends.
- **Quick Challenge** — 30-second bursts: Treble Hunt, Bullseye Blitz, 180 Chase.
- **Characters** — Ollie, Bailey, Dan and DC each play differently (aim,
  risk multiplier, and a one-per-round special move).
- **Rewards** — spend coins on dart skins, board skins, celebrations and
  reaction lines. No pay-to-win.

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS. The game is a single
client-rendered route. Sound effects are synthesised with the Web Audio API,
so there are no audio assets to ship.

## Layout

```
src/app                 Next.js entry (root layout + page mounting the game)
src/game                The whole game
  data/                 Characters, reactions/banter, chaos modifiers, rewards, challenges
  lib/                  Dartboard geometry + scoring, localStorage, Web Audio SFX
  components/           Dartboard SVG, DartStage (throw mechanic), Chaos Wheel, results
  screens/              Home, Character Select, Gauntlet, Quick Challenge, Rewards, Tutorial
  GameProvider.tsx      Persisted state (coins, unlocks, best scores, equipped)
  Game.tsx              Screen router
```
