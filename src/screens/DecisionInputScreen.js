import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Modal, Platform,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { decisionsAPI, isNetworkError } from '../services/api';
import { Colors, Radius, Shadows, Spacing } from '../theme';
import { addLocalDecision } from '../utils/localDecisions';
import { buildOfflineDecisionReply } from '../utils/offlineDecisionEngine';

const CHAT_KEY_PREFIX = 'decisionChatSession';

const DECISION_MODES = [
  { id: 'text',  label: 'Text',       icon: 'text-outline',       hint: 'General advice' },
  { id: 'pros',  label: 'Pros/Cons',  icon: 'list-outline',       hint: 'Structured breakdown' },
  { id: 'quick', label: 'Quick take', icon: 'flash-outline',      hint: 'Short answer only' },
];

const STARTER_CHIPS = [
  'Should I switch jobs?',
  'Help me decide: stay or leave?',
  'Which is the better financial move?',
  'Help me prioritize my tasks today.',
];

// ─── Voice wave ───────────────────────────────────────────────────────────────
const VoiceWave = ({ active }) => {
  const bars = useRef([...Array(10)].map(() => new Animated.Value(0.25))).current;

  useEffect(() => {
    if (!active) { bars.forEach(b => b.setValue(0.25)); return; }
    const anims = bars.map((bar, i) =>
      Animated.loop(Animated.sequence([
        Animated.timing(bar, { toValue: 1, duration: 200 + i * 40, useNativeDriver: false }),
        Animated.timing(bar, { toValue: 0.2, duration: 200 + i * 40, useNativeDriver: false }),
      ]))
    );
    const group = Animated.stagger(55, anims);
    group.start();
    return () => { group.stop(); bars.forEach(b => b.stopAnimation()); };
  }, [active]);

  return (
    <View style={styles.waveRow}>
      {bars.map((bar, i) => (
        <Animated.View key={i} style={[styles.waveBar, {
          height: bar.interpolate({ inputRange: [0, 1], outputRange: [4, 22] }),
        }]} />
      ))}
    </View>
  );
};

