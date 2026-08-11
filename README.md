# PRASA App

Mobile ticketing and passenger-information prototype for the Passenger Rail Agency of South Africa (PRASA), built with Expo Router and Expo SDK 54.

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

Scan the QR code in the terminal with Expo Go on Android, or with the Camera app on iOS. If LAN discovery is blocked by a firewall or network isolation, run:

```powershell
npx expo start --tunnel --clear
```

The login screen is in demo mode and accepts any non-empty username and password. Ticket purchases and parcel prices are local demonstrations; no payment, authentication, or live PRASA service is connected.

## Checks

```powershell
npm run typecheck
npm run doctor
npx expo export --platform all
```

## Useful scripts

- `npm start` — start Expo normally
- `npm run start:clear` — clear Metro caches and start Expo
- `npm run android` — open the Android target
- `npm run ios` — open the iOS target (macOS required for the simulator)
- `npm run web` — open the web target
