/**
 * BodyMeasurementsScreen
 * Track body measurements over time with weight chart
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useUserContext } from '../../context/UserContext';
import { BodyMeasurement } from '../../types/workout.types';
import { saveMeasurement, loadMeasurements, deleteMeasurement } from '../../services/storage';

const BodyMeasurementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useUserContext();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isMetric = user?.preferences?.measurementSystem !== 'imperial';
  const weightUnit = isMetric ? 'kg' : 'lbs';
  const lengthUnit = isMetric ? 'cm' : 'in';

  // Form state
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await loadMeasurements();
    setMeasurements(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setWeight('');
    setBodyFat('');
    setChest('');
    setWaist('');
    setHips('');
    setArms('');
    setThighs('');
    setNotes('');
  };

  const handleSave = async () => {
    if (!weight && !bodyFat && !chest && !waist && !hips && !arms && !thighs) {
      Alert.alert('Missing Data', 'Please enter at least one measurement.');
      return;
    }

    const measurement: BodyMeasurement = {
      id: `meas_${Date.now()}`,
      date: new Date(),
      weight: weight ? parseFloat(weight) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      arms: arms ? parseFloat(arms) : undefined,
      thighs: thighs ? parseFloat(thighs) : undefined,
      notes: notes || undefined,
    };

    await saveMeasurement(measurement);
    setMeasurements((prev) => [measurement, ...prev]);
    resetForm();
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this measurement?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMeasurement(id);
          setMeasurements((prev) => prev.filter((m) => m.id !== id));
        },
      },
    ]);
  };

  // Weight trend data for simple chart (last 10 entries, oldest first)
  const weightEntries = measurements
    .filter((m) => m.weight != null)
    .slice(0, 10)
    .reverse();

  const maxWeight = weightEntries.length > 0 ? Math.max(...weightEntries.map((e) => e.weight!)) : 100;
  const minWeight = weightEntries.length > 0 ? Math.min(...weightEntries.map((e) => e.weight!)) : 0;
  const weightRange = maxWeight - minWeight || 1;

  return (
    <GradientBackground colors={GRADIENTS.ocean}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.title}>Body Measurements</Text>
          </View>

          {/* Weight Trend Chart */}
          {weightEntries.length >= 2 && (
            <GlassCard style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="trending-up" size={22} color="#667EEA" />
                <Text style={styles.cardTitle}>Weight Trend</Text>
              </View>
              <View style={styles.chartContainer}>
                {weightEntries.map((entry, index) => {
                  const height = ((entry.weight! - minWeight) / weightRange) * 80 + 20;
                  const date = new Date(entry.date);
                  return (
                    <View key={entry.id} style={styles.chartBar}>
                      <Text style={styles.chartValue}>{entry.weight}</Text>
                      <View style={styles.chartBarWrapper}>
                        <LinearGradient
                          colors={['#667EEA', '#764BA2']}
                          start={{ x: 0, y: 1 }}
                          end={{ x: 0, y: 0 }}
                          style={[styles.chartBarFill, { height }]}
                        />
                      </View>
                      <Text style={styles.chartLabel}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.chartUnit}>{weightUnit}</Text>
            </GlassCard>
          )}

          {/* Quick Stats */}
          {measurements.length > 0 && (
            <View style={styles.quickStats}>
              <GlassCard style={styles.quickStatCard}>
                <Text style={styles.quickStatValue}>
                  {measurements[0]?.weight ?? '--'}
                </Text>
                <Text style={styles.quickStatLabel}>Latest ({weightUnit})</Text>
              </GlassCard>
              <GlassCard style={styles.quickStatCard}>
                <Text style={styles.quickStatValue}>{measurements.length}</Text>
                <Text style={styles.quickStatLabel}>Entries</Text>
              </GlassCard>
              <GlassCard style={styles.quickStatCard}>
                <Text style={styles.quickStatValue}>
                  {measurements[0]?.bodyFat != null ? `${measurements[0].bodyFat}%` : '--'}
                </Text>
                <Text style={styles.quickStatLabel}>Body Fat</Text>
              </GlassCard>
            </View>
          )}

          {/* Add New / Form */}
          {!showForm ? (
            <GlassButton
              title="Log New Measurement"
              onPress={() => setShowForm(true)}
              size="large"
              variant="primary"
              style={styles.addButton}
              icon={<Ionicons name="add-circle" size={22} color={COLORS.white} />}
            />
          ) : (
            <GlassCard style={styles.formCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="create" size={22} color="#38EF7D" />
                <Text style={styles.cardTitle}>New Entry</Text>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Weight ({weightUnit})</Text>
                  <TextInput
                    style={styles.formInput}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Body Fat (%)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={bodyFat}
                    onChangeText={setBodyFat}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Chest ({lengthUnit})</Text>
                  <TextInput
                    style={styles.formInput}
                    value={chest}
                    onChangeText={setChest}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Waist ({lengthUnit})</Text>
                  <TextInput
                    style={styles.formInput}
                    value={waist}
                    onChangeText={setWaist}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Hips ({lengthUnit})</Text>
                  <TextInput
                    style={styles.formInput}
                    value={hips}
                    onChangeText={setHips}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Arms ({lengthUnit})</Text>
                  <TextInput
                    style={styles.formInput}
                    value={arms}
                    onChangeText={setArms}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Thighs ({lengthUnit})</Text>
                  <TextInput
                    style={styles.formInput}
                    value={thighs}
                    onChangeText={setThighs}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
                <View style={styles.formField} />
              </View>

              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.formNotes]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder="Optional notes..."
                placeholderTextColor={COLORS.textTertiary}
              />

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => { resetForm(); setShowForm(false); }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <GlassButton
                  title="Save"
                  onPress={handleSave}
                  size="medium"
                  variant="primary"
                  style={styles.saveButton}
                  icon={<Ionicons name="checkmark" size={20} color={COLORS.white} />}
                />
              </View>
            </GlassCard>
          )}

          {/* History */}
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={22} color="#FFA500" />
              <Text style={styles.cardTitle}>History</Text>
            </View>

            {measurements.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="body" size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>No measurements yet</Text>
                <Text style={styles.emptySubtext}>Log your first measurement to start tracking!</Text>
              </View>
            ) : (
              measurements.slice(0, 20).map((m, index) => {
                const date = new Date(m.date);
                return (
                  <View key={m.id}>
                    <TouchableOpacity
                      style={styles.historyItem}
                      onLongPress={() => handleDelete(m.id)}
                    >
                      <View style={styles.historyLeft}>
                        <LinearGradient
                          colors={['rgba(102, 126, 234, 0.25)', 'rgba(118, 75, 162, 0.25)']}
                          style={styles.historyIcon}
                        >
                          <Ionicons name="body" size={18} color="#667EEA" />
                        </LinearGradient>
                        <View>
                          <Text style={styles.historyDate}>
                            {date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Text>
                          <View style={styles.historyDetails}>
                            {m.weight != null && (
                              <Text style={styles.historyDetail}>
                                {m.weight} {weightUnit}
                              </Text>
                            )}
                            {m.bodyFat != null && (
                              <Text style={styles.historyDetail}>{m.bodyFat}% BF</Text>
                            )}
                            {m.waist != null && (
                              <Text style={styles.historyDetail}>
                                Waist: {m.waist}{lengthUnit}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                      <Ionicons name="trash-outline" size={18} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                    {index < Math.min(measurements.length, 20) - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                );
              })
            )}
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
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
    gap: 16,
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
    fontSize: 28,
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
  // Chart
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 4,
  },
  chartBarWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  chartBarFill: {
    width: 20,
    borderRadius: 6,
    minHeight: 8,
  },
  chartLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 8,
    marginTop: 6,
  },
  chartUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: 8,
    fontSize: 11,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickStatCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  quickStatLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  // Form
  addButton: {
    marginBottom: 16,
  },
  formCard: {
    marginBottom: 16,
    padding: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formField: {
    flex: 1,
  },
  formLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontSize: 12,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formNotes: {
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  saveButton: {
    minWidth: 120,
  },
  // History
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
  historyDate: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  historyDetails: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  historyDetail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.white + '10',
  },
  // Empty
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
    textAlign: 'center',
  },
});

export default BodyMeasurementsScreen;
