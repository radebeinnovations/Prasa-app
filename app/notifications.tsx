import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { supabase } from '../lib/supabase';
import type { AppNotification } from '../lib/types';
import { useAuth } from '../providers/AuthProvider';

const notificationIcons: Record<AppNotification['type'], keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle', ticket: 'ticket', parcel: 'cube', service: 'megaphone', security: 'shield-checkmark',
};
const iconFor = (type: AppNotification['type']) => notificationIcons[type];

const sectionFor = (dateValue: string) => {
  const created = new Date(dateValue);
  const today = new Date();
  if (created.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return created.toDateString() === yesterday.toDateString() ? 'Yesterday' : 'Earlier';
};

export default function Notifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error: loadError } = await supabase
      .from('notifications')
      .select('id, type, title, message, url, read_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (loadError) setError(loadError.message);
    else {
      setError('');
      setNotifications((data ?? []) as AppNotification[]);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { void loadNotifications(); }, [loadNotifications]));

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => void loadNotifications())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadNotifications, user]);

  const sections = useMemo(() => ['Today', 'Yesterday', 'Earlier'].map((title) => ({
    title,
    items: notifications.filter((item) => sectionFor(item.created_at) === title),
  })).filter((section) => section.items.length > 0), [notifications]);

  const openNotification = async (item: AppNotification) => {
    if (!item.read_at) {
      const readAt = new Date().toISOString();
      const { error: updateError } = await supabase.from('notifications').update({ read_at: readAt }).eq('id', item.id);
      if (updateError) Alert.alert('Could not update notification', updateError.message);
      else setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: readAt } : entry));
    }
    if (item.url) Linking.openURL(item.url).catch(() => Alert.alert('Could not open website', 'Please try again when you have an internet connection.'));
  };

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    const readAt = new Date().toISOString();
    const { error: updateError } = await supabase.from('notifications').update({ read_at: readAt }).eq('user_id', user.id).is('read_at', null);
    if (updateError) Alert.alert('Could not update notifications', updateError.message);
    else setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? readAt })));
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScreenHeader title="Notifications" right={<TouchableOpacity accessibilityLabel="Mark all notifications as read" disabled={unreadCount === 0} onPress={() => void markAllRead()} style={styles.markAllButton}><Ionicons name="checkmark-done" size={20} color={unreadCount === 0 ? '#BDBDBD' : '#0785C5'} /></TouchableOpacity>} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? <Text style={styles.emptyText}>Loading notifications…</Text> : null}
        {error ? <Text style={styles.emptyText}>{error}</Text> : null}
        {!loading && !error && notifications.length === 0 ? <Text style={styles.emptyText}>You have no notifications yet.</Text> : null}
        {sections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => {
              const unread = !item.read_at;
              return (
                <TouchableOpacity accessibilityHint={item.url ? 'Opens the attached website' : 'Marks this notification as read'} accessibilityRole={item.url ? 'link' : 'button'} key={item.id} onPress={() => void openNotification(item)} style={[styles.notificationItem, unread && styles.unreadBackground]}>
                  <View style={styles.iconContainer}>{unread ? <View style={styles.unreadDot} /> : null}<View style={styles.iconCircle}><Ionicons name={iconFor(item.type)} size={23} color="#0076CB" /></View></View>
                  <View style={styles.textContainer}><Text style={styles.titleText}>{item.title}</Text><Text style={styles.messageText}>{item.message}</Text>{item.url ? <Text style={styles.linkText}>Open link</Text> : null}</View>
                  <Text style={styles.timeText}>{new Date(item.created_at).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  markAllButton: { minHeight: 44, justifyContent: 'center' },
  content: { paddingBottom: 24, flexGrow: 1 },
  emptyText: { textAlign: 'center', color: '#777777', margin: 30, lineHeight: 21, fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#202020', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  notificationItem: { minHeight: 86, flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 11, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEEEEE' },
  unreadBackground: { backgroundColor: '#F0F4FF' },
  iconContainer: { marginRight: 12, position: 'relative' },
  iconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#F1F1F1', justifyContent: 'center', alignItems: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0785C5', position: 'absolute', top: 0, left: 0, zIndex: 1, borderWidth: 1, borderColor: '#FFFFFF' },
  textContainer: { flex: 1, paddingRight: 10 },
  titleText: { fontSize: 15, fontWeight: '800', color: '#333333', marginBottom: 3 },
  messageText: { fontSize: 14, color: '#5D5D5D', lineHeight: 19 },
  linkText: { color: '#0785C5', fontSize: 13, fontWeight: '600', marginTop: 3 },
  timeText: { fontSize: 12, color: '#888888', marginLeft: 6 },
});
