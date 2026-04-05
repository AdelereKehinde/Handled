import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius } from '../theme';
import { authAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const { themeMode, setThemeMode, language, setLanguage, strings } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];

  const handleLogout = async () => {
    await authAPI.logout();
    navigation.replace('AuthEntry');
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <View style={styles.content}>
        <TopBar title={strings.settings || 'Settings'} onBack={() => navigation.goBack()} />
        <Text style={styles.title}>Settings</Text>

        <View style={styles.row}>
          <Text style={styles.rowText}>Dark mode</Text>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
            trackColor={{ true: Colors.primary, false: Colors.cardBorder }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Language</Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, language === 'en' && styles.langActive]}
              onPress={() => setLanguage('en')}
            >
              <Text style={styles.langText}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, language === 'yo' && styles.langActive]}
              onPress={() => setLanguage('yo')}
            >
              <Text style={styles.langText}>YO</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: Colors.primary, false: Colors.cardBorder }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Haptics</Text>
          <Switch
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ true: Colors.primary, false: Colors.cardBorder }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Daily reminder</Text>
          <Switch
            value={dailyReminder}
            onValueChange={setDailyReminder}
            trackColor={{ true: Colors.primary, false: Colors.cardBorder }}
            thumbColor={Colors.white}
          />
        </View>

        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.rowText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Security')}>
          <Text style={styles.rowText}>Security</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('FAQ')}>
          <Text style={styles.rowText}>FAQs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.rowText}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ReportBug')}>
          <Text style={styles.rowText}>Report a bug</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.row, styles.logout]} onPress={handleLogout}>
          <Text style={[styles.rowText, { color: Colors.danger }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 16 },
  row: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowText: { color: Colors.textDark, fontWeight: '600' },
  logout: { marginTop: 12 },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  langActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(159,71,241,0.12)',
  },
  langText: { color: Colors.textDark, fontWeight: '600', fontSize: 12 },
});
