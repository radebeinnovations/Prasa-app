import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { InteractiveMap } from './InteractiveMap';
import { routeStations } from '../lib/route-stations';
import type { TransitMapProps } from './TransitMap.types';

export function TransitMap({ from, onStationPress, selectedStation, to }: TransitMapProps) {
  return (
    <View style={styles.container}>
      <InteractiveMap />
      <ScrollView contentContainerStyle={styles.stationStripContent} horizontal showsHorizontalScrollIndicator={false} style={styles.stationStrip}>
        {routeStations.map((station) => (
          <TouchableOpacity
            key={station.code}
            onPress={() => onStationPress(station)}
            style={[
              styles.stationButton,
              station.code === selectedStation?.code && styles.selected,
              station.code === from.code && styles.fromSelected,
              station.code === to.code && styles.toSelected,
            ]}
          >
            <View style={[styles.dot, station.code === from.code && styles.fromDot, station.code === to.code && styles.toDot]} />
            <Text
              numberOfLines={1}
              style={[styles.stationText, (station.code === from.code || station.code === to.code) && styles.endpointStationText]}
            >
              {station.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stationStrip: { position: 'absolute', left: 0, right: 0, bottom: 48 },
  stationStripContent: { gap: 7, paddingHorizontal: 10 },
  stationButton: { minHeight: 36, maxWidth: 150, paddingHorizontal: 11, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.94)', flexDirection: 'row', alignItems: 'center' },
  selected: { backgroundColor: '#FFF1B8' },
  fromSelected: { backgroundColor: '#138A36' },
  toSelected: { backgroundColor: '#D33232' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#0785C5', marginRight: 4 },
  fromDot: { backgroundColor: '#138A36' },
  toDot: { backgroundColor: '#D33232' },
  stationText: { flexShrink: 1, color: '#25323A', fontSize: 11, fontWeight: '700' },
  endpointStationText: { color: '#FFFFFF' },
});
