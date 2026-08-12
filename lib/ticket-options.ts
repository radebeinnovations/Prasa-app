import { supabase } from './supabase';
import type { TicketOption } from './types';

type TicketOptionsRequest = {
  destinationStationId: number;
  earliestTime: string | null;
  originStationId: number;
  travelDate: string;
};

type TicketOptionsResult = {
  data: TicketOption[];
  error: string;
  hasLiveSeatInventory: boolean;
};

const normalizeRows = (rows: unknown[], hasLiveSeatInventory: boolean): TicketOption[] => (
  (rows as Partial<TicketOption>[]).map((row) => ({
    scheduled_trip_id: String(row.scheduled_trip_id ?? ''),
    train_code: String(row.train_code ?? ''),
    departure_time: String(row.departure_time ?? ''),
    arrival_time: String(row.arrival_time ?? ''),
    duration_minutes: Number(row.duration_minutes ?? 0),
    price: Number(row.price ?? 0),
    capacity: Number(row.capacity ?? 0),
    seats_remaining: hasLiveSeatInventory ? Number(row.seats_remaining ?? 0) : null,
    reservation_hold_minutes: hasLiveSeatInventory ? Number(row.reservation_hold_minutes ?? 10) : null,
  }))
);

const isMissingCurrentFunction = (code?: string, message?: string) => (
  code === 'PGRST202'
  || Boolean(message?.includes('Could not find the function') && message.includes('p_travel_date'))
);

export async function getTicketOptions({
  destinationStationId,
  earliestTime,
  originStationId,
  travelDate,
}: TicketOptionsRequest): Promise<TicketOptionsResult> {
  const current = await supabase.rpc('get_ticket_options', {
    p_origin_station_id: originStationId,
    p_destination_station_id: destinationStationId,
    p_earliest_time: earliestTime,
    p_travel_date: travelDate,
  });

  if (!current.error) {
    return {
      data: normalizeRows(current.data ?? [], true),
      error: '',
      hasLiveSeatInventory: true,
    };
  }

  if (!isMissingCurrentFunction(current.error.code, current.error.message)) {
    return { data: [], error: current.error.message, hasLiveSeatInventory: false };
  }

  const legacy = await supabase.rpc('get_ticket_options', {
    p_origin_station_id: originStationId,
    p_destination_station_id: destinationStationId,
    p_earliest_time: earliestTime,
  });

  if (legacy.error) {
    return { data: [], error: legacy.error.message, hasLiveSeatInventory: false };
  }

  return {
    data: normalizeRows(legacy.data ?? [], false),
    error: '',
    hasLiveSeatInventory: false,
  };
}
