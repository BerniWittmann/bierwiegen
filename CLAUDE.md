# Bierwiegen — Developer Notes for Claude

## What this project is

**Bierwiegen** is a web app for **Bier-Golf**, a precision drinking game. Players weigh their beer at each round, try to drink to a target weight ("Par"), and the player with the smallest |delta| wins the round and announces the next Par. The game ends when all beers are empty.

## Tech Stack

- **Next.js 15** (App Router, TypeScript, static export)
- **Tailwind CSS v3** with custom design tokens (dark beer-themed color scheme)
- **React 19** with Context + `useReducer`-style state
- **localStorage** for game persistence (key: `bwv3`)
- **Playwright** for end-to-end tests

## Project Structure

```
app/
  layout.tsx        # Root layout (Google Fonts via <link>, metadata, viewport)
  page.tsx          # Main page — wraps GameProvider, routes to active tab
  globals.css       # Tailwind directives + global input/body styles

lib/
  types.ts          # TypeScript interfaces: GameState, Player, Round, Entry, TabName
  gameLogic.ts      # Pure helpers: remainingBefore(), loadState(), saveState()
  gameState.tsx     # React Context: GameProvider + useGame() hook

components/
  Header.tsx        # App title
  Nav.tsx           # Tab navigation (4 tabs)
  Toast.tsx         # Fixed toast notification
  tabs/
    SetupTab.tsx    # Player management, first-par input, start/reset game
    RundeTab.tsx    # Live round scoring: par-setter, per-player entry cards,
                    # delta pills, finish-round / end-game buttons
    TabelleTab.tsx  # Scrollable scorecard table with medals and totals
    RanglisteTab.tsx # Leaderboard ranked by total delta

public/
  manifest.json     # PWA manifest
  sw.js             # Service Worker (offline caching)
  icon.svg          # Beer emoji icon

e2e/
  setup.spec.ts     # Tests: player add/remove, validation, game start
  game.spec.ts      # Tests: scoring, round flow, tabs, localStorage

.github/workflows/
  e2e.yml           # CI: build + Playwright tests on push/PR
  deploy.yml        # Deployment workflow
```

## Key Design Decisions

### State Management
Global state lives in `lib/gameState.tsx` as a React Context. Every mutation calls `saveState()` which writes to `localStorage` immediately. There is no debouncing — the state is authoritative.

### Fonts
Google Fonts are loaded with `media="print"` + `onLoad="this.media='all'"` to be non-blocking. CSS variables (`--font-bebas`, `--font-dm-mono`, `--font-nunito`) are set in `:root` in `globals.css` and used by Tailwind's `font-bebas`, `font-mono`, `font-nunito` classes.

### Tailwind Custom Tokens
Defined in `tailwind.config.ts`:
- Colors: `bg`, `bg2`, `surface`, `surface2`, `border`, `gold`, `amber`, `cream`, `green`, `red`, `blue`, `muted`
- Fonts: `font-bebas`, `font-mono` (DM Mono), `font-nunito`

## Development Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Serve production build
npm run test:e2e     # Run Playwright e2e tests (needs server running or builds itself)
npm run test:e2e:ui  # Open Playwright UI mode
```

## Running Tests Locally

The Playwright config uses `reuseExistingServer: true` in non-CI mode, so start the server first:

```bash
npm run build && npm run start &
npm run test:e2e
```

The tests are in `e2e/` and cover all 4 tabs, game logic, and localStorage persistence.

### Playwright Environment Notes
- Uses Chromium. In sandboxed environments, the config sets `--no-sandbox` and `--disable-setuid-sandbox`.
- All `page.goto()` calls use `{ waitUntil: 'domcontentloaded' }` because Google Fonts are loaded externally (non-blocking but they do count toward the `load` event in some environments).
- Browser executable: `/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome`

## Game Logic

The core scoring rules (implemented in `RundeTab.tsx` and `lib/gameLogic.ts`):

1. Each player starts with a full beer (`startWeight`)
2. Each round has a `par` (target weight to drink down to)
3. `drunk = remainingBefore(player, round) - endWeight`
4. `absDelta = |endWeight - par|` — lower is better
5. Next round caller = player with smallest `absDelta` in the current round
6. Game ends when all players' remaining beer ≤ 0

`remainingBefore(S, pi, roundIdx)` computes how much beer player `pi` had left before `roundIdx` by summing all `drunk` values from earlier rounds.
