import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Colors, Spacing, Radius } from '../theme';
import {
  InputField,
  PrimaryButton,
  GhostButton,
  PasswordStrength,
  GlassCard,
  Toast,
  DaisyMessage,
} from '../components/UI';
import { authAPI } from '../services/api';

const STEPS = ['Basic Info', 'About You', 'Profile'];

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const ADHD_OPTIONS = [
  'Decision fatigue',
  'Task paralysis',
  'Overwhelm easily',
  'Hyperfocus episodes',
  'Time blindness',
  'Emotional dysregulation',
  'None of the above',
];

const GenderSelect = ({ options, value, onSelect, open, onToggle }) => (
  <View style={styles.selectWrap}>
    <TouchableOpacity style={styles.selectTrigger} onPress={onToggle} activeOpacity={0.8}>
      <Text style={[styles.selectText, !value && styles.selectPlaceholder]}>
        {value || 'Select gender'}
      </Text>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textLight} />
    </TouchableOpacity>
    {open && (
      <View style={styles.selectList}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            style={styles.selectItem}
          >
            <Text style={styles.selectItemText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

const AllergiesChecklist = ({ options, selected, onToggle, max }) => (
  <View style={styles.checkList}>
    {options.map((opt) => {
      const checked = selected.includes(opt);
      return (
        <TouchableOpacity
          key={opt}
          onPress={() => onToggle(opt)}
          style={styles.checkItem}
          activeOpacity={0.8}
        >
          <Ionicons
            name={checked ? 'checkbox' : 'square-outline'}
            size={20}
            color={checked ? Colors.primary : Colors.textSoft}
          />
          <Text style={styles.checkText}>{opt}</Text>
          {checked && (
            <Text style={styles.checkHint}>{`Selected (${selected.length}/${max})`}</Text>
          )}
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const [slowNotice, setSlowNotice] = useState(false);
  const slowTimerRef = useRef(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState('');
  const [allergic, setAllergic] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [genderOpen, setGenderOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!username.trim()) errs.username = 'Username is required';
      if (!email.trim() || !email.includes('@')) errs.email = 'Valid email required';
      if (!age || isNaN(age) || +age < 13) errs.age = 'Must be 13+';
    } else if (step === 1) {
      if (!occupation.trim()) errs.occupation = 'Occupation is required';
      if (!gender) errs.gender = 'Please select a gender';
    } else if (step === 2) {
      if (!password) errs.password = 'Password required';
      if (password.length < 8) errs.password = 'Minimum 8 characters';
      if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const toggleAllergic = (item) => {
    setAllergic((prev) => {
      if (prev.includes(item)) {
        return prev.filter((i) => i !== item);
      }
      if (prev.length >= 3) {
        showToast('You can select up to 3 items.');
        return prev;
      }
      return [...prev, item];
    });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setSlowNotice(false);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => {
      setSlowNotice(true);
    }, 15000);

    const netState = await NetInfo.fetch();
    if (netState.isConnected === false || netState.isInternetReachable === false) {
      setLoading(false);
      setSlowNotice(false);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      showToast('No internet connection. Please check your network and try again.');
      return;
    }
    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        age,
        occupation: occupation.trim(),
        gender,
        description: '',
        allergic: JSON.stringify(allergic),
        password,
        confirm_password: confirmPassword,
      };
      await authAPI.signup(payload);
      showToast('Account created! Check your email for the OTP.', 'success');
      setTimeout(() => {
        navigation.navigate('EmailVerification', { email });
      }, 1200);
    } catch (err) {
      showToast(err.message || 'Signup failed. Try again.');
    } finally {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setSlowNotice(false);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
      <DaisyMessage
        visible={slowNotice}
        title="Daisy says..."
        message="We’re still syncing your account. Please check your internet."
      />

      {/* Header */}
      <View style={styles.header}>
        {step > 0 && (
          <TouchableOpacity onPress={() => setStep((s) => s - 1)} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.stepIndicator}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>
                  {i < step ? '✓' : i + 1}
                </Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, i < step && styles.stepLineActive]} />
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

      <Text style={styles.stepLabel}>{STEPS[step]}</Text>
        <Text style={styles.stepTitle}>
          {step === 0 && "Let's start\nwith the basics"}
          {step === 1 && 'Tell us a\nbit about you'}
          {step === 2 && 'Almost done!\nSet your profile'}
        </Text>

        <GlassCard style={styles.card}>
          {/* Step 1 */}
          {step === 0 && (
            <>
              <InputField
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="e.g. calmuser42"
                autoCapitalize="none"
                error={errors.username}
              />
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                error={errors.email}
              />
              <InputField
                label="Age"
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 25"
                keyboardType="numeric"
                error={errors.age}
              />
            </>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <>
              <InputField
                label="Occupation"
                value={occupation}
                onChangeText={setOccupation}
                placeholder="e.g. Designer, Student, Developer"
                autoCapitalize="words"
                error={errors.occupation}
              />
              <Text style={styles.fieldLabel}>Gender</Text>
              <GenderSelect
                options={GENDER_OPTIONS}
                value={gender}
                open={genderOpen}
                onToggle={() => setGenderOpen((v) => !v)}
                onSelect={(opt) => {
                  setGender(opt);
                  setGenderOpen(false);
                }}
              />
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
                ADHD-related challenges (choose up to 3)
              </Text>
              <AllergiesChecklist
                options={ADHD_OPTIONS}
                selected={allergic}
                onToggle={toggleAllergic}
                max={3}
              />
            </>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <>
              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                secureTextEntry={!showPass}
                error={errors.password}
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
              <PasswordStrength password={password} />

              <InputField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat your password"
                secureTextEntry
                error={errors.confirmPassword}
                style={{ marginTop: 12 }}
              />
            </>
          )}
        </GlassCard>

        {/* Navigation */}
        <View style={styles.actionRow}>
          {step < 2 ? (
            <PrimaryButton title="Continue →" onPress={handleNext} style={styles.actionBtn} />
          ) : (
            <PrimaryButton
              title="Create My Account"
              onPress={handleSubmit}
              loading={loading}
              style={styles.actionBtn}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingHorizontal: 24,
    paddingBottom: 12,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 24,
    top: Platform.OS === 'ios' ? 56 : 24,
  },
  backText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepNum: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: '700',
  },
  stepNumActive: {
    color: Colors.white,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: Colors.cardBorder,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 8,
  },
  blob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(159,71,241,0.12)',
    top: -60,
    right: -100,
  },
  blob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59,130,246,0.08)',
    bottom: 0,
    left: -40,
  },
  stepLabel: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textDark,
    lineHeight: 38,
    marginBottom: 24,
  },
  card: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: Colors.textSoft,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  selectWrap: {
    marginBottom: 4,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  selectText: {
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: '500',
  },
  selectPlaceholder: {
    color: Colors.textLight,
  },
  selectList: {
    marginTop: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  selectItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteAlpha10,
  },
  selectItemText: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: '500',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.whiteAlpha10,
    borderWidth: 1.5,
    borderColor: Colors.whiteAlpha10,
  },
  pillSelected: {
    backgroundColor: 'rgba(159,71,241,0.18)',
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.textSoft,
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: Colors.textDark,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  checkList: {
    marginTop: 4,
    gap: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.whiteAlpha10,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha10,
  },
  checkText: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  checkHint: {
    color: Colors.textLight,
    fontSize: 11,
    fontWeight: '600',
  },
  eyeIcon: { fontSize: 18 },
  actionRow: {
    marginBottom: 16,
  },
  actionBtn: {
    width: '100%',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginLinkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
