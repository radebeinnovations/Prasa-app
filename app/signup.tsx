import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { authRedirectUrl } from '../lib/auth-links';
import { supabaseErrorMessage } from '../lib/errors';
import { supabase } from '../lib/supabase';

export default function SignUp() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    const cleanName = displayName.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !phone.trim() || !cleanEmail || !password) {
      setError('Complete every field.');
      return;
    }
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { display_name: cleanName, phone: phone.trim() }, emailRedirectTo: authRedirectUrl },
      });
      if (signUpError) {
        setError(supabaseErrorMessage(signUpError, 'Account creation failed.'));
        return;
      }
      if (data.session) {
        router.replace('/home');
        return;
      }
      setPassword('');
      setConfirmationEmail(cleanEmail);
    } catch (signUpFailure) {
      setError(supabaseErrorMessage(signUpFailure, 'Account creation failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScreenHeader title="Register" />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {confirmationEmail ? (
            <View style={styles.confirmationContainer}>
              <View style={styles.successIcon}><Ionicons name="mail-unread-outline" size={42} color="#138A36" /></View>
              <Text style={styles.successTitle}>Check your email</Text>
              <Text style={styles.successText}>We sent a confirmation link to</Text>
              <Text style={styles.successEmail}>{confirmationEmail}</Text>
              <Text style={styles.successHint}>Open the link in your inbox or junk folder, then return to log in.</Text>
              <TouchableOpacity onPress={() => router.replace('/login')} style={styles.button}>
                <Text style={styles.buttonText}>Continue to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.avatar}><Ionicons name="person-add-outline" size={39} color="#0785C5" /></View>
              <TextInput placeholder="Name" placeholderTextColor="#888888" value={displayName} onChangeText={setDisplayName} style={styles.input} />
              <TextInput placeholder="Phone Number" placeholderTextColor="#888888" keyboardType="phone-pad" value={phone} onChangeText={setPhone} style={styles.input} />
              <TextInput placeholder="Email" placeholderTextColor="#888888" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
              <TextInput placeholder="Password" placeholderTextColor="#888888" secureTextEntry value={password} onChangeText={setPassword} onSubmitEditing={signUp} style={styles.input} />
              {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
              <TouchableOpacity disabled={loading} onPress={signUp} style={[styles.button, loading && styles.disabled]}>
                <Text style={styles.buttonText}>{loading ? 'Creating Account…' : 'Create Account'}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 24 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#E0E0E0', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 25, marginBottom: 54 },
  confirmationContainer: { flex: 1, alignItems: 'center', paddingTop: 70 },
  successIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#E7F5EA', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { color: '#1D2A22', fontSize: 24, lineHeight: 30, fontWeight: '800', textAlign: 'center' },
  successText: { color: '#5F6862', fontSize: 16, lineHeight: 22, textAlign: 'center', marginTop: 14 },
  successEmail: { color: '#0785C5', fontSize: 16, lineHeight: 22, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  successHint: { color: '#5F6862', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 22, marginBottom: 42, maxWidth: 310 },
  input: { height: 58, borderRadius: 6, backgroundColor: '#F1F1F1', paddingHorizontal: 17, color: '#202020', fontSize: 16, marginBottom: 14 },
  error: { color: '#B42318', fontSize: 14, lineHeight: 19, marginBottom: 10 },
  button: { height: 60, borderRadius: 6, backgroundColor: '#0785C5', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
