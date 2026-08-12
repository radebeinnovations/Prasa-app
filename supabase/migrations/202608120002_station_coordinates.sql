alter table public.stations
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

update public.stations
set
  latitude = coordinates.latitude,
  longitude = coordinates.longitude,
  updated_at = now()
from (values
  ('PTA', -25.7581, 28.1899),
  ('CEN', -25.8515, 28.1896),
  ('MID', -25.9950, 28.1263),
  ('MAR', -26.0832, 28.1133),
  ('SAN', -26.1076, 28.0567),
  ('RSB', -26.1447, 28.0416),
  ('JHB', -26.1974, 28.0411),
  ('NAS', -26.2367, 27.9826)
) as coordinates(code, latitude, longitude)
where public.stations.code = coordinates.code;
