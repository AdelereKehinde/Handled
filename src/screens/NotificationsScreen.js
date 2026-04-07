import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { notificationsAPI } from '../services/api';
import { Colors, Radius, Shadows } from '../theme';

const NOTIFICATION_TYPES = [
  {
    id: 'reminders',
    icon: 'alarm',
    label: 'Decision Reminders',
    description: 'Gentle nudges to practice decisions',
    color: '#a78bfa',
  },
  {
    id: 'calm',
    icon: 'leaf',
    label: 'Calm Moments',
    description: 'Breathing reminders throughout the day',
    color: '#34d399',
  },
  {
    id: 'focus',
    icon: 'play-circle',
    label: 'Focus Sessions',
    description: 'Time to start a focus session',
    color: '#fbbf24',
  },
  {
    id: 'mood',
    icon: 'happy',
    label: 'Mood Check-in',
    description: 'Quick mood tracking reminder',
    color: '#f87171',
  },
];

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState({
    reminders: true,
    calm: true,
    focus: false,
    mood: false,
  });
  const { expoPushToken } = usePushNotifications();
  const { themeMode, strings, hapticsEnabled } = useApp();

  const load = async () => {
    const res = await notificationsAPI.list();
    setItems(Array.isArray(res) ? res : []);
    
    const saved = await AsyncStorage.getItem('notificationSettings');
    if (saved) {
      setEnabledTypes(JSON.parse(saved));
    }
  };

  useEffect(() => {
    load();

    const unsubscribe = Notifications.addNotificationResponseReceivedListener(({ notification }) => {
      load();
    });

    return unsubscribe.remove;
  }, []);

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
  };

  const toggleNotificationType = async (typeId) => {
    const newState = {
      ...enabledTypes,
      [typeId]: !enabledTypes[typeId],
    };
    setEnabledTypes(newState);
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(newState));
  };

  const sendTestNotification = async (typeId) => {
    const type = NOTIFICATION_TYPES.find((t) => t.id === typeId);
    const messages = {
      reminders: {
        title: '✨ Time to Practice',
        body: 'A decision awaits. When ready, your mind will know.',
      },
      calm: {
        title: '🍃 Breathe',
        body: 'Take a moment. In through your nose, out through your mouth.',
      },
      focus: {
        title: '🎯 Focus Moment',
        body: 'Your 25-minute session awaits. Let\'s do this.',
      },
      mood: {
        title: '💜 How are you?',
        body: 'A quick check-in. No judgment, just honest feeling.',
      },
    };

    const msg = messages[typeId];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: 'default',
        data: { type: typeId },
      },
      trigger: { seconds: 2 },
    });

    Alert.alert('Test Notification Queued', 'Check in a moment! 📬');
  };

  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;
  const secondaryColor = isDark ? Colors.textSoft : Colors.textMid;
  const gradient = isDark ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];

  return (
    <LinearGradient
      colors={gradient}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar
          title={strings.notifications || 'Notifications'}
          onBack={() => navigation.goBack()}
          tintColor={textColor}
        />

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            onPress={() => setShowSettings(false)}
            style={[styles.tab, !showSettings && styles.tabActive]}
          >
            <Text style={[styles.tabText, !showSettings && styles.tabTextActive]}>Inbox</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={[styles.tab, showSettings && styles.tabActive]}
          >
            <Text style={[styles.tabText, showSettings && styles.tabTextActive]}>Settings</Text>
          </TouchableOpacity>
        </View>

        {showSettings ? (
          <>
            <Text style={[styles.title, { color: textColor }]}>Notification Preferences</Text>
            <Text style={[styles.subtitle, { color: secondaryColor }]}>
              Choose which notifications bring you joy, not stress.
            </Text>

            <View style={{ marginBottom: 12 }}>
              {NOTIFICATION_TYPES.map((notifType) => (
                <View
                  key={notifType.id}
                  style={[styles.notificationTypeCard, Shadows.card, isDark && styles.cardDark]}
                >
                  <View style={styles.notificationHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: `${notifType.color}20` }]}>
                      <Ionicons name={notifType.icon} size={20} color={notifType.color} />
                    </View>
                    <View style={styles.notificationInfo}>
                      <Text style={[styles.notificationLabel, { color: textColor }]}>
                        {notifType.label}
                      </Text>
                      <Text style={[styles.notificationDesc, { color: secondaryColor }]}>
                        {notifType.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.notificationActions}>
                    <TouchableOpacity
                      onPress={() => sendTestNotification(notifType.id)}
                      style={[styles.testButton, isDark && styles.testButtonDark]}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="send" size={12} color={secondaryColor} />
                      <Text style={[styles.testButtonText, { color: secondaryColor }]}>Test</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => toggleNotificationType(notifType.id)}
                      style={[
                        styles.toggleButton,
                        enabledTypes[notifType.id] && styles.toggleButtonActive,
                        { borderColor: notifType.color },
                      ]}
                    >
                      {enabledTypes[notifType.id] && (
                        <Ionicons name="checkmark" size={12} color={Colors.white} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.pushStatus, isDark && styles.pushStatusDark]}>
              <Ionicons
                name={expoPushToken ? 'checkmark-circle' : 'alert-circle'}
                size={20}
                color={expoPushToken ? '#10b981' : '#f59e0b'}
              />
              <Text style={[styles.pushStatusText, { color: secondaryColor }]}>
                {expoPushToken ? 'Push notifications enabled' : 'Enable push for remote notifications'}
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: textColor }]}>Notification Inbox</Text>
            {items.length === 0 ? (
              <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
                <Ionicons name="mail-open" size={40} color={Colors.primary} />
                <Text style={[styles.emptyText, { color: secondaryColor }]}>
                  No notifications yet
                </Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => markRead(item.id)}
                    style={[styles.card, Shadows.card, item.is_read && styles.cardRead, isDark && styles.cardDark]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: textColor }]}>{item.title}</Text>
                      <Text style={[styles.cardMsg, { color: secondaryColor }]}>{item.message}</Text>
                      <Text style={[styles.cardMeta, { color: Colors.primary }]}>
                        {item.is_read ? '✓ Read' : '✧ New'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 120 },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: { color: Colors.textMid, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  tabTextActive: { color: Colors.primary },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6, paddingHorizontal: 24, marginTop: 16 },
  subtitle: { fontSize: 13, marginBottom: 16, lineHeight: 18, paddingHorizontal: 24 },
  notificationTypeCard: {
    marginHorizontal: 24,
    marginBottom: 10,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
  },
  cardDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  notificationHeader: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationInfo: { flex: 1, justifyContent: 'center' },
  notificationLabel: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  notificationDesc: { fontSize: 11, lineHeight: 13 },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  testButton: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  testButtonDark: {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  testButtonText: { fontSize: 11, fontWeight: '500' },
  toggleButton: {
    width: 28,
    height: 28,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  pushStatus: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  pushStatusDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  pushStatusText: { fontSize: 12, lineHeight: 16, flex: 1 },
  emptyState: {
    marginHorizontal: 24,
    marginTop: 32,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  emptyText: { fontSize: 13, textAlign: 'center', marginTop: 12 },
  card: {
    marginHorizontal: 24,
    marginBottom: 8,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  cardRead: { opacity: 0.6 },
  cardContent: { gap: 4 },
  cardTitle: { fontWeight: '600', fontSize: 13 },
  cardMsg: { fontSize: 12, lineHeight: 16 },
  cardMeta: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});
