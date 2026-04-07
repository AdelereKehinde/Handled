import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { GhostButton, PrimaryButton } from '../components/UI';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadows } from '../theme';

export default function FocusSessionScreen({ navigation }) {
  const { themeMode, strings, hapticsEnabled } = useApp();
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const pulseAnim = new Animated.Value(1);

  const gradient = themeMode === 'dark' ? ['#0f172a', '#1e1b4b'] : ['#f7f3ff', '#eef2ff'];
  const isDark = themeMode === 'dark';
  const textColor = isDark ? Colors.white : Colors.textDark;
  const secondaryColor = isDark ? Colors.textSoft : Colors.textMid;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setCompleted(true);
      if (hapticsEnabled) {
        try {
          require('expo-haptics').notificationAsync(require('expo-haptics').NotificationFeedbackType.Success);
        } catch {}
      }
    }
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleReset = () => {
    setTimeLeft(duration * 60);
    setIsRunning(false);
    setCompleted(false);
  };

  const increaseDuration = () => {
    if (!isRunning) {
      setDuration(duration + 5);
      setTimeLeft((duration + 5) * 60);
    }
  };

  const decreaseDuration = () => {
    if (!isRunning && duration > 5) {
      setDuration(duration - 5);
      setTimeLeft((duration - 5) * 60);
    }
  };

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <TopBar
        title={strings.focusMode || 'Focus Mode'}
        onBack={() => navigation.goBack()}
        tintColor={textColor}
      />

      <View style={styles.content}>
        {completed ? (
          <View style={[styles.completionCard, Shadows.card, isDark && styles.cardDark]}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={[styles.completionTitle, { color: Colors.primary }]}>Focus Complete!</Text>
            <Text style={[styles.completionText, { color: secondaryColor }]}>
              Great job staying focused for {duration} minutes
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.timerCircle, Shadows.glow]}>
              <Animated.View
                style={[
                  styles.timerPulse,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Text style={[styles.timerText, { color: textColor }]}>{displayTime}</Text>
              </Animated.View>
            </View>

            <View style={[styles.durationControl, isDark && styles.durationControlDark]}>
              <TouchableOpacity onPress={decreaseDuration} style={styles.durationBtn}>
                <Ionicons name="remove" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.durationText, { color: textColor }]}>
                {duration} min
              </Text>
              <TouchableOpacity onPress={increaseDuration} style={styles.durationBtn}>
                <Ionicons name="add" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.motivationText, { color: secondaryColor }]}>
              {isRunning
                ? '✨ You\'re doing great. Stay focused.'
                : '🎯 Ready to focus? Minimize distractions and start.'}
            </Text>
          </>
        )}

        <View style={styles.buttonRow}>
          <PrimaryButton
            title={isRunning ? 'Pause' : completed ? 'Start again' : 'Start'}
            onPress={() => {
              if (completed) {
                handleReset();
              } else {
                setIsRunning(!isRunning);
              }
            }}
            style={styles.flexBtn}
          />
          {!completed && (
            <GhostButton
              title="Reset"
              onPress={handleReset}
              style={styles.flexBtn}
            />
          )}
        </View>

        {completed && (
          <PrimaryButton
            title="Done"
            onPress={() => navigation.goBack()}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', paddingBottom: 120 },
  timerCircle: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 32,
  },
  timerPulse: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 72,
    fontWeight: '700',
  },
  durationControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 32,
    width: '100%',
  },
  durationControlDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  durationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(167,139,250,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 18,
    fontWeight: '700',
  },
  motivationText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  flexBtn: {
    flex: 1,
  },
  completionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  cardDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
