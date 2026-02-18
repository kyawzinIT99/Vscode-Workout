/**
 * Sharing Service
 * Share workout achievements and stats as images or text
 */

import { Share, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { RefObject } from 'react';

/**
 * Capture a ViewShot ref and share as image
 */
export const shareImage = async (
  viewShotRef: RefObject<ViewShot>,
  message: string = ''
): Promise<void> => {
  if (!viewShotRef.current?.capture) {
    throw new Error('ViewShot ref not ready');
  }

  const uri = await viewShotRef.current.capture();
  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: 'Share Achievement',
    UTI: 'public.png',
  });
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
