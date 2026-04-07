import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius } from '../theme';

export default function EmergencyCalmButton({ onPress, hapticsEnabled }) {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    if (isBreathing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isBreathing]);

  const handlePress = () => {
    setIsBreathing(true);
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onPress?.();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <Ionicons name="leaf" size={32} color={Colors.white} />
        </TouchableOpacity>
      </Animated.View>
      {isBreathing && (
        <View style={styles.label}>
          <Text style={styles.labelText}>Breathe</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    zIndex: 999,
  },
  pulse: {
    width: 60,
    height: 60,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  label: {
    position: 'absolute',
    left: -50,
    top: 16,
    backgroundColor: 'rgba(159, 71, 241, 0.9)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  labelText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
