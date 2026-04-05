import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors, Radius, Shadows } from '../theme';
import { decisionsAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';
import { InputField } from '../components/UI';

export default function DecisionHistoryScreen({ navigation }) {
  const { user, themeMode, strings } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await decisionsAPI.history(user.id);
      setHistory(res?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const handleDelete = async (id) => {
    await decisionsAPI.remove(id);
    setHistory((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDeleteAll = async () => {
    Alert.alert('Delete all?', 'This will remove all your decision history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete all',
        style: 'destructive',
        onPress: async () => {
          const items = [...history];
          for (const item of items) {
            await decisionsAPI.remove(item.id);
          }
          setHistory([]);
        },
      },
    ]);
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return history;
    const q = query.toLowerCase();
    return history.filter(
      (d) =>
        d.input_text?.toLowerCase().includes(q) || d.ai_response?.toLowerCase().includes(q)
    );
  }, [history, query]);

  const renderItem = ({ item }) => {
    const right = () => (
      <TouchableOpacity style={styles.deleteSwipe} onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
    return (
      <Swipeable renderRightActions={right}>
        <TouchableOpacity
          style={[styles.card, Shadows.card]}
          onPress={() =>
            navigation.navigate('DecisionOutput', {
              decisionId: item.id,
              response: item.ai_response,
              original: item.input_text,
            })
          }
        >
          <Text style={styles.cardTitle}>{item.input_text}</Text>
          <Text style={styles.cardSub} numberOfLines={2}>
            {item.ai_response}
          </Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <LinearGradient colors={themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff']} style={styles.container}>
      <TopBar title={strings.decisionHistory || 'Decision history'} onBack={() => navigation.goBack()} />
      <View style={styles.header}>
        <TouchableOpacity onPress={load}>
          <Text style={styles.link}>{loading ? 'Refreshing...' : strings.refresh || 'Refresh'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteAll} disabled={history.length === 0}>
          <Text style={[styles.link, history.length === 0 && styles.linkDisabled]}>
            {strings.deleteAll || 'Delete all'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchWrap}>
        <InputField
          label={strings.searchDecisions || 'Search decisions'}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by text or response"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No decisions yet.</Text>}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: { color: Colors.primary, fontWeight: '600' },
  linkDisabled: { color: Colors.textLight },
  searchWrap: { paddingHorizontal: 24 },
  list: { paddingHorizontal: 24, paddingBottom: 120, gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { color: Colors.textDark, fontWeight: '600', marginBottom: 6 },
  cardSub: { color: Colors.textSoft, fontSize: 12 },
  deleteSwipe: {
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    marginBottom: 12,
    borderRadius: Radius.lg,
  },
  deleteText: { color: Colors.white, fontWeight: '700' },
  empty: { color: Colors.textSoft, textAlign: 'center', marginTop: 32 },
});
