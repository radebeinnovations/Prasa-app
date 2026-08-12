import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Provider } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const redirectUrl = (path: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  return Linking.createURL(path);
};

export const authRedirectUrl = redirectUrl('/auth/callback');
export const passwordResetRedirectUrl = redirectUrl('/reset-password');

function authParams(url: string) {
  const query = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  const fragment = url.includes('#') ? url.split('#')[1] : '';
  return new URLSearchParams([query, fragment].filter(Boolean).join('&'));
}

export async function completeAuthFromUrl(url: string) {
  const params = authParams(url);
  const errorDescription = params.get('error_description');
  if (errorDescription) throw new Error(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));

  const code = params.get('code');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  } else if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
  }

  return params.get('type');
}

export async function signInWithProvider(provider: Extract<Provider, 'google' | 'facebook'>) {
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: authRedirectUrl },
    });
    if (error) throw error;
    return;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: authRedirectUrl,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Supabase did not return an OAuth login URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectUrl);
  if (result.type === 'success') {
    await completeAuthFromUrl(result.url);
    return;
  }
  if (result.type !== 'cancel' && result.type !== 'dismiss') {
    throw new Error('The social sign-in window could not be completed.');
  }
}
