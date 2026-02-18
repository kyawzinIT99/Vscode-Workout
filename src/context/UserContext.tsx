/**
 * UserContext
 * Global state for user data, preferences, and workout history
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, WorkoutSession, UserContextState, UserStats, Achievement } from '../types/workout.types';
import {
  loadUser,
  saveUser,
  updateUser as updateUserStorage,
  loadWorkoutHistory,
  saveWorkoutSession,
  loadUserStats,
  saveUserStats,
  clearAllData,
} from '../services/storage';
import { syncNotificationSchedule } from '../services/notifications';

interface UserProviderProps {
  children: React.ReactNode;
}

const UserContext = createContext<UserContextState | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Load all user data from storage
  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedUser, history] = await Promise.all([
        loadUser(),
        loadWorkoutHistory(),
      ]);

      if (loadedUser) {
        // Backfill any missing preference fields for users created before updates
        const defaultPrefs = {
          measurementSystem: 'metric' as const,
          defaultRestTime: 60,
          hapticFeedback: true,
          soundEffects: true,
          voiceGuidance: false,
          theme: 'dark' as const,
          notificationsEnabled: false,
          workoutReminderEnabled: false,
          workoutReminderTime: '08:00',
          waterReminderEnabled: false,
          waterReminderInterval: 2,
        };
        const mergedPrefs = { ...defaultPrefs, ...loadedUser.preferences };
        const userWithPrefs = { ...loadedUser, preferences: mergedPrefs };
        setUser(userWithPrefs);
        // Persist the merged prefs so future loads have all fields
        if (JSON.stringify(loadedUser.preferences) !== JSON.stringify(mergedPrefs)) {
          saveUser(userWithPrefs).catch(() => {});
        }
        // Re-sync notification schedule on app launch
        if (mergedPrefs.notificationsEnabled) {
          syncNotificationSchedule(mergedPrefs).catch(() => {});
        }
      } else {
        // Create default user if none exists
        const defaultUser: User = {
          id: `user_${Date.now()}`,
          name: 'Fitness Enthusiast',
          fitnessLevel: 'beginner',
          goals: ['strength', 'endurance'],
          preferences: {
            measurementSystem: 'metric',
            defaultRestTime: 60,
            hapticFeedback: true,
            soundEffects: true,
            voiceGuidance: false,
            theme: 'dark',
            notificationsEnabled: false,
            workoutReminderEnabled: false,
            workoutReminderTime: '08:00',
            waterReminderEnabled: false,
            waterReminderInterval: 2,
          },
          stats: {
            totalWorkouts: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalMinutes: 0,
            totalCalories: 0,
            favoriteCategory: 'strength',
            achievements: [],
            personalRecords: [],
          },
          createdAt: new Date(),
        };
        await saveUser(defaultUser);
        setUser(defaultUser);
      }

      setWorkoutHistory(history);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user data
  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
      await updateUserStorage(updates);
      setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }, []);

  // Add workout session
  const addWorkoutSession = useCallback(
    async (session: WorkoutSession) => {
      try {
        await saveWorkoutSession(session);
        setWorkoutHistory((prev) => [session, ...prev]);

        // Update user stats
        if (user) {
          const updatedStats: UserStats = {
            ...user.stats,
            totalWorkouts: user.stats.totalWorkouts + 1,
            totalMinutes: user.stats.totalMinutes + Math.floor(session.duration / 60),
            totalCalories: user.stats.totalCalories + session.estimatedCalories,
          };

          // Calculate streak
          const today = new Date().toDateString();
          const lastWorkout = workoutHistory[0];
          const lastWorkoutDate = lastWorkout ? new Date(lastWorkout.date).toDateString() : '';

          if (lastWorkoutDate === today) {
            // Same day, don't increment streak
          } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (lastWorkoutDate === yesterdayStr) {
              // Continue streak
              updatedStats.currentStreak = user.stats.currentStreak + 1;
            } else if (lastWorkoutDate === '') {
              // First workout
              updatedStats.currentStreak = 1;
            } else {
              // Streak broken
              updatedStats.currentStreak = 1;
            }
          }

          // Update longest streak
          if (updatedStats.currentStreak > user.stats.longestStreak) {
            updatedStats.longestStreak = updatedStats.currentStreak;
          }

          await saveUserStats(updatedStats);
          await updateUser({ stats: updatedStats });
        }
      } catch (error) {
        console.error('Error adding workout session:', error);
        throw error;
      }
    },
    [user, workoutHistory, updateUser]
  );

  // Clear all user data
  const clearUserData = useCallback(async () => {
    try {
      await clearAllData();
      setUser(null);
      setWorkoutHistory([]);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }, []);

  const value: UserContextState = {
    user,
    workoutHistory,
    isLoading,
    updateUser,
    addWorkoutSession,
    loadUserData,
    clearUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use user context
export const useUserContext = (): UserContextState => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
