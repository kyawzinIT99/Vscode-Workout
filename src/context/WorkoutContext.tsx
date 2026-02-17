/**
 * WorkoutContext
 * Global state for active workout session
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  WorkoutProgram,
  WorkoutSession,
  CompletedExercise,
  CompletedSet,
  WorkoutContextState,
} from '../types/workout.types';
import { saveWorkoutSession } from '../services/storage';
import * as Haptics from 'expo-haptics';

interface WorkoutProviderProps {
  children: React.ReactNode;
}

const WorkoutContext = createContext<WorkoutContextState | undefined>(undefined);

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutProgram | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Start a new workout
  const startWorkout = useCallback((workout: WorkoutProgram) => {
    const session: WorkoutSession = {
      id: `session_${Date.now()}`,
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date(),
      duration: 0,
      exercisesCompleted: workout.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: '', // Will be populated from exercise data
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          reps: ex.reps,
          duration: ex.duration,
          completed: false,
          restTaken: 0,
        })),
        videoWatched: false,
      })),
      totalSets: workout.exercises.reduce((sum, ex) => sum + ex.sets, 0),
      totalReps: 0,
      estimatedCalories: workout.estimatedCalories,
      startTime: new Date(),
      endTime: new Date(),
      completionRate: 0,
    };

    setCurrentWorkout(workout);
    setActiveSession(session);
    setCurrentExerciseIndex(0);
    setIsWorkoutActive(true);
    setIsPaused(false);
    setElapsedTime(0);

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Pause workout
  const pauseWorkout = useCallback(() => {
    setIsPaused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Resume workout
  const resumeWorkout = useCallback(() => {
    setIsPaused(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Complete a set
  const completeSet = useCallback(
    (exerciseIndex: number, setIndex: number, setData: Partial<CompletedSet>) => {
      if (!activeSession) return;

      setActiveSession((prev) => {
        if (!prev) return prev;

        const updatedExercises = [...prev.exercisesCompleted];
        const exercise = updatedExercises[exerciseIndex];

        if (exercise && exercise.sets[setIndex]) {
          exercise.sets[setIndex] = {
            ...exercise.sets[setIndex],
            ...setData,
            completed: true,
          };
        }

        // Calculate completion rate
        const totalSets = updatedExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const completedSets = updatedExercises.reduce(
          (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
          0
        );
        const completionRate = (completedSets / totalSets) * 100;

        return {
          ...prev,
          exercisesCompleted: updatedExercises,
          completionRate,
        };
      });

      // Haptic feedback on set completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [activeSession]
  );

  // Move to next exercise
  const nextExercise = useCallback(() => {
    if (currentWorkout && currentExerciseIndex < currentWorkout.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [currentWorkout, currentExerciseIndex]);

  // Move to previous exercise
  const previousExercise = useCallback(() => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentExerciseIndex]);

  // End workout and save session
  const endWorkout = useCallback(async () => {
    if (!activeSession) return;

    const endedSession: WorkoutSession = {
      ...activeSession,
      endTime: new Date(),
      duration: elapsedTime,
    };

    try {
      await saveWorkoutSession(endedSession);

      // Reset state
      setCurrentWorkout(null);
      setActiveSession(null);
      setCurrentExerciseIndex(0);
      setIsWorkoutActive(false);
      setIsPaused(false);
      setElapsedTime(0);

      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving workout session:', error);
      // Error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [activeSession, elapsedTime]);

  const value: WorkoutContextState = {
    currentWorkout,
    activeSession,
    currentExerciseIndex,
    isWorkoutActive,
    isPaused,
    elapsedTime,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    completeSet,
    nextExercise,
    previousExercise,
    endWorkout,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};

// Custom hook to use workout context
export const useWorkoutContext = (): WorkoutContextState => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkoutContext must be used within a WorkoutProvider');
  }
  return context;
};

export default WorkoutContext;
