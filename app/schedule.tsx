import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Schedule() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0076CB" />
          <Text style={styles.headerTitle}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="refresh-outline" size={24} color="#0076CB" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Station:</Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Text style={styles.dropdownText}>-SELECT-</Text>
            <Ionicons name="chevron-down" size={20} color="#0076CB" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Time:</Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Text style={styles.dropdownText}>-SELECT-</Text>
            <Ionicons name="chevron-down" size={20} color="#0076CB" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} /> {/* Spacer */}

        <View style={styles.formGroup}>
          <Text style={styles.label}>End Station:</Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Text style={styles.dropdownText}>-SELECT-</Text>
            <Ionicons name="chevron-down" size={20} color="#0076CB" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>End Time:</Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Text style={styles.dropdownText}>-SELECT-</Text>
            <Ionicons name="chevron-down" size={20} color="#0076CB" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} /> {/* Spacer */}

        <View style={styles.dateContainer}>
          <Text style={styles.label}>Date:</Text>
          <TouchableOpacity style={styles.dateBox}>
            <Ionicons name="calendar-outline" size={24} color="#000" style={styles.calendarIcon} />
            <Text style={styles.dateText}>DD/ MM/ YY</Text>
          </TouchableOpacity>
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search Train</Text>
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
    justifyContent: 'space-between',
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
  dateContainer: {
    marginBottom: 50,
  },
  dateBox: {
    backgroundColor: '#F1F1F1',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  calendarIcon: {
    marginRight: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#A0A0A0',
  },
  searchButton: {
    backgroundColor: '#0076CB',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
