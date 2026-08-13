import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrasaBrand } from '../components/PrasaBrand';
import { ScreenHeader } from '../components/ScreenHeader';
import { passwordResetRedirectUrl } from '../lib/auth-links';
import { supabaseErrorMessage } from '../lib/errors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const initialEmail = Array.isArray(params.email) ? params.email[0] : params.email;
  const { session, passwordRecovery, clearPasswordRecovery } = useAuth();
  const choosingPassword = Boolean(session && passwordRecovery);
  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendRecovery = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Enter the email address used for your account.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: passwordResetRedirectUrl });
      if (resetError) {
        setError(supabaseErrorMessage(resetError, 'Password recovery failed.'));
        return;
      }
      Alert.alert('Check your email', 'Open the password-reset link on this device to choose a new password.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (resetFailure) {
      setError(supabaseErrorMessage(resetFailure, 'Password recovery failed.'));
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!session) {
      setError('Open the recovery link from your email on this device first.');
      return;
    }
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(supabaseErrorMessage(updateError, 'Password update failed.'));
        return;
      }
      clearPasswordRecovery();
      Alert.alert('Password updated', 'Your new password is ready to use.', [
        { text: 'Continue', onPress: () => router.replace('/home') },
      ]);
    } catch (updateFailure) {
      setError(supabaseErrorMessage(updateFailure, 'Password update failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScreenHeader title={choosingPassword ? 'New password' : 'Reset password'} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.instructions}>
            {choosingPassword ? 'Choose a new password for your account.' : 'Enter the email associated with your account.'}
          </Text>
          {choosingPassword ? (
            <>
              <Text style={styles.label}>New password</Text>
              <TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="At least 8 characters" placeholderTextColor="#888888" style={styles.input} />
              <Text style={styles.label}>Confirm password</Text>
              <TextInput secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} onSubmitEditing={updatePassword} placeholder="Repeat password" placeholderTextColor="#888888" style={styles.input} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Email address</Text>
              <TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} onSubmitEditing={sendRecovery} placeholder="abcd@gmail.com" placeholderTextColor="#888888" style={styles.input} />
            </>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.brand}><PrasaBrand /></View>
          <TouchableOpacity disabled={loading} onPress={choosingPassword ? updatePassword : sendRecovery} style={[styles.button, loading && styles.disabled]}>
            <Text style={styles.buttonText}>{loading ? 'Please wait…' : choosingPassword ? 'Update' : 'Send'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 42 },
  instructions: { color: '#222222', fontSize: 16, lineHeight: 22, marginTop: 22, marginBottom: 40 },
  label: { color: '#282828', fontSize: 15, fontWeight: '600', marginBottom: 10 },
  input: { height: 60, borderRadius: 6, backgroundColor: '#F1F1F1', paddingHorizontal: 17, color: '#202020', marginBottom: 20 },
  error: { color: '#B42318', fontSize: 14, lineHeight: 19 },
  brand: { alignItems: 'center', marginTop: 88 },
  button: { alignSelf: 'flex-end', width: 126, height: 60, borderRadius: 6, backgroundColor: '#0785C5', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
