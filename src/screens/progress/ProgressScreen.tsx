/**
 * ProgressScreen
 * View workout stats and progress
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const ProgressScreen: React.FC = () => {
  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>

        <GlassCard style={styles.card} gradient={GRADIENTS.forest}>
          <Text style={styles.statLabel}>CURRENT STREAK</Text>
          <Text style={styles.statValue}>7 Days 🔥</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.statLabel}>TOTAL WORKOUTS</Text>
          <Text style={styles.statValue}>24</Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.statLabel}>TOTAL MINUTES</Text>
          <Text style={styles.statValue}>780</Text>
        </GlassCard>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  card: {
    marginBottom: 16,
    padding: 20,
    alignItems: 'center',
  },
  statLabel: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    ...TYPOGRAPHY.number,
    color: COLORS.textPrimary,
  },
});

export default ProgressScreen;
