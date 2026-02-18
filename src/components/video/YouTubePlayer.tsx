/**
 * YouTubePlayer Component
 * iOS: Embedded YouTube iframe player
 * Android: Thumbnail preview + "Open in YouTube" (iframe unreliable in Expo Go)
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Linking, Platform, Image } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GLASS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

interface YouTubePlayerProps {
  videoId: string;
  height?: number;
  autoplay?: boolean;
  onEnd?: () => void;
  onReady?: () => void;
}

const YouTubePlayerComponent: React.FC<YouTubePlayerProps> = ({
  videoId,
  height = 220,
  autoplay = false,
  onEnd,
  onReady,
}) => {
  const [playing, setPlaying] = useState(autoplay);
  const [ready, setReady] = useState(false);

  const onStateChange = useCallback(
    (state: string) => {
      if (state === 'ended') {
        setPlaying(false);
        onEnd?.();
      } else if (state === 'playing') {
        setPlaying(true);
      } else if (state === 'paused') {
        setPlaying(false);
      }
    },
    [onEnd]
  );

  const onPlayerReady = useCallback(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);

  const handleOpenInYouTube = useCallback(() => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(url).catch(() => {});
  }, [videoId]);

  if (!videoId) {
    return (
      <View style={[styles.container, { height }]}>
        <BlurView intensity={80} tint="dark" style={styles.errorContainer}>
          <Text style={styles.errorText}>No video available</Text>
        </BlurView>
      </View>
    );
  }

  // Android: thumbnail + open-in-YouTube button (iframe is broken in Expo Go)
  if (Platform.OS === 'android') {
    return (
      <TouchableOpacity
        style={[styles.container, { height }]}
        activeOpacity={0.8}
        onPress={handleOpenInYouTube}
      >
        <Image
          source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.thumbnailOverlay}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={36} color={COLORS.white} style={{ marginLeft: 4 }} />
          </View>
          <View style={styles.youtubeLabel}>
            <Ionicons name="logo-youtube" size={16} color="#FF0000" />
            <Text style={styles.youtubeLabelText}>Watch on YouTube</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // iOS: embedded iframe player
  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.playerWrapper}>
        <YoutubePlayer
          height={height}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          onReady={onPlayerReady}
          initialPlayerParams={{
            modestbranding: true,
            rel: false,
          }}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
        />
      </View>

      {ready && (
        <TouchableOpacity style={styles.externalButton} onPress={handleOpenInYouTube}>
          <Ionicons name="open-outline" size={14} color={COLORS.white} />
        </TouchableOpacity>
      )}

      {!ready && (
        <View style={styles.loadingOverlay}>
          <BlurView intensity={60} tint="dark" style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading video...</Text>
          </BlurView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: GLASS.backgroundDark,
  },
  playerWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GLASS.background,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  // Android thumbnail styles
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  youtubeLabelText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  // iOS external button
  externalButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: GLASS.background,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
});

export default YouTubePlayerComponent;
