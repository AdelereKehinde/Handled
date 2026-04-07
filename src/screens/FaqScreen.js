import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadows } from '../theme';

const FAQS = [
  {
    q: 'How does Handled help me make decisions?',
    a: 'Handled is a decision engine designed specifically for people with ADHD, anxiety, or decision paralysis. You describe your situation, and we guide you through a calm, structured process to reach a thoughtful decision. We don\'t decide for you—we help you think clearly.',
  },
  {
    q: 'Are my decisions and data private?',
    a: 'Yes, your privacy is our priority. All your data is encrypted in transit and at rest. Your decision history is tied to your secure account, and we never share your data with third parties. You can read our full Privacy Policy in the settings.',
  },
  {
    q: 'What happens when I reach my free limit?',
    a: 'Free users get 10 daily decisions. When you reach this limit, you can upgrade to Pro for unlimited decisions, or wait until the next day. You can also use our Calm Space feature unlimited times regardless of your plan.',
  },
  {
    q: 'How do daily reminders work?',
    a: 'If enabled in Settings, you\'ll receive one gentle reminder per day at a time you choose. This helps you practice decision-making and maintain clarity throughout the day. You can turn this off anytime.',
  },
  {
    q: 'What are calm points in the Calm Space?',
    a: 'Calm points are collected by popping floating orbs in our Calm Space. You can use this therapeutic game to practice mindfulness, reduce anxiety, and build a calm foundation for better decision-making. There\'s no limit to how many times you can play.',
  },
  {
    q: 'Can I delete my account and data?',
    a: 'Yes, you can permanently delete your account from the Settings page in the Danger Zone. This will remove all your decisions, account data, and settings. This action cannot be undone.',
  },
  {
    q: 'Does Handled work offline?',
    a: 'Handled requires an active internet connection to process decisions and sync your data. However, you can always use the Calm Space offline to practice mindfulness and breathing exercises.',
  },
  {
    q: 'What languages does Handled support?',
    a: 'We support 20 languages including English, Spanish, French, Arabic, Chinese, Hindi, Portuguese, Russian, Japanese, German, Italian, Korean, Turkish, Indonesian, Dutch, Polish, Swahili, Urdu, Bengali, and Vietnamese. You can change your language in Settings.',
  },
  {
    q: 'How do I get the most out of Handled?',
    a: 'Start by exploring the Calm Space to reduce anxiety. Use our decision engine for small decisions first to build confidence. Enable daily reminders to practice regularly. Consider upgrading to Pro if you make more than 10 decisions daily.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes, we use industry-standard encryption and secure authentication. All communication with our servers is encrypted. However, no system is 100% secure—if you have security concerns, contact our support team.',
  },
];

export default function FaqScreen({ navigation }) {
  const { themeMode, strings } = useApp();
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;
  const secondaryColor = isDark ? Colors.textSoft : Colors.textMid;

  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar title={strings.faq || 'FAQs'} onBack={() => navigation.goBack()} tintColor={textColor} />
        <Text style={[styles.title, { color: textColor }]}>Frequently Asked Questions</Text>
        <Text style={[styles.subtitle, { color: secondaryColor }]}>Find answers to common questions about Handled.</Text>

        {FAQS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, Shadows.card, isDark && styles.cardDark]}
            onPress={() => toggleExpand(index)}
            activeOpacity={0.85}
          >
            <View style={styles.questionRow}>
              <Text style={[styles.q, { color: textColor }]} numberOfLines={expanded === index ? 0 : 2}>
                {item.q}
              </Text>
              <Ionicons
                name={expanded === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.primary}
                style={styles.icon}
              />
            </View>

            {expanded === index && (
              <View style={styles.answerContainer}>
                <View style={[styles.divider, { backgroundColor: Colors.cardBorder }]} />
                <Text style={[styles.a, { color: secondaryColor }]}>{item.a}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 18, lineHeight: 20 },
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
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  q: {
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  icon: {
    marginTop: 2,
  },
  answerContainer: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  a: {
    lineHeight: 22,
    fontSize: 14,
  },
});
