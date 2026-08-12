import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    const cleanName = displayName.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !phone.trim() || !idNumber.trim() || !cleanEmail || !password) {
      setError('Complete every field.');
      return;
    }
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { display_name: cleanName, phone: phone.trim(), id_number: idNumber.trim() }, emailRedirectTo: authRedirectUrl },
    });
    setLoading(false);
    if (signUpError) {
      setError(supabaseErrorMessage(signUpError, 'Account creation failed.'));
      return;
    }
    if (!data.session) {
      Alert.alert('Confirm your email', 'Open the confirmation link sent to your email, then return here to log in.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScreenHeader title="Register" />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatar}><Ionicons name="person-add-outline" size={39} color="#0785C5" /></View>
          <TextInput placeholder="Name" placeholderTextColor="#888888" value={displayName} onChangeText={setDisplayName} style={styles.input} />
          <TextInput placeholder="Phone Number" placeholderTextColor="#888888" keyboardType="phone-pad" value={phone} onChangeText={setPhone} style={styles.input} />
          <TextInput placeholder="NIC Number" placeholderTextColor="#888888" value={idNumber} onChangeText={setIdNumber} style={styles.input} />
          <TextInput placeholder="Email" placeholderTextColor="#888888" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
          <TextInput placeholder="Password" placeholderTextColor="#888888" secureTextEntry value={password} onChangeText={setPassword} onSubmitEditing={signUp} style={styles.input} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity disabled={loading} onPress={signUp} style={[styles.button, loading && styles.disabled]}>
            <Text style={styles.buttonText}>{loading ? 'Creating Account…' : 'Create Account'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 24 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#E0E0E0', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 25, marginBottom: 54 },
  input: { height: 58, borderRadius: 6, backgroundColor: '#F1F1F1', paddingHorizontal: 17, color: '#202020', fontSize: 16, marginBottom: 14 },
  error: { color: '#B42318', fontSize: 14, lineHeight: 19, marginBottom: 10 },
  button: { height: 60, borderRadius: 6, backgroundColor: '#0785C5', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
