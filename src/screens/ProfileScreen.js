import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { Colors, Radius, Shadows } from '../theme';

const MenuItem = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={[styles.row, danger && styles.rowDanger]} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
      <Feather name={icon} size={16} color={danger ? Colors.danger : Colors.primary} />
    </View>
    <Text style={[styles.rowText, danger && { color: Colors.danger }]}>{label}</Text>
    <Feather name="chevron-right" size={16} color={danger ? '#fca5a5' : Colors.textSoft} />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, reloadUser, plan, remainingDecisions, isFree, themeMode, strings } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;
  const initials = (user?.username || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => { reloadUser(); }, [reloadUser]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await authAPI.logout();
        navigation.replace('AuthEntry');
      }},
    ]);
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <TopBar title={strings.profile || 'Profile'} onBack={() => navigation.goBack()} tintColor={textColor} />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.name, { color: textColor }]}>{user?.username || 'User'}</Text>
          <Text style={[styles.email, { color: isDark ? Colors.textSoft : Colors.textMid }]}>{user?.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Plan</Text>
            <Text style={styles.statValue}>{plan || 'Free'}</Text>
          </View>
          {isFree && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Remaining today</Text>
              <Text style={styles.statValue}>{remainingDecisions}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Subscription')} activeOpacity={0.85}>
          <LinearGradient colors={['#9f47f1', '#7c3aed']} style={styles.upgradeBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Feather name="zap" size={16} color="#fff" />
            <Text style={styles.upgradeBtnText}>Upgrade plan</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.list}>
          <MenuItem icon="user" label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
          <MenuItem icon="lock" label="Change password" onPress={() => navigation.navigate('ChangePassword')} />
          <MenuItem icon="settings" label="Settings" onPress={() => navigation.navigate('Settings')} />
          <MenuItem icon="log-out" label="Logout" onPress={handleLogout} danger />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  body: { flex: 1 },
  bodyContent: { padding: 24, paddingTop: 20, paddingBottom: 120 },

  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Shadows.glow,
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  email: { fontSize: 14 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadows.card,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.textDark },

  upgradeBtn: { borderRadius: Radius.lg, overflow: 'hidden', marginBottom: 32 },
  upgradeBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 },
  upgradeBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },

  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadows.card,
  },
  rowDanger: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: { backgroundColor: '#fee2e2' },
  rowText: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textDark },
});