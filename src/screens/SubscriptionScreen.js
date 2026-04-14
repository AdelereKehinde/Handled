import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { paymentsAPI } from '../services/api';
import { Colors, Radius, Shadows } from '../theme';

const PLANS = [
  {
    id: 'pro',
    title: 'Pro',
    price: '$9/mo',
    badge: 'Most popular',
    accent: '#2563eb',
    description: 'Unlimited daily decisions for steady, everyday support.',
    features: ['Unlimited decisions', 'Faster day-to-day guidance', 'Clean decision history'],
  },
  {
    id: 'premium',
    title: 'Premium',
    price: '$19/mo',
    badge: 'Best support',
    accent: '#9f47f1',
    description: 'Deeper decision support for people who use Handled heavily.',
    features: ['Everything in Pro', 'Advanced AI guidance', 'Priority experience'],
  },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function SubscriptionScreen({ navigation }) {
  const { user, reloadUser, plan } = useApp();
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPlanId, setSuccessPlanId] = useState(null);

  const refreshPlanStatus = async (targetPlan, maxAttempts = 15) => {
    let planUpdated = false;
    let previousPlan = plan;
    
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await wait(2000); // Wait 2 seconds between attempts (30 seconds total for 15 attempts)
      await reloadUser();
      
      // Check if the plan has been updated by comparing with the current plan
      // This will be updated through the context after reloadUser
      if (plan !== previousPlan || plan === targetPlan) {
        planUpdated = true;
        break;
      }
    }
    
    return planUpdated;
  };

  const startCheckout = async (selectedPlan) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    setLoadingPlanId(selectedPlan);

    try {
      const res = await paymentsAPI.createCheckout({
        user_id: String(user.id),
        plan: selectedPlan,
        email: user.email,
      });

      if (!res?.checkout_url) {
        Alert.alert('Error', 'Failed to create checkout session. Please try again.');
        setLoadingPlanId(null);
        return;
      }

      await WebBrowser.openBrowserAsync(res.checkout_url);
      
      // Poll for payment status update
      const planUpdated = await refreshPlanStatus(selectedPlan);
      
      setLoadingPlanId(null);
      
      // Show success modal if plan was updated
      if (planUpdated) {
        setSuccessPlanId(selectedPlan);
        setShowSuccessModal(true);
      } else {
        Alert.alert(
          'Payment Processing',
          'Your payment is being processed. Your plan will be updated shortly. Please check back in a moment.',
          [{ text: 'OK', onPress: () => {} }]
        );
      }
    } catch (error) {
      setLoadingPlanId(null);
      Alert.alert('Error', error.message || 'Failed to start checkout. Please try again.');
    }
  };

  const getPlanDetails = (planId) => {
    return PLANS.find(p => p.id === planId);
  };

  return (
    <LinearGradient colors={['#fff8ef', '#f4f4ff']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar title="Plans" onBack={() => navigation.navigate('ProfileHome')} />

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Subscription</Text>
          <Text style={styles.title}>Choose the plan that fits your pace</Text>
          <Text style={styles.sub}>
            Your current plan is <Text style={styles.subStrong}>{plan || 'free'}</Text>. Upgrade once and Handled will sync the new plan automatically after checkout.
          </Text>
        </View>

        {PLANS.map((entry) => {
          const isActive = plan === entry.id;
          const isLoading = loadingPlanId === entry.id;

          return (
            <View
              key={entry.id}
              style={[
                styles.card,
                Shadows.card,
                isActive && styles.cardActive,
                { borderColor: `${entry.accent}55` },
              ]}
            >
              <View style={styles.cardTop}>
                <View>
                  <View style={[styles.badge, { backgroundColor: `${entry.accent}18` }]}>
                    <Text style={[styles.badgeText, { color: entry.accent }]}>{entry.badge}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{entry.title}</Text>
                  <Text style={styles.cardPrice}>{entry.price}</Text>
                </View>
                {isActive ? (
                  <View style={[styles.activePill, { borderColor: entry.accent }]}>
                    <Ionicons name="checkmark-circle" size={16} color={entry.accent} />
                    <Text style={[styles.activeText, { color: entry.accent }]}>Current</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.cardDesc}>{entry.description}</Text>

              <View style={styles.featureList}>
                {entry.features.map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <Ionicons name="checkmark" size={16} color={entry.accent} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.cta,
                  { backgroundColor: entry.accent },
                  (isLoading || isActive) && styles.ctaDisabled,
                ]}
                onPress={() => startCheckout(entry.id)}
                disabled={isLoading || isActive}
                activeOpacity={0.88}
              >
                <Text style={styles.ctaText}>
                  {isActive ? 'Active plan' : isLoading ? 'Opening checkout...' : `Choose ${entry.title}`}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.successModal, Shadows.card]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#10b981" />
            </View>
            
            <Text style={styles.successTitle}>Payment Successful! 🎉</Text>
            <Text style={styles.successSub}>
              Welcome to <Text style={{ fontWeight: '700' }}>{getPlanDetails(successPlanId)?.title} Plan</Text>
            </Text>

            <View style={styles.featuresModal}>
              {getPlanDetails(successPlanId)?.features.map((feature) => (
                <View key={feature} style={styles.featureRowModal}>
                  <Ionicons name="checkmark" size={18} color="#10b981" />
                  <Text style={styles.featureTextModal}>{feature}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.successMessage}>
              Your new features are now active! Enjoy unlimited access to all premium features.
            </Text>

            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('ProfileHome');
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.successBtnText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  hero: {
    marginTop: 10,
    marginBottom: 18,
  },
  eyebrow: {
    color: '#c2410c',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  title: {
    color: Colors.textDark,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: 10,
  },
  sub: {
    color: Colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  subStrong: {
    color: Colors.textDark,
    fontWeight: '700',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 16,
    minHeight: 250,
  },
  cardActive: {
    borderWidth: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: Colors.textDark,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardPrice: {
    color: Colors.textDark,
    fontSize: 28,
    fontWeight: '800',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activeText: {
    fontWeight: '700',
    fontSize: 12,
  },
  cardDesc: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  featureList: {
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: '600',
  },
  cta: {
    marginTop: 'auto',
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.65,
  },
  ctaText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 28,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    color: Colors.textDark,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    color: Colors.textMid,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresModal: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  featureRowModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureTextModal: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  successMessage: {
    color: Colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  successBtn: {
    width: '100%',
    backgroundColor: '#10b981',
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
