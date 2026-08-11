import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Parcels() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0076CB" />
          <Text style={styles.headerTitle}>Parcels</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>From:</Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Text style={styles.dropdownText}>-SELECT-</Text>
            <Ionicons name="chevron-down" size={20} color="#0076CB" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>To:</Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Text style={styles.dropdownText}>-SELECT-</Text>
            <Ionicons name="chevron-down" size={20} color="#0076CB" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Item:</Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Text style={styles.dropdownText}>-SELECT-</Text>
            <Ionicons name="chevron-down" size={20} color="#0076CB" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Train:</Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Text style={styles.dropdownTextFilled}>Normal</Text>
            <Ionicons name="chevron-down" size={20} color="#0076CB" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Weight</Text>
          <TextInput 
            style={styles.inputBox}
            keyboardType="numeric"
          />
        </View>

        {/* Calculate Button */}
        <TouchableOpacity style={styles.calculateButton}>
          <Text style={styles.calculateButtonText}>Calculate</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#0076CB',
    fontWeight: '500',
    marginLeft: 5,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  formGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  dropdownBox: {
    flex: 1.5,
    backgroundColor: '#F1F1F1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#666',
  },
  dropdownTextFilled: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  inputBox: {
    flex: 1.5,
    backgroundColor: '#F1F1F1',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#000',
  },
  calculateButton: {
    backgroundColor: '#0076CB',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
  },
  calculateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
