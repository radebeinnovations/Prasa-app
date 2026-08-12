import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import { completeAuthFromUrl } from '../lib/auth-links';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const refreshProfile = async () => {
    if (!session?.user.id) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, role')
      .eq('id', session.user.id)
      .maybeSingle();
    if (!error) setProfile(data as Profile | null);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setPasswordRecovery(false);
      }
    });

    const handleUrl = async (url: string) => {
      try {
        const type = await completeAuthFromUrl(url);
        if (type === 'recovery') setPasswordRecovery(true);
      } catch (error) {
        console.warn('Could not complete Supabase auth link:', error);
      }
    };

    Linking.getInitialURL().then((url) => {
      const callbackScreenHandlesWebUrl = Platform.OS === 'web' && Boolean(url?.includes('/auth/callback'));
      if (url && !callbackScreenHandlesWebUrl) void handleUrl(url);
    });
    const linkingListener = Linking.addEventListener('url', ({ url }) => void handleUrl(url));

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      linkingListener.remove();
    };
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [session?.user.id]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    passwordRecovery,
    clearPasswordRecovery: () => setPasswordRecovery(false),
    refreshProfile,
  }), [session, profile, loading, passwordRecovery]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
