import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';

export default function SecurityScreen({ navigation }) {
  const { themeMode } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Security" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>Security</Text>
        <Text style={styles.body}>
          We protect your data with authentication and encrypted transport (HTTPS). Sensitive actions
          like password changes require your current password. You can delete your account anytime.
        </Text>
        <Text style={styles.body}>
          Tips: use a strong password, avoid sharing your token, and log out on shared devices.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
  body: { color: Colors.textSoft, lineHeight: 22, marginBottom: 12 },
});
