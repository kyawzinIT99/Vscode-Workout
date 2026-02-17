/**
 * Color System & Gradients
 * Premium color palette for glassmorphism workout app
 */

// Gradient Palettes for Workout Categories
export const GRADIENTS = {
  // Strength workouts - Warm, energetic
  sunrise: ['#FF6B6B', '#FF8E53', '#FFA500'],

  // Cardio workouts - Calm, focused
  ocean: ['#667EEA', '#764BA2', '#F093FB'],

  // Flexibility workouts - Fresh, renewal
  forest: ['#11998E', '#38EF7D', '#78FFD6'],

  // Yoga workouts - Premium, futuristic
  cosmos: ['#4A00E0', '#8E2DE2', '#DA22FF'],

  // HIIT workouts - Intense, powerful
  fire: ['#F83600', '#FE8C00', '#FFDD00'],

  // General/Mixed workouts
  sunset: ['#FA709A', '#FEE140', '#FFC371'],
};

// Background Gradients
export const BACKGROUND_GRADIENTS = {
  // Deep, immersive
  darkBase: ['#0F0C29', '#302B63', '#24243E'],

  // Elegant, professional
  midnight: ['#000428', '#004E92', '#1A2980'],

  // Sophisticated
  twilight: ['#1F1C2C', '#928DAB', '#524A7B'],

  // Dynamic background
  space: ['#000000', '#1a1a2e', '#16213e'],

  // Light mode backgrounds
  lightBase: ['#E0E7FF', '#C7D2FE', '#A5B4FC'],
  lightOcean: ['#DBEAFE', '#BFDBFE', '#93C5FD'],
  lightSunrise: ['#FEE2E2', '#FECACA', '#FCA5A5'],
};

// Glassmorphism Colors
export const GLASS = {
  // Semi-transparent backgrounds
  background: 'rgba(255, 255, 255, 0.1)',
  backgroundLight: 'rgba(255, 255, 255, 0.15)',
  backgroundDark: 'rgba(255, 255, 255, 0.05)',

  // Borders
  border: 'rgba(255, 255, 255, 0.18)',
  borderLight: 'rgba(255, 255, 255, 0.25)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.5)',
};

// Shadow Colors
export const SHADOWS = {
  glass: 'rgba(31, 38, 135, 0.37)',
  dark: 'rgba(0, 0, 0, 0.5)',
  colored: 'rgba(100, 100, 200, 0.4)',
};

// UI Colors
export const COLORS = {
  // Primary
  primary: '#667EEA',
  primaryDark: '#4A5FBF',
  primaryLight: '#8E9FFF',

  // Accent
  accent: '#F093FB',
  accentDark: '#C070D6',
  accentLight: '#FFB3FF',

  // Status
  success: '#38EF7D',
  warning: '#FEE140',
  error: '#FF6B6B',
  info: '#667EEA',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',

  // Grays
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Text (Dark mode - default)
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  textDisabled: 'rgba(255, 255, 255, 0.3)',

  // Background
  background: '#0F0C29',
  backgroundSecondary: '#1a1a2e',
};

// Light Mode Colors
export const COLORS_LIGHT = {
  // Primary (same as dark)
  primary: '#667EEA',
  primaryDark: '#4A5FBF',
  primaryLight: '#8E9FFF',

  // Accent (same as dark)
  accent: '#F093FB',
  accentDark: '#C070D6',
  accentLight: '#FFB3FF',

  // Status (same as dark)
  success: '#38EF7D',
  warning: '#FEE140',
  error: '#FF6B6B',
  info: '#667EEA',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',

  // Grays (same as dark)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Text (Light mode - dark text on light backgrounds)
  textPrimary: '#111827',
  textSecondary: 'rgba(17, 24, 39, 0.7)',
  textTertiary: 'rgba(17, 24, 39, 0.5)',
  textDisabled: 'rgba(17, 24, 39, 0.3)',

  // Background
  background: '#F9FAFB',
  backgroundSecondary: '#FFFFFF',
};

// Category Colors (for muscle groups, difficulty, etc.)
export const CATEGORY_COLORS = {
  // Muscle Groups
  chest: '#FF6B6B',
  back: '#667EEA',
  shoulders: '#FFA500',
  arms: '#F093FB',
  legs: '#11998E',
  core: '#8E2DE2',
  cardio: '#FE8C00',
  fullBody: '#FA709A',

  // Difficulty
  beginner: '#38EF7D',
  intermediate: '#FEE140',
  advanced: '#FF6B6B',

  // Equipment
  noEquipment: '#78FFD6',
  dumbbells: '#764BA2',
  barbell: '#FF8E53',
  resistance: '#DA22FF',
};

// Gradient Helper Functions
export const getGradientForCategory = (category: string): string[] => {
  const categoryMap: { [key: string]: string[] } = {
    strength: GRADIENTS.sunrise,
    cardio: GRADIENTS.ocean,
    flexibility: GRADIENTS.forest,
    yoga: GRADIENTS.cosmos,
    hiit: GRADIENTS.fire,
    hybrid: GRADIENTS.sunset,
  };

  return categoryMap[category.toLowerCase()] || GRADIENTS.ocean;
};

export const getColorForDifficulty = (difficulty: string): string => {
  const difficultyMap: { [key: string]: string } = {
    beginner: CATEGORY_COLORS.beginner,
    intermediate: CATEGORY_COLORS.intermediate,
    advanced: CATEGORY_COLORS.advanced,
  };

  return difficultyMap[difficulty.toLowerCase()] || CATEGORY_COLORS.intermediate;
};

// Theme-aware color getter
export const getThemeColors = (isDark: boolean) => {
  return isDark ? COLORS : COLORS_LIGHT;
};

// Theme-aware background gradient getter
export const getThemeBackgroundGradients = (isDark: boolean) => {
  if (isDark) {
    return BACKGROUND_GRADIENTS;
  }
  return {
    ...BACKGROUND_GRADIENTS,
    ocean: BACKGROUND_GRADIENTS.lightOcean,
    sunrise: BACKGROUND_GRADIENTS.lightSunrise,
    forest: BACKGROUND_GRADIENTS.lightBase,
  };
};

// Export default theme
export default {
  GRADIENTS,
  BACKGROUND_GRADIENTS,
  GLASS,
  SHADOWS,
  COLORS,
  COLORS_LIGHT,
  CATEGORY_COLORS,
  getGradientForCategory,
  getColorForDifficulty,
  getThemeColors,
  getThemeBackgroundGradients,
};
