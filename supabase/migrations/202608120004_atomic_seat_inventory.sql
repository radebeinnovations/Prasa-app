alter table public.tickets
  add column if not exists expires_at timestamptz,
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_out_at timestamptz;

update public.tickets
set expires_at = created_at + interval '10 minutes'
where status = 'reserved' and expires_at is null;

create index if not exists tickets_inventory_idx
  on public.tickets(scheduled_trip_id, travel_date, status, expires_at);

drop function if exists public.get_ticket_options(bigint, bigint, time);
drop function if exists public.get_ticket_options(bigint, bigint, time, date);

create function public.get_ticket_options(
  p_origin_station_id bigint,
  p_destination_station_id bigint,
  p_earliest_time time default null,
  p_travel_date date default current_date
)
returns table (
  scheduled_trip_id uuid,
  train_code text,
  departure_time time,
  arrival_time time,
  duration_minutes integer,
  price numeric,
  capacity integer,
  seats_remaining integer,
  reservation_hold_minutes integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with requested_route as (
    select
      origin_stop.route_id,
      least(origin_stop.stop_order, destination_stop.stop_order) as segment_start,
      greatest(origin_stop.stop_order, destination_stop.stop_order) as segment_end
    from public.route_stops as origin_stop
    join public.route_stops as destination_stop on destination_stop.route_id = origin_stop.route_id
    where origin_stop.station_id = p_origin_station_id
      and destination_stop.station_id = p_destination_station_id
      and p_origin_station_id <> p_destination_station_id
  ),
  eligible_trips as (
    select
      trip.*,
      requested_route.segment_start,
      requested_route.segment_end,
      greatest(
        1,
        round(
          trip.duration_minutes::numeric
          * (requested_route.segment_end - requested_route.segment_start)
          / greatest((select count(*) - 1 from public.route_stops where route_id = trip.route_id), 1)
        )::integer
      ) as estimated_minutes
    from public.scheduled_trips as trip
    join requested_route on requested_route.route_id = trip.route_id
    where trip.active
      and (p_earliest_time is null or trip.departure_time >= p_earliest_time)
  ),
  availability as (
    select
      eligible_trip.id,
      coalesce(max(segment_occupancy.occupied), 0)::integer as maximum_occupied
    from eligible_trips as eligible_trip
    cross join lateral generate_series(eligible_trip.segment_start, eligible_trip.segment_end - 1) as segment(segment_order)
    cross join lateral (
      select count(*)::integer as occupied
      from public.tickets as ticket
      join public.route_stops as ticket_origin
        on ticket_origin.station_id = ticket.origin_station_id and ticket_origin.route_id = eligible_trip.route_id
      join public.route_stops as ticket_destination
        on ticket_destination.station_id = ticket.destination_station_id and ticket_destination.route_id = eligible_trip.route_id
      where ticket.scheduled_trip_id = eligible_trip.id
        and ticket.travel_date = p_travel_date
        and (ticket.status = 'paid' or (ticket.status = 'reserved' and ticket.expires_at > now()))
        and least(ticket_origin.stop_order, ticket_destination.stop_order) <= segment.segment_order
        and greatest(ticket_origin.stop_order, ticket_destination.stop_order) > segment.segment_order
    ) as segment_occupancy
    group by eligible_trip.id
  )
  select
    eligible_trip.id,
    eligible_trip.train_code,
    eligible_trip.departure_time,
    eligible_trip.departure_time + make_interval(mins => eligible_trip.estimated_minutes),
    eligible_trip.estimated_minutes,
    round(eligible_trip.base_fare + (eligible_trip.segment_end - eligible_trip.segment_start) * 8.00, 2),
    eligible_trip.capacity,
    greatest(eligible_trip.capacity - availability.maximum_occupied, 0),
    10
  from eligible_trips as eligible_trip
  join availability on availability.id = eligible_trip.id
  order by eligible_trip.departure_time;
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
  v_segment_start integer;
  v_segment_end integer;
  v_maximum_occupied integer;
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

  -- Serializes every capacity check and insert for this train, preventing concurrent overselling.
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

  v_segment_start := least(v_origin_order, v_destination_order);
  v_segment_end := greatest(v_origin_order, v_destination_order);

  update public.tickets
  set status = 'expired', updated_at = now()
  where scheduled_trip_id = p_scheduled_trip_id
    and travel_date = p_travel_date
    and status = 'reserved'
    and expires_at <= now();

  -- Repeating the same request returns its existing live hold instead of reserving another seat.
  select * into v_ticket
  from public.tickets
  where user_id = v_user_id
    and scheduled_trip_id = p_scheduled_trip_id
    and origin_station_id = p_origin_station_id
    and destination_station_id = p_destination_station_id
    and travel_date = p_travel_date
    and (status = 'paid' or (status = 'reserved' and expires_at > now()))
  order by created_at desc
  limit 1;

  if found then
    return v_ticket;
  end if;

  select coalesce(max(segment_occupancy.occupied), 0)::integer into v_maximum_occupied
  from generate_series(v_segment_start, v_segment_end - 1) as segment(segment_order)
  cross join lateral (
    select count(*)::integer as occupied
    from public.tickets as ticket
    join public.route_stops as ticket_origin
      on ticket_origin.station_id = ticket.origin_station_id and ticket_origin.route_id = v_trip.route_id
    join public.route_stops as ticket_destination
      on ticket_destination.station_id = ticket.destination_station_id and ticket_destination.route_id = v_trip.route_id
    where ticket.scheduled_trip_id = p_scheduled_trip_id
      and ticket.travel_date = p_travel_date
      and (ticket.status = 'paid' or (ticket.status = 'reserved' and ticket.expires_at > now()))
      and least(ticket_origin.stop_order, ticket_destination.stop_order) <= segment.segment_order
      and greatest(ticket_origin.stop_order, ticket_destination.stop_order) > segment.segment_order
  ) as segment_occupancy;

  if v_maximum_occupied >= v_trip.capacity then
    raise exception 'This train is fully booked for the selected route and date.' using errcode = 'P0001';
  end if;

  v_amount := round(v_trip.base_fare + (v_segment_end - v_segment_start) * 8.00, 2);

  insert into public.tickets (
    user_id, scheduled_trip_id, origin_station_id, destination_station_id,
    travel_date, amount, ticket_code, expires_at
  ) values (
    v_user_id, p_scheduled_trip_id, p_origin_station_id, p_destination_station_id,
    p_travel_date, v_amount, 'PR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), now() + interval '10 minutes'
  ) returning * into v_ticket;

  insert into public.notifications (user_id, type, title, message)
  values (
    v_user_id,
    'ticket',
    'Seat held for 10 minutes',
    'Reservation ' || v_ticket.ticket_code || ' will expire unless payment is completed.'
  );

  return v_ticket;
end;
$$;

revoke all on function public.get_ticket_options(bigint, bigint, time, date) from public;
revoke all on function public.reserve_ticket(uuid, bigint, bigint, date) from public;
grant execute on function public.get_ticket_options(bigint, bigint, time, date) to anon, authenticated;
grant execute on function public.reserve_ticket(uuid, bigint, bigint, date) to authenticated;

-- Refresh PostgREST immediately so the new four-parameter RPC is available to mobile clients.
notify pgrst, 'reload schema';
