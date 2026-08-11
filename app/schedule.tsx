import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectField } from '../components/SelectField';

const stationOptions = ['Pretoria', 'Centurion', 'Midrand', 'Marlboro', 'Sandton', 'Rosebank', 'Park Station', 'Nasrec'];
const timeOptions = ['05:00', '06:30', '07:30', '09:00', '12:00', '15:30', '17:00', '19:30'];

export default function Schedule() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string | string[] }>();
  const initialFrom = Array.isArray(params.from) ? params.from[0] : params.from;
  const today = new Date().toLocaleDateString('en-ZA');
  const [startStation, setStartStation] = useState(initialFrom || '');
  const [startTime, setStartTime] = useState('');
  const [endStation, setEndStation] = useState('');
  const [endTime, setEndTime] = useState('');

  const reset = () => {
    setStartStation('');
    setStartTime('');
    setEndStation('');
    setEndTime('');
  };

  const search = () => {
    if (!startStation || !startTime || !endStation || !endTime) {
      Alert.alert('Complete your trip', 'Select both stations and times before searching.');
      return;
    }
    if (startStation === endStation) {
      Alert.alert('Choose another destination', 'The start and end stations must be different.');
      return;
    }
    router.push({ pathname: '/tickets', params: { from: startStation, to: endStation, date: today } });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0076CB" />
          <Text style={styles.headerTitle}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Reset schedule form" accessibilityRole="button" onPress={reset} style={styles.resetButton}>
          <Ionicons name="refresh-outline" size={24} color="#0076CB" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>Plan a trip and view the available ticket options.</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start station</Text>
          <SelectField accessibilityLabel="Select start station" onChange={setStartStation} options={stationOptions} value={startStation} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start time</Text>
          <SelectField accessibilityLabel="Select start time" onChange={setStartTime} options={timeOptions} value={startTime} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>End station</Text>
          <SelectField accessibilityLabel="Select end station" onChange={setEndStation} options={stationOptions} value={endStation} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>End time</Text>
          <SelectField accessibilityLabel="Select end time" onChange={setEndTime} options={timeOptions} value={endTime} />
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateBox}>
            <Ionicons name="calendar-outline" size={22} color="#0076CB" />
            <Text style={styles.dateText}>{today}</Text>
          </View>
        </View>

        <TouchableOpacity accessibilityRole="button" onPress={search} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search trains</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  headerTitle: { fontSize: 20, color: '#0076CB', fontWeight: '700', marginLeft: 5 },
  resetButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, flexGrow: 1 },
  intro: { color: '#64748B', fontSize: 14, lineHeight: 21, marginBottom: 24 },
  formGroup: { flexDirection: 'row', alignItems: 'center', marginBottom: 22, gap: 14 },
  label: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 36, gap: 14 },
  dateBox: { flex: 1.5, minHeight: 52, backgroundColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 10 },
  dateText: { fontSize: 16, color: '#334155', marginLeft: 12 },
  searchButton: { backgroundColor: '#0076CB', padding: 17, borderRadius: 10, alignItems: 'center', marginTop: 'auto' },
  searchButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
