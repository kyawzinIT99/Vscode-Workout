/**
 * Animation Constants
 * Timing, easing, and animation presets for smooth 60fps animations
 */

// Animation Durations (in milliseconds)
export const DURATIONS = {
  instant: 0,
  fast: 200,
  normal: 300,
  moderate: 400,
  slow: 500,
  slower: 700,
  slowest: 1000,
};

// Easing Functions (for use with Animated API)
export const EASING = {
  // Standard easing curves
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Custom bezier curves (can be used with react-native-reanimated)
  easeInQuad: [0.55, 0.085, 0.68, 0.53],
  easeOutQuad: [0.25, 0.46, 0.45, 0.94],
  easeInOutQuad: [0.455, 0.03, 0.515, 0.955],

  easeInCubic: [0.55, 0.055, 0.675, 0.19],
  easeOutCubic: [0.215, 0.61, 0.355, 1],
  easeInOutCubic: [0.645, 0.045, 0.355, 1],

  // Bounce
  easeInBounce: [0.6, -0.28, 0.735, 0.045],
  easeOutBounce: [0.175, 0.885, 0.32, 1.275],
};

// Spring Physics (for react-native-reanimated spring animations)
export const SPRING_CONFIGS = {
  // Gentle spring - smooth, subtle
  gentle: {
    stiffness: 80,
    damping: 15,
    mass: 1,
  },

  // Standard spring - balanced feel
  standard: {
    stiffness: 100,
    damping: 10,
    mass: 1,
  },

  // Bouncy spring - playful, energetic
  bouncy: {
    stiffness: 150,
    damping: 8,
    mass: 1,
  },

  // Snappy spring - quick, responsive
  snappy: {
    stiffness: 200,
    damping: 12,
    mass: 0.8,
  },

  // Wobbly spring - exaggerated bounce
  wobbly: {
    stiffness: 180,
    damping: 6,
    mass: 1.2,
  },
};

// Animation Presets
export const ANIMATIONS = {
  // Fade animations
  fadeIn: {
    duration: DURATIONS.normal,
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    duration: DURATIONS.normal,
    from: { opacity: 1 },
    to: { opacity: 0 },
  },

  // Scale animations
  scaleIn: {
    duration: DURATIONS.normal,
    from: { scale: 0 },
    to: { scale: 1 },
  },
  scaleOut: {
    duration: DURATIONS.normal,
    from: { scale: 1 },
    to: { scale: 0 },
  },
  scaleBounce: {
    // Button press animation: shrink → grow → settle
    duration: DURATIONS.moderate,
    keyframes: [
      { scale: 1 },
      { scale: 0.95 },
      { scale: 1.05 },
      { scale: 1 },
    ],
  },

  // Slide animations
  slideInLeft: {
    duration: DURATIONS.normal,
    from: { translateX: -100, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
  },
  slideInRight: {
    duration: DURATIONS.normal,
    from: { translateX: 100, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
  },
  slideInUp: {
    duration: DURATIONS.normal,
    from: { translateY: 100, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
  },
  slideInDown: {
    duration: DURATIONS.normal,
    from: { translateY: -100, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
  },

  // Rotate animations
  rotate: {
    duration: DURATIONS.slow,
    from: { rotate: '0deg' },
    to: { rotate: '360deg' },
  },

  // Pulse animation
  pulse: {
    duration: DURATIONS.slow,
    loop: true,
    keyframes: [
      { scale: 1, opacity: 1 },
      { scale: 1.05, opacity: 0.9 },
      { scale: 1, opacity: 1 },
    ],
  },

  // Shake animation (for errors)
  shake: {
    duration: DURATIONS.moderate,
    keyframes: [
      { translateX: 0 },
      { translateX: -10 },
      { translateX: 10 },
      { translateX: -10 },
      { translateX: 10 },
      { translateX: 0 },
    ],
  },

  // Shimmer (for loading states)
  shimmer: {
    duration: DURATIONS.slowest,
    loop: true,
    from: { translateX: -100 },
    to: { translateX: 100 },
  },
};

// Stagger Delays (for animating lists)
export const STAGGER = {
  fast: 50,
  normal: 100,
  slow: 150,
};

// Gesture Animation Values
export const GESTURE = {
  // Swipe thresholds
  swipeVelocityThreshold: 500,
  swipeDistanceThreshold: 100,

  // Scale values for press
  pressScale: 0.95,
  activeScale: 1.05,

  // Drag resistance
  dragResistance: 0.5,
};

// Layout Animation Presets (for LayoutAnimation API)
export const LAYOUT_ANIMATIONS = {
  spring: {
    duration: DURATIONS.normal,
    create: {
      type: 'spring',
      property: 'opacity',
      springDamping: 0.7,
    },
    update: {
      type: 'spring',
      springDamping: 0.7,
    },
    delete: {
      type: 'spring',
      property: 'opacity',
      springDamping: 0.7,
    },
  },
  linear: {
    duration: DURATIONS.normal,
    create: {
      type: 'linear',
      property: 'opacity',
    },
    update: {
      type: 'linear',
    },
    delete: {
      type: 'linear',
      property: 'opacity',
    },
  },
  easeInEaseOut: {
    duration: DURATIONS.normal,
    create: {
      type: 'easeInEaseOut',
      property: 'opacity',
    },
    update: {
      type: 'easeInEaseOut',
    },
    delete: {
      type: 'easeInEaseOut',
      property: 'opacity',
    },
  },
};

// Timer Animation Values
export const TIMER_ANIMATION = {
  countdownDuration: 1000, // 1 second per count
  pulseScale: 1.1,
  completionScale: 1.3,
};

// Progress Bar Animation
export const PROGRESS_ANIMATION = {
  fillDuration: DURATIONS.moderate,
  updateInterval: 100, // Update every 100ms for smooth progress
};

// Export default
export default {
  DURATIONS,
  EASING,
  SPRING_CONFIGS,
  ANIMATIONS,
  STAGGER,
  GESTURE,
  LAYOUT_ANIMATIONS,
  TIMER_ANIMATION,
  PROGRESS_ANIMATION,
};
