import { ImageBackground, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StationDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string | string[]; area?: string | string[]; code?: string | string[] }>();
  const valueOf = (value: string | string[] | undefined, fallback: string) => Array.isArray(value) ? value[0] || fallback : value || fallback;
  const name = valueOf(params.name, 'Gauteng Railway Station');
  const area = valueOf(params.area, 'Johannesburg');
  const code = valueOf(params.code, 'PRASA');

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/train-hero.png')} resizeMode="cover" style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={23} color="#FFFFFF" /></TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{name}</Text>
            <TouchableOpacity accessibilityLabel="Share station" onPress={() => Share.share({ message: `${name}, ${area}` })} style={styles.share}><Ionicons name="share-outline" size={20} color="#0785C5" /></TouchableOpacity>
          </View>
          <Text style={styles.body}>The Gauteng Region is divided into three corridors: North, East and West, with the PRASA network consisting of commuter rail services across the region.</Text>
          <Text style={styles.info}><Text style={styles.bold}>Address:</Text> {area}, Gauteng, South Africa.</Text>
          <Text style={styles.info}><Text style={styles.bold}>Hours:</Text> <Text style={styles.green}>Open</Text> · 24 Hours</Text>
          <Text style={styles.info}><Text style={styles.bold}>Station code:</Text> {code}</Text>
          <Text style={styles.section}>General Information</Text>
          <Text style={styles.info}><Text style={styles.bold}>Telephone:</Text> +27 11 013 6700</Text>
          <Text style={styles.info}><Text style={styles.bold}>Website:</Text> www.prasa.com</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/schedule', params: { from: name } })} style={styles.button}><Text style={styles.buttonText}>Plan from this station</Text></TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  hero: { height: '42%', width: '100%' },
  back: { width: 44, height: 44, margin: 12, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  sheet: { flex: 1, marginTop: -18, backgroundColor: '#FFFFFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 28, paddingTop: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1, color: '#1B1B1B', fontSize: 21, lineHeight: 27, fontWeight: '800' },
  share: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  body: { color: '#555555', fontSize: 15, lineHeight: 22, marginTop: 20, marginBottom: 16 },
  info: { color: '#4F4F4F', fontSize: 15, lineHeight: 23 },
  bold: { color: '#222222', fontWeight: '700' },
  green: { color: '#22A53A' },
  section: { color: '#222222', fontSize: 17, fontWeight: '800', marginTop: 16, marginBottom: 7 },
  button: { height: 56, borderRadius: 6, backgroundColor: '#0785C5', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 16 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
