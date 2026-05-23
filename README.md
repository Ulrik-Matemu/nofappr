# Streakly

Privacy-first habit quitting tracker built with Vite, React, TypeScript, Tailwind CSS v4, `motion`, and PWA support.

This app is intentionally simple: it runs fully in the browser, stores all user data in `localStorage`, and has no backend, auth, sync, or server-side persistence. The codebase is small enough to refactor quickly, but the state logic is concentrated in one storage module and should be understood before changing behavior.

## What The App Does

The product is a single-screen mobile-first tracker with five primary areas:

- `Streak`: shows current streak in days, a live timer since the current start timestamp, and a reset action.
- `Stats`: shows longest streak, relapse count, weekly progress, monthly clean-day history, and achievement badges.
- `Check-In`: stores one mood entry per day.
- `Urge`: runs a guided 60-second breathing session and shows a motivational quote.
- `Journal`: stores one journal entry per day and exposes journal history.

On first launch, the user is blocked by onboarding. Finishing onboarding marks the user as onboarded and initializes the streak start date to the current time.

## Stack

- React 19
- TypeScript
- Vite using `rolldown-vite`
- Tailwind CSS v4 via `@tailwindcss/vite`
- `motion` for animation
- `lucide-react` for tab icons
- `vite-plugin-pwa` + Workbox for install/offline support

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

`npm` also works, but the lockfile is `pnpm-lock.yaml`, so `pnpm` is the canonical package manager.

## Runtime Model

There is no remote state. Everything user-specific lives in `localStorage`.

Boot flow:

1. `src/main.tsx` mounts the app and registers the PWA service worker through `src/pwa.ts`.
2. `src/App.tsx` reads onboarding status from storage.
3. If onboarding is incomplete, `Onboarding` is rendered.
4. If onboarding is complete, the tab shell is rendered and feature components are lazy-loaded.

The app is effectively an offline-first SPA. If `localStorage` is cleared, all user progress is lost.

## Source Map

### App Shell

- `src/main.tsx`: React entrypoint and PWA registration.
- `src/App.tsx`: top-level shell, onboarding gate, lazy loading, animated tab switching, bottom navigation.
- `src/index.css`: global Tailwind import and custom font registration.

### State And Persistence

- `src/utils/storage.ts`: single source of truth for browser persistence and derived streak/stat helpers.

This file owns:

- onboarding state
- streak start date
- relapse history
- daily mood check-ins
- daily journal entries
- achievements/badge unlock state

### Features

- `src/components/Onboarding.tsx`: 3-step first-run flow.
- `src/components/StreakCounter.tsx`: current streak, live timer, reset action, unlock toast.
- `src/components/Stats.tsx`: summary metrics, weekly chart, monthly chart, achievements section.
- `src/components/Achievements.tsx`: badge grid.
- `src/components/CheckIn.tsx`: mood selection and navigation to mood history.
- `src/components/MoodHistory.tsx`: historical mood list.
- `src/components/Journal.tsx`: daily journal editor and history toggle.
- `src/components/JournalHistory.tsx`: expandable journal history list.
- `src/components/UrgeKiller.tsx`: breathing timer and quote display.

### Static / PWA

- `vite.config.ts`: Vite plugins and PWA manifest/workbox setup.
- `public/manifest.json`: static manifest asset.
- `public/icons/*`: installable app icons.
- `public/privacy.html`: standalone privacy page.
- `dev-dist/*`: generated dev PWA artifacts.

## Storage Schema

All persisted keys are defined in `src/utils/storage.ts`.

| Key | Purpose |
| --- | --- |
| `nofap_start_date` | ISO timestamp for current streak start |
| `nofap_check_ins` | JSON array of `{ date, mood }` |
| `nofap_journal` | JSON array of `{ date, text }` |
| `nofap_onboarding_complete` | `'true'` when onboarding is finished |
| `nofap_relapse_history` | JSON array of ISO timestamps for reset events |
| `nofap_achievements` | JSON array of unlocked badge ids with unlock dates |

No migrations exist. Any storage shape change must be handled manually in code.

## Core Logic

### Onboarding

