import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadows } from '../theme';

const DAILY_TIPS = [
  {
    title: 'Today\'s Focus',
    icon: 'target',
    tips: [
      'Focus on one decision at a time',
      'Break big tasks into tiny steps',
      'Take a calm break every 30 minutes',
      'Celebrate small wins',
      'Start with the easiest task first',
    ],
  },
  {
    title: 'Small Win Suggestion',
    icon: 'star',
    tips: [
      'Organize one area of your space',
      'Complete a 5-minute task',
      'Send one message you\'ve been postponing',
      'Drink a glass of water',
      'Log one accomplishment',
    ],
  },
  {
    title: 'Motivational Message',
    icon: 'heart',
    tips: [
      'You\'re doing better than you think 💜',
      'Every decision counts',
      'Progress over perfection',
      'You\'re allowed to rest and reset',
      'Your efforts matter',
    ],
  },
];

export default function DailyGuidanceScreen({ navigation }) {
  const { themeMode, strings } = useApp();
  const [currentTips, setCurrentTips] = useState({});
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;
  const secondaryColor = isDark ? Colors.textSoft : Colors.textMid;

  useEffect(() => {
    generateTips();
  }, []);

  const generateTips = () => {
    const tips = {};
    DAILY_TIPS.forEach((section) => {
      tips[section.title] = section.tips[Math.floor(Math.random() * section.tips.length)];
    });
    setCurrentTips(tips);
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar
          title={strings.dailyGuidance || 'Daily Guidance'}
          onBack={() => navigation.goBack()}
          tintColor={textColor}
        />

        <Text style={[styles.title, { color: textColor }]}>
          {strings.todayGuidance || 'Today\'s guidance'}
        </Text>
        <Text style={[styles.subtitle, { color: secondaryColor }]}>
          Three things to help you thrive today
        </Text>

        {DAILY_TIPS.map((section) => (
          <View key={section.title} style={[styles.card, Shadows.card, isDark && styles.cardDark]}>
            <View style={styles.cardHeader}>
              <Ionicons name={section.icon} size={24} color={Colors.primary} />
              <Text style={[styles.cardTitle, { color: textColor }]}>{section.title}</Text>
            </View>
            <Text style={[styles.cardContent, { color: secondaryColor }]}>
              {currentTips[section.title] || section.tips[0]}
            </Text>
          </View>
        ))}

        <TouchableOpacity style={styles.refreshButton} onPress={generateTips}>
          <Ionicons name="refresh" size={20} color={Colors.white} />
          <Text style={styles.refreshText}>Get new suggestions</Text>
        </TouchableOpacity>

        <PrimaryButton
          title={strings.enterCalm || 'Take a calm moment'}
          onPress={() => navigation.navigate('Calm')}
          style={styles.primaryBtn}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 20, lineHeight: 20 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  cardDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 12,
    gap: 8,
  },
  refreshText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  primaryBtn: { marginTop: 12 },
});
