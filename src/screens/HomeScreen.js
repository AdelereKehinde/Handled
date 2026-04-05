import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing } from '../theme';
import Orb from '../components/Orb';
import LogoWatermark from '../components/LogoWatermark';
import { PrimaryButton } from '../components/UI';
import { decisionsAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';

const QUICK_SUGGESTIONS = [
  'Should I respond now or wait?',
  'How do I handle this conflict calmly?',
  'Is this the right time to say no?',
];

const DAILY_TOOLS = [
  { title: '60‑second reset', subtitle: 'Quick calm breathing' },
  { title: 'Decision clarity', subtitle: '3 questions to ground you' },
];

export default function HomeScreen({ navigation }) {
  const { user, remainingDecisions, isFree, themeMode, strings } = useApp();
  const [recent, setRecent] = useState([]);
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const res = await decisionsAPI.history(user.id);
        setRecent(res?.data?.slice(0, 3) || []);
      } catch {
        setRecent([]);
      }
    };
    load();
  }, [user?.id]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <LogoWatermark />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar
          title={strings.home || 'Home'}
          onBack={null}
          rightIcon="notifications"
          onRightPress={() => navigation.getParent()?.getParent()?.navigate('Notifications')}
        />
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.username}>{user?.username || 'Friend'}</Text>
            {isFree && (
              <Text style={styles.quota}>Free plan: {remainingDecisions} decisions left today</Text>
            )}
          </View>
          <Ionicons name="sparkles" size={22} color={Colors.primary} />
        </View>

        <View style={styles.orbWrap}>
          <Orb size="large" mode="calm" onPress={() => navigation.navigate('Calm')} />
          <Text style={styles.orbLabel}>Tap to calm your mind</Text>
          <TouchableOpacity
            style={styles.calmPill}
            onPress={() => navigation.navigate('Calm')}
            activeOpacity={0.85}
          >
            <Ionicons name="moon" size={16} color={Colors.white} />
            <Text style={styles.calmText}>{strings.enterCalm || 'Enter Calm Space'}</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="Handle for me"
          onPress={() => navigation.navigate('Decisions', { screen: 'DecisionInput' })}
          style={styles.primaryBtn}
          leftIcon={<Ionicons name="flash" size={18} color={Colors.white} />}
        />

        <Text style={styles.sectionTitle}>{strings.quickSuggestions || 'Quick suggestions'}</Text>
        <View style={styles.quickGrid}>
          {QUICK_SUGGESTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.quickCard, Shadows.card]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Decisions', { screen: 'DecisionInput', params: { preset: item } })}
            >
              <Text style={styles.quickText}>{item}</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Daily tools</Text>
        <View style={styles.quickGrid}>
          {DAILY_TOOLS.map((item) => (
            <View key={item.title} style={[styles.toolCard, Shadows.card]}>
              <Text style={styles.toolTitle}>{item.title}</Text>
              <Text style={styles.toolSub}>{item.subtitle}</Text>
            </View>
          ))}
        </View>

        <View style={styles.row}>
        <Text style={styles.sectionTitle}>{strings.recentDecisions || 'Recent decisions'}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Decisions', { screen: 'DecisionHistory' })}
          >
            <Text style={styles.link}>{strings.viewAll || 'View all'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentWrap}>
          {recent.length === 0 ? (
            <Text style={styles.empty}>No decisions yet. Let’s handle one together.</Text>
          ) : (
            recent.map((d) => (
              <View key={d.id} style={styles.recentCard}>
                <Text style={styles.recentTitle}>{d.input_text}</Text>
                <Text style={styles.recentSub} numberOfLines={2}>
                  {d.ai_response}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingTop: 6,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  greeting: { color: Colors.textSoft, fontSize: 14, fontWeight: '500' },
  username: { color: Colors.textDark, fontSize: 26, fontWeight: '700' },
  quota: { color: Colors.primary, fontSize: 12, marginTop: 4, fontWeight: '600' },
  orbWrap: { alignItems: 'center', marginTop: 10, marginBottom: 24, gap: 10 },
  orbLabel: { color: Colors.textSoft, fontSize: 13, fontWeight: '500' },
  calmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    marginTop: 6,
  },
  calmText: { color: Colors.white, fontWeight: '600', fontSize: 12 },
  primaryBtn: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark, marginBottom: 12 },
  quickGrid: { gap: 12, marginBottom: 20 },
  quickCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickText: { color: Colors.textDark, fontWeight: '600', fontSize: 14, flex: 1, marginRight: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  recentWrap: { marginTop: 12, gap: 10 },
  toolCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
  },
  toolTitle: { color: Colors.textDark, fontWeight: '700', marginBottom: 4 },
  toolSub: { color: Colors.textSoft, fontSize: 12 },
  recentCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
  },
  recentTitle: { color: Colors.textDark, fontWeight: '600', marginBottom: 4 },
  recentSub: { color: Colors.textSoft, fontSize: 12, lineHeight: 18 },
  empty: { color: Colors.textSoft, fontSize: 13 },
});
