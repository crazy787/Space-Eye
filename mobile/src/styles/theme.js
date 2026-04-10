// Space-Eye - Design System
export const COLORS = {
  // Primary palette - Deep space blues
  primary: '#6C63FF',
  primaryLight: '#8B83FF',
  primaryDark: '#4A42DB',

  // Accent - Cosmic orange/amber
  accent: '#FF6B35',
  accentLight: '#FF8A5C',
  accentDark: '#E55A2B',

  // Backgrounds - Deep space
  bgPrimary: '#0B0D17',
  bgSecondary: '#151829',
  bgTertiary: '#1E2140',
  bgCard: 'rgba(30, 33, 64, 0.8)',
  bgGlass: 'rgba(108, 99, 255, 0.08)',

  // Surface colors
  surface: '#1A1D35',
  surfaceLight: '#252847',
  surfaceBorder: 'rgba(108, 99, 255, 0.2)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A3BD',
  textMuted: '#6B6F8D',
  textAccent: '#6C63FF',

  // Status colors
  success: '#00D68F',
  warning: '#FFAA00',
  error: '#FF3D71',
  info: '#00B4D8',

  // ISS specific
  issColor: '#00D68F',
  orbitColor: 'rgba(0, 214, 143, 0.4)',
  earthBlue: '#1B4F72',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#6C63FF', '#4A42DB'],
  gradientAccent: ['#FF6B35', '#E55A2B'],
  gradientDark: ['#0B0D17', '#151829'],
  gradientCard: ['rgba(30, 33, 64, 0.9)', 'rgba(21, 24, 41, 0.9)'],
  gradientGlow: ['#6C63FF', '#00D68F'],
  gradientSunrise: ['#FF6B35', '#FFAA00'],
  gradientSpace: ['#0B0D17', '#1A1D35', '#252847'],

  // Transparency
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const FONT_SIZES = {
  caption: 11,
  small: 12,
  body: 14,
  bodyLarge: 16,
  subtitle: 18,
  title: 22,
  heading: 28,
  hero: 36,
  display: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};

export default {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  SHADOWS,
};
