import { useEffect, useMemo, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { routeStations, stationsBetween } from '../lib/route-stations';
import type { TransitMapProps } from './TransitMap.types';

export function TransitMap({ from, onStationPress, selectedStation, to }: TransitMapProps) {
  const mapRef = useRef<MapView>(null);
  const route = useMemo(() => stationsBetween(from.code, to.code), [from.code, to.code]);
  const routeCoordinates = useMemo(() => route.map(({ latitude, longitude }) => ({ latitude, longitude })), [route]);

  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(routeCoordinates, {
        animated: true,
        edgePadding: { top: 74, right: 62, bottom: 82, left: 62 },
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [routeCoordinates]);

  return (
    <MapView
      initialRegion={{ latitude: -25.99, longitude: 28.09, latitudeDelta: 0.55, longitudeDelta: 0.35 }}
      loadingEnabled
      mapPadding={{ top: 24, right: 8, bottom: 20, left: 8 }}
      moveOnMarkerPress={false}
      pitchEnabled
      ref={mapRef}
      rotateEnabled
      scrollEnabled
      showsBuildings
      showsCompass
      showsPointsOfInterest
      style={styles.map}
      toolbarEnabled={false}
      zoomControlEnabled
      zoomEnabled
    >
      <Polyline coordinates={routeCoordinates} lineCap="round" lineJoin="round" strokeColor="#0785C5" strokeWidth={5} />
      {routeStations.map((station) => {
        const isFrom = station.code === from.code;
        const isTo = station.code === to.code;
        const isSelected = station.code === selectedStation?.code;
        return (
          <Marker
            coordinate={{ latitude: station.latitude, longitude: station.longitude }}
            description={`${station.area} · Tap From or To below`}
            key={station.code}
            onPress={() => onStationPress(station)}
            pinColor={isFrom ? '#138A36' : isTo ? '#D33232' : isSelected ? '#F4B400' : '#0785C5'}
            title={station.name}
          />
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
