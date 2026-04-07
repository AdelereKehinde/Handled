import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { GlassCard, InputField, PasswordStrength, PrimaryButton, Toast } from '../components/UI';
import { authAPI } from '../services/api';
import { Colors } from '../theme';

const OTP_LENGTH = 6;

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(0); // 0 = email, 1 = otp + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);
  const otpRefs = useRef([]);
  const successScale = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  // Step 0 — Request OTP
  const handleRequestOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      showToast('OTP sent! Check your inbox.', 'success');
      setTimeout(() => setStep(1), 800);
    } catch (err) {
      showToast(err.message || 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handler
  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 1 — Reset password
  const handleReset = async () => {
    const errs = {};
    const otpCode = otp.join('');
    if (otpCode.length < OTP_LENGTH) errs.otp = 'Enter all 6 digits';
    if (!newPassword || newPassword.length < 8) errs.newPassword = 'Minimum 8 characters';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp: otpCode, new_password: newPassword });
      setDone(true);
      Animated.spring(successScale, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }).start();
      setTimeout(() => navigation.navigate('Login'), 2000);
    } catch (err) {
      showToast(err.message || 'Reset failed. Check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Animated.View style={[styles.successBubble, { transform: [{ scale: successScale }] }]}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
        </Animated.View>
        <Text style={styles.successTitle}>Password Reset!</Text>
        <Text style={styles.successSub}>Redirecting you to login...</Text>
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (step === 0 ? navigation.goBack() : setStep(0))}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.topArea}>
          <View style={styles.iconRing}>
              <Ionicons
                name={step === 0 ? 'key-outline' : 'shield-checkmark-outline'}
                size={36}
                color={Colors.primary}
              />
          </View>
          <Text style={styles.title}>
            {step === 0 ? 'Forgot your\npassword?' : 'Reset your\npassword'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 0
              ? "No worries — enter your email\nand we'll send you an OTP."
              : `Enter the code sent to\n${email}`}
          </Text>
        </View>

        <GlassCard style={styles.card}>
          {step === 0 && (
            <InputField
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={errors.email}
            />
          )}

          {step === 1 && (
            <>
              {/* OTP */}
              <Text style={styles.fieldLabel}>OTP Code</Text>
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(r) => (otpRefs.current[i] = r)}
                    style={[styles.otpInput, digit && styles.otpFilled]}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val.replace(/[^0-9]/g, ''), i)}
                    onKeyPress={(e) => handleOtpKeyPress(e, i)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    caretHidden
                  />
                ))}
              </View>
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

              <View style={{ height: 20 }} />

              <InputField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 8 characters"
                secureTextEntry={!showPass}
                error={errors.newPassword}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Ionicons
                      name={showPass ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.textLight}
                    />
                  </TouchableOpacity>
                }
              />
              <PasswordStrength password={newPassword} />

              <InputField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat new password"
                secureTextEntry
                error={errors.confirmPassword}
                style={{ marginTop: 12 }}
              />
            </>
          )}
        </GlassCard>

        <PrimaryButton
          title={step === 0 ? 'Send OTP \u2192' : 'Reset Password \u2726'}
          onPress={step === 0 ? handleRequestOtp : handleReset}
          loading={loading}
          style={styles.actionBtn}
        />

        {step === 1 && (
          <TouchableOpacity
            style={styles.resendRow}
            onPress={() => {
              setStep(0);
              setOtp(Array(OTP_LENGTH).fill(''));
            }}
          >
            <Text style={styles.resendText}>Didn&apos;t receive it? Try again</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: { alignItems: 'center', justifyContent: 'center' },
  blob1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(159,71,241,0.12)',
    top: -60,
    right: -80,
  },
  blob2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(59,130,246,0.08)',
    bottom: 80,
    left: -60,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 48,
  },
  backBtn: {
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 12,
  },
  backText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  topArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(159,71,241,0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(159,71,241,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: '#9f47f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: Colors.textSoft,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  otpInput: {
    width: 44,
    height: 54,
    borderRadius: 13,
    backgroundColor: Colors.inputBg,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    color: Colors.textDark,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpFilled: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(159,71,241,0.12)',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  actionBtn: {
    width: '100%',
    marginBottom: 16,
  },
  resendRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  // Success
  successBubble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 2,
    borderColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  successSub: {
    fontSize: 15,
    color: Colors.textSoft,
  },
});
