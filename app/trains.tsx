import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Trains() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Map Background (Mock) */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.mapBackground}
      >
        <SafeAreaView>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={32} color="#000" />
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        
        {/* Route Info */}
        <View style={styles.routeContainer}>
          <View style={styles.routePoints}>
            <Text style={styles.routeLabel}>From</Text>
            <View style={styles.dottedLineContainer}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.routeLabel}>To</Text>
          </View>
          <View style={styles.routeLocations}>
            <Text style={styles.locationText}>Pretoria</Text>
            <View style={styles.separator} />
            <Text style={styles.locationText}>Johannesburg</Text>
          </View>
        </View>

        {/* Train List */}
        <ScrollView style={styles.trainList}>
          {/* Train Item 1 */}
          <TouchableOpacity style={[styles.trainItem, styles.trainItemActive]}>
            <View style={styles.trainIconContainer}>
              <Ionicons name="train-outline" size={24} color="#000" />
            </View>
            <View style={styles.trainDetails}>
              <View style={styles.trainHeader}>
                <Text style={styles.trainCode}>KTS/MDA-1122</Text>
                <Text style={styles.trainStation}>Pretoria</Text>
              </View>
              <View style={styles.arrivalContainer}>
                <Ionicons name="people" size={14} color="#28A745" />
                <Text style={[styles.arrivalText, { color: '#28A745' }]}> Arrival Now</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward-circle" size={28} color="#FFF" style={styles.forwardIcon} />
          </TouchableOpacity>

          {/* Train Item 2 */}
          <TouchableOpacity style={styles.trainItem}>
            <View style={styles.trainIconContainer}>
              <Ionicons name="train-outline" size={24} color="#000" />
            </View>
            <View style={styles.trainDetails}>
              <View style={styles.trainHeader}>
                <Text style={styles.trainCode}>MDA/ALT-8742</Text>
                <Text style={styles.trainStation}>Nasrec</Text>
              </View>
              <View style={styles.arrivalContainer}>
                <Ionicons name="people" size={14} color="#DC3545" />
                <Text style={[styles.arrivalText, { color: '#DC3545' }]}> Arrival in 31 mins</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward-circle" size={28} color="#0076CB" style={styles.forwardIcon} />
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
  mapBackground: {
    height: '60%',
    width: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-start',
    margin: 10,
    borderRadius: 20,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
  },
  routeContainer: {
    backgroundColor: '#F9F9F9',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 20,
  },
  routePoints: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 20,
  },
  routeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  dottedLineContainer: {
    height: 40,
    justifyContent: 'space-around',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0076CB',
  },
  routeLocations: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 16,
    color: '#4A4A4A',
    paddingVertical: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  trainList: {
    flex: 1,
  },
  trainItem: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  trainItemActive: {
    backgroundColor: '#E5F1F8', // pale blue background for first item
  },
  trainIconContainer: {
    marginRight: 15,
  },
  trainDetails: {
    flex: 1,
  },
  trainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  trainCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  trainStation: {
    fontSize: 14,
    color: '#666',
  },
  arrivalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrivalText: {
    fontSize: 13,
  },
  forwardIcon: {
    // shadow for the white circle
  },
});
