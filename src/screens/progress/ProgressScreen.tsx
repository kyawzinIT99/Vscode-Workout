/**
 * ProgressScreen
 * View workout stats, weekly activity, and fitness progress
 */

import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import ViewShot from 'react-native-view-shot';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useUserContext } from '../../context/UserContext';
import ShareCard from '../../components/sharing/ShareCard';
import { shareImage } from '../../services/sharing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, workoutHistory } = useUserContext();
  const shareCardRef = useRef<ViewShot>(null) as React.RefObject<ViewShot>;

  const handleShareStats = async () => {
    try {
      await shareImage(shareCardRef, 'Check out my fitness progress!');
    } catch {
      // Silently fail if sharing is not available
    }
  };

  // Calculate weekly activity data (last 7 days)
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toDateString();
      const dayWorkouts = workoutHistory.filter(
        (w) => new Date(w.date).toDateString() === dateStr
      );
      const totalMins = dayWorkouts.reduce((sum, w) => sum + Math.floor((w.duration || 0) / 60), 0);
      weekData.push({
        day: days[date.getDay()],
        minutes: totalMins,
        workouts: dayWorkouts.length,
        isToday: i === 0,
      });
    }
    return weekData;
  }, [workoutHistory]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const thisMonth = workoutHistory.filter((w) => {
      const d = new Date(w.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = workoutHistory.filter((w) => {
      const d = new Date(w.date);
      const last = new Date(now.getFullYear(), now.getMonth() - 1);
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
    });
    return {
      thisMonthCount: thisMonth.length,
      lastMonthCount: lastMonth.length,
      thisMonthMins: thisMonth.reduce((s, w) => s + Math.floor((w.duration || 0) / 60), 0),
    };
  }, [workoutHistory]);

  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);

  const stats = user?.stats;
  const totalWorkouts = stats?.totalWorkouts || 0;
  const currentStreak = stats?.currentStreak || 0;
  const longestStreak = stats?.longestStreak || 0;
  const totalMinutes = stats?.totalMinutes || 0;
  const totalCalories = stats?.totalCalories || 0;

  return (
    <GradientBackground colors={GRADIENTS.ocean}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>

        {/* Streak Card */}
        <GlassCard style={styles.card}>
          <View style={styles.streakRow}>
            <View style={styles.streakMain}>
              <LinearGradient
                colors={['#FF6B6B', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.streakBadge}
              >
                <Ionicons name="flame" size={28} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.streakValue}>{currentStreak}</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
              </View>
            </View>
            <View style={styles.streakBest}>
              <Ionicons name="trophy" size={16} color="#FFA500" />
              <Text style={styles.streakBestText}>Best: {longestStreak}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']}
              style={styles.statIconBg}
            >
              <Ionicons name="barbell" size={22} color="#667EEA" />
            </LinearGradient>
            <Text style={styles.statValue}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <LinearGradient
              colors={['rgba(56, 239, 125, 0.3)', 'rgba(17, 153, 142, 0.3)']}
              style={styles.statIconBg}
            >
              <Ionicons name="time" size={22} color="#38EF7D" />
            </LinearGradient>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255, 107, 107, 0.3)', 'rgba(255, 142, 83, 0.3)']}
              style={styles.statIconBg}
            >
              <Ionicons name="flame" size={22} color="#FF6B6B" />
            </LinearGradient>
            <Text style={styles.statValue}>{totalCalories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </GlassCard>
        </View>

        {/* Weekly Activity Chart */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={22} color="#667EEA" />
            <Text style={styles.cardTitle}>Weekly Activity</Text>
          </View>

          <View style={styles.chartContainer}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <LinearGradient
                    colors={day.isToday ? ['#667EEA', '#764BA2'] : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={[
                      styles.bar,
                      {
                        height: day.minutes > 0
                          ? Math.max((day.minutes / maxMinutes) * 100, 8)
                          : 4,
                      },
                    ]}
                  />
                </View>
                <Text style={[
                  styles.barLabel,
                  day.isToday && styles.barLabelActive,
                ]}>
                  {day.day}
                </Text>
                {day.minutes > 0 && (
                  <Text style={styles.barMinutes}>{day.minutes}m</Text>
                )}
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Monthly Summary */}
        <GlassCard style={styles.card} gradient={['rgba(102, 126, 234, 0.15)', 'rgba(118, 75, 162, 0.15)']}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics" size={22} color="#764BA2" />
            <Text style={styles.cardTitle}>This Month</Text>
          </View>

          <View style={styles.monthRow}>
            <View style={styles.monthItem}>
              <Text style={styles.monthValue}>{monthlyStats.thisMonthCount}</Text>
              <Text style={styles.monthLabel}>Workouts</Text>
            </View>
            <View style={styles.monthDivider} />
            <View style={styles.monthItem}>
              <Text style={styles.monthValue}>{monthlyStats.thisMonthMins}</Text>
              <Text style={styles.monthLabel}>Minutes</Text>
            </View>
            <View style={styles.monthDivider} />
            <View style={styles.monthItem}>
              <View style={styles.trendRow}>
                <Text style={styles.monthValue}>{monthlyStats.lastMonthCount}</Text>
                <Ionicons
                  name={monthlyStats.thisMonthCount >= monthlyStats.lastMonthCount ? 'arrow-up' : 'arrow-down'}
                  size={14}
                  color={monthlyStats.thisMonthCount >= monthlyStats.lastMonthCount ? '#38EF7D' : '#FF6B6B'}
                />
              </View>
              <Text style={styles.monthLabel}>Last Month</Text>
            </View>
          </View>
        </GlassCard>

        {/* Recent Workouts */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={22} color="#38EF7D" />
            <Text style={styles.cardTitle}>Recent Workouts</Text>
          </View>

          {workoutHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="fitness" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No workouts yet</Text>
              <Text style={styles.emptySubtext}>Complete your first workout to see progress!</Text>
            </View>
          ) : (
            workoutHistory.slice(0, 5).map((session, index) => {
              const date = new Date(session.date);
              const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              const mins = Math.floor((session.duration || 0) / 60);
              return (
                <View key={session.id || index}>
                  <View style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <LinearGradient
                        colors={['rgba(102, 126, 234, 0.25)', 'rgba(118, 75, 162, 0.25)']}
                        style={styles.historyIcon}
                      >
                        <Ionicons name="barbell" size={18} color="#667EEA" />
                      </LinearGradient>
                      <View>
                        <Text style={styles.historyName} numberOfLines={1}>
                          {session.workoutName || 'Workout'}
                        </Text>
                        <Text style={styles.historyDate}>{formattedDate}</Text>
                      </View>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyMins}>{mins > 0 ? `${mins}m` : '--'}</Text>
                      <View style={styles.completionBadge}>
                        <Text style={styles.completionText}>
                          {Math.round(session.completionRate || 0)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                  {index < Math.min(workoutHistory.length, 5) - 1 && (
                    <View style={styles.historyDivider} />
                  )}
                </View>
              );
            })
          )}
        </GlassCard>

        {/* Body Measurements Link */}
        <TouchableOpacity onPress={() => navigation.navigate('BodyMeasurements')}>
          <GlassCard style={styles.card} gradient={['rgba(56, 239, 125, 0.15)', 'rgba(17, 153, 142, 0.15)']}>
            <View style={styles.measurementLink}>
              <View style={styles.measurementLeft}>
                <LinearGradient
                  colors={['rgba(56, 239, 125, 0.3)', 'rgba(17, 153, 142, 0.3)']}
                  style={styles.measurementIcon}
                >
                  <Ionicons name="body" size={24} color="#38EF7D" />
                </LinearGradient>
                <View>
                  <Text style={styles.cardTitle}>Body Measurements</Text>
                  <Text style={styles.measurementSubtext}>Track weight, body fat & more</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color={COLORS.textTertiary} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Achievement Preview */}
        <GlassCard style={styles.card} gradient={['rgba(255, 165, 0, 0.12)', 'rgba(255, 107, 107, 0.12)']}>
          <View style={styles.cardHeader}>
            <Ionicons name="medal" size={22} color="#FFA500" />
            <Text style={[styles.cardTitle, { flex: 1 }]}>Achievements</Text>
            <TouchableOpacity onPress={handleShareStats} style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={20} color="#FFA500" />
            </TouchableOpacity>
          </View>

          <View style={styles.achievementRow}>
            {[
              { icon: 'flame' as const, label: 'First Workout', unlocked: totalWorkouts >= 1 },
              { icon: 'ribbon' as const, label: '7-Day Streak', unlocked: longestStreak >= 7 },
              { icon: 'trophy' as const, label: '10 Workouts', unlocked: totalWorkouts >= 10 },
              { icon: 'star' as const, label: '100 Minutes', unlocked: totalMinutes >= 100 },
            ].map((ach, i) => (
              <View key={i} style={[styles.achievementItem, !ach.unlocked && styles.achievementLocked]}>
                <LinearGradient
                  colors={ach.unlocked ? ['#FFA500', '#FF6B6B'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                  style={styles.achievementIcon}
                >
                  <Ionicons
                    name={ach.icon}
                    size={20}
                    color={ach.unlocked ? '#fff' : COLORS.textTertiary}
                  />
                </LinearGradient>
                <Text style={[styles.achievementLabel, !ach.unlocked && styles.achievementLabelLocked]}>
                  {ach.label}
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>

      </ScrollView>

      {/* Hidden ShareCard for image capture */}
      <View style={styles.hiddenShareCard}>
        <ShareCard
          ref={shareCardRef}
          type="streak"
          title="My Fitness Progress"
          subtitle={`${currentStreak} Day Streak`}
          stats={[
            { label: 'Workouts', value: `${totalWorkouts}` },
            { label: 'Minutes', value: `${totalMinutes}` },
            { label: 'Calories', value: `${totalCalories}` },
          ]}
        />
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 60,
    paddingBottom: 120,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    fontSize: 36,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  // Streak Card
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    lineHeight: 40,
  },
  streakLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  streakBest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakBestText: {
    ...TYPOGRAPHY.caption,
    color: '#FFA500',
    fontWeight: '600',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  // Weekly Chart
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 20,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 28,
    borderRadius: 8,
    minHeight: 4,
  },
  barLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 11,
    marginTop: 8,
  },
  barLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  barMinutes: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  // Monthly Summary
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthItem: {
    flex: 1,
    alignItems: 'center',
  },
  monthDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.white + '15',
  },
  monthValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  monthLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptySubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  // History Items
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    maxWidth: SCREEN_WIDTH * 0.4,
  },
  historyDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyMins: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  completionBadge: {
    backgroundColor: 'rgba(56, 239, 125, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  completionText: {
    ...TYPOGRAPHY.caption,
    color: '#38EF7D',
    fontWeight: '600',
    fontSize: 11,
  },
  historyDivider: {
    height: 1,
    backgroundColor: COLORS.white + '10',
  },
  // Achievements
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
  achievementLabelLocked: {
    color: COLORS.textTertiary,
  },
  // Body Measurements Link
  measurementLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  measurementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  measurementIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  measurementSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Share Button
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  hiddenShareCard: {
    position: 'absolute',
    top: -9999,
    left: -9999,
  },
});

export default ProgressScreen;
