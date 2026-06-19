# Forge — Architecture & Contributor Guide

## Overview

Forge is a desktop application for Linux built with **React + Electron**. Data is stored locally in `localStorage` — no server, no account, no tracking.

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| UI | React 18 (functional + hooks) | Reactive, no classes, easy to contribute |
| Bundler | Vite 5 | Instant HMR, fast builds |
| Desktop | Electron 40 | System access (notifications, tray) |
| Packaging | electron-builder | AppImage + RPM for Linux |
| Styling | CSS with custom properties | No runtime CSS-in-JS, theming via `--var` |
| Fonts | Self-hosted in `/public/fonts/` | 100% offline |
| Charts | Chart.js 4 (npm, offline) | Works offline |
| Persistence | localStorage | Simple, offline, no server |
| i18n | Custom JSON in `src/i18n/` | No external library, easy to extend |

---

## Folder Structure

```
forge/
├── electron/
│   ├── main.js        # Main process: window, tray, notifications, IPC
│   └── preload.js     # Secure bridge renderer ↔ main (contextBridge)
│
├── src/
│   ├── App.tsx        # Root: global state, navigation, active month
│   ├── main.tsx       # React entry point
│   │
│   ├── components/
│   │   ├── Logo.tsx       # SVG logo (uses --acc and --gold CSS vars)
│   │   └── Onboarding.tsx # First-time setup wizard (4 steps)
│   │
│   ├── views/             # One view = one full screen
│   │   ├── TrackerView.tsx    # Monthly grid with drag & drop
│   │   ├── FocusView.tsx      # Today mode — large cards
│   │   ├── StatsView.tsx      # Statistics + comparison chart
│   │   ├── HeatmapView.tsx    # Annual heatmap
│   │   ├── GamifyView.tsx     # XP, levels, badges
│   │   └── ManageView.tsx     # Habit management + settings + export
│   │
│   ├── hooks/
│   │   ├── useHabitData.ts        # Main data hook (state, persistence, IPC)
│   │   ├── useGamificationWorker.ts # Web Worker for gamification
│   │   ├── useUndo.ts             # Single-entry undo stack
│   │   └── useAccent.ts           # Hook: injects accent palette into CSS vars
│   │
│   ├── utils/
│   │   ├── storage.ts         # loadData, saveData, makeKey, export/import
│   │   ├── gamification.ts    # XP, levels, badges — pure logic
│   │   ├── gamification.worker.ts # Web Worker entry point
│   │   ├── validate.ts        # Data validation and repair
│   │   ├── db.ts              # IndexedDB wrapper (dual storage)
│   │   ├── colors.ts          # Percentage color utility
│   │   ├── constants.ts       # APP_NAME, VERSION
│   │   └── sound.ts           # Web Audio API — check/uncheck sounds
│   │
│   ├── i18n/
│   │   └── translations.ts  # ES + EN + PT — no external library
│   │
│   ├── styles/
│   │   └── global.css       # CSS variables, themes, all components
│   │
│   └── test/
│       ├── setup.ts             # Test setup (jest-dom)
│       ├── gamification.test.ts # Gamification logic tests
│       ├── storage.test.ts      # Storage persistence tests
│       ├── validate.test.ts     # Validation tests
│       └── FocusView.test.tsx   # FocusView component tests
│
├── public/
│   └── fonts/         # WOFF2 fonts (generated with npm run download-fonts)
│
├── scripts/
│   └── download-fonts.js  # Downloads fonts for offline use
│
├── docs/
│   └── ARCHITECTURE.md    # This file
│
├── install.sh         # Installer for Fedora/KDE (AppImage → .desktop)
├── package.json
├── vite.config.ts
├── LICENSE            # MIT
└── README.md
```

---

## Data Model

### Key Format

**IMPORTANT**: Check keys use a numeric format independent of language:

```
"YYYY-MM-HI-DD"
  YYYY = year (e.g.: 2026)
  MM   = month 01-12 (NOT the month name)
  HI   = habit index (0-based)
  DD   = day of the month
```

**Why**: Previous versions used the month name in the active language (`"2026-January-0-5"`). When changing language, all keys broke. The `makeKey(year, month0, hi, day)` function in `storage.ts` generates the correct format.

### localStorage Structure (`forge_v131`)

```typescript
{
  version:   string,       // "1.3.1"
  onboarded: boolean,      // false = show onboarding
  profile: {
    name:      string,     // user's name
    lang:      "es"|"en"|"pt",
    theme:     "dark"|"light",
    accent:    string,     // id from ACCENT_PALETTES
    notifHour: number,     // 0-23
  },
  habits: Array<{
    name:  string,
    cat:   "salud"|"trabajo"|"mente"|"social"|"habitos"|"otro",
    type:  "boolean"|"negative"|"numeric",
    goal?: number,         // only for type:"numeric"
    unit?: string,         // only for type:"numeric"
    schedule?: {
      type: "daily" | "weekdays" | "interval",
      days?: number[],     // 0=Sun..6=Sat for weekdays
      interval?: number,   // every N days
      startDay?: number,   // day of month when interval starts
    },
  }>,
  checks:  Record<string, true>,   // "2026-06-3-15" → true
  numeric: Record<string, number>, // "2026-06-13-5" → 6 (glasses of water)
  notes:   Record<string, string>, // "2026-06-15"   → "daily note"
}
```

