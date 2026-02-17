/**
 * GlassButton Component
 * Interactive glassmorphism button with haptic feedback and animations
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GLASS, COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

interface GlassButtonProps {
  onPress: () => void;
  title?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gradient?: string[];
  borderColor?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  hapticFeedback?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const GlassButton: React.FC<GlassButtonProps> = ({
  onPress,
  title,
  icon,
  style,
  gradient,
  borderColor,
  disabled = false,
  size = 'medium',
  variant = 'primary',
  hapticFeedback = true,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  // Size configurations
  const sizeConfig = {
    small: { padding: 12, fontSize: TYPOGRAPHY.buttonSmall.fontSize },
    medium: { padding: 16, fontSize: TYPOGRAPHY.button.fontSize },
    large: { padding: 20, fontSize: TYPOGRAPHY.buttonLarge.fontSize },
  };

  const { padding, fontSize } = sizeConfig[size];

  // Variant configurations
  const getVariantGradient = () => {
    if (gradient) return gradient;

    switch (variant) {
      case 'primary':
        return ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)'];
      case 'secondary':
        return ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'];
      case 'outline':
        return ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'];
      default:
        return ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)'];
    }
  };

  // Handle press in (button down)
  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handle press out (button up)
  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  };

  // Handle press
  const handlePress = () => {
    if (disabled) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.container, { transform: [{ scale }] }, style]}
    >
        <BlurView intensity={60} tint="dark" style={styles.blur}>
          <LinearGradient
            colors={getVariantGradient()}
            style={[
              styles.gradient,
              {
                padding,
                borderWidth: variant === 'outline' ? 1 : 0,
                borderColor: borderColor || GLASS.border,
              },
            ]}
          >
            <View style={styles.content}>
              {icon && <View style={styles.icon}>{icon}</View>}
              {title && (
                <Text
                  style={[
                    styles.title,
                    { fontSize },
                    disabled && styles.disabledText,
                  ]}
                >
                  {title}
                </Text>
              )}
            </View>
          </LinearGradient>
        </BlurView>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: GLASS.border,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 4,
  },
  blur: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  gradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.button.fontWeight,
    letterSpacing: TYPOGRAPHY.button.letterSpacing,
  },
  disabledText: {
    color: COLORS.textDisabled,
  },
});

export default GlassButton;
