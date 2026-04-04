import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Radius } from '../theme';
import { PrimaryButton, GlassCard, Toast } from '../components/UI';
import { authAPI } from '../services/api';

const OTP_LENGTH = 6;

export default function EmailVerificationScreen({ navigation, route }) {
  const email = route?.params?.email || '';
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const inputRefs = useRef([]);
  const successScale = useRef(new Animated.Value(0)).current;
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (value && index === OTP_LENGTH - 1 && newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code) => {
    const finalCode = code || otp.join('');
    if (finalCode.length < OTP_LENGTH) {
      showToast('Please enter all 6 digits');
      return;
    }
    setLoading(true);
    try {
      await authAPI.verifyEmail({ email, otp: finalCode });
      setVerified(true);
      Animated.spring(successScale, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        navigation.replace('Main');
      }, 1800);
    } catch (err) {
      showToast(err.message || 'Invalid OTP. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await authAPI.forgotPassword({ email });
      setResendTimer(30);
      showToast('OTP resent to your email 📬', 'success');
    } catch (err) {
      showToast('Failed to resend OTP');
    }
  };

  if (verified) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <Animated.View style={[styles.successBubble, { transform: [{ scale: successScale }] }]}>
          <Text style={styles.successEmoji}>✅</Text>
        </Animated.View>
        <Text style={styles.successTitle}>Email Verified!</Text>
        <Text style={styles.successSub}>Welcome aboard. Taking you in...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <View style={styles.inner}>
        <View style={styles.iconRing}>
          <Text style={styles.lockEmoji}>📧</Text>
        </View>

        <Text style={styles.title}>Check your{'\n'}email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <GlassCard style={styles.card}>
          <Text style={styles.cardLabel}>Enter OTP Code</Text>
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => (inputRefs.current[i] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(val) => handleOtpChange(val.replace(/[^0-9]/g, ''), i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>
        </GlassCard>

        <PrimaryButton
          title="Verify Email ✦"
          onPress={() => handleVerify()}
          loading={loading}
          disabled={otp.some((d) => !d)}
          style={styles.verifyBtn}
        />

        <TouchableOpacity
          style={styles.resendRow}
          onPress={handleResend}
          disabled={resendTimer > 0}
        >
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
            {resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : 'Resend OTP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLinkText}>← Back to Signup</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(108,92,231,0.12)',
    top: -80,
    right: -80,
  },
  blob2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0,207,255,0.08)',
    bottom: 60,
    left: -60,
  },
  inner: {
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  iconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(108,92,231,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(108,92,231,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  lockEmoji: { fontSize: 38 },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.whiteAlpha60,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  emailHighlight: {
    color: Colors.glow,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  cardLabel: {
    color: Colors.whiteAlpha60,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
  },
  otpInput: {
    width: 46,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.inputBg,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(108,92,231,0.15)',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  verifyBtn: {
    width: '100%',
    marginBottom: 20,
  },
  resendRow: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  resendText: {
    color: Colors.glow,
    fontSize: 14,
    fontWeight: '500',
  },
  resendDisabled: {
    color: Colors.whiteAlpha30,
  },
  backLink: {
    paddingVertical: 8,
  },
  backLinkText: {
    color: Colors.whiteAlpha30,
    fontSize: 13,
  },
  // Success state
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBubble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,214,143,0.15)',
    borderWidth: 2,
    borderColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  successEmoji: { fontSize: 52 },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  successSub: {
    fontSize: 15,
    color: Colors.whiteAlpha60,
  },
});
