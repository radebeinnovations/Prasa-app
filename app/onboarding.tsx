import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrasaBrand } from '../components/PrasaBrand';

export default function OnboardingOperations() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/train-hero.png')} resizeMode="cover" style={styles.hero} imageStyle={styles.heroImage}>
        <SafeAreaView edges={['top']} style={styles.heroSafe}>
          <TouchableOpacity onPress={() => router.replace('/login')} style={styles.skip}>
            <Text style={styles.skipText}>Skip</Text><Ionicons name="chevron-forward" size={17} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.dots}><View style={styles.dotActive} /><View style={styles.dot} /><View style={styles.dot} /></View>
        </SafeAreaView>
      </ImageBackground>
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <Text style={styles.title}>Prasa Railway Operations</Text>
        <Text style={styles.subtitle}>Prasa Railway Department is South Africa&apos;s{`\n`}railway owner and primary operator.</Text>
        <PrasaBrand compact />
        <TouchableOpacity onPress={() => router.push('/onboarding2')} style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

export const onboardingStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  hero: { flex: 56, width: '100%' },
  heroImage: { transform: [{ translateY: -110 }] },
  heroSafe: { flex: 1, justifyContent: 'space-between' },
  skip: { alignSelf: 'flex-end', marginTop: 14, marginRight: 22, flexDirection: 'row', alignItems: 'center', minHeight: 38 },
  skipText: { color: '#FFFFFF', fontSize: 15 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 14, gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.62)' },
  dotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  sheet: { flex: 44, marginTop: -2, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#FFFFFF', paddingHorizontal: 26, paddingTop: 34, alignItems: 'center' },
  title: { color: '#111111', fontSize: 20, lineHeight: 25, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#5F5F5F', fontSize: 15, lineHeight: 21, textAlign: 'center', marginTop: 32, marginBottom: 26 },
  button: { height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#0785C5', alignSelf: 'stretch', marginTop: 'auto', marginBottom: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
});

const styles = onboardingStyles;
