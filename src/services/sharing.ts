/**
 * Sharing Service
 * Share workout achievements and stats as images or text
 */

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
 * Share text-only message (fallback when no image)
 */
export const shareText = async (message: string): Promise<void> => {
  // expo-sharing doesn't directly support text-only sharing,
  // so we create a small text file and share it
  const FileSystem = require('expo-file-system');
  const filePath = `${FileSystem.cacheDirectory}fitglass_share.txt`;
  await FileSystem.writeAsStringAsync(filePath, message);
  await Sharing.shareAsync(filePath, {
    mimeType: 'text/plain',
    dialogTitle: 'Share Workout',
  });
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
