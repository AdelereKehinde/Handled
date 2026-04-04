import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

// ─── PRIMARY BUTTON ───────────────────────────────────────────────
export const PrimaryButton = ({
  title,
  onPress,
  loading,
  disabled,
  style,
  glow = true,
  leftIcon,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[
          styles.primaryBtn,
          (disabled || loading) && styles.primaryBtnDisabled,
          glow && Shadows.glow,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <View style={styles.primaryBtnContent}>
            {leftIcon && <View style={styles.primaryBtnIcon}>{leftIcon}</View>}
            <Text style={styles.primaryBtnText}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── GHOST BUTTON ─────────────────────────────────────────────────
export const GhostButton = ({ title, onPress, style }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.ghostBtn, style]}>
    <Text style={styles.ghostBtnText}>{title}</Text>
  </TouchableOpacity>
);

// ─── TEXT BUTTON ──────────────────────────────────────────────────
export const TextButton = ({ title, onPress, style, color }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
    <Text style={[styles.textBtnText, color && { color }]}>{title}</Text>
  </TouchableOpacity>
);

// ─── INPUT FIELD ──────────────────────────────────────────────────
export const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  error,
  autoCapitalize = 'none',
  style,
  rightIcon,
  editable = true,
  multiline,
}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.inputBorder, Colors.primary],
  });

  return (
    <View style={[styles.inputWrapper, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor },
          error && { borderColor: Colors.danger },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
          editable={editable}
          multiline={multiline}
        />
        {rightIcon && <View style={styles.inputRight}>{rightIcon}</View>}
      </Animated.View>
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
};

// ─── GLASS CARD ───────────────────────────────────────────────────
export const GlassCard = ({ children, style }) => (
  <View style={[styles.glassCard, Shadows.card, style]}>{children}</View>
);

// ─── TOAST ────────────────────────────────────────────────────────
export const Toast = ({ message, type = 'error', visible }) => {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const bgColor = type === 'error' ? Colors.danger : Colors.success;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bgColor, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

// â”€â”€â”€ DAISY MESSAGE CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const DaisyMessage = ({ visible, title, message }) => {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 40, duration: 180, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.daisyWrap,
        { transform: [{ translateY }], opacity },
      ]}
      pointerEvents="none"
    >
      <View style={styles.daisyCard}>
        <View style={styles.daisyDot} />
        <View style={styles.daisyText}>
          <Text style={styles.daisyTitle}>{title}</Text>
          <Text style={styles.daisyMessage}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── STRENGTH INDICATOR ───────────────────────────────────────────
export const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: Colors.danger };
    if (score === 2) return { level: 2, label: 'Fair', color: '#FFB347' };
    if (score === 3) return { level: 3, label: 'Good', color: Colors.glow };
    return { level: 4, label: 'Strong', color: Colors.success };
  };

  const { level, label, color } = getStrength();

  if (!password) return null;

  return (
    <View style={styles.strengthWrapper}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              { backgroundColor: i <= level ? color : Colors.whiteAlpha10 },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color }]}>{label}</Text>
    </View>
  );
};

// ─── SCREEN BACKGROUND ────────────────────────────────────────────
export const ScreenBg = ({ children, style }) => (
  <View style={[styles.screenBg, style]}>{children}</View>
);

// ─── DOT PROGRESS ─────────────────────────────────────────────────
export const DotProgress = ({ total, current }) => (
  <View style={styles.dots}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i === current && styles.dotActive,
          i < current && styles.dotPast,
        ]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  // Button
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    ...Typography.button,
    letterSpacing: 0.5,
  },
  primaryBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnIcon: {
    marginTop: 1,
  },
  ghostBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  ghostBtnText: {
    ...Typography.button,
    color: Colors.primary,
  },
  textBtnText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  // Input
  inputWrapper: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.label,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    color: Colors.textDark,
    fontSize: 16,
    paddingVertical: 14,
    fontWeight: '400',
  },
  inputRight: {
    marginLeft: Spacing.sm,
  },
  inputError: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // Glass card
  glassCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
  },
  // Toast
  toast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    zIndex: 999,
    alignItems: 'center',
  },
  toastText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Daisy message
  daisyWrap: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 28,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 998,
  },
  daisyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  daisyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  daisyText: {
    flex: 1,
    gap: 2,
  },
  daisyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  daisyMessage: {
    fontSize: 13,
    color: Colors.textSoft,
  },
  // Strength
  strengthWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: Spacing.sm,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  // Screen bg
  screenBg: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Dots
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.whiteAlpha30,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotPast: {
    backgroundColor: Colors.primaryLight,
    opacity: 0.5,
  },
});
