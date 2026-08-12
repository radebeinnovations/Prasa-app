import type { RouteStation } from '../lib/route-stations';

export type TransitMapProps = {
  from: RouteStation;
  onStationPress: (station: RouteStation) => void;
  selectedStation: RouteStation | null;
  to: RouteStation;
};
