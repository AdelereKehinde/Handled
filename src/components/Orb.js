import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';

const SIZE_MAP = {
  small: 70,
  medium: 110,
  large: 160,
};

const MODE_COLORS = {
  calm: ['rgba(159,71,241,0.25)', 'rgba(59,130,246,0.12)'],
  focus: ['rgba(59,130,246,0.28)', 'rgba(14,165,233,0.18)'],
  emergency: ['rgba(239,68,68,0.25)', 'rgba(244,114,182,0.12)'],
};

const MODE_GLOW = {
  calm: Colors.primary,
  focus: Colors.glow,
  emergency: Colors.danger,
};

export default function Orb({ size = 'medium', mode = 'calm', onPress }) {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.06, { duration: 2200 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulse.value }],
  }));

  const orbSize = SIZE_MAP[size] || SIZE_MAP.medium;
  const colors = MODE_COLORS[mode] || MODE_COLORS.calm;

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 180 });
      }}
      onPress={onPress}
    >
      <Animated.View style={[styles.orbWrap, animatedStyle]}>
        <LinearGradient colors={colors} style={[styles.orb, { width: orbSize, height: orbSize }]} />
        <View
          style={[
            styles.glow,
            { shadowColor: MODE_GLOW[mode] || Colors.primary, width: orbSize, height: orbSize },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  orbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 12,
  },
});
