import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    icon: 'eye',
    tips: [
      'Focus on one decision at a time',
      'Break big tasks into tiny steps',
      'Take a calm break every 30 minutes',
      'Celebrate small wins',
      'Start with the easiest task first',
      'Set a gentle timer for focus sessions',
      'Write down three things you\'re grateful for',
      'Practice one minute of deep breathing',
      'Organize your immediate workspace',
      'Complete one item from your to-do list',
      'Reach out to one supportive person',
      'Do something creative for 10 minutes',
      'Take a short walk outside',
      'Listen to calming music',
      'Write about your feelings',
      'Practice self-compassion',
      'Set one small boundary today',
      'Try a new healthy habit',
      'Reflect on your progress',
      'End your day with gratitude',
      'Focus on what you can control',
      'Be kind to yourself today',
      'Take things one moment at a time',
      'Remember you\'re doing your best',
      'Choose progress over perfection',
      'Celebrate your resilience',
      'Trust your inner wisdom',
      'You are stronger than you know',
      'Every small step counts',
      'Your feelings are valid',
      'You deserve kindness and care',
      'Take breaks when you need them',
      'Your pace is perfect for you',
      'You\'re allowed to ask for help',
      'Your worth isn\'t measured by productivity',
      'Rest is productive too',
      'You\'re learning and growing',
      'Be patient with yourself',
      'Your journey is unique',
      'You matter and your needs matter',
      'Trust the timing of your life',
      'You\'re exactly where you need to be',
      'Your feelings will pass',
      'You have the power to choose',
      'You\'re capable of amazing things',
      'Your voice and choices matter',
      'You deserve peace and calm',
      'You\'re worthy of love and care',
      'Your presence is enough',
      'You\'re allowed to change your mind',
      'Your intuition is wise',
      'You\'re not alone in this',
      'You have inner strength',
      'Your story is still being written',
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
      'Make your bed',
      'Wash one dish',
      'Fold some laundry',
      'Take out the trash',
      'Water a plant',
      'Smile at yourself in the mirror',
      'Say something kind to yourself',
      'Complete one breathing exercise',
      'Listen to one song',
      'Read one page of a book',
      'Write one sentence',
      'Draw one small doodle',
      'Stretch for one minute',
      'Stand up and sit down slowly',
      'Notice something beautiful around you',
      'Count to ten slowly',
      'Name three things you can see',
      'Name two things you can hear',
      'Name one thing you can touch',
      'Name something you\'re grateful for',
      'Think of someone you love',
      'Remember a happy memory',
      'Notice your breath for 10 seconds',
      'Roll your shoulders gently',
      'Wiggle your toes',
      'Blink slowly three times',
      'Touch your heart and breathe',
      'Say "I am safe" quietly',
      'Notice the ground beneath your feet',
      'Feel the air on your skin',
      'Look at the sky for a moment',
      'Listen to birds or nature sounds',
      'Hold something comforting',
      'Light a candle or soft light',
      'Put on comfortable clothing',
      'Make a cup of tea',
      'Eat one healthy bite of food',
      'Brush your teeth mindfully',
      'Wash your hands with warm water',
      'Take a warm shower',
      'Lie down for one minute',
      'Close your eyes and rest',
      'Put on your favorite scent',
      'Hold a comforting object',
      'Look at a photo that makes you smile',
      'Call someone you care about',
      'Send a kind text message',
      'Write a thank you note',
      'Compliment someone',
      'Help someone with a small task',
      'Share something positive',
      'Express appreciation',
      'Give yourself a small reward',
      'Treat yourself with kindness',
      'Acknowledge your effort',
      'Notice your progress',
      'Celebrate your existence',
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
      'You are worthy of care',
      'Your feelings are valid',
      'You\'re stronger than you know',
      'Every step forward counts',
      'You\'re learning and growing',
      'Be patient with yourself',
      'Your journey is unique',
      'You matter deeply',
      'Trust your inner wisdom',
      'You have inner strength',
      'Your presence is enough',
      'You deserve kindness',
      'You\'re capable of amazing things',
      'Your voice matters',
      'You\'re not alone',
      'You have the power to choose',
      'Your story is still being written',
      'You\'re exactly where you need to be',
      'Your feelings will pass',
      'You deserve peace and calm',
      'You\'re worthy of love',
      'Rest is productive',
      'Your worth isn\'t measured by productivity',
      'You\'re allowed to ask for help',
      'Take things one moment at a time',
      'Remember you\'re doing your best',
      'Choose progress over perfection',
      'Celebrate your resilience',
      'Trust the timing of your life',
      'You are loved and valued',
      'Your needs are important',
      'You\'re allowed to change your mind',
      'Your intuition is wise',
      'You have survived hard things',
      'You\'re braver than you believe',
      'Your heart is healing',
      'You\'re worthy of happiness',
      'Your dreams matter',
      'You\'re allowed to dream',
      'Your hopes are valid',
      'You deserve good things',
      'You\'re worthy of joy',
      'Your laughter matters',
      'You\'re allowed to play',
      'Your creativity is beautiful',
      'You\'re worthy of celebration',
      'Your achievements matter',
      'You\'re allowed to succeed',
      'Your talents are gifts',
      'You\'re worthy of recognition',
      'Your contributions matter',
      'You\'re allowed to shine',
      'Your light is needed',
      'You\'re worthy of connection',
      'Your relationships matter',
      'You\'re allowed to love',
      'Your heart is beautiful',
      'You\'re worthy of trust',
      'Your boundaries matter',
      'You\'re allowed to say no',
      'Your "yes" is powerful',
      'You\'re worthy of respect',
      'Your opinions matter',
      'You\'re allowed to speak',
      'Your silence is powerful too',
      'You\'re worthy of understanding',
      'Your experiences matter',
      'You\'re allowed to feel',
      'Your emotions are valid',
      'You\'re worthy of compassion',
      'Your pain matters',
      'You\'re allowed to heal',
      'Your healing is beautiful',
      'You\'re worthy of time',
      'Your pace matters',
      'You\'re allowed to slow down',
      'Your rest is sacred',
      'You\'re worthy of space',
      'Your boundaries matter',
      'You\'re allowed to breathe',
      'Your breath is precious',
      'You\'re worthy of life',
      'Your existence matters',
      'You\'re allowed to live',
      'Your life is a gift',
    ],
  },
];

