import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

export default function LogoWatermark({ opacity = 0.08 }) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <BlurView intensity={30} style={StyleSheet.absoluteFillObject} />
      <Image source={require('../../assets/icon.png')} style={[styles.logo, { opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
  },
});
