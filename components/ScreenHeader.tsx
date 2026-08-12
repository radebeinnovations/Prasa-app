import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type ScreenHeaderProps = {
  title: string;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, right }: ScreenHeaderProps) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={18} color="#0785C5" />
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 56, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { minHeight: 44, flexDirection: 'row', alignItems: 'center' },
  title: { marginLeft: 3, color: '#0785C5', fontSize: 19, lineHeight: 24, fontWeight: '700' },
  spacer: { width: 44 },
});
