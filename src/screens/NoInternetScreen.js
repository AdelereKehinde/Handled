import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlassCard } from '../components/UI';
import { Colors, Radius, Shadows } from '../theme';

export default function NoInternetScreen({ onRetry, isRetrying = false, overlay = true }) {
  const containerStyle = [styles.container, overlay && styles.overlay];

  return (
    <View style={containerStyle}>
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <View style={styles.center}>
        <View style={styles.iconRing}>
          <Ionicons name="cloud-offline-outline" size={40} color={Colors.primary} />
        </View>

        <Text style={styles.title}>No internet connection</Text>
        <Text style={styles.subtitle}>
          Handled needs an active connection to open. Please check your network and try again.
        </Text>

        <GlassCard style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.dot} />
            <Text style={styles.cardText}>We&apos;ll open the app as soon as you&apos;re back online.</Text>
          </View>
        </GlassCard>

        <TouchableOpacity
          style={[styles.retryBtn, Shadows.glow, isRetrying && styles.retryBtnDisabled]}
          onPress={onRetry}
          activeOpacity={0.85}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <View style={styles.retryRow}>
              <ActivityIndicator size="small" color={Colors.white} />
              <Text style={styles.retryText}>Checking...</Text>
            </View>
          ) : (
            <Text style={styles.retryText}>Try Again</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  blob1: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(159,71,241,0.12)',
    top: -120,
    left: -140,
  },
  blob2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59,130,246,0.1)',
    bottom: -40,
    right: -120,
  },
  center: {
    width: '100%',
    alignItems: 'center',
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(159,71,241,0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(159,71,241,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    marginBottom: 22,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  cardText: {
    color: Colors.textSoft,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 180,
    alignItems: 'center',
  },
  retryBtnDisabled: {
    opacity: 0.9,
  },
  retryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  retryText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
