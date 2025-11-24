# NoFap Tracker MVP

A minimal, privacy-focused NoFap tracker built with Vite + React + TypeScript + Tailwind CSS.

## Features

1.  **Streak Counter**: Tracks days since your last reset using `localStorage`.
2.  **Daily Check-In**: Record your daily mood (Happy, Neutral, Sad).
3.  **Urge Killer**: Motivational quotes and a 30-second breathing exercise timer.
4.  **Journal**: Simple daily text entry.
5.  **Privacy First**: All data is stored locally in your browser (`localStorage`). No backend, no tracking.

## Project Structure

```
src/
├── components/
│   ├── StreakCounter.tsx  # Visual counter & reset logic
│   ├── CheckIn.tsx        # Daily mood selector
│   ├── UrgeKiller.tsx     # Breathing timer & quotes
│   └── Journal.tsx        # Daily text entry
├── utils/
│   └── storage.ts         # Centralized localStorage logic
├── App.tsx                # Main layout & navigation
└── index.css              # Tailwind CSS setup
```

## How Streak Calculations Work

The streak is calculated in `src/utils/storage.ts`:
1.  When you first visit (or reset), we save the **Start Date** timestamp in `localStorage`.
2.  Every time the app loads, we calculate the difference between **Now** and the **Start Date**.
3.  `Difference in milliseconds / (1000 * 60 * 60 * 24)` gives us the number of days.
4.  We round this number down (floor) so it represents full days completed.

## Installation & Running

1.  **Install Dependencies**
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## PWA Support (Future)

To turn this into a Progressive Web App (PWA) that can be installed on your phone:

1.  **Manifest**: Update `vite.config.ts` with PWA manifest details (name, icons, theme_color).
2.  **Service Worker**: The `vite-plugin-pwa` is already in `package.json`. You just need to configure it to cache assets so the app works offline.
3.  **Icons**: Add app icons to `public/` folder.

Modify `vite.config.ts` to include the PWA plugin configuration:

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      manifest: {
        name: 'NoFap Tracker',
        short_name: 'NoFap',
        theme_color: '#ffffff',
        icons: [
            // ... add your icons here
        ]
      }
    })
  ],
})
```
