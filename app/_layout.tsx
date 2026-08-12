import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../providers/AuthProvider';

const publicRoutes = new Set(['index', 'onboarding', 'onboarding2', 'login', 'signup', 'reset-password', 'auth']);

function AppNavigator() {
  const { session, loading, passwordRecovery } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const rootRoute = segments[0] ?? 'index';
    if (passwordRecovery && rootRoute !== 'reset-password') {
      router.replace('/reset-password');
      return;
    }
    if (!session && !publicRoutes.has(rootRoute)) {
      router.replace('/login');
      return;
    }
    if (session && ['index', 'onboarding', 'onboarding2', 'login', 'signup', 'auth'].includes(rootRoute)) {
      router.replace('/home');
    }
  }, [loading, passwordRecovery, router, segments, session]);

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color="#0076CB" size="large" /></View>;
  }

  return (
    <Stack screenOptions={{ animation: 'slide_from_right', contentStyle: { backgroundColor: '#FFFFFF' }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="onboarding2" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="auth/callback" />
      <Stack.Screen name="home" />
      <Stack.Screen name="stations" />
      <Stack.Screen name="station-details" />
      <Stack.Screen name="trains" />
      <Stack.Screen name="tickets" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="parcels" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="menu" />
    </Stack>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider style={styles.safeArea}>
      <View style={[styles.viewport, Platform.OS === 'web' && styles.webViewport]}>
        <View style={[styles.shell, Platform.OS === 'web' && styles.webShell]}>
          <StatusBar style="dark" />
          <AuthProvider><AppNavigator /></AuthProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, minHeight: 0 },
  viewport: { flex: 1, minHeight: 0, width: '100%', overflow: 'hidden', backgroundColor: '#FFFFFF' },
  webViewport: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EEF2' },
  shell: { flex: 1, minHeight: 0, width: '100%', overflow: 'hidden', backgroundColor: '#FFFFFF' },
  webShell: { height: '100%', width: '100%', maxWidth: 428, maxHeight: 926, alignSelf: 'center', shadowColor: '#000000', shadowOpacity: 0.14, shadowRadius: 24, elevation: 6 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
});