export default function DailyGuidanceScreen({ navigation }) {
  const { themeMode, strings } = useApp();
  const [currentTips, setCurrentTips] = useState({});
  const [tipCount, setTipCount] = useState(0);
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;
  const secondaryColor = isDark ? Colors.textSoft : Colors.textMid;

  useEffect(() => {
    generateTips();
    loadTipCount();
  }, []);

  const loadTipCount = async () => {
    try {
      const stored = await AsyncStorage.getItem('dailyGuidanceTipCount');
      setTipCount(parseInt(stored) || 0);
    } catch (error) {
      console.log('Error loading tip count:', error);
    }
  };

  const saveTipCount = async (count) => {
    try {
      await AsyncStorage.setItem('dailyGuidanceTipCount', count.toString());
    } catch (error) {
      console.log('Error saving tip count:', error);
    }
  };

  const generateTips = () => {
    const tips = {};
    DAILY_TIPS.forEach((section) => {
      tips[section.title] = section.tips[Math.floor(Math.random() * section.tips.length)];
    });
    setCurrentTips(tips);
    const newCount = tipCount + 1;
    setTipCount(newCount);
    saveTipCount(newCount);
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar
          title={strings.dailyGuidance || 'Daily Guidance'}
          onBack={() => navigation.goBack()}
          tintColor={textColor}
          icon="book"
        />

        {/* Welcome Section */}
        <View style={[styles.welcomeCard, Shadows.card, isDark && styles.cardDark]}>
          <View style={styles.welcomeHeader}>
            <Ionicons name="sun" size={28} color={Colors.primary} />
            <Text style={[styles.welcomeTitle, { color: textColor }]}>
              Welcome to your daily guidance ✨
            </Text>
          </View>
          <Text style={[styles.welcomeText, { color: secondaryColor }]}>
            Every day brings new opportunities to be kind to yourself. These gentle suggestions are here to support you on your journey.
          </Text>
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: secondaryColor }]}>
              Tips explored: {tipCount}
            </Text>
            <Ionicons name="heart" size={16} color={Colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: textColor }]}>
          {strings.todayGuidance || 'Today\'s guidance'}
        </Text>
        <Text style={[styles.subtitle, { color: secondaryColor }]}>
          Three gentle reminders to support your day
        </Text>

        {DAILY_TIPS.map((section) => (
          <View key={section.title} style={[styles.card, Shadows.card, isDark && styles.cardDark]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name={section.icon} size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: textColor }]}>{section.title}</Text>
            </View>
            <Text style={[styles.cardContent, { color: secondaryColor }]}>
              {currentTips[section.title] || section.tips[0]}
            </Text>
          </View>
        ))}

        <TouchableOpacity style={styles.refreshButton} onPress={generateTips}>
          <Ionicons name="refresh" size={20} color={Colors.white} />
          <Text style={styles.refreshText}>Discover new insights</Text>
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
  welcomeCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 20,
    marginBottom: 24,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
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
