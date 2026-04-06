import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { InputField, PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { decisionsAPI } from '../services/api';
import { Colors, Radius } from '../theme';

export default function DecisionInputScreen({ navigation, route }) {
  const preset = route?.params?.preset;
  const [input, setInput] = useState(preset || '');
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { user, remainingDecisions, isFree, incrementDecisionUsage, themeMode, strings } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];

  const canSubmit = useMemo(() => input.trim().length > 3, [input]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (!user?.id) {
      navigation.replace('AuthEntry');
      return;
    }

    if (isFree && remainingDecisions <= 0) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);

    try {
      const res = await decisionsAPI.make({
        user_input: input.trim(),
        user_id: String(user.id),
        tokens_used: 1,
      });

      await incrementDecisionUsage();

      navigation.navigate('DecisionOutput', {
        decisionId: res?.decision_id,
        response: res?.response,
        original: input.trim(),
      });
    } catch (err) {
      navigation.navigate('DecisionOutput', {
        decisionId: null,
        response: err.message || 'Something went wrong',
        original: input.trim(),
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar title={strings.newDecision || 'New decision'} onBack={() => navigation.goBack()} />
        <Text style={styles.title}>What decision do you need help with?</Text>
        <Text style={styles.sub}>Describe the situation, and we&apos;ll guide you.</Text>

        <InputField
          label="Your input"
          value={input}
          onChangeText={setInput}
          placeholder="Type your question or situation..."
          multiline
        />

        {isFree && remainingDecisions <= 2 ? (
          <Text style={styles.warn}>
            You are close to your free limit ({remainingDecisions} left today).
          </Text>
        ) : null}

        <PrimaryButton
          title={strings.submitDecision || 'Submit decision'}
          onPress={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
        />
      </ScrollView>

      <Modal transparent visible={showUpgrade} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Upgrade to Pro</Text>
            <Text style={styles.modalText}>
              You&apos;ve reached your daily free limit. Upgrade to continue making decisions.
            </Text>
            <PrimaryButton
              title="See plans"
              onPress={() => {
                setShowUpgrade(false);
                navigation.getParent()?.navigate('Profile', { screen: 'Subscription' });
              }}
            />
            <TouchableOpacity onPress={() => setShowUpgrade(false)}>
              <Text style={styles.modalLink}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 120,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textDark, marginBottom: 6 },
  sub: { color: Colors.textSoft, marginBottom: 18 },
  sliderBlock: { marginBottom: 18 },
  sliderLabel: { color: Colors.textSoft, marginBottom: 6, fontWeight: '600' },
  levelRow: { flexDirection: 'row', gap: 8 },
  levelDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  levelActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(159,71,241,0.12)',
  },
  levelText: { color: Colors.textDark, fontWeight: '700', fontSize: 12 },
  warn: { color: Colors.danger, marginBottom: 12, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 20,
    width: '100%',
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  modalText: { color: Colors.textSoft, lineHeight: 20 },
  modalLink: { color: Colors.primary, fontWeight: '600', textAlign: 'center', marginTop: 4 },
});
