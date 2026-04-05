import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius } from '../theme';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';

const FAQS = [
  {
    q: 'How does Handled make decisions?',
    a: 'We summarize your situation and generate a calm, balanced response using AI.',
  },
  {
    q: 'Are my decisions private?',
    a: 'Your data is protected with authentication and secure transport.',
  },
  {
    q: 'What happens when I reach my free limit?',
    a: 'You can upgrade to Pro or Premium to continue with unlimited decisions.',
  },
];

export default function FaqScreen({ navigation }) {
  const { themeMode } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title="FAQs" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>FAQs</Text>
        {FAQS.map((item) => (
          <View key={item.q} style={styles.card}>
            <Text style={styles.q}>{item.q}</Text>
            <Text style={styles.a}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  q: { color: Colors.textDark, fontWeight: '700', marginBottom: 6 },
  a: { color: Colors.textSoft, lineHeight: 20 },
});
