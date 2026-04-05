import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Orb from '../components/Orb';
import { Colors } from '../theme';
import { BlurView } from 'expo-blur';
import TopBar from '../components/TopBar';

const { width, height } = Dimensions.get('window');

const randomPos = () => ({
  x: Math.random() * (width - 120) - (width - 120) / 2,
  y: Math.random() * (height - 260) - (height - 260) / 2,
});

const FloatingOrb = ({ size, onPop }) => {
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
    await Haptics.selectionAsync();
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
  const [score, setScore] = useState(0);
  const orbs = useMemo(() => ['large', 'medium', 'medium', 'small', 'small', 'small', 'small'], []);

  return (
    <LinearGradient colors={['#f7f0ff', '#e7dcff']} style={styles.container}>
      <BlurView intensity={25} style={StyleSheet.absoluteFillObject} />
      <TopBar title="Calm Space" onBack={() => navigation.goBack()} />
      <Text style={styles.title}>Breathe in. Tap the orbs to release tension.</Text>
      <Text style={styles.score}>Calm points: {score}</Text>
      <View style={styles.orbLayer}>
        {orbs.map((size, idx) => (
          <FloatingOrb key={idx} size={size} onPop={() => setScore((s) => s + 1)} />
        ))}
      </View>
      <Text style={styles.sub}>Let your breathing set the pace.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 36,
  },
  title: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 6,
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
  },
  orbLayer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbFloat: {
    position: 'absolute',
  },
});
