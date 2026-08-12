-- PRASA mobile prototype backend
-- Run this entire file once in Supabase Dashboard > SQL Editor.
-- It is safe to run again: schema objects are created conditionally and seed rows are upserted.

begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Commuter' check (char_length(display_name) between 1 and 80),
  avatar_url text,
  role text not null default 'passenger' check (role in ('passenger', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stations (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null unique,
  area text not null,
  latitude double precision,
  longitude double precision,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.route_stops (
  route_id uuid not null references public.routes(id) on delete cascade,
  station_id bigint not null references public.stations(id) on delete cascade,
  stop_order integer not null check (stop_order > 0),
  primary key (route_id, station_id),
  unique (route_id, stop_order)
);

create table if not exists public.scheduled_trips (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  train_code text not null,
  departure_time time not null,
  arrival_time time not null,
  duration_minutes integer not null check (duration_minutes > 0),
  base_fare numeric(10, 2) not null check (base_fare >= 0),
  capacity integer not null default 300 check (capacity > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (route_id, train_code, departure_time)
);

create table if not exists public.live_trains (
  id uuid primary key default gen_random_uuid(),
  scheduled_trip_id uuid references public.scheduled_trips(id) on delete set null,
  train_code text not null unique,
  station_id bigint references public.stations(id) on delete set null,
  status text not null,
  status_color text not null default '#0076CB',
  minutes_to_arrival integer check (minutes_to_arrival is null or minutes_to_arrival >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scheduled_trip_id uuid not null references public.scheduled_trips(id),
  origin_station_id bigint not null references public.stations(id),
  destination_station_id bigint not null references public.stations(id),
  travel_date date not null,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'ZAR' check (currency = 'ZAR'),
  status text not null default 'reserved' check (status in ('reserved', 'paid', 'cancelled', 'used', 'expired')),
  ticket_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (origin_station_id <> destination_station_id)
);

create table if not exists public.parcel_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  origin_station_id bigint not null references public.stations(id),
  destination_station_id bigint not null references public.stations(id),
  item_type text not null,
  service_level text not null check (service_level in ('Standard', 'Priority', 'Same day')),
  weight_kg numeric(8, 2) not null check (weight_kg > 0 and weight_kg <= 30),
  estimated_price numeric(10, 2) not null check (estimated_price >= 0),
  status text not null default 'created' check (status in ('created', 'accepted', 'in_transit', 'delivered', 'cancelled')),
  tracking_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (origin_station_id <> destination_station_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'info' check (type in ('info', 'ticket', 'parcel', 'service', 'security')),
  title text not null,
  message text not null,
  url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tickets_user_created_idx on public.tickets(user_id, created_at desc);
create index if not exists tickets_trip_date_idx on public.tickets(scheduled_trip_id, travel_date, status);
create index if not exists parcels_user_created_idx on public.parcel_orders(user_id, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists route_stops_station_idx on public.route_stops(station_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists stations_set_updated_at on public.stations;
create trigger stations_set_updated_at before update on public.stations
for each row execute function public.set_updated_at();

drop trigger if exists routes_set_updated_at on public.routes;
create trigger routes_set_updated_at before update on public.routes
for each row execute function public.set_updated_at();

drop trigger if exists scheduled_trips_set_updated_at on public.scheduled_trips;
create trigger scheduled_trips_set_updated_at before update on public.scheduled_trips
for each row execute function public.set_updated_at();

drop trigger if exists live_trains_set_updated_at on public.live_trains;
create trigger live_trains_set_updated_at before update on public.live_trains
for each row execute function public.set_updated_at();

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at before update on public.tickets
for each row execute function public.set_updated_at();

drop trigger if exists parcel_orders_set_updated_at on public.parcel_orders;
create trigger parcel_orders_set_updated_at before update on public.parcel_orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Commuter'
  );

  insert into public.profiles (id, display_name)
  values (new.id, left(v_name, 80))
  on conflict (id) do nothing;

  insert into public.notifications (user_id, type, title, message)
  values (new.id, 'info', 'Welcome to PRASA', 'Your passenger account is ready. You can now reserve tickets and create parcel orders.');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill profiles for accounts created before this migration.
insert into public.profiles (id, display_name)
select
  user_row.id,
  left(coalesce(nullif(trim(user_row.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(coalesce(user_row.email, ''), '@', 1), ''), 'Commuter'), 80)
from auth.users as user_row
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.get_ticket_options(
  p_origin_station_id bigint,
  p_destination_station_id bigint,
  p_earliest_time time default null
)
returns table (
  scheduled_trip_id uuid,
  train_code text,
  departure_time time,
  arrival_time time,
  duration_minutes integer,
  price numeric,
  capacity integer
)
language sql
stable
set search_path = ''
as $$
  select
    trip.id,
    trip.train_code,
    trip.departure_time,
    trip.departure_time + make_interval(mins => estimate.duration_minutes),
    estimate.duration_minutes,
    round(trip.base_fare + abs(destination_stop.stop_order - origin_stop.stop_order) * 8.00, 2),
    trip.capacity
  from public.scheduled_trips as trip
  join public.route_stops as origin_stop
    on origin_stop.route_id = trip.route_id and origin_stop.station_id = p_origin_station_id
  join public.route_stops as destination_stop
    on destination_stop.route_id = trip.route_id and destination_stop.station_id = p_destination_station_id
  cross join lateral (
    select greatest(
      1,
      round(
        trip.duration_minutes::numeric
        * abs(destination_stop.stop_order - origin_stop.stop_order)
        / greatest((select count(*) - 1 from public.route_stops where route_id = trip.route_id), 1)
      )::integer
    ) as duration_minutes
  ) as estimate
  where trip.active
    and p_origin_station_id <> p_destination_station_id
    and (p_earliest_time is null or trip.departure_time >= p_earliest_time)
  order by trip.departure_time;
$$;

create or replace function public.reserve_ticket(
  p_scheduled_trip_id uuid,
  p_origin_station_id bigint,
  p_destination_station_id bigint,
  p_travel_date date
)
returns public.tickets
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_trip public.scheduled_trips%rowtype;
  v_ticket public.tickets%rowtype;
  v_origin_order integer;
  v_destination_order integer;
  v_reserved integer;
  v_amount numeric(10, 2);
begin
  if v_user_id is null then
    raise exception 'You must be signed in to reserve a ticket.' using errcode = '42501';
  end if;
  if p_origin_station_id = p_destination_station_id then
    raise exception 'Origin and destination stations must be different.' using errcode = '22023';
  end if;
  if p_travel_date < current_date then
    raise exception 'Travel date cannot be in the past.' using errcode = '22023';
  end if;

  select * into v_trip
  from public.scheduled_trips
  where id = p_scheduled_trip_id and active
  for update;

  if not found then
    raise exception 'This scheduled trip is not available.' using errcode = 'P0002';
  end if;

  select stop_order into v_origin_order
  from public.route_stops
  where route_id = v_trip.route_id and station_id = p_origin_station_id;

  select stop_order into v_destination_order
  from public.route_stops
  where route_id = v_trip.route_id and station_id = p_destination_station_id;

  if v_origin_order is null or v_destination_order is null then
    raise exception 'Both stations must belong to the selected route.' using errcode = '22023';
  end if;

  -- Retrying the same request returns the existing active reservation instead of double-booking.
  select * into v_ticket
  from public.tickets
  where user_id = v_user_id
    and scheduled_trip_id = p_scheduled_trip_id
    and origin_station_id = p_origin_station_id
    and destination_station_id = p_destination_station_id
    and travel_date = p_travel_date
    and status in ('reserved', 'paid')
  order by created_at desc
  limit 1;

  if found then
    return v_ticket;
  end if;

  select count(*)::integer into v_reserved
  from public.tickets
  where scheduled_trip_id = p_scheduled_trip_id
    and travel_date = p_travel_date
    and status in ('reserved', 'paid');

  if v_reserved >= v_trip.capacity then
    raise exception 'This train is fully booked for the selected date.' using errcode = 'P0001';
  end if;

  v_amount := round(v_trip.base_fare + abs(v_destination_order - v_origin_order) * 8.00, 2);

  insert into public.tickets (
    user_id, scheduled_trip_id, origin_station_id, destination_station_id,
    travel_date, amount, ticket_code
  ) values (
    v_user_id, p_scheduled_trip_id, p_origin_station_id, p_destination_station_id,
    p_travel_date, v_amount, 'PR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ) returning * into v_ticket;

  insert into public.notifications (user_id, type, title, message)
  values (
    v_user_id,
    'ticket',
    'Ticket reserved',
    'Reservation ' || v_ticket.ticket_code || ' was created for ' || to_char(p_travel_date, 'DD Mon YYYY') || '.'
  );

  return v_ticket;
end;
$$;

create or replace function public.create_parcel_order(
  p_origin_station_id bigint,
  p_destination_station_id bigint,
  p_item_type text,
  p_service_level text,
  p_weight_kg numeric
)
returns public.parcel_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_base numeric(10, 2);
  v_multiplier numeric(5, 2);
  v_price numeric(10, 2);
  v_order public.parcel_orders%rowtype;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to create a parcel order.' using errcode = '42501';
  end if;
  if p_origin_station_id = p_destination_station_id then
    raise exception 'Origin and destination stations must be different.' using errcode = '22023';
  end if;
  if p_weight_kg is null or p_weight_kg <= 0 or p_weight_kg > 30 then
    raise exception 'Parcel weight must be between 0 and 30 kg.' using errcode = '22023';
  end if;
  if p_service_level not in ('Standard', 'Priority', 'Same day') then
    raise exception 'Unknown service level.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.stations where id = p_origin_station_id and active)
    or not exists (select 1 from public.stations where id = p_destination_station_id and active) then
    raise exception 'Select two active stations.' using errcode = '22023';
  end if;

  v_base := case lower(trim(p_item_type))
    when 'documents' then 25.00
    when 'small parcel' then 40.00
    when 'medium parcel' then 65.00
    when 'large parcel' then 95.00
    else 50.00
  end;
  v_multiplier := case p_service_level
    when 'Priority' then 1.50
    when 'Same day' then 2.00
    else 1.00
  end;
  v_price := round((v_base + p_weight_kg * 8.00) * v_multiplier, 2);

  insert into public.parcel_orders (
    user_id, origin_station_id, destination_station_id, item_type,
    service_level, weight_kg, estimated_price, tracking_code
  ) values (
    v_user_id, p_origin_station_id, p_destination_station_id, trim(p_item_type),
    p_service_level, p_weight_kg, v_price,
    'PX-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ) returning * into v_order;

  insert into public.notifications (user_id, type, title, message)
  values (
    v_user_id,
    'parcel',
    'Parcel order created',
    'Parcel ' || v_order.tracking_code || ' was created with an estimated price of R' || to_char(v_price, 'FM999999990.00') || '.'
  );

  return v_order;
end;
$$;

alter table public.profiles enable row level security;
alter table public.stations enable row level security;
alter table public.routes enable row level security;
alter table public.route_stops enable row level security;
alter table public.scheduled_trips enable row level security;
alter table public.live_trains enable row level security;
alter table public.tickets enable row level security;
alter table public.parcel_orders enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Public can read active stations" on public.stations;
create policy "Public can read active stations" on public.stations for select to anon, authenticated using (active);
drop policy if exists "Admins manage stations" on public.stations;
create policy "Admins manage stations" on public.stations for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public can read active routes" on public.routes;
create policy "Public can read active routes" on public.routes for select to anon, authenticated using (active);
drop policy if exists "Admins manage routes" on public.routes;
create policy "Admins manage routes" on public.routes for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public can read route stops" on public.route_stops;
create policy "Public can read route stops" on public.route_stops for select to anon, authenticated using (true);
drop policy if exists "Admins manage route stops" on public.route_stops;
create policy "Admins manage route stops" on public.route_stops for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public can read active scheduled trips" on public.scheduled_trips;
create policy "Public can read active scheduled trips" on public.scheduled_trips for select to anon, authenticated using (active);
drop policy if exists "Admins manage scheduled trips" on public.scheduled_trips;
create policy "Admins manage scheduled trips" on public.scheduled_trips for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public can read live trains" on public.live_trains;
create policy "Public can read live trains" on public.live_trains for select to anon, authenticated using (true);
drop policy if exists "Admins manage live trains" on public.live_trains;
create policy "Admins manage live trains" on public.live_trains for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id or (select public.is_admin()));
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Users read own tickets" on public.tickets;
create policy "Users read own tickets" on public.tickets for select to authenticated using ((select auth.uid()) = user_id or (select public.is_admin()));
drop policy if exists "Admins manage tickets" on public.tickets;
create policy "Admins manage tickets" on public.tickets for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Users read own parcel orders" on public.parcel_orders;
create policy "Users read own parcel orders" on public.parcel_orders for select to authenticated using ((select auth.uid()) = user_id or (select public.is_admin()));
drop policy if exists "Admins manage parcel orders" on public.parcel_orders;
create policy "Admins manage parcel orders" on public.parcel_orders for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications for select to authenticated using ((select auth.uid()) = user_id or (select public.is_admin()));
drop policy if exists "Users mark own notifications read" on public.notifications;
create policy "Users mark own notifications read" on public.notifications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Admins manage notifications" on public.notifications;
create policy "Admins manage notifications" on public.notifications for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

revoke all on table
  public.profiles, public.stations, public.routes, public.route_stops,
  public.scheduled_trips, public.live_trains, public.tickets,
  public.parcel_orders, public.notifications
from anon, authenticated;
grant select on public.stations, public.routes, public.route_stops, public.scheduled_trips, public.live_trains to anon, authenticated;
grant select on public.profiles, public.tickets, public.parcel_orders, public.notifications to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant insert, update, delete on public.stations, public.routes, public.route_stops, public.scheduled_trips, public.live_trains to authenticated;
grant insert, update, delete on public.tickets, public.parcel_orders to authenticated;

revoke all on function public.is_admin() from public;
revoke all on function public.get_ticket_options(bigint, bigint, time) from public;
revoke all on function public.reserve_ticket(uuid, bigint, bigint, date) from public;
revoke all on function public.create_parcel_order(bigint, bigint, text, text, numeric) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_ticket_options(bigint, bigint, time) to anon, authenticated;
grant execute on function public.reserve_ticket(uuid, bigint, bigint, date) to authenticated;
grant execute on function public.create_parcel_order(bigint, bigint, text, text, numeric) to authenticated;

insert into public.stations (code, name, area, latitude, longitude)
values
  ('PTA', 'Pretoria', 'Tshwane Central', -25.7581, 28.1899),
  ('CEN', 'Centurion', 'Centurion', -25.8515, 28.1896),
  ('MID', 'Midrand', 'Midrand', -25.9950, 28.1263),
  ('MAR', 'Marlboro', 'Alexandra', -26.0832, 28.1133),
  ('SAN', 'Sandton', 'Sandton Central', -26.1076, 28.0567),
  ('RSB', 'Rosebank', 'Rosebank', -26.1447, 28.0416),
  ('JHB', 'Park Station', 'Johannesburg CBD', -26.1974, 28.0411),
  ('NAS', 'Nasrec', 'Johannesburg South', -26.2367, 27.9826)
on conflict (code) do update set
  name = excluded.name,
  area = excluded.area,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  active = true;

insert into public.routes (code, name)
values ('PRASA-NORTH-SOUTH', 'Pretoria to Johannesburg')
on conflict (code) do update set name = excluded.name, active = true;

insert into public.route_stops (route_id, station_id, stop_order)
select route_row.id, station_row.id, stop_row.stop_order
from public.routes as route_row
join (values
  ('PTA', 1), ('CEN', 2), ('MID', 3), ('MAR', 4),
  ('SAN', 5), ('RSB', 6), ('JHB', 7), ('NAS', 8)
) as stop_row(station_code, stop_order) on true
join public.stations as station_row on station_row.code = stop_row.station_code
where route_row.code = 'PRASA-NORTH-SOUTH'
on conflict (route_id, station_id) do update set stop_order = excluded.stop_order;

insert into public.scheduled_trips (
  route_id, train_code, departure_time, arrival_time, duration_minutes, base_fare, capacity
)
select route_row.id, trip_row.train_code, trip_row.departure_time::time,
  trip_row.arrival_time::time, trip_row.duration_minutes, trip_row.base_fare, 300
from public.routes as route_row
join (values
  ('KTS/MDA-1122', '05:00', '06:10', 70, 16.00),
  ('MDA/ALT-8742', '06:30', '07:40', 70, 18.00),
  ('JHB/PTA-3901', '07:30', '08:40', 70, 20.00),
  ('PRASA-0914', '09:14', '10:24', 70, 18.00),
  ('PRASA-1120', '11:20', '12:30', 70, 20.00),
  ('PRASA-1530', '15:30', '16:40', 70, 22.00),
  ('PRASA-1700', '17:00', '18:10', 70, 22.00),
  ('PRASA-1930', '19:30', '20:40', 70, 20.00)
) as trip_row(train_code, departure_time, arrival_time, duration_minutes, base_fare) on true
where route_row.code = 'PRASA-NORTH-SOUTH'
on conflict (route_id, train_code, departure_time) do update set
  arrival_time = excluded.arrival_time,
  duration_minutes = excluded.duration_minutes,
  base_fare = excluded.base_fare,
  capacity = excluded.capacity,
  active = true;

insert into public.live_trains (
  scheduled_trip_id, train_code, station_id, status, status_color, minutes_to_arrival
)
select trip.id, live_row.train_code, station_row.id, live_row.status, live_row.status_color, live_row.minutes_to_arrival
from (values
  ('KTS/MDA-1122', 'PTA', 'Arriving now', '#15803D', 0),
  ('MDA/ALT-8742', 'MID', 'Arrives in 31 min', '#B91C1C', 31),
  ('JHB/PTA-3901', 'SAN', 'Arrives in 48 min', '#B45309', 48)
) as live_row(train_code, station_code, status, status_color, minutes_to_arrival)
join public.scheduled_trips as trip on trip.train_code = live_row.train_code
join public.stations as station_row on station_row.code = live_row.station_code
on conflict (train_code) do update set
  scheduled_trip_id = excluded.scheduled_trip_id,
  station_id = excluded.station_id,
  status = excluded.status,
  status_color = excluded.status_color,
  minutes_to_arrival = excluded.minutes_to_arrival;

alter table public.live_trains replica identity full;
alter table public.notifications replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_trains'
  ) then
    alter publication supabase_realtime add table public.live_trains;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

commit;
