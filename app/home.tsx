import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      {/* Top half with train background */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.headerBackground}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.push('/menu')}>
              <Ionicons name="menu" size={32} color="#0076CB" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="search" size={28} color="#0076CB" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Good Morning !</Text>
            <Text style={styles.nameText}>Smith</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Bottom half with grid */}
      <View style={styles.bottomSheet}>
        <ScrollView contentContainerStyle={styles.gridContainer}>
          
          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/trains')}>
            <View style={styles.iconCircle}>
              <Ionicons name="train" size={30} color="#0076CB" />
            </View>
            <Text style={styles.iconLabel}>Trains</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/tickets')}>
            <View style={styles.iconCircle}>
              <Ionicons name="ticket" size={30} color="#0076CB" />
            </View>
            <Text style={styles.iconLabel}>Tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/schedule')}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar" size={30} color="#0076CB" />
            </View>
            <Text style={styles.iconLabel}>Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/parcels')}>
            <View style={styles.iconCircle}>
              <Ionicons name="cube" size={30} color="#0076CB" />
            </View>
            <Text style={styles.iconLabel}>Parcels</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="business" size={30} color="#0076CB" />
            </View>
            <Text style={styles.iconLabel}>Stations</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/notifications')}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications" size={30} color="#0076CB" />
            </View>
            <Text style={styles.iconLabel}>Notifications</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    height: '55%',
    width: '100%',
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greetingContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  greetingText: {
    fontSize: 22,
    color: '#4A4A4A',
  },
  nameText: {
    fontSize: 22,
    color: '#4A4A4A',
    fontWeight: 'bold',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30, // Overlap the background
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconLabel: {
    fontSize: 14,
    color: '#000000',
  }
});
