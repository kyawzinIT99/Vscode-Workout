/**
 * Notification Service
 * Local push notifications for workout and water reminders
 */

import { Platform } from 'react-native';
import { UserPreferences } from '../types/workout.types';

// Lazily import expo-notifications to avoid crashing if native module isn't available
let Notifications: typeof import('expo-notifications') | null = null;

const getNotifications = async () => {
  if (Notifications) return Notifications;
  try {
    Notifications = await import('expo-notifications');
    // Configure foreground notification display once loaded
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn('[Notifications] Native module not available:', e);
    Notifications = null;
  }
  return Notifications;
};

const WORKOUT_REMINDER_ID = 'workout-daily-reminder';
const WATER_REMINDER_ID_PREFIX = 'water-reminder-';

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const N = await getNotifications();
  if (!N) return false;

  try {
    const { status: existingStatus } = await N.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await N.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Android requires notification channels
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('workout-reminders', {
        name: 'Workout Reminders',
        importance: N.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
      await N.setNotificationChannelAsync('water-reminders', {
        name: 'Water Reminders',
        importance: N.AndroidImportance.DEFAULT,
      });
    }

    return true;
  } catch (e) {
    console.warn('[Notifications] requestPermissions failed:', e);
    return false;
  }
};

export const scheduleWorkoutReminder = async (timeStr: string): Promise<void> => {
  const N = await getNotifications();
  if (!N) return;

  try {
    await cancelWorkoutReminder();
    const [hours, minutes] = timeStr.split(':').map(Number);

    await N.scheduleNotificationAsync({
      identifier: WORKOUT_REMINDER_ID,
      content: {
        title: 'Time to Work Out!',
        body: "Your daily workout is waiting. Let's make today count!",
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'workout-reminders' }),
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
  } catch (e) {
    console.warn('[Notifications] scheduleWorkoutReminder failed:', e);
  }
};

export const cancelWorkoutReminder = async (): Promise<void> => {
  const N = await getNotifications();
  if (!N) return;
  await N.cancelScheduledNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});
};

export const scheduleWaterReminders = async (intervalHours: number): Promise<void> => {
  const N = await getNotifications();
  if (!N) return;

  try {
    await cancelWaterReminders();

    const startHour = 8;
    const endHour = 22;
    let reminderIndex = 0;

    for (let hour = startHour; hour < endHour; hour += intervalHours) {
      const h = Math.floor(hour);
      const m = Math.round((hour - h) * 60);

      await N.scheduleNotificationAsync({
        identifier: `${WATER_REMINDER_ID_PREFIX}${reminderIndex}`,
        content: {
          title: 'Stay Hydrated!',
          body: 'Time for a glass of water. Your body will thank you!',
          sound: false,
          ...(Platform.OS === 'android' && { channelId: 'water-reminders' }),
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.DAILY,
          hour: h,
          minute: m,
        },
      });
      reminderIndex++;
    }
  } catch (e) {
    console.warn('[Notifications] scheduleWaterReminders failed:', e);
  }
};

export const cancelWaterReminders = async (): Promise<void> => {
  const N = await getNotifications();
  if (!N) return;
  try {
    const scheduled = await N.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith(WATER_REMINDER_ID_PREFIX)) {
        await N.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (e) {
    console.warn('[Notifications] cancelWaterReminders failed:', e);
  }
};

export const cancelAllReminders = async (): Promise<void> => {
  const N = await getNotifications();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync().catch(() => {});
};

/**
 * Master sync function — reads preferences and ensures notification schedule matches.
 * Called on app launch and whenever preferences change.
 */
export const syncNotificationSchedule = async (prefs: UserPreferences): Promise<void> => {
  if (!prefs.notificationsEnabled) {
    await cancelAllReminders();
    return;
  }

  if (prefs.workoutReminderEnabled) {
    await scheduleWorkoutReminder(prefs.workoutReminderTime);
  } else {
    await cancelWorkoutReminder();
  }

  if (prefs.waterReminderEnabled) {
    await scheduleWaterReminders(prefs.waterReminderInterval);
  } else {
    await cancelWaterReminders();
  }
};
