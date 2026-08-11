import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding2" />
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
        <Stack.Screen name="trains" />
        <Stack.Screen name="tickets" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="parcels" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="menu" />
      </Stack>
    </>
  );
}
