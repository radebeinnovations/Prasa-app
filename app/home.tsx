import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../providers/AuthProvider';

type HomeRoute = '/trains' | '/tickets' | '/schedule' | '/parcels' | '/stations' | '/notifications';
const actions: { icon: keyof typeof Ionicons.glyphMap; label: string; route: HomeRoute }[] = [
  { icon: 'train', label: 'Trains', route: '/trains' },
  { icon: 'ticket', label: 'Tickets', route: '/tickets' },
  { icon: 'calendar-outline', label: 'Schedule', route: '/schedule' },
  { icon: 'cube', label: 'Parcels', route: '/parcels' },
  { icon: 'business', label: 'Stations', route: '/stations' },
  { icon: 'notifications', label: 'Notifications', route: '/notifications' },
];

export default function Home() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Smith';
  const firstName = displayName.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning !' : hour < 18 ? 'Good Afternoon !' : 'Good Evening !';

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/train-hero.png')} resizeMode="cover" style={styles.hero}>
        <View style={styles.heroShade} />
        <SafeAreaView edges={['top']} style={styles.heroSafe}>
          <View style={styles.topBar}>
            <TouchableOpacity accessibilityLabel="Open menu" onPress={() => router.push('/menu')} style={styles.topButton}>
              <Ionicons name="menu" size={30} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Search stations" onPress={() => router.push('/stations')} style={styles.topButton}>
              <Ionicons name="search" size={27} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text numberOfLines={1} style={styles.name}>{firstName}</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
      <SafeAreaView edges={['bottom']} style={styles.actionsPanel}>
        <View style={styles.grid}>
          {actions.map((action) => (
            <TouchableOpacity accessibilityLabel={action.label} key={action.route} onPress={() => router.push(action.route)} style={styles.item}>
              <View style={styles.iconCircle}><Ionicons name={action.icon} size={30} color="#0785C5" /></View>
              <Text style={styles.label}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  hero: { flex: 56, width: '100%' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,20,36,0.27)' },
  heroSafe: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  topButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(0,61,91,0.42)', alignItems: 'center', justifyContent: 'center' },
  greeting: { marginTop: 8, marginLeft: 26, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(0,20,36,0.45)', alignSelf: 'flex-start' },
  greetingText: { color: '#FFFFFF', fontSize: 20, lineHeight: 23, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.38)', textShadowRadius: 2 },
  name: { color: '#FFFFFF', fontSize: 22, lineHeight: 25, fontWeight: '800', maxWidth: 210, textShadowColor: 'rgba(0,0,0,0.38)', textShadowRadius: 2 },
  actionsPanel: { flex: 44, backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingTop: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  item: { width: '25%', minHeight: 94, alignItems: 'center', marginBottom: 18 },
  iconCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#E9F5FB', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  label: { color: '#252525', fontSize: 14, lineHeight: 18, fontWeight: '600', textAlign: 'center' },
});
