import { LinearGradient } from 'expo-linear-gradient';
import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme';

// ─── tiny helpers ────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 88 }) => {
  const initials = (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[avatarStyles.ring, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
      <LinearGradient
        colors={['#a78bfa', '#6d28d9']}
        style={[avatarStyles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[avatarStyles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
      </LinearGradient>
    </View>
  );
};

const avatarStyles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: '#7c3aed44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
});

// ─── InfoRow ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon, dark }) => (
  <View style={[rowStyles.card, dark && rowStyles.cardDark]}>
    <View style={rowStyles.iconBox}>
      <Text style={rowStyles.icon}>{icon}</Text>
    </View>
    <View style={rowStyles.text}>
      <Text style={[rowStyles.label, dark && rowStyles.labelDark]}>{label}</Text>
      <Text style={[rowStyles.value, dark && rowStyles.valueDark]} numberOfLines={3}>
        {value || '—'}
      </Text>
    </View>
  </View>
);

const rowStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffffcc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  cardDark: {
    backgroundColor: '#1e1b4b99',
    borderColor: '#4c1d9533',
    shadowOpacity: 0.2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  icon: { fontSize: 18 },
  text: { flex: 1 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#7c3aed',
    marginBottom: 3,
  },
  labelDark: { color: '#a78bfa' },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e1b4b',
    lineHeight: 21,
  },
  valueDark: { color: '#e0d9ff' },
});

// ─── StatPill ─────────────────────────────────────────────────────────────────
const StatPill = ({ label, value, dark }) => (
  <View style={[pillStyles.pill, dark && pillStyles.pillDark]}>
    <Text style={[pillStyles.val, dark && pillStyles.valDark]}>{value}</Text>
    <Text style={[pillStyles.lbl, dark && pillStyles.lblDark]}>{label}</Text>
  </View>
);

const pillStyles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#ffffffcc',
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ede9fe',
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  pillDark: {
    backgroundColor: '#1e1b4b99',
    borderColor: '#4c1d9533',
  },
  val: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6d28d9',
    letterSpacing: -0.5,
  },
  valDark: { color: '#a78bfa' },
  lbl: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  lblDark: { color: '#94a3b8' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { user, themeMode } = useApp();
  const dark = themeMode === 'dark';
  const gradient = dark ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];

  // Example stats — replace with real data from your context / API
  const stats = [
    { label: 'Recipes', value: user?.recipeCount ?? 0 },
    { label: 'Saved', value: user?.savedCount ?? 0 },
    { label: 'Reviews', value: user?.reviewCount ?? 0 },
  ];

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title="Profile" onBack={() => navigation.goBack()} />

        {/* ── Hero card ── */}
        <View style={[styles.heroCard, dark && styles.heroCardDark]}>
          {/* Decorative accent blob */}
          <LinearGradient
            colors={['#a78bfa33', '#6d28d900']}
            style={styles.blob}
          />

          <Avatar name={user?.username} size={88} />

          <Text style={[styles.name, dark && styles.nameDark]}>
            {user?.username || 'Your Name'}
          </Text>
          <Text style={[styles.emailBadge, dark && styles.emailBadgeDark]}>
            {user?.email || 'email@example.com'}
          </Text>

          {/* Edit button */}
          <TouchableOpacity
            style={[styles.editBtn, dark && styles.editBtnDark]}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>✏️  Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <StatPill key={s.label} dark={dark} {...s} />
          ))}
        </View>

        {/* ── Divider label ── */}
        <Text style={[styles.sectionLabel, dark && styles.sectionLabelDark]}>
          About
        </Text>

        {/* ── Info rows ── */}
        <InfoRow
          dark={dark}
          icon="👤"
          label="Username"
          value={user?.username}
        />
        <InfoRow
          dark={dark}
          icon="✉️"
          label="Email address"
          value={user?.email}
        />
        <InfoRow
          dark={dark}
          icon="📝"
          label="About you"
          value={user?.description}
        />
        <InfoRow
          dark={dark}
          icon="🌿"
          label="Allergies"
          value={user?.allergic}
        />
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },

  /* Hero card */
  heroCard: {
    backgroundColor: '#ffffffd0',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ede9fe',
    shadowColor: '#6d28d9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
    position: 'relative',
  },
  heroCardDark: {
    backgroundColor: '#1e1b4bcc',
    borderColor: '#4c1d9544',
  },

  /* Decorative gradient blob */
  blob: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
  },

  name: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: '800',
    color: '#1e1b4b',
    letterSpacing: -0.3,
  },
  nameDark: { color: '#f1eeff' },

  emailBadge: {
    marginTop: 5,
    fontSize: 13,
    color: '#6d28d9',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  emailBadgeDark: { color: '#a78bfa' },

  /* Edit button */
  editBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 50,
    backgroundColor: '#ede9fe',
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  editBtnDark: {
    backgroundColor: '#2e1065',
    borderColor: '#5b21b6',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5b21b6',
    letterSpacing: 0.2,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    marginHorizontal: -4,
  },

  /* Section label */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#7c3aed',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionLabelDark: { color: '#a78bfa' },
});