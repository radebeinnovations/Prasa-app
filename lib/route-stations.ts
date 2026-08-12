export type RouteStation = {
  code: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
};

export const routeStations: RouteStation[] = [
  { code: 'PTA', name: 'Pretoria', area: 'Tshwane Central', latitude: -25.7581, longitude: 28.1899 },
  { code: 'CEN', name: 'Centurion', area: 'Centurion', latitude: -25.8515, longitude: 28.1896 },
  { code: 'MID', name: 'Midrand', area: 'Midrand', latitude: -25.995, longitude: 28.1263 },
  { code: 'MAR', name: 'Marlboro', area: 'Alexandra', latitude: -26.0832, longitude: 28.1133 },
  { code: 'SAN', name: 'Sandton', area: 'Sandton Central', latitude: -26.1076, longitude: 28.0567 },
  { code: 'RSB', name: 'Rosebank', area: 'Rosebank', latitude: -26.1447, longitude: 28.0416 },
  { code: 'JHB', name: 'Park Station', area: 'Johannesburg CBD', latitude: -26.1974, longitude: 28.0411 },
  { code: 'NAS', name: 'Nasrec', area: 'Johannesburg South', latitude: -26.2367, longitude: 27.9826 },
];

export const stationsBetween = (fromCode: string, toCode: string) => {
  const fromIndex = routeStations.findIndex((station) => station.code === fromCode);
  const toIndex = routeStations.findIndex((station) => station.code === toCode);
  if (fromIndex < 0 || toIndex < 0) return routeStations;
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  const stations = routeStations.slice(start, end + 1);
  return fromIndex <= toIndex ? stations : stations.reverse();
};

export const estimateJourneyMinutes = (fromName: string, toName: string, fullRouteMinutes = 70) => {
  const fromIndex = routeStations.findIndex((station) => station.name === fromName);
  const toIndex = routeStations.findIndex((station) => station.name === toName);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return 0;
  const travelledSegments = Math.abs(toIndex - fromIndex);
  const fullRouteSegments = Math.max(routeStations.length - 1, 1);
  return Math.max(1, Math.round((fullRouteMinutes * travelledSegments) / fullRouteSegments));
};

export const estimateArrivalTime = (startTime: string, durationMinutes: number) => {
  const [hoursText, minutesText] = startTime.slice(0, 5).split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || durationMinutes <= 0) {
    return { time: '', nextDay: false };
  }
  const startMinutes = hours * 60 + minutes;
  const totalMinutes = startMinutes + durationMinutes;
  const timeMinutes = totalMinutes % (24 * 60);
  return {
    time: `${String(Math.floor(timeMinutes / 60)).padStart(2, '0')}:${String(timeMinutes % 60).padStart(2, '0')}`,
    nextDay: totalMinutes >= 24 * 60,
  };
};
