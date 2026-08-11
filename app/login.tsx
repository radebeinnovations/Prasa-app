import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="aperture" size={50} color="#0076CB" />
              <Text style={styles.logoText}>prasa</Text>
            </View>
            <Text style={styles.logoSubtext}>PASSENGER RAIL AGENCY{'\n'}OF SOUTH AFRICA</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <TextInput 
              style={styles.input} 
              placeholder="Username" 
              placeholderTextColor="#4A4A4A" 
            />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#4A4A4A" 
              secureTextEntry
            />
            
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/home')}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={20} color="#4267B2" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerLink}>Login</Text>
            </Text>
            <Text style={[styles.footerText, { marginTop: 20 }]}>
              Don't have an account? <Text style={styles.footerLink}>Sign Up</Text>
            </Text>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#0076CB',
    marginLeft: 10,
  },
  logoSubtext: {
    fontSize: 10,
    color: '#0076CB',
    textAlign: 'center',
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
    fontSize: 16,
    color: '#000000',
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#000000',
    fontSize: 16,
    marginBottom: 30,
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: '#0076CB',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#000000',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#000000',
    fontSize: 15,
  },
  footerLink: {
    color: '#0076CB',
    fontWeight: 'bold',
  },
});
