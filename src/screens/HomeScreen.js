import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { decisionsAPI } from '../services/api';
import { Colors, Radius, Shadows } from '../theme';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, suffix, sub, iconName, iconBg, iconColor }) => (
  <View style={[styles.statCard, Shadows.card]}>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.statValRow}>
      <Text style={styles.statVal}>{value}</Text>
      {suffix ? <Text style={styles.statSuffix}>{suffix}</Text> : null}
    </View>
    <Text style={styles.statSub}>{sub}</Text>
    <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
      <Feather name={iconName} size={14} color={iconColor} />
    </View>
  </View>
);

// ─── Quick Action Button ──────────────────────────────────────────────────────
const QuickAction = ({ iconName, iconBg, title, sub, onPress }) => (
  <TouchableOpacity style={[styles.quickAction, Shadows.card]} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.quickIcon, { backgroundColor: iconBg }]}>
      <Feather name={iconName} size={17} color={Colors.white} />
    </View>
    <View style={styles.quickCopy}>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSub}>{sub}</Text>
    </View>
    <Feather name="chevron-right" size={16} color={Colors.primary} />
  </TouchableOpacity>
);

// ─── Decision Card ────────────────────────────────────────────────────────────
const DECISION_COLORS = ['#9f47f1', '#10b981', '#f59e0b', '#3b82f6'];

