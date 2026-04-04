export const Colors = {
  background: '#f7f3ff',
  surface: '#faf5ff',
  card: '#ffffff',
  cardBorder: '#e9d5ff',
  primary: '#9f47f1',
  primaryLight: '#b269f7',
  glow: '#3b82f6',
  danger: '#ef4444',
  success: '#10b981',
  white: '#ffffff',
  whiteAlpha60: '#7c6fa0',
  whiteAlpha30: '#a99dc0',
  whiteAlpha10: '#ede9fe',
  inputBg: '#ffffff',
  inputBorder: '#e9d5ff',
  inputBorderFocus: '#9f47f1',
  placeholder: '#a99dc0',
  textDark: '#1a1033',
  textMid: '#4b3f72',
  textSoft: '#7c6fa0',
  textLight: '#a99dc0',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700', color: Colors.textDark },
  h2: { fontSize: 20, fontWeight: '600', color: Colors.textDark },
  body: { fontSize: 16, fontWeight: '400', color: Colors.textSoft },
  button: { fontSize: 18, fontWeight: '700', color: Colors.white },
  small: { fontSize: 13, fontWeight: '400', color: Colors.textSoft },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textSoft },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
};

export const Shadows = {
  glow: {
    shadowColor: '#9f47f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  glowCyan: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
};
