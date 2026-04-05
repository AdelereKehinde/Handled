import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Radius, Shadows } from '../theme';
import { paymentsAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import TopBar from '../components/TopBar';

const PLANS = [
  { id: 'free', title: 'Free', price: '$0', desc: '10 decisions/day' },
  { id: 'pro', title: 'Pro', price: '$9/mo', desc: 'Unlimited decisions' },
  { id: 'premium', title: 'Premium', price: '$19/mo', desc: 'Advanced AI guidance' },
];

export default function SubscriptionScreen({ navigation }) {
  const { user, reloadUser } = useApp();
  const [loading, setLoading] = useState(false);

  const startCheckout = async (plan) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await paymentsAPI.createCheckout({
        user_id: String(user.id),
        plan,
        email: user.email,
      });
      if (res?.checkout_url) {
        await WebBrowser.openBrowserAsync(res.checkout_url);
        await reloadUser();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#f7f3ff', '#eef2ff']} style={styles.container}>
      <TopBar title="Plans" onBack={() => navigation.goBack()} />
      <Text style={styles.title}>Choose your plan</Text>
      <Text style={styles.sub}>Upgrade anytime for more calm decisions.</Text>

      {PLANS.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={[styles.card, Shadows.card]}
          onPress={() => startCheckout(plan.id)}
          disabled={loading}
        >
          <View>
            <Text style={styles.cardTitle}>{plan.title}</Text>
            <Text style={styles.cardDesc}>{plan.desc}</Text>
          </View>
          <Text style={styles.price}>{plan.price}</Text>
        </TouchableOpacity>
      ))}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textDark, marginBottom: 6 },
  sub: { color: Colors.textSoft, marginBottom: 18 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { color: Colors.textDark, fontWeight: '700', fontSize: 16 },
  cardDesc: { color: Colors.textSoft, fontSize: 12, marginTop: 4 },
  price: { color: Colors.primary, fontWeight: '700' },
});
