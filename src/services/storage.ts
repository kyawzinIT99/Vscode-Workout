/**
 * AsyncStorage Service
 * Wrapper for persistent data storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, WorkoutSession, UserStats, BodyMeasurement, WaterIntake, WaterDailyLog } from '../types/workout.types';

// Storage Keys
const STORAGE_KEYS = {
  USER: '@fitglass_user',
  WORKOUT_HISTORY: '@fitglass_workout_history',
  USER_STATS: '@fitglass_user_stats',
  ACHIEVEMENTS: '@fitglass_achievements',
  PREFERENCES: '@fitglass_preferences',
  ONBOARDING_COMPLETE: '@fitglass_onboarding_complete',
  BODY_MEASUREMENTS: '@fitglass_body_measurements',
  WATER_INTAKE: '@fitglass_water_intake',
  WATER_GOAL: '@fitglass_water_goal',
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
// BODY MEASUREMENTS
// ============================================================================

export const saveMeasurement = async (measurement: BodyMeasurement): Promise<void> => {
  try {
    const measurements = await loadMeasurements();
    const updated = [measurement, ...measurements];
    await AsyncStorage.setItem(STORAGE_KEYS.BODY_MEASUREMENTS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving measurement:', error);
    throw error;
  }
};

export const loadMeasurements = async (): Promise<BodyMeasurement[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.BODY_MEASUREMENTS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading measurements:', error);
    return [];
  }
};

export const deleteMeasurement = async (measurementId: string): Promise<void> => {
  try {
    const measurements = await loadMeasurements();
    const updated = measurements.filter((m) => m.id !== measurementId);
    await AsyncStorage.setItem(STORAGE_KEYS.BODY_MEASUREMENTS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting measurement:', error);
    throw error;
  }
};

// ============================================================================
// WATER INTAKE
// ============================================================================

const getTodayDate = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const loadAllWaterEntries = async (): Promise<WaterIntake[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WATER_INTAKE);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading water entries:', error);
    return [];
  }
};

const saveAllWaterEntries = async (entries: WaterIntake[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.WATER_INTAKE, JSON.stringify(entries));
};

export const addWaterIntake = async (amount: number): Promise<WaterDailyLog> => {
  const entries = await loadAllWaterEntries();
  const today = getTodayDate();
  const entry: WaterIntake = {
    id: `water_${Date.now()}`,
    date: today,
    amount,
    timestamp: Date.now(),
  };
  entries.unshift(entry);
  await saveAllWaterEntries(entries);
  return loadTodayWater();
};

export const loadTodayWater = async (): Promise<WaterDailyLog> => {
  const entries = await loadAllWaterEntries();
  const today = getTodayDate();
  const goalMl = await getWaterGoal();
  const todayEntries = entries.filter(e => e.date === today);
  const totalMl = todayEntries.reduce((sum, e) => sum + e.amount, 0);
  return { date: today, entries: todayEntries, totalMl, goalMl };
};

export const loadWaterHistory = async (days: number = 7): Promise<WaterDailyLog[]> => {
  const entries = await loadAllWaterEntries();
  const goalMl = await getWaterGoal();
  const logs: WaterDailyLog[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayEntries = entries.filter(e => e.date === dateStr);
    const totalMl = dayEntries.reduce((sum, e) => sum + e.amount, 0);
    logs.push({ date: dateStr, entries: dayEntries, totalMl, goalMl });
  }

  return logs;
};

export const deleteWaterEntry = async (entryId: string): Promise<void> => {
  const entries = await loadAllWaterEntries();
  const updated = entries.filter(e => e.id !== entryId);
  await saveAllWaterEntries(updated);
};

export const setWaterGoal = async (goalMl: number): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.WATER_GOAL, JSON.stringify(goalMl));
};

export const getWaterGoal = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.WATER_GOAL);
    return value != null ? JSON.parse(value) : 2000;
  } catch {
    return 2000;
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
      STORAGE_KEYS.BODY_MEASUREMENTS,
      STORAGE_KEYS.WATER_INTAKE,
      STORAGE_KEYS.WATER_GOAL,
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
