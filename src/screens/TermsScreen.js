import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';

export default function TermsScreen({ navigation }) {
  const { themeMode } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="Terms of Service" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.body}>
          By using Handled, you agree to receive AI-assisted guidance intended to help with
          everyday decisions and emotional regulation. Handled does not provide medical, legal, or
          financial advice. If you are in crisis or need immediate help, contact local emergency
          services or a licensed professional.
        </Text>
        <Text style={styles.body}>
          You are responsible for how you use the app. We may update features to improve accuracy,
          personalization, and safety. We never sell your personal data and only use it to operate
          and improve the service.
        </Text>
        <Text style={styles.section}>Privacy & Security</Text>
        <Text style={styles.body}>
          Your account data is protected with authentication and encryption in transit. We store
          only what is necessary to provide the service. You can delete your account at any time in
          Settings.
        </Text>
        <Text style={styles.section}>Contact</Text>
        <Text style={styles.body}>Developer: Handled Labs</Text>
        <Text style={styles.body}>Phone: +2348142436225</Text>
        <Text style={styles.body}>Email: adelerekehinde01@gmail.com</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
  body: { color: Colors.textSoft, lineHeight: 22 },
});
