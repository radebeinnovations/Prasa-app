import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectField } from '../components/SelectField';
import { ScreenHeader } from '../components/ScreenHeader';
import { supabase } from '../lib/supabase';
import type { Station } from '../lib/types';

const items = ['Documents', 'Small parcel', 'Medium parcel', 'Large parcel'];
const services = ['Normal', 'Priority', 'Same day'];

export default function Parcels() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [item, setItem] = useState('');
  const [service, setService] = useState('Normal');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ estimatedPrice: number; trackingCode: string } | null>(null);
  const stationNames = useMemo(() => stations.map((station) => station.name), [stations]);

  useEffect(() => {
    supabase.from('stations').select('id, code, name, area, latitude, longitude').eq('active', true).order('name').then(({ data, error: loadError }) => {
      if (loadError) setError(loadError.message);
      else setStations((data ?? []) as Station[]);
    });
  }, []);

  const createOrder = () => {
    const numericWeight = Number(weight.replace(',', '.'));
    if (!from || !to || !item || !service || !weight) {
      Alert.alert('Complete the parcel details', 'Select each option and enter the parcel weight.');
      return;
    }
    if (from === to) {
      Alert.alert('Choose another destination', 'The collection and destination stations must be different.');
      return;
    }
    if (!Number.isFinite(numericWeight) || numericWeight <= 0 || numericWeight > 30) {
      Alert.alert('Invalid weight', 'Enter a weight between 0.1 kg and 30 kg.');
      return;
    }
    const origin = stations.find((station) => station.name === from);
    const destination = stations.find((station) => station.name === to);
    if (!origin || !destination) {
      Alert.alert('Stations unavailable', 'Refresh the screen and select the stations again.');
      return;
    }
    Alert.alert('Create parcel order?', `${from} to ${to}\n${numericWeight.toFixed(1)} kg · ${service}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Create', onPress: () => void saveOrder(origin.id, destination.id, numericWeight) },
    ]);
  };

  const saveOrder = async (originId: number, destinationId: number, numericWeight: number) => {
    setSaving(true);
    const { data, error: orderError } = await supabase.rpc('create_parcel_order', {
      p_origin_station_id: originId,
      p_destination_station_id: destinationId,
      p_item_type: item,
      p_service_level: service,
      p_weight_kg: numericWeight,
    });
    setSaving(false);
    if (orderError) {
      Alert.alert('Could not create order', orderError.message);
      return;
    }
    const result = (Array.isArray(data) ? data[0] : data) as { estimated_price?: number; tracking_code?: string } | null;
    setResult({ estimatedPrice: Number(result?.estimated_price ?? 0), trackingCode: result?.tracking_code ?? 'Pending' });
  };

  if (result) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.resultContainer}>
        <ScreenHeader title="Parcels" />
        <Text style={styles.resultIntro}>Your parcel order is ready and the transport cost is</Text>
        <Text style={styles.resultPrice}>R {result.estimatedPrice.toFixed(2)} + VAT</Text>
        <Ionicons name="cube" size={112} color="#E7F5FB" style={styles.resultCube} />
        <Text style={styles.tracking}>Tracking: {result.trackingCode}</Text>
        <TouchableOpacity onPress={() => setResult(null)} style={styles.okButton}><Text style={styles.okText}>Ok</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScreenHeader title="Parcels" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.formGroup}>
          <Text style={styles.label}>From:</Text>
          <SelectField accessibilityLabel="Select collection station" onChange={setFrom} options={stationNames} value={from} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>To:</Text>
          <SelectField accessibilityLabel="Select destination station" onChange={setTo} options={stationNames} value={to} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Item:</Text>
          <SelectField accessibilityLabel="Select parcel type" onChange={setItem} options={items} value={item} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Train:</Text>
          <SelectField accessibilityLabel="Select parcel service" onChange={setService} options={services} value={service} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Weight</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              accessibilityLabel="Parcel weight in kilograms"
              keyboardType="decimal-pad"
              maxLength={5}
              onChangeText={setWeight}
              placeholder="0.0"
              placeholderTextColor="#64748B"
              style={styles.input}
              value={weight}
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        </View>

        <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={createOrder} style={[styles.calculateButton, saving && styles.disabled]}>
          <Text style={styles.calculateButtonText}>{saving ? 'Calculating…' : 'Calculate'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 28, paddingTop: 40, paddingBottom: 26, flexGrow: 1 },
  errorText: { color: '#B91C1C', fontSize: 14, marginBottom: 18 },
  formGroup: { flexDirection: 'row', alignItems: 'center', marginBottom: 27, gap: 14 },
  label: { fontSize: 16, fontWeight: '700', color: '#202020', flex: 1 },
  inputWrapper: { flex: 1.5, minHeight: 56, backgroundColor: '#F1F1F1', borderRadius: 6, flexDirection: 'row', alignItems: 'center', paddingRight: 14 },
  input: { flex: 1, paddingHorizontal: 14, fontSize: 16, color: '#343434' },
  unit: { color: '#777777', fontSize: 14 },
  calculateButton: { backgroundColor: '#0785C5', height: 60, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 'auto' },
  calculateButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  resultContainer: { flex: 1, backgroundColor: '#FFFFFF', paddingBottom: 40 },
  resultIntro: { color: '#5F5F5F', fontSize: 16, lineHeight: 22, marginHorizontal: 28, marginTop: 20, maxWidth: 320 },
  resultPrice: { color: '#20A83A', fontSize: 21, fontWeight: '800', textAlign: 'center', marginTop: 72 },
  resultCube: { alignSelf: 'center', marginTop: 82 },
  tracking: { color: '#666666', fontSize: 14, textAlign: 'center', marginTop: 22 },
  okButton: { width: 126, height: 60, borderRadius: 6, backgroundColor: '#0785C5', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 'auto' },
  okText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
