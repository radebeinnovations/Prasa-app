import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setError('Enter both a username and password.');
      return;
    }

    setError('');
    router.replace({ pathname: '/home', params: { name: cleanUsername } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="train" size={46} color="#0076CB" />
              <Text style={styles.logoText}>prasa</Text>
            </View>
            <Text style={styles.logoSubtext}>
              PASSENGER RAIL AGENCY{`\n`}OF SOUTH AFRICA
            </Text>
          </View>

          <View style={styles.formSection}>
            <TextInput
              accessibilityLabel="Username"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#64748B"
              returnKeyType="next"
              style={styles.input}
              value={username}
            />
            <View style={styles.passwordField}>
              <TextInput
                accessibilityLabel="Password"
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
                placeholder="Password"
                placeholderTextColor="#64748B"
                returnKeyType="go"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={password}
              />
              <TouchableOpacity
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
                onPress={() => setShowPassword((current) => !current)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.demoText}>Demo mode: use any non-empty credentials.</Text>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() =>
                Alert.alert('Password reset', 'Password recovery will be available when authentication is connected.')
              }
            >
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={handleLogin}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              accessibilityLabel="Continue with Google"
              accessibilityRole="button"
              onPress={() => Alert.alert('Google sign-in', 'Google sign-in is not connected in this demo yet.')}
              style={styles.socialButton}
            >
              <Ionicons name="logo-google" size={22} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Continue with Facebook"
              accessibilityRole="button"
              onPress={() => Alert.alert('Facebook sign-in', 'Facebook sign-in is not connected in this demo yet.')}
              style={styles.socialButton}
            >
              <Ionicons name="logo-facebook" size={22} color="#4267B2" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => Alert.alert('Sign up', 'Account registration is not connected in this demo yet.')}
            >
              <Text style={styles.footerLink}> Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  content: { flexGrow: 1, padding: 30, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 42 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  logoText: { fontSize: 40, fontWeight: '800', color: '#0076CB', marginLeft: 10 },
  logoSubtext: { fontSize: 10, color: '#0076CB', textAlign: 'center', fontWeight: '600' },
  formSection: { marginBottom: 28 },
  input: {
    minHeight: 56,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 18,
    marginBottom: 15,
    fontSize: 16,
    color: '#0F172A',
  },
  passwordField: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  passwordInput: { flex: 1, paddingHorizontal: 18, fontSize: 16, color: '#0F172A' },
  eyeButton: { minWidth: 52, minHeight: 52, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#B91C1C', marginTop: 10, fontSize: 14 },
  demoText: { color: '#64748B', marginTop: 8, fontSize: 12 },
  forgotPassword: { textAlign: 'center', color: '#075985', fontSize: 15, marginVertical: 24 },
  loginButton: { backgroundColor: '#0076CB', borderRadius: 10, padding: 17, alignItems: 'center' },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 12, color: '#64748B', fontSize: 13 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 32 },
  socialButton: {
    width: 60,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#334155', fontSize: 15 },
  footerLink: { color: '#0076CB', fontWeight: '700', fontSize: 15 },
});
