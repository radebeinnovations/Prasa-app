import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrainMark } from '../components/PrasaBrand';

export default function LanguageSelection() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.markCard}><TrainMark small /></View>
      <View style={styles.bottomContent}>
        <Text style={styles.prompt}>Please select your language</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/onboarding')} style={styles.button}>
          <Text style={styles.buttonText}>ENGLISH</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center' },
  markCard: {
    marginTop: 150, width: 88, height: 88, borderRadius: 7, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 5, elevation: 4,
  },
  bottomContent: { position: 'absolute', left: 26, right: 26, bottom: 78 },
  prompt: { textAlign: 'center', color: '#1C1C1C', fontSize: 17, lineHeight: 22, fontWeight: '600', marginBottom: 48 },
  button: { height: 60, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0785C5' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
});
