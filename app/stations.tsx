import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const stations = [
  { name: 'Pretoria', area: 'Tshwane Central' },
  { name: 'Centurion', area: 'Centurion' },
  { name: 'Midrand', area: 'Midrand' },
  { name: 'Marlboro', area: 'Alexandra' },
  { name: 'Sandton', area: 'Sandton Central' },
  { name: 'Rosebank', area: 'Rosebank' },
  { name: 'Park Station', area: 'Johannesburg CBD' },
  { name: 'Nasrec', area: 'Johannesburg South' },
];

export default function Stations() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const filteredStations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return stations;
    return stations.filter((station) =>
      `${station.name} ${station.area}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#0076CB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stations</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={21} color="#64748B" />
        <TextInput
          accessibilityLabel="Search stations"
          autoCapitalize="words"
          onChangeText={setQuery}
          placeholder="Search by station or area"
          placeholderTextColor="#64748B"
          style={styles.searchInput}
          value={query}
        />
        {query ? (
          <TouchableOpacity accessibilityLabel="Clear search" accessibilityRole="button" onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={21} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={filteredStations}
        keyExtractor={(station) => station.name}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.emptyText}>No stations match “{query}”.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            accessibilityHint="Use this station as the schedule starting point"
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/schedule', params: { from: item.name } })}
            style={styles.stationCard}
          >
            <View style={styles.stationIcon}>
              <Ionicons name="train-outline" size={24} color="#0076CB" />
            </View>
            <View style={styles.stationText}>
              <Text style={styles.stationName}>{item.name}</Text>
              <Text style={styles.stationArea}>{item.area}</Text>
            </View>
            <Ionicons name="chevron-forward" size={21} color="#64748B" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 21, fontWeight: '700', color: '#0F172A' },
  headerSpacer: { width: 44 },
  searchBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 16, color: '#0F172A' },
  list: { padding: 20, paddingTop: 8, flexGrow: 1 },
  stationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CBD5E1',
  },
  stationIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  stationText: { flex: 1, marginHorizontal: 14 },
  stationName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  stationArea: { fontSize: 13, color: '#64748B', marginTop: 3 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#64748B', fontSize: 15 },
});
