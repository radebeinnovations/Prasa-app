import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';

const paramValue = (value: string | string[] | undefined, fallback: string) => Array.isArray(value) ? value[0] || fallback : value || fallback;

export default function TrainDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string | string[]; from?: string | string[]; minutes?: string | string[]; station?: string | string[]; status?: string | string[]; statusColor?: string | string[]; to?: string | string[] }>();
  const code = paramValue(params.code, 'PRASA train');
  const from = paramValue(params.from, 'Pretoria');
  const to = paramValue(params.to, 'Park Station');
  const station = paramValue(params.station, 'Location unavailable');
  const status = paramValue(params.status, 'Live status unavailable');
  const statusColor = paramValue(params.statusColor, '#0785C5');
  const minutes = paramValue(params.minutes, '');

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScreenHeader title="Train details" />
      <View style={styles.content}>
        <View style={styles.trainBadge}><Ionicons name="train-outline" size={38} color="#0785C5" /></View>
        <Text style={styles.code}>{code}</Text>
        <View style={styles.statusRow}><View style={[styles.statusDot, { backgroundColor: statusColor }]} /><Text style={[styles.status, { color: statusColor }]}>{status}</Text></View>

        <View style={styles.card}>
          <View style={styles.infoRow}><Ionicons name="location-outline" size={21} color="#0785C5" /><View style={styles.infoText}><Text style={styles.infoLabel}>Current reported station</Text><Text style={styles.infoValue}>{station}</Text></View></View>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Ionicons name="navigate-outline" size={21} color="#0785C5" /><View style={styles.infoText}><Text style={styles.infoLabel}>Selected journey</Text><Text style={styles.infoValue}>{from} → {to}</Text></View></View>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Ionicons name="time-outline" size={21} color="#0785C5" /><View style={styles.infoText}><Text style={styles.infoLabel}>Estimated arrival</Text><Text style={styles.infoValue}>{minutes ? `${minutes} minute${minutes === '1' ? '' : 's'}` : 'Not currently available'}</Text></View></View>
        </View>

        <Text style={styles.note}>Live train positions and times are estimates and may change due to operational conditions.</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/schedule', params: { from, to } })} style={styles.secondaryButton}><Ionicons name="calendar-outline" size={18} color="#0785C5" /><Text style={styles.secondaryText}>Schedule</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/tickets', params: { from, to } })} style={styles.primaryButton}><Ionicons name="ticket-outline" size={18} color="#FFFFFF" /><Text style={styles.primaryText}>Find tickets</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 26 },
  trainBadge: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#E9F5FB', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  code: { color: '#1F2933', fontSize: 25, fontWeight: '900', textAlign: 'center', marginTop: 13 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 7 },
  statusDot: { width: 9, height: 9, borderRadius: 5, marginRight: 7 },
  status: { fontSize: 15, fontWeight: '700' },
  card: { borderRadius: 14, backgroundColor: '#F4F7F8', paddingHorizontal: 17, marginTop: 28 },
  infoRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 13 },
  infoLabel: { color: '#71808A', fontSize: 12, fontWeight: '600', marginBottom: 3 },
  infoValue: { color: '#25313A', fontSize: 16, lineHeight: 21, fontWeight: '800' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#D7E0E4', marginLeft: 34 },
  note: { color: '#71808A', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 20, paddingHorizontal: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 'auto', marginBottom: 12 },
  secondaryButton: { flex: 1, height: 56, borderRadius: 8, borderWidth: 1, borderColor: '#B9DDEC', flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#0785C5', fontSize: 15, fontWeight: '800' },
  primaryButton: { flex: 1.15, height: 56, borderRadius: 8, backgroundColor: '#0785C5', flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
