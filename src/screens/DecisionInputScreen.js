import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing } from '../theme';
import { InputField, PrimaryButton } from '../components/UI';
import { decisionsAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import LogoWatermark from '../components/LogoWatermark';
import TopBar from '../components/TopBar';

export default function DecisionInputScreen({ navigation, route }) {
  const preset = route?.params?.preset;
  const [input, setInput] = useState(preset || '');
  const [clarity, setClarity] = useState(0.5);
  const [urgency, setUrgency] = useState(0.5);
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
      const contextNote = `\n\nContext: clarity ${Math.round(clarity * 10)}/10, urgency ${Math.round(
        urgency * 10
      )}/10.`;
      const res = await decisionsAPI.make({
        user_input: `${input.trim()}${contextNote}`,
        user_id: String(user?.id || ''),
        tokens_used: 1,
      });
      await incrementDecisionUsage();
      navigation.navigate('DecisionOutput', {
        decisionId: res?.data?.decision_id,
        response: res?.data?.response,
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
      <LogoWatermark />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar title={strings.newDecision || 'New decision'} onBack={() => navigation.goBack()} />
        <Text style={styles.title}>What decision do you need help with?</Text>
        <Text style={styles.sub}>Describe the situation, and we’ll guide you.</Text>

        <InputField
          label="Your input"
          value={input}
          onChangeText={setInput}
          placeholder="Type your decision..."
          multiline
        />

        <View style={styles.sliderBlock}>
          <Text style={styles.sliderLabel}>Clarity needed</Text>
          <Slider
            value={clarity}
            onValueChange={setClarity}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor={Colors.primary}
            maximumTrackTintColor={Colors.whiteAlpha30}
            thumbTintColor={Colors.primary}
          />
        </View>
        <View style={styles.sliderBlock}>
          <Text style={styles.sliderLabel}>Urgency</Text>
          <Slider
            value={urgency}
            onValueChange={setUrgency}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor={Colors.glow}
            maximumTrackTintColor={Colors.whiteAlpha30}
            thumbTintColor={Colors.glow}
          />
        </View>

        {isFree && remainingDecisions <= 2 && (
          <Text style={styles.warn}>
            You are close to your free limit ({remainingDecisions} left today).
          </Text>
        )}

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
              You’ve reached your daily free limit. Upgrade to continue making decisions.
            </Text>
            <PrimaryButton
              title="See plans"
              onPress={() => {
                setShowUpgrade(false);
                navigation.navigate('Profile', { screen: 'Subscription' });
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
