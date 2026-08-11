import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Notifications() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0076CB" />
          <Text style={styles.headerTitle}>Notifications</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        
        {/* Today Section */}
        <Text style={styles.sectionTitle}>Today</Text>

        <View style={[styles.notificationItem, styles.unreadBackground]}>
          <View style={styles.iconContainer}>
            <View style={styles.unreadDot} />
            <View style={styles.iconCircle}>
              <Ionicons name="megaphone" size={24} color="#0076CB" />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.messageText}>The train from Pretoria to Johannesburg now arrives at the 1st...</Text>
          </View>
          <Text style={styles.timeText}>Now</Text>
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="train" size={24} color="#0076CB" />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.messageText}>Your train <Text style={styles.boldText}>KTS/ MDA-1122</Text> is arriving now</Text>
          </View>
          <Text style={styles.timeText}>5 min</Text>
        </View>

        {/* Yesterday Section */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Yesterday</Text>

        <View style={styles.notificationItem}>
          <View style={styles.iconContainer}>
            <View style={styles.unreadDot} />
            <View style={styles.iconCircle}>
              <Ionicons name="megaphone" size={24} color="#0076CB" />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.messageText}>The Parcel you ordered is ready for deliver. Payment due for delivery.</Text>
          </View>
          <Text style={styles.timeText}>20 May</Text>
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="ticket" size={24} color="#0076CB" />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.messageText}>Ticket purchase successful.</Text>
          </View>
          <Text style={styles.timeText}>20 May</Text>
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="globe" size={24} color="#0076CB" />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.messageText}>Visit our website today. <Text style={styles.linkText}>www.railway.gov.lk</Text></Text>
          </View>
          <Text style={styles.timeText}>20 May</Text>
        </View>

        <View style={styles.notificationItem}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="ticket" size={24} color="#0076CB" />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.messageText}>Ticket purchase successful.</Text>
          </View>
          <Text style={styles.timeText}>20 May</Text>
        </View>

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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
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
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    padding: 20,
    paddingBottom: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  unreadBackground: {
    backgroundColor: '#F8FAFF',
  },
  iconContainer: {
    marginRight: 15,
    position: 'relative',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0076CB',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  messageText: {
    fontSize: 15,
    color: '#4A4A4A',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  linkText: {
    color: '#0076CB',
  },
  timeText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 2,
  },
});
