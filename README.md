# PRASA App

Mobile ticketing and passenger-information prototype for the Passenger Rail Agency of South Africa (PRASA), built with Expo Router and Expo SDK 54.

## Live Demo

**[View the Live Web App on Vercel](https://prasa-app-one.vercel.app/home)**

## Run with Expo Go

Requirements:

- Node.js 20.19 or newer
- The current app-store version of Expo Go (SDK 54)
- A computer and phone on the same Wi-Fi network

Install and start:

```powershell
npm install
npm run start:clear
```

Before signing in, configure `.env` and run the Supabase migration described in [supabase/README.md](./supabase/README.md). Email/password is the simplest authentication method to test in Expo Go.

Scan the QR code in the terminal with Expo Go on Android, or with the Camera app on iOS. If LAN discovery is blocked by a firewall or network isolation, run:

```powershell
npx expo start --tunnel --clear
```

The app uses Supabase Auth and Row Level Security. Stations, timetables, reservations, parcel orders, notifications, and live train status are backed by Supabase. Ticket reservations do not charge money until a payment provider and verified server-side webhook are added.

## Interactive train map

The Trains screen uses `react-native-maps`, which is included in Expo Go. On Android and iOS you can drag the map, pinch to zoom, rotate it, and tap any station marker to see its name.

To plan a route:

1. Tap the **From** or **To** row below the map.
2. Tap a station marker. The chosen endpoint updates and the route is redrawn.
3. Select **Schedule** or **Find tickets** to carry the route into the next screen.

You do not need a Google Maps API key while testing this project in Expo Go. A standalone Android store build will need a restricted Google Maps SDK for Android key during the EAS build setup. iOS currently uses the native Apple Maps provider; only configure a Google Maps iOS key if the production app is changed to explicitly use Google as its iOS provider.

## Checks

```powershell
npm run typecheck
npm run doctor
npx expo export --platform all
```

## Deploy the web app to Vercel

The repository contains `vercel.json`, so Vercel can build the Expo Router web app without manual framework detection.

Use these import settings:

- Framework Preset: **Other**
- Root Directory: `./`
- Build Command: `npm run vercel-build`
- Output Directory: `dist`
- Install Command: leave at the automatic default

Add these variables to both **Production** and **Preview**:

```text
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Never add a Supabase `service_role` or secret key to Vercel for this client-side Expo app.

After Vercel gives you the production URL, open Supabase **Authentication > URL Configuration** and set:

- Site URL: the exact production Vercel URL
- Redirect URL: `https://your-project.vercel.app/**`
- Optional preview redirect: `https://*-your-team-slug.vercel.app/**`

The Vercel deployment is intentionally a hosted mobile app, not a responsive desktop website. Desktop browsers display the original 428 × 926 mobile design frame; phone browsers use the full available viewport. Screens, spacing, navigation, and content remain the same as the Expo Go app.

## Useful scripts

- `npm start` — start Expo normally
- `npm run start:clear` — clear Metro caches and start Expo
- `npm run android` — open the Android target
- `npm run ios` — open the iOS target (macOS required for the simulator)
- `npm run web` — open the web target
