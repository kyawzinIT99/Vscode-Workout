/**
 * WorkoutLibraryScreen
 * Browse and select workouts
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import { COLORS, getColorForDifficulty } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { WorkoutProgram } from '../../types/workout.types';
import workoutsData from '../../data/workouts.json';

/** Convert a 6-digit hex color to rgba with the given alpha (0–1) */
const hexToRgba = (hex: string, alpha: number): string => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const WorkoutLibraryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [workouts, setWorkouts] = useState<WorkoutProgram[]>([]);

  useEffect(() => {
    setWorkouts(workoutsData as WorkoutProgram[]);
  }, []);

  const renderItem = ({ item: workout }: { item: WorkoutProgram }) => {
    const difficultyColor = getColorForDifficulty(workout.difficulty);
    // Convert hex gradient colors to rgba to avoid 8-digit hex Android crash
    const safeGradient = workout.gradientColors.map((c) => hexToRgba(c, 0.19));

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('WorkoutDetail' as never, { workoutId: workout.id } as never)}
      >
        <GlassCard style={styles.card} gradient={safeGradient}>
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>{workout.iconEmoji}</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <View style={styles.metaRow}>
                <View style={[styles.badge, { backgroundColor: difficultyColor + '30' }]}>
                  <Text style={[styles.badgeText, { color: difficultyColor }]}>
                    {workout.difficulty.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: COLORS.primary + '30' }]}>
                  <Text style={[styles.badgeText, { color: COLORS.primary }]}>
                    {workout.category.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.description}>{workout.description}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.stat}>{workout.estimatedDuration} min</Text>
            <Text style={styles.stat}>•</Text>
            <Text style={styles.stat}>{workout.exercises.length} exercises</Text>
            <Text style={styles.stat}>•</Text>
            <Text style={styles.stat}>{workout.estimatedCalories} cal</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Workouts</Text>
            <Text style={styles.subtitle}>Choose your workout program</Text>
          </>
        }
      />
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
    paddingBottom: 100,
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
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 40,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  workoutName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});

export default WorkoutLibraryScreen;
