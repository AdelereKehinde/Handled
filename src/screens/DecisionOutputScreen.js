import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import DecisionCard from '../components/DecisionCard';
import TopBar from '../components/TopBar';
import { GhostButton, PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { decisionsAPI } from '../services/api';
import { Colors, Radius, Shadows } from '../theme';

export default function DecisionOutputScreen({ navigation, route }) {
  const { decisionId, response, original, error } = route.params || {};
  const [deleting, setDeleting] = useState(false);
  const { themeMode, strings } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;

  const handleDelete = async () => {
    if (!decisionId) return;
    setDeleting(true);
    try {
      await decisionsAPI.remove(decisionId);
      navigation.navigate('DecisionHistory');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar title={strings.result || 'Decision result'} onBack={() => navigation.goBack()} tintColor={textColor} />
        <Text style={[styles.title, { color: textColor }]}>{error ? strings.hitSnag || 'We hit a snag' : strings.yourDecision || 'Your decision'}</Text>
        
        <View style={[styles.resultCard, Shadows.card, isDark && styles.resultCardDark]}>
          <DecisionCard text={response || 'No response'} />
        </View>

        <View style={styles.actionSection}>
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
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
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
