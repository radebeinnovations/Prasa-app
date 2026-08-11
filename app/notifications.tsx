import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const notifications = [
  { id: 'arrival-change', section: 'Today', icon: 'megaphone' as const, message: 'The Pretoria to Johannesburg train now arrives at platform 1.', time: 'Now', unread: true },
  { id: 'train-arrival', section: 'Today', icon: 'train' as const, message: 'Train KTS/MDA-1122 is arriving now.', time: '5 min', unread: false },
  { id: 'parcel', section: 'Yesterday', icon: 'cube' as const, message: 'Your parcel is ready for delivery. Payment is due on collection.', time: '20 May', unread: true },
  { id: 'ticket', section: 'Yesterday', icon: 'ticket' as const, message: 'Your demo ticket reservation was successful.', time: '20 May', unread: false },
  { id: 'website', section: 'Yesterday', icon: 'globe' as const, message: 'Visit the official PRASA website for agency information.', time: '20 May', unread: false, url: 'https://www.prasa.com/' },
];

export default function Notifications() {
  const router = useRouter();
  const initialUnread = notifications.filter((item) => item.unread).map((item) => item.id);
  const [unreadIds, setUnreadIds] = useState(() => new Set(initialUnread));

  const openNotification = (id: string, url?: string) => {
    setUnreadIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Could not open website', 'Please try again when you have an internet connection.'));
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0076CB" />
          <Text style={styles.headerTitle}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Mark all notifications as read"
          accessibilityRole="button"
          disabled={unreadIds.size === 0}
          onPress={() => setUnreadIds(new Set())}
          style={styles.markAllButton}
        >
          <Text style={[styles.markAllText, unreadIds.size === 0 && styles.markAllDisabled]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {['Today', 'Yesterday'].map((section) => (
          <View key={section}>
            <Text style={styles.sectionTitle}>{section}</Text>
            {notifications.filter((item) => item.section === section).map((item) => {
              const unread = unreadIds.has(item.id);
              return (
                <TouchableOpacity
                  accessibilityHint={item.url ? 'Opens the official PRASA website' : 'Marks this notification as read'}
                  accessibilityRole={item.url ? 'link' : 'button'}
                  key={item.id}
                  onPress={() => openNotification(item.id, item.url)}
                  style={[styles.notificationItem, unread && styles.unreadBackground]}
                >
                  <View style={styles.iconContainer}>
                    {unread ? <View style={styles.unreadDot} /> : null}
                    <View style={styles.iconCircle}>
                      <Ionicons name={item.icon} size={23} color="#0076CB" />
                    </View>
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.messageText}>{item.message}</Text>
                    {item.url ? <Text style={styles.linkText}>www.prasa.com</Text> : null}
                  </View>
                  <Text style={styles.timeText}>{item.time}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' },
  backButton: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  headerTitle: { fontSize: 20, color: '#0076CB', fontWeight: '700', marginLeft: 5 },
  markAllButton: { minHeight: 44, justifyContent: 'center' },
  markAllText: { color: '#0076CB', fontSize: 12, fontWeight: '700' },
  markAllDisabled: { color: '#94A3B8' },
  content: { paddingBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8 },
  notificationItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'flex-start', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' },
  unreadBackground: { backgroundColor: '#EFF6FF' },
  iconContainer: { marginRight: 14, position: 'relative' },
  iconCircle: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0076CB', position: 'absolute', top: -2, left: -2, zIndex: 1, borderWidth: 2, borderColor: '#FFFFFF' },
  textContainer: { flex: 1, paddingRight: 10 },
  messageText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  linkText: { color: '#0076CB', fontWeight: '700', fontSize: 13, marginTop: 4 },
  timeText: { fontSize: 11, color: '#64748B', marginTop: 2 },
});
