import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#FFFFFF' },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding2" />
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
        <Stack.Screen name="stations" />
        <Stack.Screen name="trains" />
        <Stack.Screen name="tickets" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="parcels" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="menu" />
      </Stack>
    </SafeAreaProvider>
  );
}
