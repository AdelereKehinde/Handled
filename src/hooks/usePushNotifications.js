import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

const LOCAL_INBOX_KEY = 'localNotificationInbox';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const register = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }
      const token = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(token.data);
    };

    register();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      persistNotificationToInbox(notification);
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      persistNotificationToInbox(response.notification);
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current?.remove) {
        notificationListener.current.remove();
      }
      if (responseListener.current?.remove) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#a78bfa',
      });

      // Create specific channels for different notification types
      Notifications.setNotificationChannelAsync('calm', {
        name: 'Calm Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 150, 150, 150],
        lightColor: '#34d399',
        sound: 'default',
      });

      Notifications.setNotificationChannelAsync('guidance', {
        name: 'Daily Guidance',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200, 200, 200],
        lightColor: '#a78bfa',
        sound: 'default',
      });
    }
  }, []);

  const scheduleRecurringNotification = async (type, hour, minute = 0) => {
    try {
      // Cancel existing notifications of this type
      await Notifications.cancelScheduledNotificationAsync(`${type}-recurring`);

      const schedulingOptions = {
        content: getNotificationContent(type),
        trigger: {
          type: 'calendar',
          hour,
          minute,
          repeats: true,
        },
      };

      await Notifications.scheduleNotificationAsync({
        ...schedulingOptions,
        identifier: `${type}-recurring`,
      });

      // Save scheduling preference
      const settings = await AsyncStorage.getItem('notificationSettings') || '{}';
      const parsedSettings = JSON.parse(settings);
      parsedSettings[`${type}Time`] = { hour, minute };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(parsedSettings));

    } catch (error) {
      console.log('Error scheduling notification:', error);
    }
  };

  const cancelRecurringNotification = async (type) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(`${type}-recurring`);
    } catch (error) {
      console.log('Error canceling notification:', error);
    }
  };

  return {
    expoPushToken,
    scheduleRecurringNotification,
    cancelRecurringNotification
  };
};

const persistNotificationToInbox = async (notification) => {
  try {
    const content = notification?.request?.content || {};
    const data = content.data || {};
    const inboxItem = {
      id: notification?.request?.identifier || `local-${Date.now()}`,
      title: content.title || 'Notification',
      message: content.body || '',
      is_read: false,
      created_at: new Date().toISOString(),
      source: 'local',
      type: data.type || 'general',
    };

    const saved = await AsyncStorage.getItem(LOCAL_INBOX_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    const withoutDuplicate = parsed.filter((item) => item.id !== inboxItem.id);
    await AsyncStorage.setItem(
      LOCAL_INBOX_KEY,
      JSON.stringify([inboxItem, ...withoutDuplicate].slice(0, 50))
    );
  } catch (error) {
    console.log('Error storing local notification:', error);
  }
};

const getNotificationContent = (type) => {
  const contents = {
    calm: {
      title: '🍃 Time for a Calm Moment',
      body: 'Take a gentle breath. You\'ve got this.',
      sound: 'default',
      data: { type: 'calm', screen: 'Calm' },
    },
    guidance: {
      title: '✨ Daily Guidance Ready',
      body: 'Your daily reminders are waiting for you.',
      sound: 'default',
      data: { type: 'guidance', screen: 'DailyGuidance' },
    },
    reminders: {
      title: '💜 Decision Practice',
      body: 'A gentle nudge to practice your decision-making.',
      sound: 'default',
      data: { type: 'reminders', screen: 'Home' },
    },
    focus: {
      title: '🎯 Focus Session Available',
      body: 'Ready for a 25-minute focus session?',
      sound: 'default',
      data: { type: 'focus', screen: 'FocusSession' },
    },
  };

  return contents[type] || contents.reminders;
};
