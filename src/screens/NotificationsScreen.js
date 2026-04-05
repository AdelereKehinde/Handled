import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius } from '../theme';
import { notificationsAPI } from '../services/api';
import { usePushNotifications } from '../hooks/usePushNotifications';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const { expoPushToken } = usePushNotifications();
  const { themeMode, strings } = useApp();

  const load = async () => {
    const res = await notificationsAPI.list();
    setItems(res?.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  return (
    <LinearGradient colors={themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff']} style={styles.container}>
      <TopBar title={strings.notifications || 'Notifications'} onBack={() => navigation.goBack()} />
      <View style={styles.header}>
        {expoPushToken ? (
          <Text style={styles.pushHint}>Push enabled</Text>
        ) : (
          <Text style={styles.pushHint}>Enable push for updates</Text>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>You have no notifications yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => markRead(item.id)}
            style={[styles.card, item.is_read && styles.cardRead]}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMsg}>{item.message}</Text>
            <Text style={styles.cardMeta}>{item.is_read ? 'Read' : 'Tap to mark read'}</Text>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 12 },
  pushHint: { color: Colors.textSoft, marginTop: 6, fontSize: 12 },
  list: { paddingHorizontal: 24, paddingBottom: 120, gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
  },
  cardRead: { opacity: 0.7 },
  cardTitle: { color: Colors.textDark, fontWeight: '600', marginBottom: 4 },
  cardMsg: { color: Colors.textSoft, fontSize: 12, lineHeight: 18 },
  cardMeta: { color: Colors.primary, fontSize: 11, marginTop: 6, fontWeight: '600' },
  empty: { color: Colors.textSoft, textAlign: 'center', marginTop: 32 },
});
