import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { GhostButton, PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { decisionsAPI } from '../services/api';
import { Colors, Radius, Shadows } from '../theme';
import { addLocalDecision } from '../utils/localDecisions';
import { buildOfflineDecisionReply } from '../utils/offlineDecisionEngine';

const CHAT_STORAGE_PREFIX = 'decisionChatSession';

const VoiceWave = ({ active }) => {
  const bars = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0.35))).current;

  useEffect(() => {
    if (!active) {
      bars.forEach((bar) => bar.setValue(0.35));
      return;
    }

    const animations = bars.map((bar, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 1,
            duration: 220 + index * 60,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: 0.3,
            duration: 220 + index * 60,
            useNativeDriver: false,
          }),
        ])
      )
    );

    const group = Animated.stagger(70, animations);
    group.start();

    return () => {
      group.stop();
      bars.forEach((bar) => bar.stopAnimation());
    };
  }, [active, bars]);

  return (
    <View style={styles.waveRow}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              height: bar.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 32],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function DecisionInputScreen({ navigation, route }) {
  const preset = route?.params?.preset;
  const { user, isFree, remainingDecisions, incrementDecisionUsage, themeMode, strings, hapticsEnabled } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;
  const secondaryColor = isDark ? Colors.textSoft : Colors.textMid;
  const chatKey = `${CHAT_STORAGE_PREFIX}_${user?.id || 'guest'}`;

  const [input, setInput] = useState(preset || '');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const recordTimer = useRef(null);

  const canSubmit = useMemo(() => input.trim().length > 1, [input]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
    });

    NetInfo.fetch().then((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadChat = async () => {
      try {
        const saved = await AsyncStorage.getItem(chatKey);
        if (saved) {
          setMessages(JSON.parse(saved));
        }
      } catch {}
    };

    loadChat();
  }, [chatKey]);

  useEffect(() => {
    AsyncStorage.setItem(chatKey, JSON.stringify(messages)).catch(() => {});
  }, [chatKey, messages]);

  useEffect(() => {
    if (preset) {
      setInput(preset);
    }
  }, [preset]);

  useEffect(() => () => {
    if (recordTimer.current) clearInterval(recordTimer.current);
  }, []);

  const createMessage = (role, text, meta = {}) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role,
    text,
    ...meta,
  });

  const sendVoiceMessage = async (durationSeconds) => {
    if (durationSeconds <= 0) return;

    if (Platform.OS === 'ios' && Alert.prompt) {
      Alert.prompt(
        'Voice Input',
        'Describe your decision request in text so we can send it.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit',
            onPress: (voiceText) => {
              if (voiceText && voiceText.trim()) {
                Speech.speak('Voice message sent');
                handleSubmit('voice', voiceText.trim());
              }
            },
          },
        ],
        'plain-text'
      );
      return;
    }

    Alert.alert(
      'Voice input',
      'Text voice request manually in the input box and press send. Voice recognition is not available in this build.',
      [{ text: 'OK' }]
    );
  };

  const startRecording = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Speech.speak('Starting voice recording');
    setIsRecording(true);
    setVoiceSeconds(0);
    recordTimer.current = setInterval(() => {
      setVoiceSeconds((current) => current + 1);
    }, 1000);
  };

  const cancelRecording = () => {
    if (recordTimer.current) clearInterval(recordTimer.current);
    setIsRecording(false);
    setVoiceSeconds(0);
  };

  const stopRecording = () => {
    if (recordTimer.current) clearInterval(recordTimer.current);
    setIsRecording(false);
    const duration = voiceSeconds;
    setVoiceSeconds(0);
    sendVoiceMessage(duration);
  };

  const clearConversation = async () => {
    setMessages([]);
    await AsyncStorage.removeItem(chatKey);
  };

  const handleSubmit = async (submissionMode = 'text', overrideInput) => {
    const normalizedInput = (overrideInput ?? input).trim();
    if (!normalizedInput) return;

    if (!user?.id) {
      navigation.replace('AuthEntry');
      return;
    }

    if (!isOffline && isFree && remainingDecisions <= 0) {
      setShowUpgrade(true);
      return;
    }

    try {
      if (isOffline) {
        setMessages((prev) => [
          ...prev,
          createMessage(
            'assistant',
            'App is offline. Reconnect to send a decision request. While waiting, you can keep using Calm, Focus, Mood, Daily Guidance, and Micro Tasks.'
          ),
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        createMessage('user', normalizedInput, { mode: submissionMode }),
      ]);
      if (submissionMode === 'text') {
        setInput('');
      }
      Speech.speak('Sending decision');
      setLoading(true);

      const res = await decisionsAPI.make({
        user_input: normalizedInput,
        user_id: String(user.id),
        tokens_used: 1,
      });

      await incrementDecisionUsage();
      setMessages((prev) => [
        ...prev,
        createMessage('assistant', res?.response || 'Handled returned an empty answer.'),
      ]);
    } catch {
      const offlineReply = buildOfflineDecisionReply({ input: normalizedInput, mode: submissionMode });
      await addLocalDecision({
        userId: user.id,
        inputText: normalizedInput,
        responseText: offlineReply,
        mode: submissionMode,
      });

      setMessages((prev) => [...prev, createMessage('assistant', offlineReply)]);
    } finally {
      setLoading(false);
      setVoiceSeconds(0);
    }
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <TopBar title={strings.newDecision || 'New decision'} onBack={() => navigation.goBack()} tintColor={textColor} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.messageList}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                isDark && message.role === 'assistant' && styles.darkCard,
              ]}
            >
              <View style={styles.messageRow}>
                {message.mode === 'voice' ? (
                  <Ionicons
                    name="mic"
                    size={14}
                    color={message.role === 'user' ? Colors.white : Colors.primary}
                    style={styles.messageIcon}
                  />
                ) : null}
                <Text style={[styles.messageText, { color: message.role === 'user' ? Colors.white : textColor }]}>
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={[styles.composerCard, Shadows.card, isDark && styles.darkCard]}>
          <View style={styles.inputShell}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Enter decision message"
              placeholderTextColor={Colors.placeholder}
              multiline
              style={[styles.composerInput, { color: textColor }]}
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.voiceButton} onPress={startRecording} activeOpacity={0.85}>
              <Ionicons name="mic" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, (!canSubmit || loading) && styles.sendButtonDisabled]}
              onPress={() => handleSubmit('text')}
              disabled={!canSubmit || loading}
              activeOpacity={0.85}
            >
              <Ionicons name={loading ? 'hourglass' : 'arrow-up'} size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.utilityRow}>
            <GhostButton title="View history" onPress={() => navigation.navigate('DecisionHistory')} style={styles.utilityButton} />
            <GhostButton title="Clear chat" onPress={clearConversation} style={styles.utilityButton} />
          </View>
        </View>

        {isRecording ? (
          <View style={[styles.recordingCard, Shadows.card, isDark && styles.darkCard]}>
            <View style={styles.recordingRow}>
              <View style={styles.recordingCopy}>
                <Text style={[styles.voiceTitle, { color: textColor }]}>Listening</Text>
                <Text style={[styles.voiceSub, { color: secondaryColor }]}>{voiceSeconds}s</Text>
              </View>
              <View style={styles.recordingWaveWrap}>
                <VoiceWave active={true} />
              </View>
              <TouchableOpacity style={styles.voiceActionGhost} onPress={cancelRecording} activeOpacity={0.8}>
                <Ionicons name="close" size={18} color={Colors.textDark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.voiceActionPrimary} onPress={stopRecording} activeOpacity={0.8}>
                <Ionicons name="arrow-up" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      {showUpgrade ? (
        <View style={styles.modalBackdrop}>
          <View style={styles.upgradeCard}>
            <Text style={styles.modalTitle}>Connect to the internet</Text>
            <Text style={styles.modalSub}>
              You reached your online decision limit for now. Reconnect later or continue using the app until network-backed decisions are available again.
            </Text>
            <PrimaryButton title="Close" onPress={() => setShowUpgrade(false)} />
          </View>
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 140, gap: 16 },
  darkCard: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  messageList: {
    gap: 12,
  },
  messageBubble: {
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
  },
  assistantBubble: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
    marginLeft: 36,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageIcon: {
    marginRight: 8,
    marginTop: 3,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  composerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
  },
  inputShell: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  composerInput: {
    minHeight: 42,
    maxHeight: 84,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: 'top',
    paddingTop: 2,
    paddingBottom: 2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 34,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  voiceButton: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.textDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    marginTop: 12,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordingCopy: { minWidth: 68 },
  recordingWaveWrap: { flex: 1 },
  voiceTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  voiceSub: {
    fontSize: 12,
    marginTop: 2,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    minHeight: 28,
  },
  waveBar: {
    width: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  voiceActionGhost: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  voiceActionPrimary: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  utilityRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  utilityButton: {
    flex: 1,
  },
  modalBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(13,10,25,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  upgradeCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 18,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    color: Colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
  },
});
