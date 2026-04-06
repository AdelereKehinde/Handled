import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { decisionsAPI } from '../services/api';
import { Colors, Radius, Shadows, Spacing } from '../theme';

const QUICK_SUGGESTIONS = [
  'Should I respond now or wait?',
  'How can I stay calm while I decide?',
  'What feels most aligned with my values?',
];

const SUPPORT_CARDS = [
  { title: 'Guided pause', subtitle: 'Take a quiet moment to breathe.' },
  { title: 'Mindful focus', subtitle: 'Break your day into gentle steps.' },
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
        setRecent(Array.isArray(res) ? res.slice(0, 3) : []);
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar
          title=""
          onBack={null}
          rightIcon="notifications"
          tintColor={themeMode === 'dark' ? Colors.white : Colors.textDark}
          onRightPress={() => {
            navigation.getParent()?.navigate('Notifications') || navigation.navigate('Notifications');
          }}
        />

        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>{greeting}</Text>
              <View style={styles.greetingBadge}>
                <Text style={styles.greetingBadgeText}>Mindful today</Text>
              </View>
            </View>
            <Text style={styles.username}>{user?.username || 'Friend'}</Text>
            {isFree ? (
              <Text style={styles.quota}>Decision quota: {remainingDecisions} left today</Text>
            ) : null}
          </View>
        </View>

        <View style={[styles.heroCard, Shadows.card]}>
          <Text style={styles.heroTitle}>Calm guidance for your day</Text>
          <Text style={styles.heroSub}>Make thoughtful choices with a clear, gentle process.</Text>
          <PrimaryButton
            title={strings.enterCalm || 'Enter Calm Space'}
            onPress={() => navigation.navigate('Calm')}
            style={styles.heroButton}
          />
        </View>

        <PrimaryButton
          title="Get calm guidance"
          onPress={() => navigation.navigate('Decisions', { screen: 'DecisionInput' })}
          style={styles.primaryBtn}
          leftIcon={<Ionicons name="flash" size={18} color={Colors.white} />}
        />

        <View style={[styles.infoCard, Shadows.card]}>
          <Text style={styles.infoTitle}>How handled helps</Text>
          <Text style={styles.infoText}>
            Handled supports your thinking with calm suggestions and useful steps. It does not decide for you.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{strings.quickSuggestions || 'Quick suggestions'}</Text>
        <View style={styles.quickGrid}>
          {QUICK_SUGGESTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.quickCard, Shadows.card]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('Decisions', {
                  screen: 'DecisionInput',
                  params: { preset: item },
                })
              }
            >
              <Text style={styles.quickText}>{item}</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Calm practices</Text>
        <View style={styles.quickGrid}>
          {SUPPORT_CARDS.map((item) => (
            <View key={item.title} style={[styles.toolCard, Shadows.card]}>
              <Text style={styles.toolTitle}>{item.title}</Text>
              <Text style={styles.toolSub}>{item.subtitle}</Text>
            </View>
          ))}
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
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  greeting: { color: Colors.textSoft, fontSize: 14, fontWeight: '500' },
  greetingBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  greetingBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
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
  heroCard: {
    borderRadius: Radius.xl,
    padding: 22,
    marginBottom: 22,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  heroSub: {
    color: Colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroButton: {
    marginTop: 4,
    borderRadius: Radius.full,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: { color: Colors.textDark, fontWeight: '700', marginBottom: 6 },
  infoText: { color: Colors.textMid, fontSize: 13, lineHeight: 20 },
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
