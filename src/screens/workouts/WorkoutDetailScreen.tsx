/**
 * WorkoutDetailScreen
 * Preview workout details before starting
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS, getColorForDifficulty } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { WorkoutProgram, Exercise } from '../../types/workout.types';
import workoutsData from '../../data/workouts.json';
import exercisesData from '../../data/exercises.json';

const WorkoutDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { startWorkout } = useWorkoutContext();
  const { workoutId } = route.params as { workoutId: string };

  const [workout, setWorkout] = useState<WorkoutProgram | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const found = (workoutsData as WorkoutProgram[]).find((w) => w.id === workoutId);
    if (found) {
      setWorkout(found);

      // Load exercise details
      const exerciseDetails = found.exercises
        .map((we) => {
          const ex = (exercisesData as Exercise[]).find((e) => e.id === we.exerciseId);
          return ex;
        })
        .filter((ex) => ex !== undefined) as Exercise[];

      setExercises(exerciseDetails);
    }
  }, [workoutId]);

  const handleStartWorkout = () => {
    if (workout) {
      startWorkout(workout);
      navigation.navigate('ActiveWorkout' as never);
    }
  };

  if (!workout) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Workout not found</Text>
          <GlassButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </GradientBackground>
    );
  }

  const difficultyColor = getColorForDifficulty(workout.difficulty);

  return (
    <GradientBackground colors={workout.gradientColors}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Workout Info */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{workout.iconEmoji}</Text>
          <Text style={styles.title}>{workout.name}</Text>
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

        {/* Description */}
        <GlassCard style={styles.card}>
          <Text style={styles.description}>{workout.description}</Text>
        </GlassCard>

        {/* Stats */}
        <GlassCard style={styles.card}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.estimatedDuration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.estimatedCalories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.exercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.completionCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </GlassCard>

        {/* Equipment Needed */}
        {workout.equipment.length > 0 && (
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>🏋️ Equipment Needed</Text>
            <View style={styles.tagContainer}>
              {workout.equipment.map((equip) => (
                <View key={equip} style={styles.tag}>
                  <Text style={styles.tagText}>{equip.replace('_', ' ')}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Exercises List */}
        <Text style={styles.sectionTitle}>Exercises ({exercises.length})</Text>
        {workout.exercises.map((workoutEx, index) => {
          const exercise = exercises.find((e) => e.id === workoutEx.exerciseId);
          if (!exercise) return null;

          return (
            <TouchableOpacity
              key={`${workoutEx.exerciseId}_${index}`}
              onPress={() => navigation.navigate('ExerciseDetail' as never, { exerciseId: exercise.id } as never)}
            >
              <GlassCard style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {workoutEx.sets} sets × {workoutEx.reps || workoutEx.duration + 's'}
                      {' • '}
                      {workoutEx.restTime}s rest
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        })}

        {/* Start Button */}
        <GlassButton
          title="Start Workout"
          onPress={handleStartWorkout}
          size="large"
          style={styles.startButton}
        />
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
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    ...TYPOGRAPHY.captionBold,
    fontSize: 11,
  },
  card: {
    marginBottom: 16,
    padding: 20,
  },
  description: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '40%',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  exerciseCard: {
    marginBottom: 12,
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    ...TYPOGRAPHY.h5,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  exerciseMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  startButton: {
    marginTop: 16,
  },
});

export default WorkoutDetailScreen;
