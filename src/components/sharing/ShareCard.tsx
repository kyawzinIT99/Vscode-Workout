/**
 * ShareCard
 * Styled card for sharing workout stats as an image
 */

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import ViewShot from 'react-native-view-shot'; // Use SafeViewShot instead to prevent crash
import SafeViewShot from '../SafeViewShot';
import type ViewShot from 'react-native-view-shot';

export type ShareCardType = 'workout_complete' | 'achievement' | 'streak';

interface ShareCardProps {
  type: ShareCardType;
  title: string;
  stats: { label: string; value: string }[];
  subtitle?: string;
}

const ShareCard = forwardRef<ViewShot, ShareCardProps>(({ type, title, stats, subtitle }, ref) => {
  const gradients: Record<ShareCardType, string[]> = {
    workout_complete: ['#667EEA', '#764BA2'],
    achievement: ['#FFA500', '#FF6B6B'],
    streak: ['#FF6B6B', '#FF8E53'],
  };

  const icons: Record<ShareCardType, keyof typeof Ionicons.glyphMap> = {
    workout_complete: 'barbell',
    achievement: 'trophy',
    streak: 'flame',
  };

  return (
    <SafeViewShot ref={ref} options={{ format: 'png', quality: 1 }}>
      <LinearGradient
        colors={gradients[type] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* App Branding */}
        <View style={styles.branding}>
          <Text style={styles.appName}>FitGlass</Text>
          <Ionicons name="fitness" size={20} color="rgba(255,255,255,0.7)" />
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={icons[type]} size={40} color="#fff" />
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>fitglass.app</Text>
      </LinearGradient>
    </SafeViewShot>
  );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  card: {
    width: 340,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  footer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
});

export default ShareCard;
