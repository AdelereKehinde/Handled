import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { authAPI, usersAPI } from '../services/api';
import { Colors, Radius } from '../theme';

const TIME_OPTIONS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const {
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    strings,
    availableLanguages,
    hapticsEnabled,
    setHapticsEnabled,
    dailyReminderEnabled,
    setDailyReminderEnabled,
    dailyReminderTime,
    setDailyReminderTime,
  } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;
  const secondaryColor = isDark ? Colors.textSoft : Colors.textMid;

  const selectedLanguage = availableLanguages.find((item) => item.code === language)?.label || 'English';

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete account',
      'This will remove your account and all your data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await usersAPI.deleteMe();
            await authAPI.logout();
            navigation.replace('AuthEntry');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar title={strings.settings || 'Settings'} onBack={() => navigation.goBack()} tintColor={textColor} />
        <Text style={[styles.title, { color: textColor }]}>{strings.settings || 'Settings'}</Text>

        <TouchableOpacity style={[styles.row, styles.cardRow]} onPress={() => setLanguageModalVisible(true)}>
          <View style={styles.rowBody}>
            <Text style={[styles.rowText, { color: textColor }]}>Language</Text>
            <Text style={[styles.rowDesc, { color: secondaryColor }]}>Select your app language.</Text>
          </View>
          <Text style={[styles.rowValue, { color: textColor }]}>{selectedLanguage}</Text>
        </TouchableOpacity>

        <View style={[styles.row, styles.cardRow]}>
          <View style={styles.rowBody}>
            <Text style={[styles.rowText, { color: textColor }]}>Notifications</Text>
            <Text style={[styles.rowDesc, { color: secondaryColor }]}>Keep reminders and updates enabled.</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(value) => {
              setNotificationsEnabled(value);
              if (!value) setDailyReminderEnabled(false);
            }}
            trackColor={{ true: Colors.primary, false: Colors.cardBorder }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={[styles.row, styles.cardRow]}>
          <View style={styles.rowBody}>
            <Text style={[styles.rowText, { color: textColor }]}>Haptics</Text>
            <Text style={[styles.rowDesc, { color: secondaryColor }]}>Feel subtle feedback across the app.</Text>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={(value) => setHapticsEnabled(value)}
            trackColor={{ true: Colors.primary, false: Colors.cardBorder }}
            thumbColor={Colors.white}
          />
        </View>

        <TouchableOpacity
          style={[styles.row, styles.cardRow]}
          onPress={() => setDailyReminderEnabled((prev) => !prev)}
          activeOpacity={0.85}
        >
          <View style={styles.rowBody}>
            <Text style={[styles.rowText, { color: textColor }]}>Daily reminder</Text>
            <Text style={[styles.rowDesc, { color: secondaryColor }]}>Receive one calm reminder every day.</Text>
          </View>
          <Switch
            value={dailyReminderEnabled}
            onValueChange={setDailyReminderEnabled}
            trackColor={{ true: Colors.primary, false: Colors.cardBorder }}
            thumbColor={Colors.white}
          />
        </TouchableOpacity>

        {dailyReminderEnabled ? (
          <TouchableOpacity style={[styles.row, styles.cardRow]} onPress={() => setTimeModalVisible(true)}>
            <Text style={[styles.rowText, { color: textColor }]}>Reminder time</Text>
            <Text style={[styles.rowValue, { color: textColor }]}>{dailyReminderTime}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={[styles.linkRow]} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={[styles.linkText, { color: textColor }]}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkRow]} onPress={() => navigation.navigate('Security')}>
          <Text style={[styles.linkText, { color: textColor }]}>Security</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkRow]} onPress={() => navigation.navigate('FAQ')}>
          <Text style={[styles.linkText, { color: textColor }]}>FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkRow]} onPress={() => navigation.navigate('Terms')}>
          <Text style={[styles.linkText, { color: textColor }]}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkRow]} onPress={() => navigation.navigate('ReportBug')}>
          <Text style={[styles.linkText, { color: textColor }]}>Report a bug</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.row, styles.cardRow, styles.dangerRow]} onPress={handleDeleteAccount} activeOpacity={0.85}>
          <View style={styles.rowBody}>
            <Text style={[styles.rowText, { color: Colors.danger }]}>Delete account</Text>
            <Text style={[styles.rowDesc, { color: Colors.danger }]}>This cannot be undone</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={languageModalVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalHeading, { color: textColor }]}>Choose language</Text>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
              {availableLanguages.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={styles.modalOption}
                  onPress={() => {
                    setLanguage(item.code);
                    setLanguageModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, { color: textColor }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setLanguageModalVisible(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={timeModalVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalHeading, { color: textColor }]}>Choose reminder time</Text>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
              {TIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={styles.modalOption}
                  onPress={() => {
                    setDailyReminderTime(time);
                    setTimeModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, { color: textColor }]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setTimeModalVisible(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 18 },
  cardRow: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowBody: { flex: 1, marginRight: 12 },
  rowText: { fontSize: 15, fontWeight: '600' },
  rowDesc: { fontSize: 13, marginTop: 4, color: Colors.textSoft },
  rowValue: { fontSize: 14, fontWeight: '700' },
  linkRow: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.md,
    padding: 16,
    marginBottom: 12,
    backgroundColor: Colors.card,
  },
  linkText: { fontSize: 15, fontWeight: '600' },
  dangerRow: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    marginTop: 18,
  },
  modalContent: {
    padding: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingTop: 18,
    paddingHorizontal: 18,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.textDark,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  modalOptionText: {
    fontSize: 15,
  },
  modalClose: { marginTop: 12, alignItems: 'center' },
  modalCloseText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
});
