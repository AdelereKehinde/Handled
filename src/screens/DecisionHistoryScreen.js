import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import TopBar from '../components/TopBar';
import { InputField } from '../components/UI';
import { useApp } from '../context/AppContext';
import { decisionsAPI } from '../services/api';
import { Colors, Radius, Shadows } from '../theme';
import { clearLocalDecisions, listLocalDecisions, removeLocalDecision } from '../utils/localDecisions';

export default function DecisionHistoryScreen({ navigation }) {
  const { user, themeMode, strings } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const load = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const [remote, local] = await Promise.all([
        decisionsAPI.history(user.id).catch(() => []),
        listLocalDecisions(user.id),
      ]);

      const merged = [...(local || []), ...(Array.isArray(remote) ? remote : [])].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      setHistory(merged);
    } catch (error) {
      console.error('Load history error:', error);
      Alert.alert('Error', error.message || 'Failed to load decision history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [user?.id])
  );

  const handleDelete = async (id) => {
    try {
      if (String(id).startsWith('local-')) {
        await removeLocalDecision(id);
      } else {
        await decisionsAPI.remove(id);
      }
      setHistory((prev) => prev.filter((item) => item.id !== id));
      Alert.alert('Success', 'Decision deleted successfully.');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', error.message || 'Failed to delete decision. Please try again.');
    }
  };

  const handleDeleteAll = async () => {
    Alert.alert('Delete all?', 'This will remove all your decision history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete all',
        style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all([
                decisionsAPI.removeAll(user.id).catch(() => null),
                clearLocalDecisions(user.id),
              ]);
              setHistory([]);
              Alert.alert('Success', 'All decisions deleted successfully.');
            } catch (error) {
            console.error('Delete all error:', error);
            Alert.alert('Error', error.message || 'Failed to delete all decisions. Please try again.');
            // Fallback to individual deletion if batch delete fails
            try {
              const items = [...history];
              for (const item of items) {
                if (String(item.id).startsWith('local-')) {
                  await removeLocalDecision(item.id);
                } else {
                  await decisionsAPI.remove(item.id);
                }
              }
              setHistory([]);
              Alert.alert('Success', 'All decisions deleted successfully.');
            } catch (fallbackError) {
              Alert.alert('Error', 'Failed to delete decisions. Please try again.');
            }
          }
        },
      },
    ]);
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return history;

    const q = query.toLowerCase();
    return history.filter(
      (item) =>
        item.input_text?.toLowerCase().includes(q) || item.ai_response?.toLowerCase().includes(q)
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
    <LinearGradient
      colors={themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff']}
      style={styles.container}
    >
      <TopBar
        title={strings.decisionHistory || 'Decision history'}
        onBack={() => navigation.goBack()}
        icon="time"
      />

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
        keyExtractor={(item) => String(item.id)}
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
