// Agri-Fintech Design Tokens — High-contrast, premium, outdoor-friendly

export const COLORS = {
  // Primary Palette (Emerald Forest)
  primary: '#15803D',       // Main CTA, brand authority
  primaryDark: '#166534',   // Headers, active accents
  primaryLight: '#22C55E',  // Success states, highlights
  primarySurface: '#ECFDF5',// Soft badge / card tint

  // Accent Palette (Harvest Amber / Wheat Gold)
  accent: '#F59E0B',        // Attention, token badges, MSP highlights
  accentDark: '#D97706',    // Deep amber
  accentLight: '#FEF3C7',   // Light amber background

  // Secondary Accents
  info: '#2563EB',          // Blue for scheduling/info
  infoSurface: '#EFF6FF',
  warning: '#EA580C',       // Pending / delay
  warningSurface: '#FFF7ED',
  danger: '#DC2626',        // Rejections, errors
  dangerSurface: '#FEF2F2',

  // Neutrals & Surfaces
  background: '#F8FAFC',    // Light slate background
  surface: '#FFFFFF',       // Crisp white cards
  surfaceMuted: '#F1F5F9',  // Input backgrounds, divider fills
  border: '#E2E8F0',        // Subtle card borders
  borderLight: '#F1F5F9',

  // Typography Colors
  textPrimary: '#0F172A',   // High readability outdoor dark slate
  textSecondary: '#475569', // Subtext, labels
  textMuted: '#94A3B8',     // Placeholders, timestamps
  textInverse: '#FFFFFF',

  // Gradients
  gradientGreen: ['#15803D', '#166534'] as const,
  gradientAmber: ['#F59E0B', '#D97706'] as const,
  gradientDark: ['#1E293B', '#0F172A'] as const,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};
