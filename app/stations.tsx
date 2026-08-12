import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { supabase } from '../lib/supabase';
import type { Station } from '../lib/types';

export default function Stations() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStations = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('stations').select('id, code, name, area, latitude, longitude').eq('active', true).order('name');
    setLoading(false);
    if (loadError) setError(loadError.message);
    else { setError(''); setStations((data ?? []) as Station[]); }
  };

  useEffect(() => { void loadStations(); }, []);
  const sections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized ? stations.filter((station) => `${station.name} ${station.area}`.toLowerCase().includes(normalized)) : stations;
    const grouped = new Map<string, Station[]>();
    filtered.forEach((station) => {
      const letter = station.name.charAt(0).toUpperCase();
      grouped.set(letter, [...(grouped.get(letter) ?? []), station]);
    });
    return [...grouped].map(([title, data]) => ({ title, data }));
  }, [query, stations]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScreenHeader title="Stations" />
      <View style={styles.searchBox}>
        <TextInput accessibilityLabel="Search stations" value={query} onChangeText={setQuery} placeholder="Search..." placeholderTextColor="#8A8A8A" style={styles.searchInput} />
        <Ionicons name="search" size={22} color="#0785C5" />
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(station) => String(station.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStations} tintColor="#0785C5" />}
        ListEmptyComponent={<Text style={styles.empty}>{error || (loading ? 'Loading stations…' : `No stations match “${query}”.`)}</Text>}
        renderSectionHeader={({ section }) => <Text style={styles.letter}>{section.title}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/station-details', params: { name: item.name, area: item.area, code: item.code } })}
            style={styles.stationRow}
          >
            <Text style={styles.stationName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  searchBox: { height: 52, marginHorizontal: 24, marginTop: 4, marginBottom: 14, borderRadius: 7, backgroundColor: '#F1F1F1', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, height: 52, color: '#222222', fontSize: 16 },
  list: { paddingHorizontal: 30, paddingBottom: 28, flexGrow: 1 },
  letter: { color: '#202020', fontWeight: '800', fontSize: 16, paddingTop: 8, paddingBottom: 7, backgroundColor: '#FFFFFF' },
  stationRow: { minHeight: 42, justifyContent: 'center', paddingLeft: 12 },
  stationName: { color: '#555555', fontSize: 16, lineHeight: 21, fontWeight: '500' },
  empty: { textAlign: 'center', color: '#777777', fontSize: 15, marginTop: 40 },
});