const DecisionCard = ({ item, index, onPress }) => {
  const dotColor = DECISION_COLORS[index % DECISION_COLORS.length];
  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'Recently';

  return (
    <TouchableOpacity style={[styles.decCard, Shadows.card]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.decDot, { backgroundColor: dotColor }]} />
      <View style={styles.decBody}>
        <Text style={styles.decTitle} numberOfLines={1}>{item.input_text}</Text>
        <Text style={styles.decSub} numberOfLines={2}>{item.ai_response}</Text>
        <View style={styles.decMeta}>
          <Feather name="clock" size={10} color={Colors.textLight} />
          <Text style={styles.decMetaText}>{date}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={14} color={Colors.cardBorder} />
    </TouchableOpacity>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyDecisions = ({ onPress }) => (
  <View style={[styles.emptyCard, Shadows.card]}>
    <View style={styles.emptyIcon}>
      <Feather name="inbox" size={22} color={Colors.primary} />
    </View>
    <Text style={styles.emptyTitle}>No decisions yet</Text>
    <Text style={styles.emptySub}>Your AI-guided decisions will appear here once you start.</Text>
    <TouchableOpacity style={styles.emptyBtn} onPress={onPress} activeOpacity={0.85}>
      <Feather name="plus" size={13} color={Colors.primary} />
      <Text style={styles.emptyBtnText}>Make your first decision</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { user, remainingDecisions, isFree, themeMode, strings } = useApp();
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({
    decisionsThisWeek: 0,
    decisionsToday: 0,
  });
  const [calmPoints, setCalmPoints] = useState(0);

  const isDark = themeMode === 'dark';
  const gradient = isDark ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#f0ebff'];

  useEffect(() => {
    // Load calm points
    AsyncStorage.getItem('calm_points').then(points => {
      setCalmPoints(parseInt(points || '0'));
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    decisionsAPI.history(user.id)
      .then(res => {
        const decisions = Array.isArray(res) ? res : [];
        setRecent(decisions.slice(0, 3));
        
        // Calculate stats
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        let decisionsThisWeek = 0;
        let decisionsToday = 0;
        
        decisions.forEach(decision => {
          const decisionDate = new Date(decision.created_at);
          if (!isNaN(decisionDate.getTime())) { // Check if date is valid
            if (decisionDate >= startOfWeek) {
              decisionsThisWeek++;
            }
            if (decisionDate >= startOfDay) {
              decisionsToday++;
            }
          }
        });
        
        // Calculate clarity score based on calm points and decisions
        const clarityScore = Math.min(100, Math.max(0, (calmPoints * 2) + (decisionsThisWeek * 3) + (decisionsToday * 5)));
        
        setStats({
          decisionsThisWeek,
          decisionsToday,
        });
      })
      .catch(() => {
        setRecent([]);
        setStats({ decisionsThisWeek: 0, decisionsToday: 0 });
      });
  }, [user?.id]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const quotaMax = 10; // Match DAILY_QUOTA from AppContext
  const quotaUsed = isFree ? quotaMax - (remainingDecisions ?? 0) : 0;
  const quotaPercent = isFree ? Math.min((quotaUsed / quotaMax) * 100, 100) : 100;

  const goToDecision = () => navigation.navigate('Decisions', { screen: 'DecisionInput' });

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      {/* Top Bar with Hamburger Menu */}
      <TopBar 
        title="Home" 
        navigation={navigation}
        showNotifications={true}
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Greeting + Quota */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingRow}>
            <Text style={[styles.greetingTxt, { color: isDark ? Colors.textSoft : Colors.textSoft }]}>
              {greeting}
            </Text>
            <View style={styles.mindfulBadge}>
              <Text style={styles.mindfulBadgeText}>Mindful today</Text>
            </View>
          </View>
          <Text style={[styles.username, { color: isDark ? Colors.white : Colors.textDark }]}>
            {user?.username || 'Friend'}
          </Text>
          {isFree && (
            <View style={styles.quotaRow}>
              <View style={styles.quotaBarBg}>
                <View style={[styles.quotaBarFill, { width: `${quotaPercent}%` }]} />
              </View>
              <Text style={styles.quotaTxt}>{remainingDecisions} of {quotaMax} left today</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statRow}>
          <StatCard
            label="This week"
            value={stats.decisionsThisWeek.toString()}
            sub="Decisions made"
            iconName="activity"
            iconBg={Colors.whiteAlpha10}
            iconColor={Colors.primary}
          />
          <StatCard
            label="Today"
            value={stats.decisionsToday.toString()}
            sub="Decisions made"
            iconName="calendar"
            iconBg="#fef3c7"
            iconColor="#d97706"
          />
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroOrb1} />
          <View style={styles.heroOrb2} />
          <Text style={styles.heroLabel}>Featured</Text>
          <Text style={styles.heroTitle}>Calm guidance{'\n'}for your day</Text>
          <Text style={styles.heroSub}>
            Make thoughtful choices with a clear, gentle process. Enter your calm space.
          </Text>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => navigation.navigate('Calm')}
            activeOpacity={0.9}
          >
            <Feather name="play" size={13} color={Colors.primary} />
            <Text style={styles.heroBtnText}>{strings.enterCalm || 'Enter calm space'}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <QuickAction
          iconName="zap"
          iconBg={Colors.primary}
          title="Get calm guidance"
          sub="Start a new AI-powered decision"
          onPress={goToDecision}
        />

        {/* Recent Decisions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.white : Colors.textDark }]}>
            Recent decisions
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Decisions', { screen: 'DecisionHistory' })} activeOpacity={0.7}>
            <Text style={styles.sectionLink}>View all →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.decisionList}>
          {recent.length === 0 ? (
            <EmptyDecisions onPress={goToDecision} />
          ) : (
            recent.map((item, i) => (
              <DecisionCard
                key={String(item.id)}
                item={item}
                index={i}
                onPress={() =>
                  navigation.navigate('Decisions', {
                    screen: 'DecisionOutput',
                    params: { decisionId: item.id, response: item.ai_response, original: item.input_text },
                  })
                }
              />
            ))
          )}
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Top Bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, gap: 12,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  topBarCenter: { flex: 1, alignItems: 'center' },
  appName: { fontSize: 14, fontWeight: '600' },
  appStatus: { fontSize: 10.5, color: Colors.success, fontWeight: '500', marginTop: 1 },
  notifBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.card, borderWidth: 0.5, borderColor: Colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary,
    position: 'absolute', top: 8, right: 8,
    borderWidth: 1.5, borderColor: Colors.surface,
  },

  // Content
  content: { paddingHorizontal: 18, paddingBottom: 120, gap: 18 },

  // Greeting
  greetingSection: { gap: 5 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greetingTxt: { fontSize: 13, fontWeight: '500' },
  mindfulBadge: {
    backgroundColor: Colors.whiteAlpha10,
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 0.5, borderColor: Colors.cardBorder,
  },
  mindfulBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  username: { fontSize: 27, fontWeight: '700', lineHeight: 34 },
  quotaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  quotaBarBg: {
    height: 5, borderRadius: 99, backgroundColor: Colors.cardBorder, width: 120,
  },
  quotaBarFill: { height: 5, borderRadius: 99, backgroundColor: Colors.primary },
  quotaTxt: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  // Stats
  statRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: Colors.card,
    borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.cardBorder,
    padding: 14,
  },
  statLabel: {
    fontSize: 10.5, color: Colors.textLight, fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4,
  },
  statValRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  statVal: { fontSize: 26, fontWeight: '700', color: Colors.textDark },
  statSuffix: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  statSub: { fontSize: 11.5, color: Colors.textSoft, marginTop: 2 },
  statIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-end', marginTop: 8,
  },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl, padding: 22,
    overflow: 'hidden', gap: 8,
  },
  heroOrb1: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -35, right: -35,
  },
  heroOrb2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: 60,
  },
  heroLabel: {
    fontSize: 10.5, fontWeight: '700', color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  heroTitle: { fontSize: 22, fontWeight: '700', color: Colors.white, lineHeight: 30 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 19 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: Colors.white, borderRadius: Radius.full,
    paddingHorizontal: 18, paddingVertical: 11, alignSelf: 'flex-start', marginTop: 4,
  },
  heroBtnText: { fontSize: 13.5, fontWeight: '700', color: Colors.primary },

  // Quick Action
  quickAction: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.cardBorder, padding: 15,
  },
  quickIcon: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  quickCopy: { flex: 1 },
  quickTitle: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  quickSub: { fontSize: 12, color: Colors.textSoft, marginTop: 2 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionLink: { fontSize: 12.5, color: Colors.primary, fontWeight: '600' },

  // Decision Cards
  decisionList: { gap: 10 },
  decCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.cardBorder, padding: 14,
  },
  decDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  decBody: { flex: 1 },
  decTitle: { fontSize: 13.5, fontWeight: '600', color: Colors.textDark, marginBottom: 3 },
  decSub: { fontSize: 12, color: Colors.textSoft, lineHeight: 17 },
  decMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  decMetaText: { fontSize: 11, color: Colors.textLight },

  // Empty State
  emptyCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.cardBorder,
    padding: 28, alignItems: 'center', gap: 8,
  },
  emptyIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.whiteAlpha10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  emptySub: { fontSize: 13, color: Colors.textSoft, textAlign: 'center', lineHeight: 18 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, borderWidth: 1, borderColor: Colors.primary,
    borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 9,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
});