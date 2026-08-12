# Supabase setup for the PRASA app

## 1. Run the database migration

1. Open your Supabase project.
2. Go to **SQL Editor** and create a new query.
3. Run each migration below in order, using a new query for each file:
   1. `migrations/202608120001_initial_prasa_backend.sql` creates the schema, policies, functions, realtime configuration, and starter timetable data.
   2. `migrations/202608120002_station_coordinates.sql` safely adds/fills the latitude and longitude used by the interactive map.
   3. `migrations/202608120003_ticket_option_estimates.sql` makes ticket arrival times and durations reflect the selected section of the route.
   4. `migrations/202608120004_atomic_seat_inventory.sql` adds live remaining-seat counts, segment-aware capacity, atomic oversell protection, ten-minute reservation holds, and check-in fields for a future gate/scanner integration.

If you already ran migrations 001–003, run only migration 004 now.

The migration is designed to be rerun safely. If it fails, do not run fragments individually; copy the complete Supabase error message so the failing statement can be corrected without leaving security half-configured.

## 2. Configure client environment variables

Copy `.env.example` to `.env` and use **Project Settings > API** to fill in the project URL and anon/publishable key. Never use a `service_role` or secret key in an Expo app.

Restart Metro whenever `.env` changes:

```powershell
npm run start:clear
```

## 3. Configure email authentication

In **Authentication > Providers > Email**, enable Email. For the easiest first Expo Go test, email/password login works without any browser callback after the user is confirmed.

In **Authentication > URL Configuration**, add these redirect URLs:

- `prasa-app://**` for development/production builds.
- Your Expo Go Metro URL, for example `exp://192.168.1.20:8081/--/**`, while testing confirmation and password-reset links in Expo Go.
- Your deployed web URL if you deploy the web app.

Your phone and computer must be on the same network for the LAN Expo Go URL. The IP shown by `npx expo start` is the value to use. Replace/remove development URLs before production.

## 4. Optional Google and Facebook login

The app buttons are implemented, but each provider still needs external credentials:

1. In **Authentication > Providers**, open Google or Facebook and copy the Supabase callback URL shown there.
2. Add that callback URL to the OAuth app in Google Cloud or Meta for Developers.
3. Paste the provider client ID and secret back into Supabase and enable the provider.
4. Keep the mobile redirect URLs from step 3 on the Supabase allow list.

Email/password is the recommended authentication path for Expo Go. OAuth and custom-scheme links should also be tested in an Expo development build before production.

## 5. What the migration provides

- Automatic `profiles` rows and welcome notifications for new Auth users.
- Public, read-only stations, routes, route stops, timetables, and live train status.
- Private tickets, parcel orders, and notifications protected by Row Level Security.
- `get_ticket_options` for server-calculated fares.
- `reserve_ticket` with authentication, station validation, atomic segment-capacity locking, expiring seat holds, ticket codes, and a notification.
- `create_parcel_order` with server-side validation, pricing, tracking codes, and a notification.
- Realtime publication for live trains and the signed-in user's notifications.
- Seed data matching the app's current stations and sample services.
- Coordinates for all map markers on the Pretoria–Johannesburg route.

## 6. Useful administrator SQL

Promote one existing user only if that person should manage operational data:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@example.com');
```

Update live train status (the app refreshes automatically):

```sql
update public.live_trains
set status = 'Arrives in 12 min',
    status_color = '#B45309',
    minutes_to_arrival = 12
where train_code = 'MDA/ALT-8742';
```

## Payment boundary

The ticket button creates a secure `reserved` ticket; it does not charge money. Real payments need a payment provider, a Supabase Edge Function to create payment sessions, and a verified provider webhook that changes a ticket from `reserved` to `paid`. Never mark a ticket paid based only on a mobile-client response.
