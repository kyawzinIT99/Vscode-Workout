/**
 * ExerciseDetailScreen
 * Detailed view of a single exercise with YouTube player
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import YouTubePlayer from '../../components/video/YouTubePlayer';
import { COLORS, CATEGORY_COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Exercise } from '../../types/workout.types';
import exercisesData from '../../data/exercises.json';

const ExerciseDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { exerciseId } = route.params as { exerciseId: string };
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const found = (exercisesData as Exercise[]).find((ex) => ex.id === exerciseId);
    setExercise(found || null);
  }, [exerciseId]);

  if (!exercise) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Exercise not found</Text>
          <GlassButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </GradientBackground>
    );
  }

  const difficultyColor = CATEGORY_COLORS[exercise.difficulty] || COLORS.primary;

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: difficultyColor + '30' }]}>
            <Text style={[styles.badgeText, { color: difficultyColor }]}>
              {exercise.difficulty.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: COLORS.primary + '30' }]}>
            <Text style={[styles.badgeText, { color: COLORS.primary }]}>
              {exercise.category.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* YouTube Player */}
        <GlassCard style={styles.videoCard} noBorder>
          <YouTubePlayer videoId={exercise.videoId} height={220} />
        </GlassCard>

        {/* Description */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{exercise.description}</Text>
        </GlassCard>

        {/* Muscle Groups */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Target Muscles</Text>
          <View style={styles.tagContainer}>
            {exercise.muscleGroups.map((muscle) => (
              <View key={muscle} style={styles.tag}>
                <Text style={styles.tagText}>{muscle.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Instructions */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {exercise.instructions.map((instruction, index) => (
            <View key={`instruction-${index}`} style={styles.instructionRow}>
              <Text style={styles.instructionNumber}>{index + 1}.</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Tips */}
        {exercise.tips.length > 0 && (
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>💡 Tips</Text>
            {exercise.tips.map((tip, index) => (
              <Text key={`tip-${index}`} style={styles.tipText}>
                • {tip}
              </Text>
            ))}
          </GlassCard>
        )}

        {/* Common Mistakes */}
        {exercise.commonMistakes.length > 0 && (
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>⚠️ Common Mistakes</Text>
            {exercise.commonMistakes.map((mistake, index) => (
              <Text key={`mistake-${index}`} style={styles.mistakeText}>
                • {mistake}
              </Text>
            ))}
          </GlassCard>
        )}

        {/* Default Sets/Reps */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Recommended</Text>
          <View style={styles.statsRow}>
            {exercise.defaultSets && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{exercise.defaultSets}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>
            )}
            {exercise.defaultReps && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{exercise.defaultReps}</Text>
                <Text style={styles.statLabel}>Reps</Text>
              </View>
            )}
            {exercise.defaultDuration && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{exercise.defaultDuration}s</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{exercise.restTime}s</Text>
              <Text style={styles.statLabel}>Rest</Text>
            </View>
          </View>
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
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
  videoCard: {
    marginBottom: 16,
    padding: 0,
  },
  card: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
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
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.primary,
    fontWeight: 'bold',
    width: 30,
  },
  instructionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 24,
  },
  tipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  mistakeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
});

export default ExerciseDetailScreen;
