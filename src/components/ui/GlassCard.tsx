/**
 * GlassCard Component
 * Core glassmorphism component with frosted glass effect
 * Used throughout the app for premium visual design
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GLASS, SHADOWS } from '../../constants/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number; // Blur intensity (0-100)
  tint?: 'light' | 'dark' | 'default'; // Blur tint
  gradient?: string[]; // Custom gradient colors
  borderColor?: string; // Custom border color
  padding?: number; // Internal padding
  borderRadius?: number; // Corner radius
  noBorder?: boolean; // Disable border
  noShadow?: boolean; // Disable shadow
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 80,
  tint = 'dark',
  gradient,
  borderColor,
  padding = 16,
  borderRadius = 16,
  noBorder = false,
  noShadow = false,
}) => {
  const defaultGradient = [
    'rgba(255, 255, 255, 0.1)',
    'rgba(255, 255, 255, 0.05)',
  ];

  const borderStyle = noBorder
    ? {}
    : {
        borderWidth: 1,
        borderColor: borderColor || GLASS.border,
      };

  const shadowStyle = noShadow
    ? {}
    : {
        shadowColor: SHADOWS.glass,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 32,
        elevation: 8, // Android shadow
      };

  return (
    <View
      style={[
        styles.container,
        shadowStyle,
        { borderRadius },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.blur, { borderRadius }]}
      >
        <LinearGradient
          colors={gradient || defaultGradient}
          style={[styles.gradient, { borderRadius, padding }]}
        >
          <View
            style={[
              styles.content,
              borderStyle,
              { borderRadius },
            ]}
          >
            {children}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  blur: {
    overflow: 'hidden',
  },
  gradient: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});

export default GlassCard;
