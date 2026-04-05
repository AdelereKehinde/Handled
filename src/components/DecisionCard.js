import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows } from '../theme';

export default function DecisionCard({ text }) {
  return (
    <View style={[styles.card, Shadows.glowCyan]}>
      <Text style={styles.text} numberOfLines={10} adjustsFontSizeToFit>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(159,71,241,0.25)',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.textDark,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
});
