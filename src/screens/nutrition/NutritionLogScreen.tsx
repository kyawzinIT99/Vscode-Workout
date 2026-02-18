/**
 * NutritionLogScreen
 * Daily meal diary with macro tracking and weekly calorie chart
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  loadTodayNutrition,
  loadNutritionHistory,
  deleteNutritionEntry,
} from '../../services/storage';
import { NutritionDailyLog, NutritionEntry, MealType } from '../../types/workout.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MEAL_CONFIG: Record<MealType, { label: string; icon: string; color: string }> = {
  breakfast: { label: 'Breakfast', icon: 'sunny-outline', color: '#FFA500' },
  lunch: { label: 'Lunch', icon: 'restaurant-outline', color: '#38EF7D' },
  dinner: { label: 'Dinner', icon: 'moon-outline', color: '#667EEA' },
  snack: { label: 'Snack', icon: 'cafe-outline', color: '#F093FB' },
};

const NutritionLogScreen: React.FC = () => {
  const navigation = useNavigation();
  const [todayLog, setTodayLog] = useState<NutritionDailyLog | null>(null);
  const [weeklyData, setWeeklyData] = useState<NutritionDailyLog[]>([]);

  const loadData = useCallback(async () => {
    const [today, history] = await Promise.all([
      loadTodayNutrition(),
      loadNutritionHistory(7),
    ]);
    setTodayLog(today);
    setWeeklyData(history);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDeleteEntry = (entry: NutritionEntry) => {
    Alert.alert(
      'Delete Entry',
      `Remove this ${MEAL_CONFIG[entry.mealType].label.toLowerCase()} (${entry.totalCalories} kcal)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await deleteNutritionEntry(entry.id);
            await loadData();
          },
        },
      ]
    );
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  // Group today's entries by meal type
  const groupedMeals: Record<MealType, NutritionEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  todayLog?.entries.forEach(entry => {
    groupedMeals[entry.mealType].push(entry);
  });

  // Weekly chart data
  const maxCalories = Math.max(...weeklyData.map(d => d.totalCalories), 1);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <GradientBackground colors={GRADIENTS.forest}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircle}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Nutrition</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CalorieCalculator' as never)}
            style={styles.settingsCircle}
          >
            <Ionicons name="camera" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Track your daily meals and macros. Use the AI scanner to log food automatically.
        </Text>

        {/* Daily Summary Card */}
        <GlassCard style={styles.summaryCard} gradient={['rgba(17, 153, 142, 0.3)', 'rgba(56, 239, 125, 0.3)']}>
          <Text style={styles.summaryLabel}>Today's Calories</Text>
          <Text style={styles.summaryValue}>{todayLog?.totalCalories || 0}</Text>
          <Text style={styles.summaryUnit}>kcal</Text>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: '#FF6B6B' }]}>
                {todayLog?.totalProtein?.toFixed(1) || '0'}g
              </Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: '#FFA500' }]}>
                {todayLog?.totalCarbs?.toFixed(1) || '0'}g
              </Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: '#667EEA' }]}>
                {todayLog?.totalFat?.toFixed(1) || '0'}g
              </Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </GlassCard>

        {/* Meals by Type */}
        {(Object.keys(MEAL_CONFIG) as MealType[]).map(mealType => {
          const config = MEAL_CONFIG[mealType];
          const meals = groupedMeals[mealType];
          if (meals.length === 0) return null;

          return (
            <View key={mealType} style={styles.mealSection}>
              <View style={styles.mealSectionHeader}>
                <Ionicons name={config.icon as any} size={20} color={config.color} />
                <Text style={styles.mealSectionTitle}>{config.label}</Text>
                <Text style={styles.mealSectionCal}>
                  {meals.reduce((sum, m) => sum + m.totalCalories, 0)} kcal
                </Text>
              </View>

              {meals.map(entry => (
                <TouchableOpacity
                  key={entry.id}
                  onLongPress={() => handleDeleteEntry(entry)}
                  activeOpacity={0.7}
                >
                  <GlassCard style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryInfo}>
                        <Text style={styles.entryFoods} numberOfLines={2}>
                          {entry.foods.map(f => f.name).join(', ')}
                        </Text>
                        <Text style={styles.entryTime}>{formatTime(entry.timestamp)}</Text>
                      </View>
                      <View style={styles.entryCals}>
                        <Text style={styles.entryCalValue}>{entry.totalCalories}</Text>
                        <Text style={styles.entryCalUnit}>kcal</Text>
                      </View>
                    </View>
                    <View style={styles.entryMacros}>
                      <Text style={styles.entryMacroText}>P: {entry.totalProtein.toFixed(1)}g</Text>
                      <Text style={styles.entryMacroText}>C: {entry.totalCarbs.toFixed(1)}g</Text>
                      <Text style={styles.entryMacroText}>F: {entry.totalFat.toFixed(1)}g</Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        {/* Empty State */}
        {(!todayLog || todayLog.entries.length === 0) && (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="restaurant-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No meals logged today</Text>
            <Text style={styles.emptyText}>Scan your food with AI to start tracking</Text>
          </GlassCard>
        )}

        {/* Weekly Calorie Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Calories</Text>
          <GlassCard style={styles.chartCard}>
            <View style={styles.chartContainer}>
              {weeklyData.slice().reverse().map((day, index) => {
                const barHeight = maxCalories > 0 ? (day.totalCalories / maxCalories) * 120 : 0;
                const dayOfWeek = new Date(day.date + 'T12:00:00').getDay();
                const isToday = index === weeklyData.length - 1;

                return (
                  <View key={day.date} style={styles.chartBarWrapper}>
                    <Text style={styles.chartBarValue}>
                      {day.totalCalories > 0 ? day.totalCalories : ''}
                    </Text>
                    <View style={styles.chartBarBg}>
                      <LinearGradient
                        colors={isToday ? ['#38EF7D', '#11998E'] : ['rgba(56, 239, 125, 0.5)', 'rgba(17, 153, 142, 0.5)']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={[styles.chartBar, { height: Math.max(barHeight, 4) }]}
                      />
                    </View>
                    <Text style={[styles.chartLabel, isToday && styles.chartLabelToday]}>
                      {dayLabels[dayOfWeek]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>
        </View>

        {/* Scan Food Button */}
        <GlassButton
          title="Scan Food"
          onPress={() => navigation.navigate('CalorieCalculator' as never)}
          size="large"
          style={styles.scanButton}
          icon={<Ionicons name="camera" size={20} color={COLORS.white} />}
        />

        {/* Long-press hint */}
        {todayLog && todayLog.entries.length > 0 && (
          <Text style={styles.hintText}>Long-press an entry to delete it</Text>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  settingsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  // Summary Card
  summaryCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryLabel: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  summaryUnit: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  macroLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  macroDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  // Meal Sections
  mealSection: {
    marginBottom: 16,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  mealSectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  mealSectionCal: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  entryCard: {
    padding: 14,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  entryInfo: {
    flex: 1,
    marginRight: 12,
  },
  entryFoods: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  entryTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 11,
  },
  entryCals: {
    alignItems: 'flex-end',
  },
  entryCalValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  entryCalUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  entryMacros: {
    flexDirection: 'row',
    gap: 16,
  },
  entryMacroText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  // Empty State
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  // Chart
  chartSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chartCard: {
    padding: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
    paddingTop: 20,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBarValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 9,
    marginBottom: 4,
    height: 14,
  },
  chartBarBg: {
    width: 24,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    borderRadius: 12,
  },
  chartLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 6,
  },
  chartLabelToday: {
    color: '#38EF7D',
    fontWeight: 'bold',
  },
  // Buttons
  scanButton: {
    marginTop: 8,
  },
  hintText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 11,
  },
});

export default NutritionLogScreen;
