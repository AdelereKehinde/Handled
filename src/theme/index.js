export const Colors = {
  background: '#0B0F2F',
  card: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.12)',
  primary: '#6C5CE7',
  primaryLight: '#8B7FF0',
  glow: '#00CFFF',
  danger: '#FF4D6D',
  success: '#00D68F',
  white: '#FFFFFF',
  whiteAlpha60: 'rgba(255,255,255,0.6)',
  whiteAlpha30: 'rgba(255,255,255,0.3)',
  whiteAlpha10: 'rgba(255,255,255,0.1)',
  inputBg: 'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(108,92,231,0.4)',
  inputBorderFocus: '#6C5CE7',
  placeholder: 'rgba(255,255,255,0.35)',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700', color: Colors.white },
  h2: { fontSize: 20, fontWeight: '600', color: Colors.white },
  body: { fontSize: 16, fontWeight: '400', color: Colors.whiteAlpha60 },
  button: { fontSize: 18, fontWeight: '700', color: Colors.white },
  small: { fontSize: 13, fontWeight: '400', color: Colors.whiteAlpha60 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.whiteAlpha60 },
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
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glowCyan: {
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
};
