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

revoke all on function public.get_ticket_options(bigint, bigint, time) from public;
grant execute on function public.get_ticket_options(bigint, bigint, time) to anon, authenticated;
