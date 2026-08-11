import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type MenuRoute = '/home' | '/trains' | '/tickets' | '/schedule' | '/parcels' | '/stations' | '/notifications';

const menuItems: { icon: keyof typeof Ionicons.glyphMap; label: string; route: MenuRoute }[] = [
  { icon: 'home-outline', label: 'Home', route: '/home' },
  { icon: 'train-outline', label: 'Live trains', route: '/trains' },
  { icon: 'ticket-outline', label: 'Tickets', route: '/tickets' },
  { icon: 'calendar-outline', label: 'Schedule', route: '/schedule' },
  { icon: 'cube-outline', label: 'Parcels', route: '/parcels' },
  { icon: 'business-outline', label: 'Stations', route: '/stations' },
  { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
];

export default function Menu() {
  const router = useRouter();

  const logOut = () => {
    Alert.alert('Log out?', 'You will return to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          router.dismissAll();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>PRASA MOBILE</Text>
          <Text style={styles.title}>Menu</Text>
        </View>
        <TouchableOpacity accessibilityLabel="Close menu" accessibilityRole="button" onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {menuItems.map((item) => (
          <TouchableOpacity
            accessibilityRole="button"
            key={item.route}
            onPress={() => router.replace(item.route)}
            style={styles.menuItem}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={23} color="#0076CB" />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity accessibilityRole="button" onPress={logOut} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={22} color="#B91C1C" />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 22 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  eyebrow: { color: '#0076CB', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { fontSize: 30, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  closeButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', minHeight: 66, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' },
  iconCircle: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF' },
  menuLabel: { flex: 1, marginHorizontal: 15, fontSize: 16, fontWeight: '600', color: '#1E293B' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 54, marginBottom: 12, borderRadius: 12, backgroundColor: '#FEF2F2' },
  logoutText: { color: '#B91C1C', fontWeight: '700', fontSize: 16, marginLeft: 8 },
});
