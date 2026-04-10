import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { notificationsAPI } from '../services/api';
import { Colors, Radius, Shadows } from '../theme';

const NOTIFICATION_SETTINGS_KEY = 'notificationSettings';
const LOCAL_INBOX_KEY = 'localNotificationInbox';

const NOTIFICATION_TYPES = [
  {
    id: 'reminders',
    icon: 'time',
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
    id: 'guidance',
    icon: 'book',
    label: 'Daily Guidance',
    description: 'Daily motivational tips and reminders',
    color: '#8b5cf6',
  },
];

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState({
    reminders: true,
    calm: true,
    focus: false,
    guidance: false,
  });
  const [scheduledTimes, setScheduledTimes] = useState({
    reminders: { hour: 14, minute: 0 },
    calm: { hour: 12, minute: 0 },
    focus: { hour: 9, minute: 0 },
    guidance: { hour: 8, minute: 0 },
  });
  const { expoPushToken, scheduleRecurringNotification, cancelRecurringNotification } = usePushNotifications();
  const { themeMode, strings, hapticsEnabled } = useApp();

  const load = async () => {
    const [res, saved, localInbox] = await Promise.all([
      notificationsAPI.list().catch(() => []),
      AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY),
      AsyncStorage.getItem(LOCAL_INBOX_KEY),
    ]);

    const remoteItems = Array.isArray(res) ? res : [];
    const storedLocalItems = localInbox ? JSON.parse(localInbox) : [];
    const mergedItems = [...storedLocalItems, ...remoteItems].sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime();
      const bTime = new Date(b.created_at || 0).getTime();
      return bTime - aTime;
    });

    setItems(mergedItems);

    if (saved) {
      const parsed = JSON.parse(saved);
      setEnabledTypes({
        reminders: parsed.reminders ?? true,
        calm: parsed.calm ?? true,
        focus: parsed.focus ?? false,
        guidance: parsed.guidance ?? false,
      });
      setScheduledTimes({
        reminders: parsed.remindersTime || { hour: 14, minute: 0 },
        calm: parsed.calmTime || { hour: 12, minute: 0 },
        focus: parsed.focusTime || { hour: 9, minute: 0 },
        guidance: parsed.guidanceTime || { hour: 8, minute: 0 },
      });
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
    const target = items.find((item) => item.id === id);

    if (target?.source === 'local') {
      const saved = await AsyncStorage.getItem(LOCAL_INBOX_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      const updated = parsed.map((item) => (item.id === id ? { ...item, is_read: true } : item));
      await AsyncStorage.setItem(LOCAL_INBOX_KEY, JSON.stringify(updated));
    } else {
      await notificationsAPI.markRead(id);
    }

    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
  };

  const persistNotificationSettings = async (nextEnabledTypes, nextScheduledTimes) => {
    await AsyncStorage.setItem(
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify({
        ...nextEnabledTypes,
        remindersTime: nextScheduledTimes.reminders,
        calmTime: nextScheduledTimes.calm,
        focusTime: nextScheduledTimes.focus,
        guidanceTime: nextScheduledTimes.guidance,
      })
    );
  };

  const updateScheduledTime = async (typeId, hour, minute) => {
    const newTimes = {
      ...scheduledTimes,
      [typeId]: { hour, minute },
    };
    setScheduledTimes(newTimes);

    // If this type is enabled, reschedule with new time
    if (enabledTypes[typeId]) {
      await scheduleRecurringNotification(typeId, hour, minute);
    }
    await persistNotificationSettings(enabledTypes, newTimes);
  };

  const toggleNotificationType = async (typeId) => {
    const newState = {
      ...enabledTypes,
      [typeId]: !enabledTypes[typeId],
    };
    setEnabledTypes(newState);

    try {
      // Schedule or cancel recurring notification
      if (newState[typeId]) {
        const time = scheduledTimes[typeId];
        await scheduleRecurringNotification(typeId, time.hour, time.minute);
      } else {
        await cancelRecurringNotification(typeId);
      }
    } catch (error) {
      console.log('Error scheduling/canceling notification:', error);
      // Still save the toggle state even if scheduling fails
    }

    // Save settings
    await persistNotificationSettings(newState, scheduledTimes);
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
          icon="notifications"
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
                    <View style={styles.timeContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          const time = scheduledTimes[notifType.id];
                          const newHour = time.hour > 0 ? time.hour - 1 : 23;
                          updateScheduledTime(notifType.id, newHour, time.minute);
                        }}
                        style={[styles.timeButton, isDark && styles.timeButtonDark]}
                      >
                        <Ionicons name="remove" size={12} color={secondaryColor} />
                      </TouchableOpacity>
                      
                      <Text style={[styles.timeText, { color: textColor }]}>
                        {scheduledTimes[notifType.id].hour.toString().padStart(2, '0')}:
                        {scheduledTimes[notifType.id].minute.toString().padStart(2, '0')}
                      </Text>
                      
                      <TouchableOpacity
                        onPress={() => {
                          const time = scheduledTimes[notifType.id];
                          const newHour = time.hour < 23 ? time.hour + 1 : 0;
                          updateScheduledTime(notifType.id, newHour, time.minute);
                        }}
                        style={[styles.timeButton, isDark && styles.timeButtonDark]}
                      >
                        <Ionicons name="add" size={12} color={secondaryColor} />
                      </TouchableOpacity>
                    </View>

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
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeButton: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeButtonDark: {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
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
