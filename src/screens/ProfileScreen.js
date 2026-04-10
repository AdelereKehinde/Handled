import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { Colors, Radius, Shadows } from '../theme';

export default function ProfileScreen({ navigation }) {
  const { user, reloadUser, plan, remainingDecisions, isFree, themeMode, strings } = useApp();
  const [loading, setLoading] = useState(false);
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];

  useEffect(() => {
    reloadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => {
          await authAPI.logout();
          navigation.replace('AuthEntry');
        }},
      ]
    );
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar title={strings.profile || 'Profile'} onBack={() => navigation.goBack()} />
        <View style={styles.card}>
          <Text style={styles.name}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.plan}>Plan: {plan || 'free'}</Text>
          {isFree && <Text style={styles.quota}>Remaining today: {remainingDecisions}</Text>}
        </View>

        <PrimaryButton
          title="Upgrade plan"
          onPress={() => navigation.navigate('Subscription')}
          style={styles.primaryBtn}
        />

        <View style={styles.list}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.rowText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.rowText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.rowText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <Text style={[styles.rowText, { color: Colors.danger }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 20,
    ...Shadows.card,
  },
  name: { color: Colors.textDark, fontSize: 22, fontWeight: '700' },
  email: { color: Colors.textSoft, marginTop: 6 },
  plan: { color: Colors.primary, marginTop: 10, fontWeight: '600' },
  quota: { color: Colors.textSoft, marginTop: 6, fontSize: 12 },
  primaryBtn: { marginBottom: 20 },
  list: { gap: 10 },
  row: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  rowText: { color: Colors.textDark, fontWeight: '600' },
});
