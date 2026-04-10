import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import DecisionCard from '../components/DecisionCard';
import TopBar from '../components/TopBar';
import { GhostButton, PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { decisionsAPI } from '../services/api';
import { Colors, Radius, Shadows } from '../theme';
import { removeLocalDecision } from '../utils/localDecisions';

export default function DecisionOutputScreen({ navigation, route }) {
  const { decisionId, response, original, error } = route.params || {};
  const [deleting, setDeleting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const { themeMode, strings } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;

  console.log('DecisionOutputScreen params:', { decisionId, response, original, error });

  const handleDelete = async () => {
    if (!decisionId) {
      console.log('No decisionId provided');
      Alert.alert('Error', 'Decision ID not found.');
      return;
    }
    setDeleting(true);
    try {
      console.log('Deleting decision:', decisionId);
      if (String(decisionId).startsWith('local-')) {
        await removeLocalDecision(decisionId);
      } else {
        await decisionsAPI.remove(decisionId);
      }
      console.log('Decision deleted successfully');
      // Navigate back to history immediately - deletion confirmed to server
      // DecisionHistoryScreen's useFocusEffect will refresh the list
      navigation.navigate('DecisionHistory');
    } catch (error) {
      console.error('Error deleting decision:', error);
      setDeleting(false);
      Alert.alert('Error', error.message || 'Failed to delete decision. Please try again.');
    }
  };

  const handleSpeak = async () => {
    if (!response) return;

    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    Speech.speak(response, {
      language: 'en',
      pitch: 1,
      rate: 0.95,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar title={strings.result || 'Decision result'} onBack={() => navigation.goBack()} tintColor={textColor} icon="bulb" />
        <Text style={[styles.title, { color: textColor }]}>{error ? strings.hitSnag || 'We hit a snag' : strings.yourDecision || 'Your decision'}</Text>
        
        <View style={[styles.resultCard, Shadows.card, isDark && styles.resultCardDark]}>
          <DecisionCard text={response || 'No response'} />
        </View>

        <View style={styles.actionSection}>
          <PrimaryButton title={speaking ? 'Stop reading' : 'Read aloud'} onPress={handleSpeak} />
          <PrimaryButton title={strings.next || 'Next decision'} onPress={() => navigation.navigate('DecisionInput', { preset: original })} />
          <GhostButton title={strings.deletDecision || 'Delete decision'} onPress={handleDelete} style={styles.deleteBtn} loading={deleting} />
          <GhostButton title={strings.back || 'Back'} onPress={() => navigation.navigate('DecisionHistory')} />
        </View>

        {original && (
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <Text style={[styles.infoLabel, { color: isDark ? Colors.textSoft : Colors.textMid }]}>Original question</Text>
            <Text style={[styles.infoText, { color: textColor }]}>{original}</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 32, gap: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 18,
    marginBottom: 16,
  },
  resultCardDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  actionSection: { gap: 12 },
  deleteBtn: { borderColor: Colors.danger },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  infoCardDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  infoLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 20 },
});
