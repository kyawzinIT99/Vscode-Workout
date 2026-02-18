/**
 * HomeScreen
 * Main dashboard with workout stats and quick actions
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useUserContext } from '../../context/UserContext';
import { WorkoutProgram } from '../../types/workout.types';
import workoutsData from '../../data/workouts.json';
import { loadTodayWater, addWaterIntake, getWaterGoal, loadTodayNutrition } from '../../services/storage';
import { WaterDailyLog, NutritionDailyLog } from '../../types/workout.types';
import useWaterSounds from '../../hooks/useWaterSounds';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useUserContext();
  const [featuredWorkouts, setFeaturedWorkouts] = useState<WorkoutProgram[]>([]);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [waterLog, setWaterLog] = useState<WaterDailyLog | null>(null);
  const [goalMl, setGoalMl] = useState(2000);
  const [nutritionLog, setNutritionLog] = useState<NutritionDailyLog | null>(null);
  const { playDrop, playGoalReached } = useWaterSounds();

  useEffect(() => {
    // Load featured workouts
    const featured = (workoutsData as WorkoutProgram[]).filter((w) => w.isFeatured);
    setFeaturedWorkouts(featured);

    // Determine time of day for greeting
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');
  }, []);

  // Reload water data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTodayWater().then(setWaterLog);
      getWaterGoal().then(setGoalMl);
      loadTodayNutrition().then(setNutritionLog);
    }, [])
  );

  const handleQuickAddWater = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const prevTotal = waterLog?.totalMl || 0;
    await addWaterIntake(250);
    const updated = await loadTodayWater();
    setWaterLog(updated);
    playDrop();
    if (prevTotal < goalMl && prevTotal + 250 >= goalMl) {
      setTimeout(() => {
        playGoalReached();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
    }
  };

  const waterProgress = waterLog ? Math.min(waterLog.totalMl / waterLog.goalMl, 1) : 0;

  const weeklyGoal = 5; // Weekly workout goal
  const weeklyProgress = user?.stats.currentStreak || 0;
  const progressPercentage = Math.min((weeklyProgress / weeklyGoal) * 100, 100);

  return (
    <GradientBackground colors={GRADIENTS.cosmos}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.greetingContainer}>
            <Text style={styles.timeOfDay}>Good {timeOfDay}</Text>
            <Text style={styles.heroTitle}>
              {user?.name || 'Champion'}! 👋
            </Text>
            <Text style={styles.heroSubtitle}>
              Let's make today legendary
            </Text>
          </View>

          {/* Circular Progress Ring */}
          <View style={styles.progressRing}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressNumber}>{weeklyProgress}</Text>
              <Text style={styles.progressLabel}>of {weeklyGoal}</Text>
              <Text style={styles.progressText}>this week</Text>
            </View>
            <Ionicons name="trophy" size={24} color={COLORS.primary} style={styles.trophyIcon} />
          </View>
        </View>

        {/* Quick Start Hero Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Workouts' as never)}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickStartButton}
          >
            <View style={styles.quickStartContent}>
              <View>
                <Text style={styles.quickStartTitle}>Start Your Workout</Text>
                <Text style={styles.quickStartSubtitle}>Choose from {workoutsData.length}+ programs</Text>
              </View>
              <View style={styles.quickStartIcon}>
                <Ionicons name="play-circle" size={48} color={COLORS.white} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCardLarge} gradient={['rgba(102, 126, 234, 0.19)', 'rgba(118, 75, 162, 0.19)']}>
            <Ionicons name="flame" size={32} color="#FF6B6B" />
            <Text style={styles.statValueLarge}>{user?.stats.currentStreak || 0}</Text>
            <Text style={styles.statLabelLarge}>Day Streak</Text>
          </GlassCard>

          <View style={styles.statsColumn}>
            <GlassCard style={styles.statCardSmall} gradient={['rgba(17, 153, 142, 0.19)', 'rgba(56, 239, 125, 0.19)']}>
              <Ionicons name="barbell" size={24} color="#38EF7D" />
              <Text style={styles.statValueSmall}>{user?.stats.totalWorkouts || 0}</Text>
              <Text style={styles.statLabelSmall}>Workouts</Text>
            </GlassCard>

            <GlassCard style={styles.statCardSmall} gradient={['rgba(248, 54, 0, 0.19)', 'rgba(254, 140, 0, 0.19)']}>
              <Ionicons name="time" size={24} color="#FFA500" />
              <Text style={styles.statValueSmall}>{user?.stats.totalMinutes || 0}</Text>
              <Text style={styles.statLabelSmall}>Minutes</Text>
            </GlassCard>
          </View>

          <View style={styles.statsColumn}>
            <GlassCard style={styles.statCardSmall} gradient={['rgba(74, 0, 224, 0.19)', 'rgba(142, 45, 226, 0.19)']}>
              <Ionicons name="trending-up" size={24} color="#8E2DE2" />
              <Text style={styles.statValueSmall}>{user?.stats.totalCalories || 0}</Text>
              <Text style={styles.statLabelSmall}>Calories</Text>
            </GlassCard>

            <GlassCard style={styles.statCardSmall} gradient={['rgba(255, 107, 107, 0.19)', 'rgba(78, 205, 196, 0.19)']}>
              <Ionicons name="trophy" size={24} color="#4ECDC4" />
              <Text style={styles.statValueSmall}>{user?.stats.achievements?.length || 0}</Text>
              <Text style={styles.statLabelSmall}>Badges</Text>
            </GlassCard>
          </View>
        </View>

        {/* Water Tracker Widget */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('WaterTracker' as never)}
        >
          <GlassCard style={styles.waterCard} gradient={['rgba(102, 126, 234, 0.25)', 'rgba(118, 75, 162, 0.25)']}>
            <View style={styles.waterCardContent}>
              <View style={styles.waterLeft}>
                {/* Mini progress ring */}
                <View style={styles.waterRing}>
                  <View style={styles.waterRingBg} />
                  <View style={[
                    styles.waterRingFill,
                    {
                      borderColor: waterProgress >= 1 ? '#38EF7D' : '#667EEA',
                      borderRightColor: waterProgress * 360 > 180 ? (waterProgress >= 1 ? '#38EF7D' : '#667EEA') : 'transparent',
                      borderBottomColor: waterProgress * 360 > 90 ? (waterProgress >= 1 ? '#38EF7D' : '#667EEA') : 'transparent',
                      borderLeftColor: waterProgress * 360 > 270 ? (waterProgress >= 1 ? '#38EF7D' : '#667EEA') : 'transparent',
                      transform: [{ rotate: '-90deg' }],
                    },
                  ]} />
                  <Ionicons name="water" size={20} color={waterProgress >= 1 ? '#38EF7D' : '#667EEA'} />
                </View>
                <View style={styles.waterInfo}>
                  <Text style={styles.waterTitle}>Daily Water Intake</Text>
                  <Text style={styles.waterAmount}>
                    {waterLog?.totalMl || 0} / {waterLog?.goalMl || 2000} ml
                  </Text>
                  <Text style={styles.waterHint}>Tap to log your drinks</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </View>
            {/* Progress bar */}
            <View style={styles.waterProgressBar}>
              <View style={[
                styles.waterProgressFill,
                {
                  width: `${waterProgress * 100}%`,
                  backgroundColor: waterProgress >= 1 ? '#38EF7D' : '#667EEA',
                },
              ]} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Quick Add Water — separate from card so it's always tappable */}
        <TouchableOpacity
          style={styles.waterQuickAddStandalone}
          onPress={handleQuickAddWater}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.waterQuickAddGradient}
          >
            <Ionicons name="water" size={18} color={COLORS.white} />
            <Text style={styles.waterQuickAddText}>+250ml</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Nutrition Summary Widget */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('NutritionLog' as never)}
        >
          <GlassCard style={styles.nutritionCard} gradient={['rgba(17, 153, 142, 0.25)', 'rgba(56, 239, 125, 0.25)']}>
            <View style={styles.nutritionCardContent}>
              <View style={styles.nutritionLeft}>
                <View style={styles.nutritionIcon}>
                  <Ionicons name="restaurant" size={20} color="#38EF7D" />
                </View>
                <View style={styles.nutritionInfo}>
                  <Text style={styles.nutritionTitle}>Today's Nutrition</Text>
                  <Text style={styles.nutritionAmount}>
                    {nutritionLog?.totalCalories || 0} kcal
                  </Text>
                  <Text style={styles.nutritionMacros}>
                    P: {nutritionLog?.totalProtein?.toFixed(0) || 0}g  C: {nutritionLog?.totalCarbs?.toFixed(0) || 0}g  F: {nutritionLog?.totalFat?.toFixed(0) || 0}g
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Featured Workouts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Workouts</Text>
          <Ionicons name="star" size={20} color="#FFA500" />
        </View>

        {featuredWorkouts.slice(0, 3).map((workout, index) => (
          <TouchableOpacity
            key={workout.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WorkoutDetail' as never, { workoutId: workout.id } as never)}
          >
            <GlassCard
              style={[styles.workoutCard, { marginTop: index * 4 }]}
              gradient={workout.gradientColors.map((c) => c + '30')}
            >
              <View style={styles.workoutCardHeader}>
                <LinearGradient
                  colors={workout.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.workoutIconContainer}
                >
                  <Text style={styles.workoutEmoji}>{workout.iconEmoji}</Text>
                </LinearGradient>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <View style={styles.workoutMetaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.workoutMeta}>{workout.estimatedDuration} min</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="flash-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.workoutMeta}>{workout.difficulty}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="flame-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.workoutMeta}>{workout.estimatedCalories} cal</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        {/* AI Calorie Scanner Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CalorieCalculator' as never)}
        >
          <GlassCard style={styles.aiCard} gradient={['rgba(17, 153, 142, 0.25)', 'rgba(56, 239, 125, 0.25)']}>
            <LinearGradient
              colors={['#11998E', '#38EF7D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiIconBg}
            >
              <Ionicons name="camera" size={32} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.aiInfo}>
              <Text style={styles.aiTitle}>AI Food Scanner</Text>
              <Text style={styles.aiSubtitle}>Snap a photo, track your calories</Text>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={12} color="#FFA500" />
                <Text style={styles.aiBadgeText}>Powered by OpenAI</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color={COLORS.white} />
          </GlassCard>
        </TouchableOpacity>

        {/* Browse All Button */}
        <GlassButton
          title="Explore All Workouts"
          onPress={() => navigation.navigate('Workouts' as never)}
          size="large"
          style={styles.exploreButton}
          icon={<Ionicons name="grid" size={20} color={COLORS.white} />}
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
    paddingTop: 60,
    paddingBottom: 120,
  },
  hero: {
    marginBottom: 24,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  timeOfDay: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  progressRing: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 8,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  progressLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: -4,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  trophyIcon: {
    position: 'absolute',
    top: -10,
    right: width / 2 - 90,
  },
  quickStartButton: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  quickStartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickStartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  quickStartSubtitle: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quickStartIcon: {
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCardLarge: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  statsColumn: {
    flex: 1,
    gap: 12,
  },
  statCardSmall: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValueLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statLabelLarge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  statValueSmall: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  statLabelSmall: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  // Water Tracker Widget
  waterCard: {
    padding: 16,
    marginBottom: 24,
  },
  waterCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  waterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  waterRing: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterRingBg: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  waterRingFill: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderTopColor: '#667EEA',
  },
  waterInfo: {
    gap: 2,
  },
  waterTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  waterAmount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  waterHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 11,
    marginTop: 2,
  },
  waterProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  waterQuickAddStandalone: {
    alignSelf: 'center',
    borderRadius: 20,
    marginTop: -12,
    marginBottom: 20,
  },
  waterQuickAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
    borderRadius: 20,
  },
  waterQuickAddText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
  // Nutrition Widget
  nutritionCard: {
    padding: 16,
    marginBottom: 24,
  },
  nutritionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nutritionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  nutritionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 239, 125, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutritionInfo: {
    gap: 2,
  },
  nutritionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  nutritionAmount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  nutritionMacros: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  workoutCard: {
    marginBottom: 12,
    padding: 16,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutEmoji: {
    fontSize: 28,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: 6,
    fontSize: 17,
    fontWeight: '600',
  },
  workoutMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  aiCard: {
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiInfo: {
    flex: 1,
  },
  aiTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: 4,
    fontWeight: '600',
  },
  aiSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  aiBadgeText: {
    ...TYPOGRAPHY.caption,
    color: '#FFA500',
    fontSize: 10,
    fontWeight: '600',
  },
  exploreButton: {
    marginTop: 8,
  },
});

export default HomeScreen;
