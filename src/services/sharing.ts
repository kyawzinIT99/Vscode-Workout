/**
 * Sharing Service
 * Share workout achievements and stats as images or text
 */

import { Share, Platform, Alert } from 'react-native';
import type ViewShot from 'react-native-view-shot';
import { RefObject } from 'react';

// Lazy load expo-sharing to prevent crashes if native module is missing
let Sharing: typeof import('expo-sharing') | null = null;
const getSharing = async () => {
  if (Sharing) return Sharing;
  try {
    Sharing = await import('expo-sharing');
  } catch (e) {
    console.warn('[SharingService] expo-sharing module not available:', e);
    Sharing = null;
  }
  return Sharing;
};

/**
 * Capture a ViewShot ref and share as image
 */
export const shareImage = async (
  viewShotRef: RefObject<ViewShot>,
  message: string = ''
): Promise<void> => {
  // 1. Check if ViewShot ref is ready
  if (!viewShotRef.current?.capture) {
    console.warn('ViewShot ref not ready');
    return;
  }

  // 2. Check if Sharing module is available
  const SharingModule = await getSharing();
  if (!SharingModule) {
    Alert.alert('Sharing Unavailable', 'Sharing is not supported on this device configuration.');
    return;
  }

  try {
    const uri = await viewShotRef.current.capture();
    if (!uri) {
      throw new Error('Captured URI is null');
    }

    const available = await SharingModule.isAvailableAsync();
    if (available) {
      await SharingModule.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Achievement',
        UTI: 'public.png',
      });
    } else {
      Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
    }
  } catch (e) {
    console.warn('Share failed:', e);
    // Don't crash the app
  }
};

/**
 * Share text message using native share sheet
 */
export const shareText = async (message: string): Promise<void> => {
  await Share.share(
    Platform.OS === 'ios'
      ? { message }
      : { message, title: 'FitGlass Workout' },
  );
};

/**
 * Generate a shareable workout completion message
 */
export const getWorkoutShareMessage = (
  workoutName: string,
  duration: number,
  calories: number,
  completionRate: number
): string => {
  const mins = Math.floor(duration / 60);
  return `Just completed "${workoutName}" on FitGlass!\n\n` +
    `Duration: ${mins} min\n` +
    `Calories: ${calories}\n` +
    `Completion: ${Math.round(completionRate)}%\n\n` +
    `#FitGlass #Workout #Fitness`;
};

/**
 * Generate a shareable achievement message
 */
export const getAchievementShareMessage = (
  achievementName: string,
  stat: string
): string => {
  return `Achievement unlocked on FitGlass!\n\n` +
    `${achievementName}\n` +
    `${stat}\n\n` +
    `#FitGlass #Achievement #Fitness`;
};
