import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectField } from '../components/SelectField';
import { ScreenHeader } from '../components/ScreenHeader';
import { estimateArrivalTime, estimateJourneyMinutes } from '../lib/route-stations';
import { supabase } from '../lib/supabase';
import { getTicketOptions } from '../lib/ticket-options';
import type { Station } from '../lib/types';

export default function Schedule() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string | string[]; to?: string | string[] }>();
  const initialFrom = Array.isArray(params.from) ? params.from[0] : params.from;
  const initialTo = Array.isArray(params.to) ? params.to[0] : params.to;
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayLabel = new Date(`${todayIso}T12:00:00`).toLocaleDateString('en-ZA');
  const [stations, setStations] = useState<Station[]>([]);
  const [departureTimes, setDepartureTimes] = useState<string[]>([]);
  const [fullRouteDuration, setFullRouteDuration] = useState(70);
  const [loadError, setLoadError] = useState('');
  const [checkingSeats, setCheckingSeats] = useState(false);
  const [hasLiveSeatInventory, setHasLiveSeatInventory] = useState(true);
  const [startStation, setStartStation] = useState(initialFrom || '');
  const [startTime, setStartTime] = useState('');
  const [endStation, setEndStation] = useState(initialTo || '');
  const stationOptions = useMemo(() => stations.map((station) => station.name), [stations]);
  const estimatedDuration = useMemo(
    () => estimateJourneyMinutes(startStation, endStation, fullRouteDuration),
    [endStation, fullRouteDuration, startStation],
  );
  const estimatedArrival = useMemo(
    () => estimateArrivalTime(startTime, estimatedDuration),
    [estimatedDuration, startTime],
  );

  useEffect(() => {
    const loadScheduleData = async () => {
      const [stationsResult, tripsResult] = await Promise.all([
        supabase.from('stations').select('id, code, name, area, latitude, longitude').eq('active', true).order('name'),
        supabase.from('scheduled_trips').select('departure_time, duration_minutes').eq('active', true).order('departure_time'),
      ]);
      const error = stationsResult.error ?? tripsResult.error;
      if (error) {
        setLoadError(error.message);
        return;
      }
      setLoadError('');
      setStations((stationsResult.data ?? []) as Station[]);
      const durations = (tripsResult.data ?? []).map((trip) => Number(trip.duration_minutes)).filter((duration) => duration > 0);
      if (durations.length > 0) {
        setFullRouteDuration(Math.round(durations.reduce((total, duration) => total + duration, 0) / durations.length));
      }
    };
    void loadScheduleData();
  }, []);

  useEffect(() => {
    const origin = stations.find((station) => station.name === startStation);
    const destination = stations.find((station) => station.name === endStation);
    if (!origin || !destination || origin.id === destination.id) {
      setDepartureTimes([]);
      setStartTime('');
      return;
    }

    let cancelled = false;
    const loadAvailableTimes = async () => {
      setCheckingSeats(true);
      const result = await getTicketOptions({
        originStationId: origin.id,
        destinationStationId: destination.id,
        earliestTime: null,
        travelDate: todayIso,
      });
      if (cancelled) return;
      setCheckingSeats(false);
      if (result.error) {
        setLoadError(result.error);
        setDepartureTimes([]);
        setStartTime('');
        return;
      }
      setLoadError('');
      setHasLiveSeatInventory(result.hasLiveSeatInventory);
      const availableTimes = [...new Set(
        result.data
          .filter((trip) => trip.seats_remaining === null || trip.seats_remaining > 0)
          .map((trip) => trip.departure_time.slice(0, 5)),
      )];
      setDepartureTimes(availableTimes);
      setStartTime((current) => availableTimes.includes(current) ? current : '');
    };
    void loadAvailableTimes();
    return () => { cancelled = true; };
  }, [endStation, startStation, stations, todayIso]);

  const reset = () => {
    setStartStation('');
    setStartTime('');
    setEndStation('');
  };

  const search = () => {
    if (!startStation || !startTime || !endStation || !estimatedArrival.time) {
      Alert.alert('Complete your trip', 'Select both stations and a departure time before searching.');
      return;
    }
    if (startStation === endStation) {
      Alert.alert('Choose another destination', 'The start and end stations must be different.');
      return;
    }
    router.push({ pathname: '/tickets', params: { from: startStation, to: endStation, date: todayIso, startTime } });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScreenHeader title="Schedule" right={<TouchableOpacity accessibilityLabel="Reset schedule form" onPress={reset} style={styles.resetButton}><Ionicons name="refresh-outline" size={22} color="#0785C5" /></TouchableOpacity>} />

      <ScrollView contentContainerStyle={styles.content}>
        {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
        {!checkingSeats && !hasLiveSeatInventory && startStation && endStation && !loadError ? <Text style={styles.inventoryNotice}>Showing scheduled departures. Seat availability will be checked again when booking.</Text> : null}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Station:</Text>
          <SelectField accessibilityLabel="Select start station" onChange={setStartStation} options={stationOptions} value={startStation} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>End Station:</Text>
          <SelectField accessibilityLabel="Select end station" onChange={setEndStation} options={stationOptions} value={endStation} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Time:</Text>
          <SelectField
            accessibilityLabel="Select available start time"
            onChange={setStartTime}
            options={departureTimes}
            placeholder={checkingSeats ? 'CHECKING SEATS…' : startStation && endStation ? departureTimes.length > 0 ? '-SELECT-' : 'NO SEATS' : 'SELECT ROUTE FIRST'}
            value={startTime}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>End Time:</Text>
          <View accessibilityLabel={estimatedArrival.time ? `Estimated arrival ${estimatedArrival.time}` : 'Estimated arrival not available yet'} style={styles.estimateBox}>
            <Ionicons name="time-outline" size={21} color={estimatedArrival.time ? '#0785C5' : '#8A949A'} />
            <View style={styles.estimateTextContainer}>
              <Text style={[styles.estimateTime, !estimatedArrival.time && styles.estimatePlaceholder]}>
                {estimatedArrival.time || '--:--'}{estimatedArrival.nextDay ? ' +1 day' : ''}
              </Text>
              <Text style={styles.estimateCaption}>
                {estimatedDuration > 0 ? `Estimated · ${estimatedDuration} min` : 'Select route and start time'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.label}>Date:</Text>
          <View style={styles.dateBox}>
            <Ionicons name="calendar-outline" size={22} color="#0076CB" />
            <Text style={styles.dateText}>{todayLabel}</Text>
          </View>
        </View>

        <TouchableOpacity accessibilityRole="button" onPress={search} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search Train</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  resetButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 28, paddingTop: 38, paddingBottom: 26, flexGrow: 1 },
  errorText: { color: '#B91C1C', fontSize: 14, marginBottom: 18 },
  inventoryNotice: { color: '#795300', backgroundColor: '#FFF8E5', borderRadius: 7, fontSize: 12, lineHeight: 17, padding: 10, marginBottom: 18 },
  formGroup: { flexDirection: 'row', alignItems: 'center', marginBottom: 27, gap: 14 },
  label: { fontSize: 16, fontWeight: '700', color: '#202020', flex: 1 },
  estimateBox: { flex: 1.5, minHeight: 62, backgroundColor: '#EEF8FC', borderWidth: 1, borderColor: '#CBE7F2', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 6 },
  estimateTextContainer: { flex: 1, marginLeft: 10 },
  estimateTime: { fontSize: 17, lineHeight: 21, color: '#202020', fontWeight: '800' },
  estimatePlaceholder: { color: '#7D878C' },
  estimateCaption: { fontSize: 11, lineHeight: 15, color: '#60717A', fontWeight: '600' },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 36, gap: 14 },
  dateBox: { flex: 1.5, minHeight: 56, backgroundColor: '#F1F1F1', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 6 },
  dateText: { fontSize: 16, color: '#555555', marginLeft: 12 },
  searchButton: { backgroundColor: '#0785C5', height: 60, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 'auto' },
  searchButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
