import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { SelectField } from '../components/SelectField';
import { estimateArrivalTime, estimateJourneyMinutes, routeStations } from '../lib/route-stations';
import { supabase } from '../lib/supabase';
import { getTicketOptions } from '../lib/ticket-options';
import type { Station, TicketOption } from '../lib/types';

export default function Tickets() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string | string[]; to?: string | string[]; date?: string | string[]; startTime?: string | string[] }>();
  const valueOf = (value: string | string[] | undefined, fallback: string) => Array.isArray(value) ? value[0] || fallback : value || fallback;
  const [from, setFrom] = useState(() => valueOf(params.from, 'Pretoria'));
  const [to, setTo] = useState(() => valueOf(params.to, 'Park Station'));
  const toLabel = to === 'Park Station' ? 'Johannesburg' : to;
  const date = valueOf(params.date, new Date().toISOString().slice(0, 10));
  const startTime = valueOf(params.startTime, '');
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString('en-ZA');
  const [ticketOptions, setTicketOptions] = useState<TicketOption[]>([]);
  const [stationIds, setStationIds] = useState<{ origin: number; destination: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [hasLiveSeatInventory, setHasLiveSeatInventory] = useState(true);
  const [sortByPrice, setSortByPrice] = useState(false);
  const stationNames = routeStations.map((station) => station.name);
  const fromOptions = stationNames.filter((station) => station !== to);
  const toOptions = stationNames.filter((station) => station !== from);
  const options = useMemo(
    () => [...ticketOptions].sort((a, b) => {
      if ((a.seats_remaining === 0) !== (b.seats_remaining === 0)) return a.seats_remaining === 0 ? 1 : -1;
      return sortByPrice ? Number(a.price) - Number(b.price) : a.departure_time.localeCompare(b.departure_time);
    }),
    [sortByPrice, ticketOptions],
  );
  const availableOptionCount = options.filter((option) => option.seats_remaining !== 0).length;

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      if (from === to) {
        setTicketOptions([]);
        setError('Departure and destination stations must be different.');
        setLoading(false);
        return;
      }
      const { data: stationData, error: stationError } = await supabase
        .from('stations')
        .select('id, code, name, area, latitude, longitude')
        .in('name', [from, to]);
      if (stationError) {
        setError(stationError.message);
        setLoading(false);
        return;
      }
      const foundStations = (stationData ?? []) as Station[];
      const origin = foundStations.find((station) => station.name === from);
      const destination = foundStations.find((station) => station.name === to);
      if (!origin || !destination) {
        setError('One or both selected stations are not available.');
        setLoading(false);
        return;
      }
      setStationIds({ origin: origin.id, destination: destination.id });
      const optionsResult = await getTicketOptions({
        originStationId: origin.id,
        destinationStationId: destination.id,
        earliestTime: startTime || null,
        travelDate: date,
      });
      setLoading(false);
      if (optionsResult.error) {
        setError(optionsResult.error);
        return;
      }
      setError('');
      setHasLiveSeatInventory(optionsResult.hasLiveSeatInventory);
      setTicketOptions(optionsResult.data.map((ticket) => {
        const estimatedDuration = estimateJourneyMinutes(from, to, ticket.duration_minutes);
        const estimatedArrival = estimateArrivalTime(ticket.departure_time, estimatedDuration);
        return {
          ...ticket,
          arrival_time: estimatedArrival.time || ticket.arrival_time,
          duration_minutes: estimatedDuration || ticket.duration_minutes,
        };
      }));
    };
    void loadOptions();
  }, [date, from, refreshNonce, startTime, to]);

  const reserveTicket = async (ticket: TicketOption) => {
    if (!stationIds) return;
    setReservingId(ticket.scheduled_trip_id);
    const { data, error: reservationError } = await supabase.rpc('reserve_ticket', {
      p_scheduled_trip_id: ticket.scheduled_trip_id,
      p_origin_station_id: stationIds.origin,
      p_destination_station_id: stationIds.destination,
      p_travel_date: date,
    });
    setReservingId(null);
    if (reservationError) {
      Alert.alert('Could not reserve ticket', reservationError.message);
      setRefreshNonce((current) => current + 1);
      return;
    }
    const reservation = (Array.isArray(data) ? data[0] : data) as { ticket_code?: string } | null;
    setRefreshNonce((current) => current + 1);
    Alert.alert(
      ticket.reservation_hold_minutes ? 'Seat held' : 'Ticket reserved',
      ticket.reservation_hold_minutes
        ? `Reservation ${reservation?.ticket_code ?? ''} is holding one seat for ${ticket.reservation_hold_minutes} minutes. Complete payment before the hold expires.`
        : `Reservation ${reservation?.ticket_code ?? ''} has been created. Seat availability was checked again by the server.`,
    );
  };

  const confirmTicket = (ticket: TicketOption) => {
    if (ticket.seats_remaining !== null && ticket.seats_remaining <= 0) {
      Alert.alert('Train sold out', 'Choose another departure time. Seat availability is checked again before every reservation.');
      return;
    }
    const availabilityLine = ticket.seats_remaining === null
      ? 'Availability will be rechecked before booking'
      : `${ticket.seats_remaining} seat${ticket.seats_remaining === 1 ? '' : 's'} remaining`;
    const holdLine = ticket.reservation_hold_minutes ? `\n\nThe hold lasts ${ticket.reservation_hold_minutes} minutes.` : '';
    Alert.alert(ticket.reservation_hold_minutes ? 'Hold one seat?' : 'Reserve this ticket?', `${from} to ${toLabel}\n${dateLabel} at ${ticket.departure_time.slice(0, 5)}\n${availabilityLine}\nR${Number(ticket.price).toFixed(2)}${holdLine}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: ticket.reservation_hold_minutes ? 'Hold seat' : 'Reserve', onPress: () => void reserveTicket(ticket) },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScreenHeader title="Tickets" />

      <View style={styles.tripCard}>
        <View style={styles.tripRow}>
          <View style={styles.tripPoint}>
            <Text style={styles.label}>FROM</Text>
            <SelectField accessibilityLabel="Select departure station" onChange={setFrom} options={fromOptions} value={from} />
          </View>
          <View style={[styles.tripPoint, styles.tripPointRight]}>
            <Text style={styles.label}>TO</Text>
            <SelectField accessibilityLabel="Select destination station" onChange={setTo} options={toOptions} value={to} />
          </View>
        </View>
        <Text style={styles.dateLabel}>Date:</Text>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={19} color="#242424" />
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.resultsSubtitle}>{loading ? 'Checking departures…' : hasLiveSeatInventory ? `${availableOptionCount} trains with seats` : `${options.length} scheduled trains`}</Text>
          <TouchableOpacity
            accessibilityLabel={sortByPrice ? 'Sort by departure time' : 'Sort by lowest price'}
            accessibilityRole="button"
            onPress={() => setSortByPrice((current) => !current)}
            style={[styles.filterButton, sortByPrice && styles.filterButtonActive]}
          >
            <Ionicons name="options-outline" size={22} color={sortByPrice ? '#FFFFFF' : '#0076CB'} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {!loading && !hasLiveSeatInventory && !error ? (
            <View style={styles.availabilityNotice}>
              <Ionicons name="information-circle-outline" size={18} color="#9A6700" />
              <Text style={styles.availabilityNoticeText}>Live seat counts are temporarily unavailable. Availability is checked again when you reserve.</Text>
            </View>
          ) : null}
          {error ? <Text style={styles.emptyText}>{error}</Text> : null}
          {!loading && !error && options.length === 0 ? <Text style={styles.emptyText}>No trains match this trip and time.</Text> : null}
          {options.map((ticket) => (
            <View key={ticket.scheduled_trip_id} style={styles.ticketItem}>
              <View style={styles.timeInfo}>
                <Text style={styles.timeText}>{ticket.departure_time.slice(0, 5)} <Text style={styles.timeDash}>→</Text> {ticket.arrival_time.slice(0, 5)}</Text>
                <View style={styles.durationContainer}>
                  <Ionicons name="time-outline" size={16} color="#0076CB" />
                  <Text style={styles.durationText}>{ticket.duration_minutes} min · {ticket.train_code}</Text>
                </View>
                <View style={styles.seatContainer}>
                  <Ionicons name="people-outline" size={16} color={ticket.seats_remaining === null || ticket.seats_remaining <= 5 ? '#B45309' : '#15803D'} />
                  <Text style={[styles.seatText, (ticket.seats_remaining === null || ticket.seats_remaining <= 5) && styles.seatTextLow]}>
                    {ticket.seats_remaining === null ? 'Checked when booking' : ticket.seats_remaining === 0 ? 'Sold out' : `${ticket.seats_remaining} seat${ticket.seats_remaining === 1 ? '' : 's'} left`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity disabled={reservingId !== null || ticket.seats_remaining === 0} accessibilityLabel={ticket.seats_remaining === 0 ? 'Train sold out' : `Hold one seat for R${ticket.price}`} accessibilityRole="button" onPress={() => confirmTicket(ticket)} style={[styles.priceButton, ticket.seats_remaining === 0 && styles.soldOutButton, reservingId !== null && styles.disabled]}>
                <Text style={styles.priceText}>{reservingId === ticket.scheduled_trip_id ? 'Holding…' : ticket.seats_remaining === 0 ? 'SOLD OUT' : `R${Number(ticket.price).toFixed(2)}`}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  tripCard: { height: 285, backgroundColor: '#FFFFFF', paddingHorizontal: 28, paddingTop: 24 },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  tripPoint: { flex: 1 },
  tripPointRight: { alignItems: 'stretch' },
  label: { fontSize: 15, fontWeight: '700', color: '#202020', marginBottom: 10 },
  dateLabel: { fontSize: 15, fontWeight: '700', color: '#202020', marginTop: 17, marginBottom: 10 },
  dateRow: { height: 56, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F1F1', borderRadius: 6, paddingHorizontal: 14 },
  dateText: { flex: 1, textAlign: 'center', fontSize: 15, color: '#555555', marginRight: 22 },
  bottomSheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 28, paddingTop: 10, shadowColor: '#000000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  sheetHandle: { width: 28, height: 3, borderRadius: 2, backgroundColor: '#D1D1D1', alignSelf: 'center', marginBottom: 4 },
  sheetHeader: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultsSubtitle: { color: '#666666', fontSize: 14 },
  filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, minHeight: 40, borderRadius: 8, backgroundColor: '#FFFFFF' },
  filterButtonActive: { backgroundColor: '#0076CB' },
  ticketItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 112, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EFEFEF' },
  timeInfo: { flex: 1 },
  timeText: { fontSize: 17, fontWeight: '700', color: '#202020', marginBottom: 6 },
  timeDash: { color: '#0076CB' },
  durationContainer: { flexDirection: 'row', alignItems: 'center' },
  durationText: { fontSize: 14, color: '#666666', marginLeft: 4 },
  seatContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  seatText: { fontSize: 13, color: '#15803D', marginLeft: 4, fontWeight: '700' },
  seatTextLow: { color: '#B45309' },
  availabilityNotice: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E5', borderRadius: 8, padding: 10, marginBottom: 5 },
  availabilityNoticeText: { flex: 1, color: '#795300', fontSize: 12, lineHeight: 17, marginLeft: 7 },
  priceButton: { minWidth: 94, height: 58, backgroundColor: '#0785C5', alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
  soldOutButton: { backgroundColor: '#88949A' },
  priceText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 30, lineHeight: 21 },
  disabled: { opacity: 0.6 },
});