// ─── Mode pill ────────────────────────────────────────────────────────────────
const ModePill = ({ mode, active, onPress }) => (
  <TouchableOpacity
    style={[styles.modePill, active && styles.modePillActive]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Ionicons name={mode.icon} size={12} color={active ? Colors.primary : Colors.textSoft} />
    <Text style={[styles.modePillText, active && styles.modePillTextActive]}>
      {mode.label}
    </Text>
  </TouchableOpacity>
);

// ─── Message bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ message, isDark }) => {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <View style={styles.assistantAvatar}>
          <Ionicons name="chatbubble-ellipses" size={13} color={Colors.white} />
        </View>
      )}
      <View style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleAssistant,
        isDark && !isUser && styles.bubbleDark,
      ]}>
        {message.mode === 'voice' && (
          <View style={styles.voiceTag}>
            <Ionicons name="mic" size={10} color={isUser ? Colors.white : Colors.primary} />
            <Text style={[styles.voiceTagText, { color: isUser ? 'rgba(255,255,255,0.7)' : Colors.primary }]}>
              Voice
            </Text>
          </View>
        )}
        <Text style={[styles.bubbleText, { color: isUser ? Colors.white : (isDark ? Colors.white : Colors.textDark) }]}>
          {message.text}
        </Text>
        <Text style={[styles.bubbleMeta, { color: isUser ? 'rgba(255,255,255,0.55)' : Colors.textLight }]}>
          {message.modeLabel || 'text'} · just now
        </Text>
      </View>
    </View>
  );
};

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator = ({ isDark }) => {
  const dots = useRef([...Array(3)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 150),
        Animated.timing(d, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]))
    );
    Animated.stagger(150, anims).start();
  }, []);

  return (
    <View style={styles.messageRow}>
      <View style={styles.assistantAvatar}>
        <Ionicons name="chatbubble-ellipses" size={13} color={Colors.white} />
      </View>
      <View style={[styles.bubble, styles.bubbleAssistant, isDark && styles.bubbleDark, { paddingVertical: 14 }]}>
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
          {dots.map((d, i) => (
            <Animated.View key={i} style={[styles.typingDot, { opacity: d, transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }]} />
          ))}
        </View>
      </View>
    </View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onChipPress, isDark }) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIcon}>
      <Ionicons name="chatbubbles-outline" size={28} color={Colors.primary} />
    </View>
    <Text style={[styles.emptyTitle, { color: isDark ? Colors.white : Colors.textDark }]}>
      What's your decision today?
    </Text>
    <Text style={styles.emptySub}>
      Describe a situation and get a clear, structured recommendation.
    </Text>
    <View style={styles.chipRow}>
      {STARTER_CHIPS.map(chip => (
        <TouchableOpacity key={chip} style={styles.chip} onPress={() => onChipPress(chip)} activeOpacity={0.75}>
          <Text style={styles.chipText}>{chip}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function DecisionInputScreen({ navigation, route }) {
  const preset = route?.params?.preset;
  const { user, isFree, remainingDecisions, incrementDecisionUsage, themeMode, strings, hapticsEnabled } = useApp();
  const insets = useSafeAreaInsets();
  const isDark = themeMode === 'dark';
  const gradient = isDark ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const chatKey = `${CHAT_KEY_PREFIX}_${user?.id || 'guest'}`;

  const [input, setInput] = useState(preset || '');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [activeMode, setActiveMode] = useState('text');
  const scrollRef = useRef(null);
  const recordTimer = useRef(null);
  const canSubmit = useMemo(() => input.trim().length > 1, [input]);
  const activeModeObj = DECISION_MODES.find(m => m.id === activeMode);

  // Network
  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => {
      setIsOffline(s.isConnected === false || s.isInternetReachable === false);
    });
    NetInfo.fetch().then(s => setIsOffline(s.isConnected === false || s.isInternetReachable === false));
    return () => unsub();
  }, []);

  // Load / persist chat
  useEffect(() => {
    AsyncStorage.getItem(chatKey).then(s => s && setMessages(JSON.parse(s))).catch(() => {});
  }, [chatKey]);
  useEffect(() => {
    AsyncStorage.setItem(chatKey, JSON.stringify(messages)).catch(() => {});
  }, [chatKey, messages]);

  useEffect(() => { if (preset) setInput(preset); }, [preset]);
  useEffect(() => () => { if (recordTimer.current) clearInterval(recordTimer.current); }, []);
  useEffect(() => {
    if (messages.length) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages]);

  const createMsg = (role, text, meta = {}) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role, text,
    modeLabel: activeModeObj?.label || 'text',
    ...meta,
  });

  const clearConversation = useCallback(async () => {
    setMessages([]);
    await AsyncStorage.removeItem(chatKey);
  }, [chatKey]);

  const handleSubmit = useCallback(async (mode = 'text', override) => {
    const text = (override ?? input).trim();
    if (!text) return;
    if (!user?.id) { navigation.replace('AuthEntry'); return; }
    if (!isOffline && isFree && remainingDecisions <= 0) { setShowUpgrade(true); return; }

    setMessages(prev => [...prev, createMsg('user', text, { mode })]);
    if (mode === 'text') setInput('');

    if (isOffline) {
      setMessages(prev => [...prev, createMsg('assistant', 'You are offline. Reconnect to send decisions.')]);
      return;
    }

    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    try {
      const res = await decisionsAPI.make({
        user_input: text,
        user_id: String(user.id),
        mode: activeMode,
        tokens_used: 1,
      });
      await incrementDecisionUsage();
      const aiResponse = res?.response || 'No response returned.';
      setMessages(prev => [...prev, createMsg('assistant', aiResponse)]);
      
      // Auto-speak the response
      Speech.speak(aiResponse, {
        language: 'en',
        pitch: 1,
        rate: 0.95,
      });
    } catch (err) {
      let errorMessage = 'Something went wrong. Please try again.';
      if (isNetworkError(err) || isOffline) {
        const offlineReply = buildOfflineDecisionReply({ input: text, mode });
        await addLocalDecision({ userId: user.id, inputText: text, responseText: offlineReply, mode });
        setMessages(prev => [...prev, createMsg('assistant', offlineReply)]);
        errorMessage = offlineReply;
      } else {
        setMessages(prev => [...prev, createMsg('assistant', errorMessage)]);
      }
      
      // Speak error message too
      Speech.speak(errorMessage, {
        language: 'en',
        pitch: 1,
        rate: 0.95,
      });
    } finally {
      setLoading(false);
    }
  }, [input, user, isOffline, isFree, remainingDecisions, activeMode, hapticsEnabled]);

  const startRecording = () => {
    // Remove haptic feedback for recording start to avoid click sound
    setIsRecording(true);
    setVoiceSeconds(0);
    recordTimer.current = setInterval(() => setVoiceSeconds(s => s + 1), 1000);
  };

  const cancelRecording = () => {
    clearInterval(recordTimer.current);
    setIsRecording(false);
    setVoiceSeconds(0);
  };

  const stopRecording = () => {
    clearInterval(recordTimer.current);
    setIsRecording(false);
    const secs = voiceSeconds;
    setVoiceSeconds(0);
    if (secs < 1) return;
    // Generate voice draft and submit directly
    const { buildVoiceDraft } = require('../utils/offlineDecisionEngine');
    const voiceText = buildVoiceDraft(secs);
    handleSubmit('voice', voiceText);
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: isDark ? Colors.white : Colors.textDark }]}>
            {strings.newDecision || 'New decision'}
          </Text>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.topIconBtn} onPress={() => navigation.navigate('DecisionHistory')}>
              <Ionicons name="time-outline" size={17} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topIconBtn} onPress={clearConversation}>
              <Ionicons name="trash-outline" size={17} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Offline banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <View style={styles.offlineDot} />
            <Text style={styles.offlineText}>Offline — some features unavailable</Text>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.messagesList, messages.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0
            ? <EmptyState isDark={isDark} onChipPress={text => setInput(text)} />
            : messages.map(msg => <MessageBubble key={msg.id} message={msg} isDark={isDark} />)
          }
          {loading && <TypingIndicator isDark={isDark} />}
        </ScrollView>

        {/* Bottom composer */}
        <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 8 }]}>

          {/* Recording bar */}
          {isRecording && (
            <View style={[styles.recordingBar, Shadows.card]}>
              <View style={styles.recDot} />
              <VoiceWave active />
              <Text style={[styles.recTime, { color: isDark ? Colors.white : Colors.textDark }]}>
                {voiceSeconds}s
              </Text>
              <TouchableOpacity style={styles.recCancelBtn} onPress={cancelRecording}>
                <Ionicons name="close" size={16} color={Colors.danger} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.recSendBtn} onPress={stopRecording}>
                <Ionicons name="arrow-up" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* Mode selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll} contentContainerStyle={styles.modeRow}>
            {DECISION_MODES.map(mode => (
              <ModePill
                key={mode.id}
                mode={mode}
                active={activeMode === mode.id}
                onPress={() => setActiveMode(mode.id)}
              />
            ))}
            {isFree && (
              <View style={styles.quotaBadge}>
                <Text style={styles.quotaText}>{remainingDecisions} left today</Text>
              </View>
            )}
          </ScrollView>

          {/* Composer card */}
          <View style={[styles.composerCard, Shadows.card, isDark && styles.composerDark]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={activeModeObj?.hint || 'Describe your decision...'}
              placeholderTextColor={Colors.placeholder}
              multiline
              style={[styles.composerInput, { color: isDark ? Colors.white : Colors.textDark }]}
              onSubmitEditing={() => handleSubmit('text')}
            />
            <View style={styles.composerFooter}>
              <Text style={styles.modeHint}>{activeModeObj?.label || 'Text'} mode</Text>
              <TouchableOpacity
                style={[styles.micBtn, isRecording && styles.micBtnActive]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.85}
              >
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={16} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBtn, !canSubmit && styles.sendBtnDisabled]}
                onPress={() => handleSubmit('text')}
                disabled={!canSubmit || loading}
                activeOpacity={0.85}
              >
                <Ionicons name={loading ? 'hourglass' : 'arrow-up'} size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Upgrade modal */}
      {showUpgrade && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
            <View style={styles.upgradeIcon}>
              <Ionicons name="flash" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: isDark ? Colors.white : Colors.textDark }]}>
              Daily limit reached
            </Text>
            <Text style={styles.modalSub}>
              You've used all your free decisions for today. Upgrade to get unlimited access.
            </Text>
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => { setShowUpgrade(false); navigation.navigate('Subscription'); }}
            >
              <LinearGradient colors={['#9f47f1', '#7c3aed']} style={styles.upgradeBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="flash" size={15} color={Colors.white} />
                <Text style={styles.upgradeBtnText}>Upgrade plan</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowUpgrade(false)} style={{ alignItems: 'center', marginTop: 4 }}>
              <Text style={styles.modalCancelText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingBottom: 10, gap: 10,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.whiteAlpha10,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
  topActions: { flexDirection: 'row', gap: 6 },
  topIconBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.whiteAlpha10,
    alignItems: 'center', justifyContent: 'center',
  },

  // Offline
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#fef3c7', paddingVertical: 7, paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: '#fde68a',
  },
  offlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#f59e0b' },
  offlineText: { fontSize: 12, color: '#92400e', fontWeight: '500' },

  // Messages
  messagesList: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.lg, gap: 12 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  messageRowUser: { justifyContent: 'flex-end' },

  assistantAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginTop: 2, flexShrink: 0,
  },
  bubble: { maxWidth: '80%', borderRadius: Radius.lg, padding: 12, gap: 4 },
  bubbleAssistant: {
    backgroundColor: Colors.card,
    borderWidth: 0.5, borderColor: Colors.cardBorder,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  bubbleDark: { backgroundColor: 'rgba(30,27,75,0.9)', borderColor: 'rgba(159,71,241,0.2)' },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleMeta: { fontSize: 10, marginTop: 2 },
  voiceTag: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 3 },
  voiceTagText: { fontSize: 10, fontWeight: '600' },

  // Typing
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primaryLight },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: Spacing.lg },
  emptyIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.whiteAlpha10, alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: 13, color: Colors.textSoft, textAlign: 'center', lineHeight: 19 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 },
  chip: {
    backgroundColor: Colors.card, borderWidth: 0.5, borderColor: Colors.cardBorder,
    borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 8,
  },
  chipText: { fontSize: 12, color: Colors.textMid, fontWeight: '500' },

  // Bottom
  bottomArea: { paddingHorizontal: Spacing.md, paddingTop: 6, gap: 8 },
  modeScroll: { marginBottom: 2 },
  modeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 2 },
  modePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: Radius.full, backgroundColor: Colors.card,
    borderWidth: 0.5, borderColor: Colors.cardBorder,
  },
  modePillActive: { backgroundColor: Colors.whiteAlpha10, borderColor: Colors.primaryLight },
  modePillText: { fontSize: 12, fontWeight: '500', color: Colors.textSoft },
  modePillTextActive: { color: Colors.primary },
  quotaBadge: {
    marginLeft: 4, backgroundColor: Colors.card,
    borderWidth: 0.5, borderColor: Colors.cardBorder,
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  quotaText: { fontSize: 11, color: Colors.textSoft },

  // Composer
  composerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: Colors.cardBorder,
  },
  composerDark: { backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(159,71,241,0.25)' },
  composerInput: {
    paddingHorizontal: 16, paddingTop: 13, paddingBottom: 4,
    fontSize: 15, lineHeight: 22, minHeight: 46, maxHeight: 130,
    textAlignVertical: 'top',
  },
  composerFooter: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingBottom: 10, gap: 8,
  },
  modeHint: { flex: 1, fontSize: 11, color: Colors.textLight, paddingLeft: 2 },
  micBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.textDark, alignItems: 'center', justifyContent: 'center',
  },
  micBtnActive: { backgroundColor: Colors.danger },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.primaryLight, opacity: 0.45 },

  // Recording bar
  recordingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.danger + '44',
    padding: 10,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  recTime: { fontSize: 13, fontWeight: '600', minWidth: 28 },
  recCancelBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#fecaca',
  },
  recSendBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },

  // Voice wave
  waveRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: Colors.primary },

  // Modal
  modalOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(13,10,25,0.6)',
    justifyContent: 'center', padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 20, gap: 10,
  },
  modalCardDark: { backgroundColor: '#1e1b4b', borderColor: 'rgba(159,71,241,0.25)' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSub: { fontSize: 13, color: Colors.textSoft, lineHeight: 19 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  modalCancelBtn: {
    flex: 1, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.whiteAlpha10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.cardBorder,
  },
  modalCancelText: { fontSize: 14, color: Colors.textSoft, fontWeight: '500' },
  modalSendBtn: {
    flex: 2, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  modalSendText: { fontSize: 14, color: Colors.white, fontWeight: '600' },

  // Upgrade modal
  upgradeIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.whiteAlpha10, alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 4,
  },
  upgradeBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: 4 },
  upgradeBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 13,
  },
  upgradeBtnText: { fontSize: 15, color: Colors.white, fontWeight: '600' },
});