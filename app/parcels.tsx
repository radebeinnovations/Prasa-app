import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectField } from '../components/SelectField';
import { ScreenHeader } from '../components/ScreenHeader';
import { supabase } from '../lib/supabase';
import type { Station } from '../lib/types';
import { useAuth } from '../providers/AuthProvider';

const items = ['Documents', 'Small parcel', 'Medium parcel', 'Large parcel'];
const services = ['Standard', 'Priority', 'Same day'];
const itemPrices: Record<string, number> = { Documents: 25, 'Small parcel': 40, 'Medium parcel': 65, 'Large parcel': 95 };
const serviceMultipliers: Record<string, number> = { Standard: 1, Priority: 1.5, 'Same day': 2 };

export default function Parcels() {
  const router = useRouter();
  const { session } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [item, setItem] = useState('');
  const [service, setService] = useState('Standard');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [result, setResult] = useState<{ estimatedPrice: number; trackingCode: string } | null>(null);
  const stationNames = useMemo(() => stations.map((station) => station.name), [stations]);

  useEffect(() => {
    supabase.from('stations').select('id, code, name, area, latitude, longitude').eq('active', true).order('name').then(({ data, error: loadError }) => {
      if (loadError) setError(loadError.message);
      else setStations((data ?? []) as Station[]);
    });
  }, []);

  useEffect(() => {
    setEstimatedPrice(null);
  }, [from, item, service, to, weight]);

  const validatedParcelDetails = () => {
    const numericWeight = Number(weight.replace(',', '.'));
    if (!from || !to || !item || !service || !weight) {
      Alert.alert('Complete the parcel details', 'Select each option and enter the parcel weight.');
      return null;
    }
    if (from === to) {
      Alert.alert('Choose another destination', 'The collection and destination stations must be different.');
      return null;
    }
    if (!Number.isFinite(numericWeight) || numericWeight <= 0 || numericWeight > 30) {
      Alert.alert('Invalid weight', 'Enter a weight between 0.1 kg and 30 kg.');
      return null;
    }
    const origin = stations.find((station) => station.name === from);
    const destination = stations.find((station) => station.name === to);
    if (!origin || !destination) {
      Alert.alert('Stations unavailable', 'Refresh the screen and select the stations again.');
      return null;
    }
    const basePrice = itemPrices[item];
    const multiplier = serviceMultipliers[service];
    if (basePrice === undefined || multiplier === undefined) {
      Alert.alert('Invalid parcel options', 'Select a valid item type and service level.');
      return null;
    }
    return { origin, destination, numericWeight, estimated: Math.round((basePrice + numericWeight * 8) * multiplier * 100) / 100 };
  };

  const calculateFare = () => {
    const details = validatedParcelDetails();
    if (!details) return;
    setEstimatedPrice(details.estimated);
  };

  const createOrder = () => {
    const details = validatedParcelDetails();
    if (!details) return;
    if (!session) {
      Alert.alert('Sign in required', 'Please sign in before booking a parcel order.');
      router.push('/login');
      return;
    }
    Alert.alert('Create parcel order?', `${from} to ${to}\n${details.numericWeight.toFixed(1)} kg · ${service}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Create', onPress: () => void saveOrder(details.origin.id, details.destination.id, details.numericWeight) },
    ]);
  };

  const saveOrder = async (originId: number, destinationId: number, numericWeight: number) => {
    setSaving(true);
    try {
      const { data, error: orderError } = await supabase.rpc('create_parcel_order', {
        p_origin_station_id: originId,
        p_destination_station_id: destinationId,
        p_item_type: item,
        p_service_level: service,
        p_weight_kg: numericWeight,
      });
      if (orderError) {
        Alert.alert('Could not create order', orderError.message);
        return;
      }
      const order = (Array.isArray(data) ? data[0] : data) as { estimated_price?: number; tracking_code?: string } | null;
      setResult({ estimatedPrice: Number(order?.estimated_price ?? 0), trackingCode: order?.tracking_code ?? 'Pending' });
    } catch (orderFailure) {
      Alert.alert('Could not create order', orderFailure instanceof Error ? orderFailure.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
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
          <Text style={styles.label}>Service:</Text>
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

        <TouchableOpacity accessibilityRole="button" onPress={calculateFare} style={styles.calculateButton}>
          <Text style={styles.calculateButtonText}>Calculate</Text>
        </TouchableOpacity>
        {estimatedPrice !== null ? (
          <View style={styles.estimateSection}>
            <View accessibilityLabel={`Estimated price R ${estimatedPrice.toFixed(2)} plus VAT`} style={styles.estimateCard}>
              <Text style={styles.estimateLabel}>Estimated price</Text>
              <Text style={styles.estimatePrice}>R {estimatedPrice.toFixed(2)} + VAT</Text>
              <Text style={styles.estimateHint}>Final availability and price are confirmed when you book.</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={createOrder} style={[styles.bookButton, saving && styles.disabled]}>
              <Ionicons name="cube-outline" size={19} color="#FFFFFF" />
              <Text style={styles.bookButtonText}>{saving ? 'Creating order…' : 'Book Parcel Order'}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
  estimateSection: { marginTop: 16 },
  estimateCard: { backgroundColor: '#E9F8EE', borderRadius: 10, borderWidth: 1, borderColor: '#BEE5C8', padding: 18 },
  estimateLabel: { color: '#236438', fontSize: 14, fontWeight: '700' },
  estimatePrice: { color: '#138A36', fontSize: 24, fontWeight: '800', marginTop: 5 },
  estimateHint: { color: '#4D6D57', fontSize: 12, lineHeight: 17, marginTop: 7 },
  bookButton: { minHeight: 56, backgroundColor: '#138A36', borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 12 },
  bookButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  resultContainer: { flex: 1, backgroundColor: '#FFFFFF', paddingBottom: 40 },
  resultIntro: { color: '#5F5F5F', fontSize: 16, lineHeight: 22, marginHorizontal: 28, marginTop: 20, maxWidth: 320 },
  resultPrice: { color: '#20A83A', fontSize: 21, fontWeight: '800', textAlign: 'center', marginTop: 72 },
  resultCube: { alignSelf: 'center', marginTop: 82 },
  tracking: { color: '#666666', fontSize: 14, textAlign: 'center', marginTop: 22 },
  okButton: { width: 126, height: 60, borderRadius: 6, backgroundColor: '#0785C5', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 'auto' },
  okText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
