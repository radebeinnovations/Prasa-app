export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: 'passenger' | 'admin';
};

export type Station = {
  id: number;
  code: string;
  name: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
};

export type TicketOption = {
  scheduled_trip_id: string;
  train_code: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  price: number;
  capacity: number;
  seats_remaining: number | null;
  reservation_hold_minutes: number | null;
};

export type AppNotification = {
  id: string;
  type: 'info' | 'ticket' | 'parcel' | 'service' | 'security';
  title: string;
  message: string;
  url: string | null;
  read_at: string | null;
  created_at: string;
};

export type LiveTrain = {
  id: string;
  train_code: string;
  status: string;
  status_color: string;
  minutes_to_arrival: number | null;
  station: string;
};