- `getOnboardingStatus()` checks whether onboarding is complete.
- `handleFinish()` in `Onboarding` calls `resetStreak()` and then `setOnboardingComplete()`.
- On a true first run, `resetStreak()` initializes `nofap_start_date` without writing a relapse entry because there is no prior start date.

### Streak Calculation

- `getStreak()` reads `nofap_start_date`.
- It computes `now - startDate`, converts to whole days, and floors the value.
- Negative results are clamped to `0`.

This means the streak is based on elapsed 24-hour periods, not calendar-day boundaries.

### Reset / Relapse Logic

- `resetStreak()` appends the current timestamp to `nofap_relapse_history` if a streak already exists.
- It then replaces `nofap_start_date` with the current timestamp.

Operationally, a reset means:

- current streak becomes `0`
- the reset timestamp is treated as a relapse event
- future charts and derived stats use that timestamp as a boundary marker

### Check-In Logic

- `saveCheckIn(mood)` writes one mood per calendar date in `YYYY-MM-DD` format.
- Saving again on the same day overwrites the existing entry.
- `getTodayMood()` is used to hydrate the check-in UI.

### Journal Logic

- `saveJournalEntry(text)` stores one entry per calendar date.
- Saving again on the same day overwrites the same-day entry.
- `Journal.tsx` currently clears the textarea after save, even though the stored entry still exists and can be recovered on reload.

### Achievement Logic

Badges are hardcoded in `BADGES` with day thresholds:

- 3
- 7
- 14
- 30
- 90

`checkAchievements(currentStreak)` unlocks any badge whose threshold is met and persists unlock timestamps.

### Stats Logic

`Stats.tsx` derives all charts client-side from the storage layer.

- Longest streak comes from `getLongestStreak()`.
- Total relapses is `relapse_history.length`.
- Weekly chart estimates streak progress for each day of the current week using reset timestamps.
- Monthly chart counts clean days by treating relapse dates as "unclean" days and other active days as clean.

## Known Behavioral Limits

These are important if you plan to maintain or refactor the app:

- `getLongestStreak()` is explicitly approximate. The code comments note that ideal accuracy would require storing complete streak intervals, not only reset timestamps.
- Monthly stats are also approximate because the model does not store a full timeline of streak start/end pairs.
- All date handling uses the browser's local time and mixes full ISO timestamps with `YYYY-MM-DD` day keys.
- There is no cross-tab synchronization. Updating state in one tab does not actively refresh another.
- There is no validation, schema versioning, or corruption recovery for stored JSON.
- There are no automated tests in the repository today.

## PWA Notes

PWA support is active in `vite.config.ts`:

- `registerType: 'autoUpdate'`
- `cleanupOutdatedCaches: true`
- `clientsClaim: true`
- `skipWaiting: true`
- `devOptions.enabled: true`

`src/pwa.ts` registers the service worker on `window.load`.

Implications:

- the app is intended to be installable
- static assets are cached for offline use
- service worker behavior is enabled in development too

## Maintenance Guidance

If you need to change behavior safely, start in this order:

1. `src/utils/storage.ts`
2. the feature component that consumes that storage function
3. `src/App.tsx` only if the change affects navigation or boot flow

Refactor priorities that would improve correctness:

1. Replace ad hoc `localStorage` access with a typed persistence layer and schema version.
2. Store explicit streak sessions such as `{ startedAt, endedAt }` instead of only reset timestamps.
3. Centralize date utilities so streaks, charts, and daily entries use one consistent time model.
4. Add tests around `getStreak`, `resetStreak`, `getLongestStreak`, and monthly/weekly chart derivation.
5. Separate pure domain logic from UI components so charts and achievement logic are easier to verify.

## Quick Orientation For A New Developer Or AI Agent

If you need to understand the app fast, read these files first:

1. `src/utils/storage.ts`
2. `src/App.tsx`
3. `src/components/StreakCounter.tsx`
4. `src/components/Stats.tsx`
5. `src/components/Onboarding.tsx`

That sequence gives you the persistence model, boot flow, primary user action, derived analytics, and first-run behavior.
