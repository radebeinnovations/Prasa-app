import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransitMap } from '../components/TransitMap';
import { routeStations, stationsBetween, type RouteStation } from '../lib/route-stations';
import { supabase } from '../lib/supabase';
import type { LiveTrain } from '../lib/types';

type EditingEndpoint = 'from' | 'to';

export default function Trains() {
  const router = useRouter();
  const [trains, setTrains] = useState<LiveTrain[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [from, setFrom] = useState<RouteStation>(routeStations[0]);
  const [to, setTo] = useState<RouteStation>(routeStations[6]);
  const [selectedStation, setSelectedStation] = useState<RouteStation | null>(routeStations[0]);
  const [editingEndpoint, setEditingEndpoint] = useState<EditingEndpoint>('from');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const routeStationNames = new Set(stationsBetween(from.code, to.code).map((station) => station.name));
  const visibleTrains = trains.filter((train) => routeStationNames.has(train.station));

  const selectMapStation = (station: RouteStation) => {
    setSelectedStation(station);
    if (editingEndpoint === 'from') {
      if (station.code === to.code) {
        Alert.alert('Choose another station', 'Your departure and destination stations cannot be the same.');
        return;
      }
      setFrom(station);
      setEditingEndpoint('to');
      return;
    }
    if (station.code === from.code) {
      Alert.alert('Choose another station', 'Your destination must be different from your departure station.');
      return;
    }
    setTo(station);
  };

  const openTrainDetails = (train: LiveTrain) => {
    router.push({
      pathname: '/train-details',
      params: {
        code: train.train_code,
        from: from.name,
        minutes: train.minutes_to_arrival === null ? '' : String(train.minutes_to_arrival),
        station: train.station,
        status: train.status,
        statusColor: train.status_color,
        to: to.name,
      },
    });
  };

  const openTickets = () => {
    router.push({ pathname: '/tickets', params: { from: from.name, to: to.name } });
  };

  const openSchedule = () => {
    router.push({ pathname: '/schedule', params: { from: from.name, to: to.name } });
  };

  const loadTrains = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from('live_trains')
      .select('id, train_code, status, status_color, minutes_to_arrival, stations(name)')
      .order('minutes_to_arrival');
    setLoading(false);
    if (loadError) {
      setError(loadError.message);
      return;
    }
    const mapped = (data ?? []).map((row) => {
      const related = row.stations as { name?: string } | { name?: string }[] | null;
      const station = Array.isArray(related) ? related[0]?.name : related?.name;
      return {
        id: row.id,
        train_code: row.train_code,
        status: row.status,
        status_color: row.status_color,
        minutes_to_arrival: row.minutes_to_arrival,
        station: station ?? 'Location unavailable',
      } satisfies LiveTrain;
    });
    setError('');
    setTrains(mapped);
    setSelectedCode((current) => current ?? mapped[0]?.train_code ?? null);
  }, []);

  useEffect(() => {
    void loadTrains();
    const channel = supabase
      .channel('live-train-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_trains' }, () => void loadTrains())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadTrains]);

  return (
    <View style={styles.container}>
      <View style={styles.mapBackground}>
        <TransitMap from={from} onStationPress={selectMapStation} selectedStation={selectedStation} to={to} />
        <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.mapHeader}>
          <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#0785C5" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.mapInstruction}>
          Editing <Text style={styles.mapInstructionStrong}>{editingEndpoint === 'from' ? 'From' : 'To'}</Text> · tap a station marker
        </Text>
        <View style={styles.routeContainer}>
          <TouchableOpacity
            accessibilityLabel={`Change departure station, currently ${from.name}`}
            accessibilityRole="button"
            onPress={() => setEditingEndpoint('from')}
            style={[styles.routeRow, editingEndpoint === 'from' && styles.routeRowActive]}
          >
            <View style={[styles.endpointDot, styles.fromDot]} />
            <Text style={styles.routeLabel}>From</Text>
            <View style={styles.locationContainer}>
              <Text numberOfLines={1} style={styles.locationText}>{from.name}</Text>
              <Text numberOfLines={1} style={styles.areaText}>{from.area}</Text>
            </View>
            <Ionicons name="locate-outline" size={20} color="#0785C5" />
          </TouchableOpacity>
          <View style={styles.routeDivider} />
          <TouchableOpacity
            accessibilityLabel={`Change destination station, currently ${to.name}`}
            accessibilityRole="button"
            onPress={() => setEditingEndpoint('to')}
            style={[styles.routeRow, editingEndpoint === 'to' && styles.routeRowActive]}
          >
            <View style={[styles.endpointDot, styles.toDot]} />
            <Text style={styles.routeLabel}>To</Text>
            <View style={styles.locationContainer}>
              <Text numberOfLines={1} style={styles.locationText}>{to.name}</Text>
              <Text numberOfLines={1} style={styles.areaText}>{to.area}</Text>
            </View>
            <Ionicons name="locate-outline" size={20} color="#0785C5" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity accessibilityRole="button" onPress={openSchedule} style={styles.secondaryAction}>
            <Ionicons name="calendar-outline" size={17} color="#067EBB" />
            <Text style={styles.secondaryActionText}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" onPress={openTickets} style={styles.primaryAction}>
            <Ionicons name="ticket-outline" size={17} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Find tickets</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.trainListContent} showsVerticalScrollIndicator={false} style={styles.trainList}>
          {loading ? <Text style={styles.emptyText}>Loading live train data…</Text> : null}
          {error ? <Text style={styles.emptyText}>{error}</Text> : null}
          {!loading && !error && trains.length === 0 ? <Text style={styles.emptyText}>No live trains are reporting right now.</Text> : null}
          {!loading && !error && trains.length > 0 && visibleTrains.length === 0 ? <Text style={styles.emptyText}>No live trains are currently reporting along this selected section.</Text> : null}
          {visibleTrains.map((train) => {
            const selected = selectedCode === train.train_code;
            return (
              <View
                accessibilityState={{ selected }}
                key={train.id}
                style={[styles.trainItem, selected && styles.trainItemActive]}
              >
                <TouchableOpacity accessibilityRole="button" onPress={() => setSelectedCode(train.train_code)} style={styles.trainSummary}>
                  <View style={[styles.trainIconContainer, selected && styles.trainIconSelected]}>
                    <Ionicons name="train-outline" size={23} color="#161616" />
                  </View>
                  <View style={styles.trainDetails}>
                    <View style={styles.trainHeader}>
                      <Text style={styles.trainCode}>{train.train_code}</Text>
                      <Text style={styles.trainStation}>{train.station}</Text>
                    </View>
                    <View style={styles.arrivalContainer}>
                      <View style={[styles.statusDot, { backgroundColor: train.status_color }]} />
                      <Text style={[styles.arrivalText, { color: train.status_color }]}>{train.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity accessibilityLabel={`View details for train ${train.train_code}`} accessibilityRole="button" onPress={() => openTrainDetails(train)} style={styles.detailsButton}>
                  <Ionicons name="chevron-forward-circle" size={25} color="#0785C5" />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mapBackground: { flex: 52, width: '100%' },
  mapHeader: { ...StyleSheet.absoluteFillObject },
  backButton: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.88)', margin: 12, borderRadius: 19 },
  bottomSheet: { flex: 48, backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, marginTop: -22, paddingTop: 8, paddingHorizontal: 0, overflow: 'hidden' },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#CBD0D4', alignSelf: 'center', marginBottom: 5 },
  mapInstruction: { textAlign: 'center', fontSize: 12, color: '#64717A', marginBottom: 7 },
  mapInstructionStrong: { color: '#0785C5', fontWeight: '800' },
  routeContainer: { backgroundColor: '#F3F5F6', borderRadius: 12, padding: 5, marginHorizontal: 20, marginBottom: 8 },
  routeRow: { flexDirection: 'row', alignItems: 'center', minHeight: 43, paddingHorizontal: 9, borderRadius: 8 },
  routeRowActive: { backgroundColor: '#FFFFFF', shadowColor: '#0A3348', shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
  routeDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#C8CDD0', marginLeft: 76, marginRight: 10 },
  endpointDot: { width: 9, height: 9, borderRadius: 5, marginRight: 9 },
  fromDot: { backgroundColor: '#138A36' },
  toDot: { backgroundColor: '#D33232' },
  routeLabel: { width: 48, fontSize: 14, fontWeight: '800', color: '#222222' },
  locationContainer: { flex: 1, paddingVertical: 4 },
  locationText: { fontSize: 15, lineHeight: 18, color: '#30363A', fontWeight: '700' },
  areaText: { fontSize: 10, lineHeight: 13, color: '#7A848A', fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 6 },
  secondaryAction: { flex: 1, minHeight: 36, borderWidth: 1, borderColor: '#BBDDEC', borderRadius: 9, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  secondaryActionText: { color: '#067EBB', fontSize: 13, fontWeight: '800' },
  primaryAction: { flex: 1.25, minHeight: 36, borderRadius: 9, backgroundColor: '#0785C5', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  trainList: { flex: 1 },
  trainListContent: { paddingBottom: 8 },
  trainItem: { minHeight: 64, flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E7E7E7' },
  trainItemActive: { backgroundColor: '#D9F3F5', borderBottomColor: '#D9F3F5' },
  trainSummary: { flex: 1, minHeight: 64, flexDirection: 'row', alignItems: 'center' },
  detailsButton: { width: 46, height: 52, alignItems: 'flex-end', justifyContent: 'center' },
  trainIconContainer: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  trainIconSelected: { backgroundColor: 'transparent' },
  trainDetails: { flex: 1 },
  trainHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' },
  trainCode: { fontSize: 15, fontWeight: '800', color: '#202020', marginRight: 8 },
  trainStation: { fontSize: 14, color: '#666666' },
  arrivalContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  arrivalText: { fontSize: 13, lineHeight: 17, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#64748B', marginVertical: 24 },
});
