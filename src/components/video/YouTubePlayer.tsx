/**
 * YouTubePlayer Component
 * Embedded YouTube video player with glassmorphism controls
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { BlurView } from 'expo-blur';
import { COLORS, GLASS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

interface YouTubePlayerProps {
  videoId: string;
  height?: number;
  autoplay?: boolean;
  onEnd?: () => void;
  onReady?: () => void;
}

const { width } = Dimensions.get('window');

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

  if (!videoId) {
    return (
      <View style={[styles.container, { height }]}>
        <BlurView intensity={80} tint="dark" style={styles.errorContainer}>
          <Text style={styles.errorText}>No video available</Text>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.playerWrapper}>
        <YoutubePlayer
          height={height}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          onReady={onPlayerReady}
          webViewProps={{
            androidLayerType: 'hardware',
          }}
        />
      </View>

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
