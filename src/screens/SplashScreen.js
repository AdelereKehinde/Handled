import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Colors } from '../theme';
import { authAPI } from '../services/api';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(async () => {
      const isAuth = await authAPI.isAuthenticated();
      if (isAuth) {
        navigation.replace('Main');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Ambient glow blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <Animated.View
        style={[
          styles.iconWrapper,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require('../../assets/icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text style={[styles.wordmark, { opacity: fadeAnim }]}>
        handled.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(159,71,241,0.16)',
    top: '20%',
    left: '-20%',
    transform: [{ scale: 1.5 }],
  },
  blob2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(59,130,246,0.1)',
    bottom: '15%',
    right: '-10%',
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(159,71,241,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9f47f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 20,
  },
  icon: {
    width: 90,
    height: 90,
  },
  wordmark: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: 2,
  },
});
