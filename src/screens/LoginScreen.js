import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../theme';
import { InputField, PrimaryButton, GlassCard, Toast } from '../components/UI';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const validate = () => {
    const errs = {};
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email required';
    if (!password) errs.password = 'Password required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.login({ email, password });
      showToast('Welcome back!', 'success');
      setTimeout(() => navigation.replace('Main'), 1000);
    } catch (err) {
      showToast(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      {/* Ambient blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.topArea}>
            <View style={styles.iconBadge}>
              <Ionicons name="lock-closed-outline" size={32} color={Colors.glow} />
            </View>
            <Text style={styles.title}>Welcome{'\n'}back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          <GlassCard style={styles.card}>
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={errors.email}
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry={!showPass}
              error={errors.password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Ionicons
                      name={showPass ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.whiteAlpha60}
                    />
                  </TouchableOpacity>
                }
            />

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </GlassCard>

          <PrimaryButton
            title="Login →"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or</Text>
            <View style={styles.divLine} />
          </View>

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupLinkText}>
              Don't have an account?{' '}
              <Text style={styles.signupHighlight}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  blob1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(108,92,231,0.11)',
    top: -80,
    left: -100,
  },
  blob2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0,207,255,0.07)',
    bottom: 100,
    right: -70,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
  },
  topArea: {
    alignItems: 'center',
    marginBottom: 36,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(108,92,231,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(108,92,231,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.whiteAlpha60,
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: -4,
  },
  forgotText: {
    color: Colors.glow,
    fontSize: 13,
    fontWeight: '500',
  },
  eyeIcon: { fontSize: 18 },
  loginBtn: {
    width: '100%',
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.whiteAlpha10,
  },
  divText: {
    color: Colors.whiteAlpha30,
    fontSize: 13,
  },
  signupLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  signupLinkText: {
    color: Colors.whiteAlpha60,
    fontSize: 14,
  },
  signupHighlight: {
    color: Colors.glow,
    fontWeight: '600',
  },
});
