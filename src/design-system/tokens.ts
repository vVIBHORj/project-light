export const colors = {
  // Brand & Accent
  primary: '#2F80ED',
  verified: '#2D9CFF',
  safety: '#0E9F8E',
  destructive: '#E5484D',

  // Navy / Orb
  orbNavy: '#0A1A4A',
  orbRimGlow: '#3B82F6',
  orbRing: '#FFFFFF',

  // Text
  textPrimary: '#0B0F1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLink: '#2F80ED',
  textOnDark: '#FFFFFF',

  // Intents
  intent: {
    friendship: '#34C759',
    dating: '#FF6B5B',
    community: '#2F80ED',
    explore: '#8B5CF6',
  },

  // Gradients
  gradients: {
    sky: ['#DDEBFB', '#BBD6F8', '#A9C4F5'] as const,
    homeHeader: ['#C9F0FF', '#8EC5FF'] as const,
    orb: ['#1A2E70', '#0A1A4A', '#040C24'] as const,
    cardPhotoOverlay: ['rgba(74, 144, 226, 0.0)', 'rgba(74, 144, 226, 0.58)'] as const,
    cardDarkOverlay: ['transparent', 'rgba(11, 15, 26, 0.85)'] as const,
    glassHighlight: ['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.1)'] as const,
    categoryBlue: ['#4FACFE', '#00F2FE'] as const,
    categoryPurple: ['#C471ED', '#F64F59'] as const,
    categoryGreen: ['#43E97B', '#38F9D7'] as const,
    categoryOrange: ['#FA709A', '#FEE140'] as const,
    categoryRed: ['#FF5858', '#F09819'] as const,
  },

  // Glass & Backgrounds
  glass: {
    background: 'rgba(255, 255, 255, 0.45)',
    backgroundFallback: 'rgba(255, 255, 255, 0.82)',
    border: 'rgba(255, 255, 255, 0.7)',
    borderSubtle: 'rgba(255, 255, 255, 0.35)',
    topHighlight: 'rgba(255, 255, 255, 0.9)',
  },

  // UI Surfaces
  surface: '#FFFFFF',
  surfaceSoft: '#F3F6FB',
  border: '#E2E8F0',
  trackBackground: 'rgba(11, 15, 26, 0.08)',
  trackFill: '#0B0F1A',
};

export const typography = {
  fontFamily: {
    display: 'Chewy',
    sans: 'Inter',
  },
  fontSize: {
    hero: 32,
    screenTitle: 24,
    sectionTitle: 20,
    body: 16,
    caption: 13,
    chip: 12,
    tabLabel: 11,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    hero: 38,
    screenTitle: 30,
    sectionTitle: 26,
    body: 22.4, // 16 * 1.4
    caption: 18,
    chip: 16,
    tabLabel: 14,
  },
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  categoryIcon: 18,
  card: 28,
  bottomSheet: 32,
  pill: 999,
  full: 999,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPadding: 16,
  minTouchTarget: 44,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  chip: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#2F80ED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  phone: {
    shadowColor: '#2F80ED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 10,
  },
  orbGlow: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 8,
  },
};

export const motion = {
  spring: {
    damping: 20,
    stiffness: 150,
    mass: 0.8,
  },
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
    radarPulseDuration: 2000,
  },
};

export const tokens = {
  colors,
  typography,
  radii,
  spacing,
  shadows,
  motion,
};

export default tokens;
