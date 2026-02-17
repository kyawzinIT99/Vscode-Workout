/**
 * ActiveWorkoutScreen
 * Main screen for active workout session
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const ActiveWorkoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    activeSession,
    currentWorkout,
    currentExerciseIndex,
    completeSet,
    nextExercise,
    endWorkout
  } = useWorkoutContext();
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  // Auto-advance on rest timer completion
  useEffect(() => {
    if (isResting && restTimer > 0) {
      const timer = setTimeout(() => {
        setRestTimer(restTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isResting && restTimer === 0) {
      setIsResting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [isResting, restTimer]);

  if (!activeSession || !currentWorkout) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No active workout</Text>
          <GlassButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </GradientBackground>
    );
  }

  const currentExercise = currentWorkout.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / currentWorkout.exercises.length) * 100;
  const totalSets = currentExercise.sets;
  const completedSets = activeSession.exercisesCompleted[currentExerciseIndex]?.sets.filter(s => s.completed).length || 0;

  const handleCompleteSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    completeSet(currentExerciseIndex, currentSetIndex, {
      reps: currentExercise.reps,
      duration: currentExercise.duration,
      restTaken: currentExercise.restTime,
    });
    if (currentSetIndex < totalSets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    }
    if (currentExercise.restTime && currentExercise.restTime > 0) {
      setRestTimer(currentExercise.restTime);
      setIsResting(true);
    }
  };

  const handleNextExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    nextExercise();
    setIsResting(false);
    setRestTimer(0);
    setCurrentSetIndex(0);
  };

  const handleEndWorkout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    endWorkout();
    navigation.goBack();
  };

  const allSetsCompleted = completedSets >= totalSets;
  const isLastExercise = currentExerciseIndex === currentWorkout.exercises.length - 1;

  return (
    <GradientBackground colors={GRADIENTS.fire}>
      <View style={styles.container}>
        {/* Scrollable: header + cards only */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleEndWorkout} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.workoutTitle}>{activeSession.workoutName}</Text>
          </View>

          {/* Progress Bar */}
          <GlassCard style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Exercise {currentExerciseIndex + 1} of {currentWorkout.exercises.length}
              </Text>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <View style={styles.setProgress}>
              <Text style={styles.setProgressText}>
                Set {Math.min(currentSetIndex + 1, totalSets)} of {totalSets} • {completedSets} completed
              </Text>
              {allSetsCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#38EF7D" />
                  <Text style={styles.completedBadgeText}>All sets done!</Text>
                </View>
              )}
            </View>
          </GlassCard>

          {/* Current Exercise */}
          <GlassCard style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>
              {currentExercise.exerciseId.replace('ex_', '').replace(/_001$/, '').replace(/_/g, ' ')}
            </Text>
            <View style={styles.exerciseDetails}>
              {currentExercise.sets && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Sets</Text>
                  <Text style={styles.detailValue}>{currentExercise.sets}</Text>
                </View>
              )}
              {currentExercise.reps && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Reps</Text>
                  <Text style={styles.detailValue}>{currentExercise.reps}</Text>
                </View>
              )}
              {currentExercise.duration && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Sec</Text>
                  <Text style={styles.detailValue}>{currentExercise.duration}</Text>
                </View>
              )}
            </View>
          </GlassCard>

          {/* Rest Timer */}
          {isResting && (
            <GlassCard style={styles.restCard} gradient={GRADIENTS.ocean}>
              <Text style={styles.restTitle}>Rest Time</Text>
              <Text style={styles.restTimer}>{restTimer}s</Text>
              <Text style={styles.restMessage}>Get ready for the next set!</Text>
            </GlassCard>
          )}
        </ScrollView>

        {/* Fixed Bottom Bar — always visible */}
        <View style={styles.bottomBar}>
          {!allSetsCompleted && (
            <GlassButton
              title={isResting ? `Resting ${restTimer}s...` : 'Complete Set'}
              onPress={handleCompleteSet}
              size="large"
              variant="primary"
              disabled={isResting}
              style={styles.actionButton}
              icon={<Ionicons name="checkmark-circle" size={22} color={COLORS.white} />}
            />
          )}

          {!isLastExercise && (
            <GlassButton
              title="Next Exercise"
              onPress={handleNextExercise}
              size="large"
              variant="secondary"
              style={styles.actionButton}
              icon={<Ionicons name="arrow-forward-circle" size={22} color={COLORS.white} />}
            />
          )}

          {isLastExercise && (
            <GlassButton
              title="Finish Workout"
              onPress={handleEndWorkout}
              size="large"
              variant="primary"
              gradient={GRADIENTS.cosmos}
              style={styles.actionButton}
            />
          )}

          <TouchableOpacity onPress={handleEndWorkout} style={styles.endButton}>
            <Text style={styles.endButtonText}>End Workout Early</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 60,
    paddingBottom: 20,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    flex: 1,
  },
  progressCard: {
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  progressPercentage: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  setProgress: {
    marginTop: 12,
    alignItems: 'center',
  },
  setProgressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(56, 239, 125, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completedBadgeText: {
    ...TYPOGRAPHY.caption,
    color: '#38EF7D',
    fontWeight: '600',
  },
  exerciseCard: {
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  exerciseName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 32,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  restCard: {
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  restTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  restMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Fixed bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 20 : 34,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    gap: 10,
  },
  actionButton: {
    width: '100%',
  },
  endButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  endButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default ActiveWorkoutScreen;
