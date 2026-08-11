import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectField } from '../components/SelectField';

const stations = ['Pretoria', 'Centurion', 'Midrand', 'Sandton', 'Park Station', 'Nasrec'];
const items = ['Documents', 'Small parcel', 'Medium parcel', 'Large parcel'];
const services = ['Normal', 'Priority'];

export default function Parcels() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [item, setItem] = useState('');
  const [service, setService] = useState('Normal');
  const [weight, setWeight] = useState('');

  const calculate = () => {
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
    const itemFee = item === 'Documents' ? 15 : item === 'Small parcel' ? 25 : item === 'Medium parcel' ? 40 : 60;
    const multiplier = service === 'Priority' ? 1.5 : 1;
    const total = (itemFee + numericWeight * 8) * multiplier;
    Alert.alert('Estimated parcel price', `R${total.toFixed(2)}\n${from} to ${to}\n${service} service`, [
      { text: 'Done' },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0076CB" />
          <Text style={styles.headerTitle}>Parcels</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>Get an estimated station-to-station parcel price.</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>From</Text>
          <SelectField accessibilityLabel="Select collection station" onChange={setFrom} options={stations} value={from} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>To</Text>
          <SelectField accessibilityLabel="Select destination station" onChange={setTo} options={stations} value={to} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Item</Text>
          <SelectField accessibilityLabel="Select parcel type" onChange={setItem} options={items} value={item} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Service</Text>
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

        <TouchableOpacity accessibilityRole="button" onPress={calculate} style={styles.calculateButton}>
          <Text style={styles.calculateButtonText}>Calculate estimate</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>Estimates are for demo purposes and are not live PRASA rates.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  headerTitle: { fontSize: 20, color: '#0076CB', fontWeight: '700', marginLeft: 5 },
  content: { padding: 20, flexGrow: 1 },
  intro: { color: '#64748B', fontSize: 14, lineHeight: 21, marginBottom: 24 },
  formGroup: { flexDirection: 'row', alignItems: 'center', marginBottom: 22, gap: 14 },
  label: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1 },
  inputWrapper: { flex: 1.5, minHeight: 52, backgroundColor: '#F1F5F9', borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingRight: 15 },
  input: { flex: 1, paddingHorizontal: 15, fontSize: 16, color: '#0F172A' },
  unit: { color: '#64748B', fontWeight: '600' },
  calculateButton: { backgroundColor: '#0076CB', padding: 17, borderRadius: 10, alignItems: 'center', marginTop: 'auto' },
  calculateButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disclaimer: { textAlign: 'center', color: '#64748B', fontSize: 11, lineHeight: 16, marginTop: 12 },
});
