/**
 * ActiveWorkoutScreen
 * Main screen for active workout session
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { useUserContext } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import useTimer from '../../hooks/useTimer';
import useWorkoutSounds from '../../hooks/useWorkoutSounds';
import { shareText, getWorkoutShareMessage } from '../../services/sharing';

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
  const { user } = useUserContext();
  const [isResting, setIsResting] = useState(false);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  // Elapsed workout timer (counts up)
  const workoutTimer = useTimer({
    initialTime: 0,
    countdown: false,
    autoStart: true,
  });

  const soundEnabled = user?.preferences?.soundEffects !== false;
  const {
    playCountdown,
    playWorkoutStart,
    playLastThree,
    playRestStart,
    playNextSet,
    playFinish,
  } = useWorkoutSounds({ enabled: soundEnabled });

  // Play workout-start sound once on mount
  const didPlayStartRef = useRef(false);
  useEffect(() => {
    if (!didPlayStartRef.current) {
      didPlayStartRef.current = true;
      playWorkoutStart();
    }
  }, [playWorkoutStart]);

  const handleRestComplete = useCallback(() => {
    setIsResting(false);
    playNextSet();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [playNextSet]);

  const handleRestTick = useCallback((currentTime: number) => {
    if (currentTime > 0 && currentTime <= 3) {
      playLastThree();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (currentTime > 3) {
      playCountdown();
    }
  }, [playLastThree, playCountdown]);

  const restTimer = useTimer({
    initialTime: 0,
    countdown: true,
    onComplete: handleRestComplete,
    onTick: handleRestTick,
  });

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
      restTimer.setTime(currentExercise.restTime);
      restTimer.start();
      setIsResting(true);
      playRestStart();
    }
  };

  const handleSkipRest = () => {
    restTimer.stop();
    setIsResting(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNextExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    nextExercise();
    restTimer.stop();
    setIsResting(false);
    setCurrentSetIndex(0);
  };

  const handleEndWorkout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    restTimer.stop();
    workoutTimer.pause();

    const workoutName = activeSession.workoutName;
    const elapsedSeconds = workoutTimer.time;
    const calories = activeSession.estimatedCalories || 0;
    const completion = activeSession.completionRate || 0;

    playFinish();
    try {
      const message = getWorkoutShareMessage(workoutName, elapsedSeconds, calories, completion);
      await shareText(message);
    } catch {
      // User cancelled or sharing not available
    }

    endWorkout();
    navigation.goBack();
  };

  const allSetsCompleted = completedSets >= totalSets;
  const isLastExercise = currentExerciseIndex === currentWorkout.exercises.length - 1;

  // Format rest timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}:${secs.toString().padStart(2, '0')}`;
    return `${secs}`;
  };

  // Rest timer progress (0 to 1)
  const restProgress = currentExercise.restTime > 0
    ? 1 - (restTimer.time / currentExercise.restTime)
    : 0;

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
            <View style={styles.headerInfo}>
              <Text style={styles.workoutTitle}>{activeSession.workoutName}</Text>
              <View style={styles.elapsedRow}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.elapsedText}>
                  {Math.floor(workoutTimer.time / 60)}:{String(workoutTimer.time % 60).padStart(2, '0')}
                </Text>
              </View>
            </View>
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

              {/* Circular progress indicator */}
              <View style={styles.timerCircle}>
                <View style={styles.timerCircleInner}>
                  <Text style={[
                    styles.restTimer,
                    restTimer.time <= 3 && restTimer.time > 0 && styles.restTimerWarning,
                  ]}>
                    {formatTime(restTimer.time)}
                  </Text>
                  <Text style={styles.restTimerUnit}>
                    {restTimer.time <= 3 && restTimer.time > 0 ? 'GET READY' : 'seconds'}
                  </Text>
                </View>
                {/* Progress ring background */}
                <View style={[styles.progressRing, { opacity: 0.2 }]} />
                {/* Progress ring fill */}
                <View style={[
                  styles.progressRing,
                  {
                    borderColor: restTimer.time <= 3 ? '#FF6B6B' : '#667EEA',
                    borderRightColor: 'transparent',
                    transform: [{ rotate: `${restProgress * 360}deg` }],
                  },
                ]} />
              </View>

              <Text style={styles.restMessage}>Get ready for the next set!</Text>

              <TouchableOpacity style={styles.skipRestButton} onPress={handleSkipRest}>
                <Ionicons name="play-forward" size={18} color={COLORS.textSecondary} />
                <Text style={styles.skipRestText}>Skip Rest</Text>
              </TouchableOpacity>
            </GlassCard>
          )}
        </ScrollView>

        {/* Fixed Bottom Bar — always visible */}
        <View style={styles.bottomBar}>
          {!allSetsCompleted && (
            <GlassButton
              title={isResting ? `Resting ${formatTime(restTimer.time)}...` : 'Complete Set'}
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
  headerInfo: {
    flex: 1,
  },
  workoutTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  elapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  elapsedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
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
    marginBottom: 16,
  },
  timerCircle: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerCircleInner: {
    alignItems: 'center',
  },
  restTimer: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  restTimerWarning: {
    color: '#FF6B6B',
  },
  restTimerUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: -4,
  },
  progressRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  restMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  skipRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipRestText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
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
