import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrasaBrand } from '../components/PrasaBrand';
import { signInWithProvider } from '../lib/auth-links';
import { supabaseErrorMessage } from '../lib/errors';
import { supabase } from '../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Enter both your email address and password.');
      return;
    }
    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setLoading(false);
    if (signInError) setError(supabaseErrorMessage(signInError, 'Login failed.'));
  };

  const socialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setError('');
      setLoading(true);
      await signInWithProvider(provider);
    } catch (providerError) {
      setError(supabaseErrorMessage(providerError, 'Social sign-in failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}><PrasaBrand /></View>

          <TextInput
            accessibilityLabel="Email address" autoCapitalize="none" autoCorrect={false}
            keyboardType="email-address" onChangeText={setEmail} placeholder="Username"
            placeholderTextColor="#8B8B8B" style={styles.input} value={email}
          />
          <View style={styles.passwordField}>
            <TextInput
              accessibilityLabel="Password" onChangeText={setPassword} onSubmitEditing={handleLogin}
              placeholder="Password" placeholderTextColor="#8B8B8B" returnKeyType="go"
              secureTextEntry={!showPassword} style={styles.passwordInput} value={password}
            />
            <TouchableOpacity accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword((value) => !value)} style={styles.eye}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6A6A6A" />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity onPress={() => router.push({ pathname: '/reset-password', params: { email: email.trim() } })} style={styles.forgotButton}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={loading} onPress={handleLogin} style={[styles.primaryButton, loading && styles.disabled]}>
            <Text style={styles.primaryText}>{loading ? 'Please wait…' : 'Login'}</Text>
          </TouchableOpacity>

          <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>Or</Text><View style={styles.line} /></View>
          <View style={styles.socialRow}>
            <TouchableOpacity accessibilityLabel="Continue with Google" disabled={loading} onPress={() => socialLogin('google')} style={styles.socialButton}>
              <Ionicons name="logo-google" size={19} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Continue with Facebook" disabled={loading} onPress={() => socialLogin('facebook')} style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={19} color="#4267B2" />
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}><Text style={styles.footerLink}> Sign Up</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 27, paddingBottom: 26 },
  brand: { alignItems: 'center', marginTop: 112, marginBottom: 46 },
  input: { height: 60, backgroundColor: '#F2F2F2', borderRadius: 6, paddingHorizontal: 17, color: '#202020', fontSize: 16, marginBottom: 14 },
  passwordField: { height: 60, backgroundColor: '#F2F2F2', borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, height: 60, paddingHorizontal: 17, color: '#202020', fontSize: 16 },
  eye: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#B42318', fontSize: 14, lineHeight: 19, marginTop: 10 },
  forgotButton: { alignSelf: 'center', minHeight: 48, justifyContent: 'center', marginTop: 14 },
  forgot: { fontSize: 15, color: '#161616' },
  primaryButton: { height: 60, borderRadius: 6, backgroundColor: '#0785C5', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#D7D7D7' },
  or: { color: '#555555', fontSize: 13, marginHorizontal: 18 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: 15 },
  socialButton: { width: 48, height: 48, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#333333', fontSize: 14 },
  footerLink: { color: '#0785C5', fontSize: 14, fontWeight: '700' },
});
