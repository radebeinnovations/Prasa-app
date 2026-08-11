import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Menu() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={32} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Map Pin with Train */}
        <View style={styles.pinContainer}>
          <View style={styles.pinCircle}>
            <Ionicons name="train" size={80} color="#0076CB" />
          </View>
          <View style={styles.pinTriangle} />
        </View>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="aperture" size={60} color="#0076CB" />
            <Text style={styles.logoText}>prasa</Text>
          </View>
          <Text style={styles.logoSubtext}>PASSENGER RAIL AGENCY{'\n'}OF SOUTH AFRICA</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 20,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  pinCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#24A0ED',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pinTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#24A0ED',
    transform: [{ rotate: '180deg' }],
    marginTop: -20,
    zIndex: 1,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#0076CB',
    marginLeft: 15,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#0076CB',
    textAlign: 'center',
    fontWeight: '500',
  },
});
