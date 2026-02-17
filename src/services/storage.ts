/**
 * AsyncStorage Service
 * Wrapper for persistent data storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, WorkoutSession, UserStats } from '../types/workout.types';

// Storage Keys
const STORAGE_KEYS = {
  USER: '@fitglass_user',
  WORKOUT_HISTORY: '@fitglass_workout_history',
  USER_STATS: '@fitglass_user_stats',
  ACHIEVEMENTS: '@fitglass_achievements',
  PREFERENCES: '@fitglass_preferences',
  ONBOARDING_COMPLETE: '@fitglass_onboarding_complete',
};

// ============================================================================
// USER DATA
// ============================================================================

export const saveUser = async (user: User): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, jsonValue);
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const loadUser = async (): Promise<User | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading user:', error);
    return null;
  }
};

export const updateUser = async (updates: Partial<User>): Promise<void> => {
  try {
    const currentUser = await loadUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      await saveUser(updatedUser);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// ============================================================================
// WORKOUT HISTORY
// ============================================================================

export const saveWorkoutSession = async (session: WorkoutSession): Promise<void> => {
  try {
    const history = await loadWorkoutHistory();
    const updatedHistory = [session, ...history];
    const jsonValue = JSON.stringify(updatedHistory);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, jsonValue);
  } catch (error) {
    console.error('Error saving workout session:', error);
    throw error;
  }
};

export const loadWorkoutHistory = async (): Promise<WorkoutSession[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading workout history:', error);
    return [];
  }
};

export const getRecentWorkouts = async (limit: number = 10): Promise<WorkoutSession[]> => {
  try {
    const history = await loadWorkoutHistory();
    return history.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent workouts:', error);
    return [];
  }
};

export const deleteWorkoutSession = async (sessionId: string): Promise<void> => {
  try {
    const history = await loadWorkoutHistory();
    const updatedHistory = history.filter((session) => session.id !== sessionId);
    const jsonValue = JSON.stringify(updatedHistory);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, jsonValue);
  } catch (error) {
    console.error('Error deleting workout session:', error);
    throw error;
  }
};

// ============================================================================
// USER STATS
// ============================================================================

export const saveUserStats = async (stats: UserStats): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(stats);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, jsonValue);
  } catch (error) {
    console.error('Error saving user stats:', error);
    throw error;
  }
};

export const loadUserStats = async (): Promise<UserStats | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading user stats:', error);
    return null;
  }
};

export const updateUserStats = async (updates: Partial<UserStats>): Promise<void> => {
  try {
    const currentStats = await loadUserStats();
    if (currentStats) {
      const updatedStats = { ...currentStats, ...updates };
      await saveUserStats(updatedStats);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

// ============================================================================
// ONBOARDING
// ============================================================================

export const setOnboardingComplete = async (complete: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, JSON.stringify(complete));
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
    throw error;
  }
};

export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value != null ? JSON.parse(value) : false;
  } catch (error) {
    console.error('Error checking onboarding:', error);
    return false;
  }
};

// ============================================================================
// CLEAR DATA (for testing/logout)
// ============================================================================

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER,
      STORAGE_KEYS.WORKOUT_HISTORY,
      STORAGE_KEYS.USER_STATS,
      STORAGE_KEYS.ACHIEVEMENTS,
      STORAGE_KEYS.PREFERENCES,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

export const clearWorkoutHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.WORKOUT_HISTORY);
  } catch (error) {
    console.error('Error clearing workout history:', error);
    throw error;
  }
};

// ============================================================================
// EXPORT ALL KEYS
// ============================================================================

export { STORAGE_KEYS };