### Habit Types

| Type | Behavior |
|------|----------|
| `boolean` | Click → completed (green check) |
| `negative` | Click → failed (gold ✗). 0 checks = good |
| `numeric` | Left click +1, right click -1. Progress bar |

---

## Data Flow

```
localStorage
    │
    ▼
loadData() ──→ App.tsx (useState)
                   │
                   ├── monthStats (useMemo) ──→ TrackerView, StatsView
                   ├── gamStats   (useMemo) ──→ GamifyView
                   ├── xp/level   (useMemo) ──→ Header, GamifyView
                   │
                   └── update(patch) ──→ saveData() ──→ localStorage
```

---

## Theme & Color System

Colors are injected into `document.documentElement` via the `useAccent` hook:

```css
--acc       /* main accent color */
--acc-dim   /* 15% opacity version */
--acc-glow  /* 30% opacity version (for check glow) */
--acc-dark  /* dark version of accent */
--acc-1     /* for heatmap level 1 */
--acc-2     /* for heatmap level 2 */
```

Dark/light theme is controlled by the `.app.dark` / `.app.light` class on the root div.

---

## Electron ↔ React Communication

```
React                          Electron main
  │                                │
  ├── window.electronAPI.notify()  ──→ ipcMain.on("notify") ──→ Notification
  │
  ├── window.electronAPI.onDailyCheck(cb) ──← ipcMain: setInterval 24h
  │
  └── window.electronAPI.onNavigate(cb)  ──← Tray menu click
```

The `preload.js` exposes only necessary functions via `contextBridge` — never `nodeIntegration: true`.

---

## Gamification

The system is **stateless**: it recalculates from checks on every render.

```
computeStats(checks, habits)  →  { totalChecks, maxStreak, perfectDays, ... }
computeXP(stats)              →  XP number
getLevel(xp)                  →  { level, name, xpMin, xpMax }
getEarnedBadges(stats)        →  Badge[] with .earned boolean
```

To add a badge: edit the `BADGES` array in `utils/gamification.ts`.
To add a level: edit the `LEVELS` array.

---

## i18n

To add a new language:

1. Copy the `es` object in `src/i18n/translations.ts`
2. Translate all strings
3. Add the code (`"fr"`) and flag emoji
4. Onboarding will show it automatically

---

## How to Add a New View

1. Create `src/views/MyView.tsx`
2. Add it to the `navItems` array in `App.tsx`
3. Add `{view==="my-view"&&<MyView {...shared}/>}` in the JSX
4. Add translations in `src/i18n/translations.ts` under each language

---

## Code Conventions

- **Components**: functional + hooks, no classes
- **Styling**: CSS classes in `global.css`, inline only for dynamic values
- **Global state**: in `App.tsx` via `useState` + `update(patch)`
- **Local state**: `useState` inside the component that needs it
- **Check keys**: always use `makeKey(year, month0, hi, day)`
- **Commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`

---

## Roadmap

- [ ] Weekly view (7 days)
- [ ] Optional self-hosted sync (PocketBase / Supabase)
- [ ] Multiple user profiles
- [ ] PWA (installable without Electron)
- [ ] Import from Habitica CSV
- [ ] KDE Plasma widget
- [ ] More tests with Vitest

---

## Changelog (v1.3.1)

### Critical Bug Fixes

| # | File | Problem | Solution |
|---|------|---------|----------|
| 1 | `gamification.ts` | Used keys `"2026-January-0-5"` instead of numeric format | Migrated to `"2026-01-0-5"` via `KEY_RE` regex |
| 2 | `gamification.ts` | Streak regex didn't group by month correctly | Rewritten with `Map<hi, Map<monthKey, days[]>>` |
| 3 | `App.tsx` | `today` was a fixed `const` in module — got stale after midnight | `useState(getToday)` + `setInterval` every 60s |
| 4 | `App.tsx` | `onDailyCheck` registered a new listener on every `habits`/`checks` change | Moved to `useEffect(()=>{},[])` with `dataRef` for fresh data |
| 5 | `App.tsx` | `Math.max(...[])` = `-Infinity` with 0 habits → crash | Guard `if (habits.length===0)` before spread |
| 6 | `TrackerView.tsx` | Drag remap with `indexOf` was O(n²); `newToOld` was built but never used | Replaced with `Map` for O(n) |
| 7 | `ManageView.tsx` | Local settings didn't sync on JSON import | `useEffect` that syncs when `profile` changes |
| 8 | `storage.ts` | `saveData` failed silently on `QuotaExceededError` | Returns `boolean`; App shows error toast |
| 9 | `storage.ts` | CSV had no guaranteed order (`Object.keys` not ordered) | `entries.sort((a,b) => year, month, day)` before writing |
| 10 | `FocusView.tsx` | Used `today.getMonth()` instead of `monthIdx` from props | Added and used `monthIdx` prop in `makeKey` |
| 11 | `App.tsx` + `storage.ts` | `notes` used ad-hoc format, not `makeKey` | `makeNoteKey(year, month0, day)` centralizes format |
| 12 | `TrackerView.tsx` | `useRef` imported but never used → console warning | Import removed |
