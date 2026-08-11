import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type HomeRoute = '/trains' | '/tickets' | '/schedule' | '/parcels' | '/stations' | '/notifications';

const actions: { icon: keyof typeof Ionicons.glyphMap; label: string; route: HomeRoute }[] = [
  { icon: 'train', label: 'Trains', route: '/trains' },
  { icon: 'ticket', label: 'Tickets', route: '/tickets' },
  { icon: 'calendar', label: 'Schedule', route: '/schedule' },
  { icon: 'cube', label: 'Parcels', route: '/parcels' },
  { icon: 'business', label: 'Stations', route: '/stations' },
  { icon: 'notifications', label: 'Notifications', route: '/notifications' },
];

export default function Home() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string | string[] }>();
  const rawName = Array.isArray(params.name) ? params.name[0] : params.name;
  const displayName = rawName?.trim() || 'Commuter';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/train-hero.png')} style={styles.headerBackground}>
        <View style={styles.overlay} />
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.topBar}>
            <TouchableOpacity
              accessibilityLabel="Open menu"
              accessibilityRole="button"
              onPress={() => router.push('/menu')}
              style={styles.headerButton}
            >
              <Ionicons name="menu" size={30} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Search stations"
              accessibilityRole="button"
              onPress={() => router.push('/stations')}
              style={styles.headerButton}
            >
              <Ionicons name="search" size={25} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text numberOfLines={1} style={styles.nameText}>{displayName}</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <View style={styles.bottomSheet}>
        <Text style={styles.sectionTitle}>What would you like to do?</Text>
        <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
          {actions.map((action) => (
            <TouchableOpacity
              accessibilityLabel={action.label}
              accessibilityRole="button"
              key={action.route}
              onPress={() => router.push(action.route)}
              style={styles.gridItem}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={action.icon} size={30} color="#0076CB" />
              </View>
              <Text style={styles.iconLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerBackground: { height: '55%', width: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 18, 43, 0.34)' },
  safeArea: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(2, 18, 43, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingContainer: { paddingHorizontal: 24, marginTop: 24 },
  greetingText: { fontSize: 22, color: '#FFFFFF', textShadowColor: '#000', textShadowRadius: 5 },
  nameText: { fontSize: 30, color: '#FFFFFF', fontWeight: '800', textShadowColor: '#000', textShadowRadius: 5 },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 24 },
  gridItem: { width: '30%', alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconLabel: { fontSize: 14, color: '#1E293B', textAlign: 'center' },
});
