/**
 * WaterTrackerScreen
 * Daily hydration tracking with goal progress and weekly history
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  addWaterIntake,
  loadTodayWater,
  loadWaterHistory,
  deleteWaterEntry,
  setWaterGoal,
  getWaterGoal,
} from '../../services/storage';
import { WaterDailyLog, WaterIntake } from '../../types/workout.types';
import useWaterSounds from '../../hooks/useWaterSounds';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 200;
const RING_STROKE = 12;

const WaterTrackerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [todayLog, setTodayLog] = useState<WaterDailyLog | null>(null);
  const [weeklyData, setWeeklyData] = useState<WaterDailyLog[]>([]);
  const [goalMl, setGoalMl] = useState(2000);
  const { playDrop, playGoalReached } = useWaterSounds();

  const loadData = useCallback(async () => {
    const [today, history, goal] = await Promise.all([
      loadTodayWater(),
      loadWaterHistory(7),
      getWaterGoal(),
    ]);
    setTodayLog(today);
    setWeeklyData(history);
    setGoalMl(goal);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddWater = async (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const prevTotal = todayLog?.totalMl || 0;
    await addWaterIntake(amount);
    await loadData();
    playDrop();
    // Check if goal just reached
    if (prevTotal < goalMl && prevTotal + amount >= goalMl) {
      setTimeout(() => {
        playGoalReached();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
    }
  };

  const handleCustomAmount = () => {
    Alert.prompt(
      'Custom Amount',
      'Enter amount in ml:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (value) => {
            const amount = parseInt(value || '0', 10);
            if (amount > 0) handleAddWater(amount);
          },
        },
      ],
      'plain-text',
      '',
      'number-pad'
    );
  };

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert('Delete Entry', 'Remove this water entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWaterEntry(entryId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await loadData();
        },
      },
    ]);
  };

  const handleEditGoal = () => {
    Alert.prompt(
      'Daily Goal',
      'Set your daily water goal (ml):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (value) => {
            const goal = parseInt(value || '0', 10);
            if (goal >= 500 && goal <= 10000) {
              await setWaterGoal(goal);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await loadData();
            } else {
              Alert.alert('Invalid', 'Goal must be between 500ml and 10,000ml');
            }
          },
        },
      ],
      'plain-text',
      String(goalMl),
      'number-pad'
    );
  };

  const totalMl = todayLog?.totalMl || 0;
  const progress = Math.min(totalMl / goalMl, 1);
  const progressDeg = progress * 360;

  // Format time from timestamp
  const formatEntryTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
  };

  // Weekly chart max
  const weekMax = Math.max(goalMl, ...weeklyData.map(d => d.totalMl));
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <GradientBackground colors={GRADIENTS.ocean}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Hydration</Text>
          <TouchableOpacity onPress={handleEditGoal} style={styles.goalButton}>
            <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Guide subtitle */}
        <Text style={styles.subtitle}>
          Track your daily water intake to stay hydrated. Tap the buttons below to log each drink.
        </Text>

        {/* Progress Ring */}
        <GlassCard style={styles.progressCard}>
          <View style={styles.ringContainer}>
            {/* Background ring */}
            <View style={styles.ringBg} />
            {/* Progress ring using border trick */}
            <View
              style={[
                styles.ringProgress,
                {
                  borderColor: progress >= 1 ? '#38EF7D' : '#667EEA',
                  borderRightColor: progressDeg > 180 ? (progress >= 1 ? '#38EF7D' : '#667EEA') : 'transparent',
                  borderBottomColor: progressDeg > 90 ? (progress >= 1 ? '#38EF7D' : '#667EEA') : 'transparent',
                  borderLeftColor: progressDeg > 270 ? (progress >= 1 ? '#38EF7D' : '#667EEA') : 'transparent',
                  transform: [{ rotate: '-90deg' }],
                },
              ]}
            />
            {/* Center content */}
            <View style={styles.ringCenter}>
              <Ionicons
                name="water"
                size={28}
                color={progress >= 1 ? '#38EF7D' : '#667EEA'}
              />
              <Text style={styles.ringAmount}>{totalMl}</Text>
              <Text style={styles.ringGoal}>/ {goalMl} ml</Text>
              {progress >= 1 && (
                <View style={styles.goalReached}>
                  <Ionicons name="checkmark-circle" size={16} color="#38EF7D" />
                  <Text style={styles.goalReachedText}>Goal reached!</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
        </GlassCard>

        {/* Quick Add Buttons */}
        <GlassCard style={styles.quickAddCard}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddRow}>
            {[
              { label: '+250ml', amount: 250, icon: 'water-outline' as const },
              { label: '+500ml', amount: 500, icon: 'water' as const },
              { label: '+1L', amount: 1000, icon: 'beaker' as const },
            ].map((item) => (
              <TouchableOpacity
                key={item.amount}
                style={styles.quickAddButton}
                onPress={() => handleAddWater(item.amount)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']}
                  style={styles.quickAddGradient}
                >
                  <Ionicons name={item.icon} size={24} color="#667EEA" />
                  <Text style={styles.quickAddLabel}>{item.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={handleCustomAmount}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(255, 165, 0, 0.3)', 'rgba(255, 107, 107, 0.3)']}
                style={styles.quickAddGradient}
              >
                <Ionicons name="add-circle" size={24} color="#FFA500" />
                <Text style={styles.quickAddLabel}>Custom</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Weekly Chart */}
        <GlassCard style={styles.chartCard}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.chartContainer}>
            {weeklyData.slice().reverse().map((day, index) => {
              const dayDate = new Date(day.date + 'T00:00:00');
              const dayLabel = dayLabels[dayDate.getDay()];
              const barHeight = weekMax > 0 ? (day.totalMl / weekMax) * 120 : 0;
              const isToday = index === weeklyData.length - 1;
              const metGoal = day.totalMl >= day.goalMl;

              return (
                <View key={day.date} style={styles.chartBar}>
                  <Text style={styles.chartValue}>
                    {day.totalMl > 0 ? (day.totalMl >= 1000 ? `${(day.totalMl / 1000).toFixed(1)}L` : `${day.totalMl}`) : ''}
                  </Text>
                  <View style={styles.barWrapper}>
                    <LinearGradient
                      colors={metGoal
                        ? ['#38EF7D', '#11998e']
                        : isToday
                          ? ['#667EEA', '#764BA2']
                          : ['rgba(102, 126, 234, 0.4)', 'rgba(118, 75, 162, 0.4)']}
                      style={[styles.bar, { height: Math.max(barHeight, 4) }]}
                    />
                  </View>
                  <Text style={[styles.chartLabel, isToday && styles.chartLabelToday]}>
                    {dayLabel}
                  </Text>
                </View>
              );
            })}
          </View>
          {/* Goal line label */}
          <View style={styles.goalLine}>
            <View style={styles.goalLineDash} />
            <Text style={styles.goalLineLabel}>Goal: {goalMl}ml</Text>
          </View>
        </GlassCard>

        {/* Today's Log */}
        <GlassCard style={styles.logCard}>
          <Text style={styles.sectionTitle}>Today's Log</Text>
          {(!todayLog?.entries || todayLog.entries.length === 0) ? (
            <View style={styles.emptyLog}>
              <Ionicons name="water-outline" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyLogText}>No water logged yet today</Text>
              <Text style={styles.emptyLogSubtext}>Tap a quick add button above</Text>
            </View>
          ) : (
            todayLog.entries.map((entry: WaterIntake) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.logEntry}
                onLongPress={() => handleDeleteEntry(entry.id)}
              >
                <View style={styles.logLeft}>
                  <Ionicons name="water" size={18} color="#667EEA" />
                  <Text style={styles.logAmount}>{entry.amount}ml</Text>
                </View>
                <Text style={styles.logTime}>{formatEntryTime(entry.timestamp)}</Text>
              </TouchableOpacity>
            ))
          )}
        </GlassCard>

        {/* Back Button */}
        <GlassButton
          title="Back"
          onPress={() => navigation.goBack()}
          size="large"
          style={styles.backButtonLarge}
          icon={<Ionicons name="arrow-back" size={24} color={COLORS.white} />}
        />
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    fontSize: 32,
    flex: 1,
    marginLeft: 16,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  goalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Progress Ring
  progressCard: {
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ringBg: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ringProgress: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderTopColor: '#667EEA',
  },
  ringCenter: {
    alignItems: 'center',
  },
  ringAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  ringGoal: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: -2,
  },
  goalReached: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: 'rgba(56, 239, 125, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalReachedText: {
    ...TYPOGRAPHY.caption,
    color: '#38EF7D',
    fontWeight: '600',
  },
  progressPercent: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textSecondary,
  },
  // Quick Add
  quickAddCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: 16,
    fontWeight: '600',
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAddButton: {
    flex: 1,
  },
  quickAddGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 6,
  },
  quickAddLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  // Weekly Chart
  chartCard: {
    padding: 20,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 4,
  },
  barWrapper: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  chartLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontSize: 11,
  },
  chartLabelToday: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  goalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  goalLineDash: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  goalLineLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  // Today's Log
  logCard: {
    padding: 20,
    marginBottom: 16,
  },
  emptyLog: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyLogText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  emptyLogSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  logEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logAmount: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  logTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  backButtonLarge: {
    marginTop: 8,
  },
});

export default WaterTrackerScreen;
