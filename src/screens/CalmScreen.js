import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Orb from '../components/Orb';
import TopBar from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { Colors, Radius, Shadows } from '../theme';

const { width, height } = Dimensions.get('window');

const randomPos = () => ({
  x: Math.random() * (width - 120) - (width - 120) / 2,
  y: Math.random() * (height - 260) - (height - 260) / 2,
});

const FloatingOrb = ({ size, onPop, hapticsEnabled }) => {
  const float = useSharedValue(0);
  const scale = useSharedValue(1);
  const [pos, setPos] = useState(randomPos());

  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 4200 + Math.random() * 1200 }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: pos.x + float.value * 10 },
      { translateY: pos.y + float.value * -14 },
      { scale: scale.value },
    ],
    opacity: scale.value,
  }));

  const handlePress = async () => {
    if (hapticsEnabled) {
      await Haptics.selectionAsync();
    }
    scale.value = withTiming(0, { duration: 180 }, () => {
      scale.value = withTiming(1, { duration: 240 });
    });
    setPos(randomPos());
    onPop?.();
  };

  return (
    <Animated.View style={[styles.orbFloat, style]}>
      <Orb size={size} mode="calm" onPress={handlePress} />
    </Animated.View>
  );
};

export default function CalmScreen({ navigation }) {
  const { themeMode, hapticsEnabled } = useApp();
  const [score, setScore] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const orbs = useMemo(() => ['large', 'medium', 'medium', 'small', 'small', 'small', 'small'], []);
  const promptSteps = ['Breathe in…', 'Hold calm…', 'Breathe out…'];
  const prompt = promptSteps[phaseIndex];
  const isDark = themeMode === 'dark';

  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIndex((value) => (value + 1) % promptSteps.length);
    }, 4200);

    return () => clearInterval(id);
  }, []);

  return (
    <LinearGradient
      colors={isDark ? ['#111827', '#1e293b'] : ['#f7f0ff', '#e7dcff']}
      style={styles.container}
    >
      <BlurView intensity={35} style={StyleSheet.absoluteFillObject} />
      <TopBar title={''} onBack={() => navigation.goBack()} tintColor={isDark ? Colors.primary : Colors.textDark} />
      <View style={[styles.heroSection, Shadows.card, isDark && styles.heroSectionDark]}>
        <Text style={[styles.title, { color: isDark ? Colors.white : Colors.textDark }]}>Calm space</Text>
        <Text style={[styles.sub, { color: isDark ? Colors.textSoft : Colors.textMid }]}>{prompt}</Text>
        <Text style={[styles.score, { color: Colors.primary }]}>Calm points: {score}</Text>
      </View>

      <View style={styles.orbLayer}>
        {orbs.map((size, idx) => (
          <FloatingOrb
            key={idx}
            size={size}
            hapticsEnabled={hapticsEnabled}
            onPop={() => setScore((s) => s + 1)}
          />
        ))}
      </View>

      <View style={styles.breathCard}>
        <Text style={[styles.breathTitle, { color: isDark ? Colors.white : Colors.textDark }]}>Guided breathing</Text>
        <Text style={[styles.breathText, { color: isDark ? Colors.textSoft : Colors.textMid }]}>Tap the floating orbs while you follow the rhythm above. Each tap adds calm points and helps you reset.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  heroSectionDark: {
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  title: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 0,
  },
  score: {
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  sub: {
    color: Colors.textSoft,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  orbLayer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathCard: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  breathTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  breathText: {
    fontSize: 12,
    lineHeight: 18,
  },
  orbFloat: {
    position: 'absolute',
  },
});
