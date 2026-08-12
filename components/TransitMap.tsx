import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { InteractiveMap } from './InteractiveMap';
import { routeStations } from '../lib/route-stations';
import type { TransitMapProps } from './TransitMap.types';

export function TransitMap({ from, onStationPress, selectedStation, to }: TransitMapProps) {
  return (
    <View style={styles.container}>
      <InteractiveMap />
      <View style={styles.stationStrip}>
        {routeStations.map((station) => (
          <TouchableOpacity
            key={station.code}
            onPress={() => onStationPress(station)}
            style={[styles.stationButton, station.code === selectedStation?.code && styles.selected]}
          >
            <View style={[styles.dot, station.code === from.code && styles.fromDot, station.code === to.code && styles.toDot]} />
            <Text numberOfLines={1} style={styles.stationText}>{station.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stationStrip: { position: 'absolute', left: 8, right: 8, bottom: 48, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  stationButton: { minHeight: 28, maxWidth: 104, paddingHorizontal: 7, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.92)', flexDirection: 'row', alignItems: 'center' },
  selected: { backgroundColor: '#FFF1B8' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#0785C5', marginRight: 4 },
  fromDot: { backgroundColor: '#138A36' },
  toDot: { backgroundColor: '#D33232' },
  stationText: { flexShrink: 1, color: '#25323A', fontSize: 10, fontWeight: '700' },
});
