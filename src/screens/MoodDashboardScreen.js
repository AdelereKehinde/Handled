import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadows } from '../theme';

const MOODS = [
  { emoji: '😊', label: 'Great', value: 5, color: '#10b981' },
  { emoji: '😐', label: 'Okay', value: 3, color: '#f59e0b' },
  { emoji: '😔', label: 'Struggling', value: 1, color: '#ef4444' },
  { emoji: '😵', label: 'Overwhelmed', value: 0, color: '#8b5cf6' },
];

const COPING_STRATEGIES = {
  5: ['Celebrate your wins! 🎉', 'Share your joy with others', 'Plan something fun', 'Practice gratitude'],
  3: ['Take a short walk', 'Listen to favorite music', 'Call a friend', 'Do something creative'],
  1: ['Breathe deeply for 5 minutes', 'Write down your thoughts', 'Reach out for support', 'Do one small task'],
  0: ['Stop and breathe', 'Step away from triggers', 'Use grounding techniques', 'Ask for immediate help']
};

export default function MoodDashboardScreen({ navigation }) {
  const { themeMode, strings } = useApp();
  const [todayMood, setTodayMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;
  const secondaryColor = isDark ? Colors.textSoft : Colors.textMid;

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const history = JSON.parse(await AsyncStorage.getItem('moodHistory')) || [];
    
    setMoodHistory(history);
    
    const todayEntry = history.find((entry) => entry.date === today);
    if (todayEntry) {
      setTodayMood(todayEntry.value);
    }
  };

  const handleMoodSelect = async (moodValue) => {
    setTodayMood(moodValue);
    
    const today = new Date().toISOString().split('T')[0];
    const history = JSON.parse(await AsyncStorage.getItem('moodHistory')) || [];
    
    const existingIndex = history.findIndex((entry) => entry.date === today);
    const moodEntry = {
      date: today,
      value: moodValue,
      timestamp: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      history[existingIndex] = moodEntry;
    } else {
      history.push(moodEntry);
    }
    
    await AsyncStorage.setItem('moodHistory', JSON.stringify(history.slice(-30)));
    setMoodHistory(history);
  };

  const getMoodStats = () => {
    if (moodHistory.length === 0) return null;
    
    const avg = (moodHistory.reduce((sum, entry) => sum + entry.value, 0) / moodHistory.length).toFixed(1);
    const best = Math.max(...moodHistory.map((e) => e.value));
    const streak = countStreak();
    
    return { avg, best, streak };
  };

  const countStreak = () => {
    let count = 0;
    const today = new Date();
    
    for (let i = 0; i < moodHistory.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (!moodHistory.find((entry) => entry.date === dateStr)) {
        break;
      }
      count++;
    }
    
    return count;
  };

  const stats = getMoodStats();
  const currentMoodObj = MOODS.find((m) => m.value === todayMood);

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopBar
          title={strings.moodDashboard || 'Mood Dashboard'}
          onBack={() => navigation.goBack()}
          tintColor={textColor}
          icon="happy"
        />

        <Text style={[styles.title, { color: textColor }]}>How are you feeling today?</Text>

        <View style={[styles.moodSelector, isDark && styles.moodSelectorDark]}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.value}
              style={[
                styles.moodButton,
                todayMood === mood.value && styles.moodButtonSelected,
                todayMood === mood.value && { borderColor: mood.color },
              ]}
              onPress={() => handleMoodSelect(mood.value)}
              activeOpacity={0.85}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, { color: textColor }]}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {currentMoodObj && (
          <>
            <View style={[styles.feedbackCard, Shadows.card, isDark && styles.cardDark]}>
              <Text style={[styles.feedbackEmoji, { fontSize: 40 }]}>{currentMoodObj.emoji}</Text>
              <Text style={[styles.feedbackText, { color: secondaryColor }]}>
                {currentMoodObj.value === 5
                  ? "You're thriving! Keep it up! 💜"
                  : currentMoodObj.value === 3
                  ? "You're managing well. Take care of yourself."
                  : currentMoodObj.value === 1
                  ? "It's okay to struggle. You can reach out for support."
                  : "Take a break, breathe, and be kind to yourself."}
              </Text>
            </View>

            <View style={[styles.sectionCard, Shadows.card, isDark && styles.cardDark]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Coping strategies</Text>
              <View style={styles.strategiesContainer}>
                {COPING_STRATEGIES[currentMoodObj.value]?.map((strategy, index) => (
                  <View key={index} style={styles.strategyItem}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                    <Text style={[styles.strategyText, { color: secondaryColor }]}>{strategy}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {stats && (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, isDark && styles.cardDark]}>
              <Text style={[styles.statLabel, { color: secondaryColor }]}>7-Day Avg</Text>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{stats.avg}/5</Text>
            </View>
            <View style={[styles.statCard, isDark && styles.cardDark]}>
              <Text style={[styles.statLabel, { color: secondaryColor }]}>Best</Text>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{stats.best}/5</Text>
            </View>
            <View style={[styles.statCard, isDark && styles.cardDark]}>
              <Text style={[styles.statLabel, { color: secondaryColor }]}>Streak</Text>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{stats.streak}d</Text>
            </View>
          </View>
        )}

        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Recent mood entries</Text>
          {moodHistory.slice().reverse().slice(0, 7).map((entry, idx) => {
            const mood = MOODS.find((m) => m.value === entry.value);
            const date = new Date(entry.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return (
              <View key={idx} style={[styles.historyItem, isDark && styles.historyItemDark]}>
                <Text style={styles.historyEmoji}>{mood?.emoji}</Text>
                <Text style={[styles.historyDate, { color: secondaryColor }]}>{dateStr}</Text>
                <View style={[styles.moodBar, { width: `${(entry.value / 5) * 100}%`, backgroundColor: mood?.color }]} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
  moodSelector: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  moodSelectorDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    backgroundColor: 'rgba(167,139,250,0.1)',
    borderColor: Colors.primary,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  feedbackCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  cardDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  feedbackEmoji: {
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  strategiesContainer: {
    gap: 8,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  strategyText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  historyItemDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  historyEmoji: {
    fontSize: 18,
  },
  historyDate: {
    fontSize: 12,
    minWidth: 60,
  },
  moodBar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
});
