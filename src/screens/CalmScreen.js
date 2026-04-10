import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { Colors, Radius } from '../theme';

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
  const isDark = themeMode === 'dark';

  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIndex((value) => (value + 1) % promptSteps.length);
    }, 4200);

    return () => clearInterval(id);
  }, []);

  // Save calm points when score changes
  useEffect(() => {
    if (score > 0) {
      AsyncStorage.setItem('calm_points', score.toString());
    }
  }, [score]);

  return (
    <LinearGradient
      colors={isDark ? ['#111827', '#1e293b'] : ['#f7f0ff', '#e7dcff']}
      style={styles.container}
    >
      <BlurView intensity={35} style={StyleSheet.absoluteFillObject} />
      
      {/* Full game area */}
      <View style={styles.gameContainer}>
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
      </View>

      {/* Top overlay - minimal */}
      <View style={styles.topOverlay}>
        <View style={styles.topBarWrapper}>
          <TopBar title={''} onBack={() => navigation.goBack()} tintColor={isDark ? Colors.primary : Colors.textDark} navigation={navigation} showNotifications={true} onNotificationsPress={() => navigation.navigate('Notifications')} />
        </View>
        <View style={[styles.scoreCard, isDark && styles.scoreCardDark]}>
          <Text style={[styles.scoreText, { color: Colors.primary }]}>Calm points: {score}</Text>
        </View>
      </View>

      {/* Bottom overlay - breathing guidance */}
      <View style={styles.bottomOverlay}>
        <View style={[styles.breathCard, isDark && styles.breathCardDark]}>
          <View style={styles.promptGrid}>
            {promptSteps.map((step, index) => (
              <View key={index} style={[styles.promptItem, index === phaseIndex && styles.promptActive]}>
                <Text style={[styles.promptText, { color: index === phaseIndex ? Colors.white : (isDark ? Colors.white : Colors.textDark) }]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.breathText, { color: isDark ? Colors.textSoft : Colors.textMid }]}>
            Tap orbs • Follow rhythm • Reset yourself
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  orbLayer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  topBarWrapper: {
    paddingTop: 8,
  },
  scoreCard: {
    marginHorizontal: 24,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignSelf: 'center',
  },
  scoreCardDark: {
    backgroundColor: 'rgba(15,23,42,0.95)',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    padding: 24,
  },
  breathCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  breathCardDark: {
    backgroundColor: 'rgba(15,23,42,0.95)',
  },
  promptGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  promptItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(200,200,200,0.2)',
  },
  promptActive: {
    backgroundColor: Colors.primary,
  },
  promptText: {
    fontSize: 11,
    fontWeight: '600',
  },
  breathText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  orbFloat: {
    position: 'absolute',
  },
});
