import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ticketOptions = [
  { id: 'morning', start: '07:30', end: '08:00', duration: 30, price: 40 },
  { id: 'midmorning', start: '09:14', end: '09:41', duration: 27, price: 20 },
  { id: 'midday', start: '11:20', end: '12:01', duration: 41, price: 35 },
];

export default function Tickets() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string | string[]; to?: string | string[]; date?: string | string[] }>();
  const valueOf = (value: string | string[] | undefined, fallback: string) => Array.isArray(value) ? value[0] || fallback : value || fallback;
  const from = valueOf(params.from, 'Pretoria');
  const to = valueOf(params.to, 'Park Station');
  const date = valueOf(params.date, new Date().toLocaleDateString('en-ZA'));
  const [sortByPrice, setSortByPrice] = useState(false);
  const options = useMemo(
    () => [...ticketOptions].sort((a, b) => sortByPrice ? a.price - b.price : a.start.localeCompare(b.start)),
    [sortByPrice],
  );

  const buyTicket = (start: string, price: number) => {
    Alert.alert('Confirm demo ticket', `${from} to ${to}\n${date} at ${start}\nR${price.toFixed(2)}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => Alert.alert('Ticket reserved', 'Your demo ticket has been added successfully.') },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0076CB" />
          <Text style={styles.headerTitle}>Tickets</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tripCard}>
        <View style={styles.tripRow}>
          <View style={styles.tripPoint}>
            <Text style={styles.label}>FROM</Text>
            <Text numberOfLines={1} style={styles.inputText}>{from}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#0076CB" />
          <View style={[styles.tripPoint, styles.tripPointRight]}>
            <Text style={styles.label}>TO</Text>
            <Text numberOfLines={1} style={styles.inputText}>{to}</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={20} color="#0076CB" />
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.resultsTitle}>Available trains</Text>
            <Text style={styles.resultsSubtitle}>{options.length} demo options</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel={sortByPrice ? 'Sort by departure time' : 'Sort by lowest price'}
            accessibilityRole="button"
            onPress={() => setSortByPrice((current) => !current)}
            style={[styles.filterButton, sortByPrice && styles.filterButtonActive]}
          >
            <Ionicons name="options-outline" size={22} color={sortByPrice ? '#FFFFFF' : '#0076CB'} />
            <Text style={[styles.filterText, sortByPrice && styles.filterTextActive]}>{sortByPrice ? 'Price' : 'Time'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map((ticket) => (
            <View key={ticket.id} style={styles.ticketItem}>
              <View style={styles.timeInfo}>
                <Text style={styles.timeText}>{ticket.start} <Text style={styles.timeDash}>→</Text> {ticket.end}</Text>
                <View style={styles.durationContainer}>
                  <Ionicons name="time-outline" size={16} color="#0076CB" />
                  <Text style={styles.durationText}>{ticket.duration} min · direct</Text>
                </View>
              </View>
              <TouchableOpacity accessibilityLabel={`Buy ticket for R${ticket.price}`} accessibilityRole="button" onPress={() => buyTicket(ticket.start, ticket.price)} style={styles.priceButton}>
                <Text style={styles.priceText}>R{ticket.price.toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  headerTitle: { fontSize: 20, color: '#0076CB', fontWeight: '700', marginLeft: 5 },
  tripCard: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16 },
  tripRow: { flexDirection: 'row', alignItems: 'center' },
  tripPoint: { flex: 1 },
  tripPointRight: { alignItems: 'flex-end' },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: '#64748B', marginBottom: 5 },
  inputText: { fontSize: 16, fontWeight: '700', color: '#1E293B', maxWidth: '92%' },
  dateRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#CBD5E1', paddingTop: 14, marginTop: 16 },
  dateText: { fontSize: 14, color: '#475569', marginLeft: 8 },
  bottomSheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 22 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  resultsTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  resultsSubtitle: { color: '#64748B', fontSize: 12, marginTop: 2 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, minHeight: 42, borderRadius: 12, backgroundColor: '#EFF6FF' },
  filterButtonActive: { backgroundColor: '#0076CB' },
  filterText: { color: '#0076CB', fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  ticketItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' },
  timeInfo: { flex: 1 },
  timeText: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 7 },
  timeDash: { color: '#0076CB' },
  durationContainer: { flexDirection: 'row', alignItems: 'center' },
  durationText: { fontSize: 13, color: '#64748B', marginLeft: 5 },
  priceButton: { backgroundColor: '#0076CB', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  priceText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
