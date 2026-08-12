import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthCallback() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator color="#0076CB" size="large" />
        <Text style={styles.title}>Completing sign in…</Text>
        <Text style={styles.body}>You will be redirected automatically.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#FFFFFF', padding: 24 },
  card: { alignItems: 'center' },
  title: { marginTop: 18, fontSize: 20, fontWeight: '700', color: '#0F172A' },
  body: { marginTop: 8, color: '#64748B' },
});
