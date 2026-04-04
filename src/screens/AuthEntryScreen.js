import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../theme';
import { PrimaryButton, GhostButton } from '../components/UI';

const { width } = Dimensions.get('window');

export default function AuthEntryScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Ambient blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={styles.iconRing}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>handled.</Text>
          <Text style={styles.tagline}>Your decisions, handled for you.</Text>
        </View>

        {/* Decorative line */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>get started</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Action buttons */}
        <View style={styles.buttons}>
          <PrimaryButton
            title="Create Account"
            leftIcon={<Ionicons name="person-add-outline" size={18} color="#fff" />}
            onPress={() => navigation.navigate('Signup')}
            style={styles.btn}
          />
          <GhostButton
            title="Login"
            onPress={() => navigation.navigate('Login')}
            style={styles.btn}
          />
        </View>

        {/* Legal links */}
        <View style={styles.legal}>
          <Text style={styles.legalText}>By continuing, you agree to our </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalText}> & </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  blob1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(159,71,241,0.12)',
    top: -100,
    left: -120,
  },
  blob2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59,130,246,0.08)',
    bottom: 50,
    right: -80,
  },
  blob3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(159,71,241,0.08)',
    bottom: 180,
    left: -40,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(159,71,241,0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(159,71,241,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#9f47f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 16,
  },
  icon: {
    width: 72,
    height: 72,
  },
  appName: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSoft,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 28,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.cardBorder,
  },
  dividerText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  buttons: {
    width: '100%',
    gap: 14,
  },
  btn: {
    width: '100%',
  },
  legal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 28,
    gap: 0,
  },
  legalText: {
    color: Colors.textLight,
    fontSize: 12,
  },
  legalLink: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});
