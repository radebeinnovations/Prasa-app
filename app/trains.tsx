import { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const trains = [
  { code: 'KTS/MDA-1122', station: 'Pretoria', status: 'Arriving now', color: '#15803D' },
  { code: 'MDA/ALT-8742', station: 'Midrand', status: 'Arrives in 31 min', color: '#B91C1C' },
  { code: 'JHB/PTA-3901', station: 'Sandton', status: 'Arrives in 48 min', color: '#B45309' },
];

export default function Trains() {
  const router = useRouter();
  const [selectedCode, setSelectedCode] = useState(trains[0].code);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/route-map.png')} style={styles.mapBackground}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={27} color="#0F172A" />
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>

      <SafeAreaView edges={['bottom']} style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.routeContainer}>
          <View style={styles.routeStop}>
            <View style={styles.originDot} />
            <View><Text style={styles.routeLabel}>FROM</Text><Text style={styles.locationText}>Pretoria</Text></View>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#0076CB" />
          <View style={[styles.routeStop, styles.routeStopEnd]}>
            <View><Text style={[styles.routeLabel, styles.alignRight]}>TO</Text><Text style={styles.locationText}>Johannesburg</Text></View>
            <View style={styles.destinationDot} />
          </View>
        </View>

        <Text style={styles.listTitle}>Live train status</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {trains.map((train) => {
            const selected = selectedCode === train.code;
            return (
              <TouchableOpacity
                accessibilityState={{ selected }}
                accessibilityRole="button"
                key={train.code}
                onPress={() => setSelectedCode(train.code)}
                style={[styles.trainItem, selected && styles.trainItemActive]}
              >
                <View style={[styles.trainIconContainer, selected && styles.trainIconSelected]}>
                  <Ionicons name="train-outline" size={23} color={selected ? '#FFFFFF' : '#0076CB'} />
                </View>
                <View style={styles.trainDetails}>
                  <View style={styles.trainHeader}>
                    <Text style={styles.trainCode}>{train.code}</Text>
                    <Text style={styles.trainStation}>{train.station}</Text>
                  </View>
                  <View style={styles.arrivalContainer}>
                    <View style={[styles.statusDot, { backgroundColor: train.color }]} />
                    <Text style={[styles.arrivalText, { color: train.color }]}>{train.status}</Text>
                  </View>
                </View>
                <Ionicons name={selected ? 'checkmark-circle' : 'chevron-forward-circle'} size={27} color="#0076CB" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  mapBackground: { height: '52%', width: '100%' },
  backButton: { width: 46, height: 46, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.92)', margin: 14, borderRadius: 23 },
  bottomSheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, paddingTop: 12, paddingHorizontal: 20 },
  sheetHandle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 16 },
  routeContainer: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  routeStop: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  routeStopEnd: { justifyContent: 'flex-end' },
  routeLabel: { fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 1 },
  alignRight: { textAlign: 'right' },
  locationText: { fontSize: 14, color: '#1E293B', fontWeight: '700', marginTop: 2 },
  originDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#0076CB' },
  destinationDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#F4B400' },
  listTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  trainItem: { flexDirection: 'row', padding: 14, marginBottom: 8, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  trainItemActive: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  trainIconContainer: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', marginRight: 12 },
  trainIconSelected: { backgroundColor: '#0076CB' },
  trainDetails: { flex: 1 },
  trainHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' },
  trainCode: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginRight: 8 },
  trainStation: { fontSize: 13, color: '#64748B' },
  arrivalContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  arrivalText: { fontSize: 12, fontWeight: '600' },
});
