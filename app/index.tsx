import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Onboarding1() {
  const router = useRouter();

  return (
    <ImageBackground 
      source={require('../assets/train-hero.png')}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topContainer}>
          <TouchableOpacity onPress={() => router.replace('/login')} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.indicatorContainer}>
          <View style={[styles.indicator, styles.indicatorActive]} />
          <View style={styles.indicator} />
        </View>

        <View style={styles.bottomSheet}>
          <Text style={styles.title}>Find your train easily</Text>
          <Text style={styles.subtitle}>Find your trains easily and buy tickets online.</Text>

          <View style={styles.logoContainer}>
            <Ionicons name="aperture" size={40} color="#0088cc" />
            <Text style={styles.logoText}>prasa</Text>
          </View>
          <Text style={styles.logoSubtext}>PASSENGER RAIL AGENCY{'\n'}OF SOUTH AFRICA</Text>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/onboarding2')}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 18, 43, 0.2)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topContainer: {
    padding: 20,
    alignItems: 'flex-end',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: 'white',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0088cc',
    marginLeft: 8,
  },
  logoSubtext: {
    fontSize: 8,
    color: '#0088cc',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007ACC',
    width: '100%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
