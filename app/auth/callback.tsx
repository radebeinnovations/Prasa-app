import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { completeAuthFromUrl } from '../../lib/auth-links';
import { supabaseErrorMessage } from '../../lib/errors';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const complete = async () => {
      try {
        const url = Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.href
          : await Linking.getInitialURL();
        if (!url) throw new Error('The confirmation link is missing or incomplete.');

        const type = await completeAuthFromUrl(url);
        if (!active) return;
        if (type === 'recovery') {
          router.replace('/reset-password');
          return;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        router.replace(data.session ? '/home' : '/login');
      } catch (callbackError) {
        if (active) setError(supabaseErrorMessage(callbackError, 'The confirmation link could not be completed.'));
      }
    };

    void complete();
    return () => { active = false; };
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {error ? (
          <>
            <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.button}>
              <Text style={styles.buttonText}>Return to Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ActivityIndicator color="#0076CB" size="large" />
            <Text style={styles.title}>Confirming your account…</Text>
            <Text style={styles.body}>You will be redirected automatically.</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#FFFFFF', padding: 24 },
  card: { alignItems: 'center' },
  title: { marginTop: 18, fontSize: 20, fontWeight: '700', color: '#0F172A' },
  body: { marginTop: 8, color: '#64748B' },
  error: { color: '#B42318', fontSize: 16, lineHeight: 23, textAlign: 'center' },
  button: { minWidth: 190, height: 52, borderRadius: 6, backgroundColor: '#0785C5', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
