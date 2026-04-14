import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadows } from '../theme';

// ─── Single detail row ────────────────────────────────────────────────────────
const DetailCard = ({ iconLib, iconName, label, value, dark, isLast }) => {
  const IconComponent = iconLib === 'material' ? MaterialCommunityIcons : Feather;

  return (
    <View style={[card.wrap, dark && card.wrapDark, isLast && { marginBottom: 0 }]}>
      {/* left accent bar */}
      <LinearGradient
        colors={dark ? [Colors.primaryLight, Colors.primary] : [Colors.primary, Colors.primaryLight]}
        style={card.bar}
      />

      {/* icon */}
      <View style={[card.iconBox, dark && card.iconBoxDark]}>
        <IconComponent
          name={iconName}
          size={20}
          color={dark ? Colors.primaryLight : Colors.primary}
        />
      </View>

      {/* text */}
      <View style={card.body}>
        <Text style={[card.label, dark && card.labelDark]}>{label}</Text>
        <Text style={[card.value, dark && card.valueDark]} numberOfLines={4}>
          {value || 'Not set'}
        </Text>
      </View>
    </View>
  );
};

const card = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginBottom: 14,
    overflow: 'hidden',
    ...Shadows.card,
    minHeight: 76,
  },
  wrapDark: {
    backgroundColor: '#1a142e',
    borderColor: `${Colors.primary}33`,
    borderWidth: 1,
  },
  bar: {
    width: 4,
    alignSelf: 'stretch',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.whiteAlpha10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 14,
    flexShrink: 0,
  },
  iconBoxDark: {
    backgroundColor: `${Colors.primary}22`,
  },
  body: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.primary,
    marginBottom: 4,
  },
  labelDark: { color: Colors.primaryLight },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textDark,
    lineHeight: 22,
  },
  valueDark: { color: '#e0c7ff' },
});

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={av.outerRing}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={av.circle}>
        <Text style={av.initials}>{initials}</Text>
      </LinearGradient>
    </View>
  );
};

const av = StyleSheet.create({
  outerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: `${Colors.primary}33`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    alignSelf: 'center',
  },
  circle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { user, themeMode } = useApp();
  const dark = themeMode === 'dark';
  const textColor = dark ? Colors.white : Colors.textDark;
  const gradient = dark ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title="Profile details" onBack={() => navigation.goBack()} tintColor={textColor} />

        {/* ── Detail cards ── */}
        <DetailCard
          dark={dark}
          iconLib="feather"
          iconName="user"
          label="Username"
          value={user?.username}
        />
        <DetailCard
          dark={dark}
          iconLib="feather"
          iconName="mail"
          label="Email Address"
          value={user?.email}
        />
        <DetailCard
          dark={dark}
          iconLib="feather"
          iconName="file-text"
          label="About You"
          value={user?.description}
        />
        <DetailCard
          dark={dark}
          iconLib="material"
          iconName="leaf-circle-outline"
          label="Allergies"
          value={user?.allergic}
          isLast
        />
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
});