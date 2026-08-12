import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PrasaBrandProps = {
  compact?: boolean;
};

export function PrasaBrand({ compact = false }: PrasaBrandProps) {
  return (
    <View accessibilityLabel="PRASA Passenger Rail Agency of South Africa" style={styles.brand}>
      <Ionicons name="aperture" size={compact ? 38 : 56} color="#12AEE2" />
      <View style={styles.wordmark}>
        <Text style={[styles.name, compact && styles.nameCompact]}>prasa</Text>
        <Text style={[styles.tagline, compact && styles.taglineCompact]}>
          PASSENGER RAIL AGENCY{`\n`}OF SOUTH AFRICA
        </Text>
      </View>
    </View>
  );
}

export function TrainMark({ small = false }: { small?: boolean }) {
  const size = small ? 56 : 104;
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="train" size={small ? 31 : 58} color="#FFFFFF" />
      <View style={[styles.pointer, small && styles.pointerSmall]} />
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  wordmark: { marginLeft: 9 },
  name: { color: '#0785C5', fontSize: 34, fontWeight: '800', lineHeight: 36, letterSpacing: -1 },
  nameCompact: { fontSize: 26, lineHeight: 28 },
  tagline: { color: '#0785C5', fontSize: 6.5, fontWeight: '700', lineHeight: 8 },
  taglineCompact: { fontSize: 5, lineHeight: 6 },
  mark: { backgroundColor: '#12AEE2', alignItems: 'center', justifyContent: 'center' },
  pointer: {
    position: 'absolute', bottom: -12, width: 0, height: 0,
    borderLeftWidth: 14, borderRightWidth: 14, borderTopWidth: 18,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#12AEE2',
  },
  pointerSmall: { bottom: -8, borderLeftWidth: 9, borderRightWidth: 9, borderTopWidth: 12 },
});
