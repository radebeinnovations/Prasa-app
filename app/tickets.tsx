import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Tickets() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0076CB" />
          <Text style={styles.headerTitle}>Tickets</Text>
        </TouchableOpacity>
      </View>

      {/* Top Form */}
      <View style={styles.formContainer}>
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>From:</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputText}>Pretoria</Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>To:</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputText}>Johannesburg</Text>
            </View>
          </View>
        </View>

        <View style={styles.dateGroup}>
          <Text style={styles.label}>Date:</Text>
          <View style={styles.dateBox}>
            <Ionicons name="calendar-outline" size={24} color="#000" style={styles.calendarIcon} />
            <Text style={styles.inputText}>08/ 09/ 2025</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        
        <View style={styles.sheetHeader}>
          <TouchableOpacity>
            <Ionicons name="options-outline" size={28} color="#0076CB" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.ticketList}>
          {/* Ticket Item 1 */}
          <View style={styles.ticketItem}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>7:30am <Text style={styles.timeDash}>-</Text> 8:00am</Text>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color="#0076CB" />
                <Text style={styles.durationText}>30 min</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.priceButton}>
              <Text style={styles.priceText}>R40.00</Text>
            </TouchableOpacity>
          </View>

          {/* Ticket Item 2 */}
          <View style={styles.ticketItem}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>9:14am <Text style={styles.timeDash}>-</Text> 9:41am</Text>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color="#0076CB" />
                <Text style={styles.durationText}>27 min</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.priceButton}>
              <Text style={styles.priceText}>R20.00</Text>
            </TouchableOpacity>
          </View>

          {/* Ticket Item 3 */}
          <View style={styles.ticketItem}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>11:20am <Text style={styles.timeDash}>-</Text> 12:01pm</Text>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color="#0076CB" />
                <Text style={styles.durationText}>41 min</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.priceButton}>
              <Text style={styles.priceText}>R35.00</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
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
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputGroup: {
    width: '47%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  inputBox: {
    backgroundColor: '#F1F1F1',
    padding: 15,
    borderRadius: 8,
  },
  inputText: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateBox: {
    backgroundColor: '#F1F1F1',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 15,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeader: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  ticketList: {
    flex: 1,
  },
  ticketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 5,
  },
  timeDash: {
    color: '#E0E0E0',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  priceButton: {
    backgroundColor: '#0076CB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  priceText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
