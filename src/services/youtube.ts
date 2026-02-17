/**
 * YouTube Service
 * Utilities for working with YouTube videos
 */

/**
 * Extract video ID from YouTube URL
 * Supports formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export const extractVideoId = (url: string): string | null => {
  if (!url) return null;

  // Handle youtu.be short URLs
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];

  // Handle youtube.com URLs
  const longMatch = url.match(/[?&]v=([^?&]+)/);
  if (longMatch) return longMatch[1];

  // Handle embed URLs
  const embedMatch = url.match(/\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];

  // If it's already just an ID (no URL)
  if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
    return url;
  }

  return null;
};

/**
 * Get YouTube thumbnail URL for a video ID
 */
export const getThumbnailUrl = (
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'
): string => {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

/**
 * Format duration in seconds to MM:SS
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default {
  extractVideoId,
  getThumbnailUrl,
  formatDuration,
};
