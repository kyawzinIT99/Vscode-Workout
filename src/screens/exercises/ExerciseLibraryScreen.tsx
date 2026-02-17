/**
 * ExerciseLibraryScreen
 * Browse exercise library
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import { COLORS, CATEGORY_COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { Exercise } from '../../types/workout.types';
import exercisesData from '../../data/exercises.json';

const ExerciseLibraryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    setExercises(exercisesData as Exercise[]);
  }, []);

  const renderItem = ({ item: exercise }: { item: Exercise }) => {
    const difficultyColor = CATEGORY_COLORS[exercise.difficulty] || COLORS.primary;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ExerciseDetail' as never, { exerciseId: exercise.id } as never)}
      >
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.thumbnail}>
              <Image
                source={{ uri: exercise.thumbnailUrl }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
              <View style={styles.playIcon}>
                <Text style={styles.playText}>▶</Text>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.badgeRow}>
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
              <Text style={styles.muscles} numberOfLines={1}>
                {exercise.muscleGroups.map((m) => m.replace('_', ' ')).join(', ')}
              </Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {exercise.description}
          </Text>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Exercises</Text>
            <Text style={styles.subtitle}>Browse all exercises with video guides</Text>
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
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playText: {
    color: COLORS.white,
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    fontWeight: 'bold',
  },
  muscles: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default ExerciseLibraryScreen;
