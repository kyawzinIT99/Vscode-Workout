/**
 * GradientBackground Component
 * Static gradient background for screens
 */

import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BACKGROUND_GRADIENTS } from '../../constants/colors';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: string[];
  animated?: boolean;
  animationDuration?: number;
  locations?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  colors = BACKGROUND_GRADIENTS.darkBase,
  locations = [0, 0.5, 1],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}) => {
  return (
    <LinearGradient
      colors={colors}
      style={[styles.gradient, style]}
      start={start}
      end={end}
      locations={locations}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientBackground;
