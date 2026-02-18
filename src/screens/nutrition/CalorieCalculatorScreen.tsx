/**
 * CalorieCalculatorScreen
 * AI-powered food recognition and calorie tracking
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { recognizeFood, RecognitionResult } from '../../services/foodRecognition';
import { saveNutritionEntry } from '../../services/storage';
import { MealType, NutritionEntry } from '../../types/workout.types';
import * as Haptics from 'expo-haptics';

const CalorieCalculatorScreen: React.FC = () => {
  const navigation = useNavigation();
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Request camera permission
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to take photos of your food.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Upload photo from gallery
  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  // Analyze image with AI
  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const recognitionResult = await recognizeFood(imageUri);
      setResult(recognitionResult);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save scanned food to nutrition log
  const handleSaveToLog = () => {
    if (!result) return;
    Alert.alert(
      'Log Meal',
      'What type of meal is this?',
      [
        { text: 'Breakfast', onPress: () => saveMeal('breakfast') },
        { text: 'Lunch', onPress: () => saveMeal('lunch') },
        { text: 'Dinner', onPress: () => saveMeal('dinner') },
        { text: 'Snack', onPress: () => saveMeal('snack') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const saveMeal = async (mealType: MealType) => {
    if (!result) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const entry: NutritionEntry = {
      id: `nutrition_${Date.now()}`,
      date: dateStr,
      mealType,
      foods: result.foods.map(f => ({
        name: f.name,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        serving: f.serving,
        confidence: f.confidence,
      })),
      totalCalories: result.totalCalories,
      totalProtein: result.totalProtein,
      totalCarbs: result.totalCarbs,
      totalFat: result.totalFat,
      imageUri: result.imageUri,
      timestamp: Date.now(),
    };

    await saveNutritionEntry(entry);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved!', 'Meal logged successfully', [
      { text: 'View Log', onPress: () => navigation.navigate('NutritionLog' as never) },
      { text: 'OK' },
    ]);
  };

  // Reset and take new photo
  const handleReset = () => {
    setResult(null);
  };

  return (
    <GradientBackground colors={GRADIENTS.ocean}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Calorie Calculator</Text>
        <Text style={styles.subtitle}>
          Take a photo or upload an image of your food for AI-powered nutritional analysis
        </Text>

        {!result && !isAnalyzing && (
          <>
            {/* Action Buttons */}
            <GlassCard style={styles.actionCard}>
              <Text style={styles.actionTitle}>📸 How it works</Text>
              <Text style={styles.actionText}>
                1. Take a photo or upload an image of your meal{'\n'}
                2. Our AI analyzes the food{'\n'}
                3. Get instant calorie and nutrition info
              </Text>
            </GlassCard>

            <View style={styles.buttonContainer}>
              <GlassButton
                title="Take Photo"
                onPress={handleTakePhoto}
                size="large"
                style={styles.button}
                icon={<Text style={styles.buttonIcon}>📷</Text>}
              />

              <GlassButton
                title="Upload Photo"
                onPress={handleUploadPhoto}
                size="large"
                variant="secondary"
                style={styles.button}
                icon={<Text style={styles.buttonIcon}>🖼️</Text>}
              />
            </View>
          </>
        )}

        {/* Analyzing State */}
        {isAnalyzing && (
          <GlassCard style={styles.analyzingCard}>
            <Text style={styles.analyzingEmoji}>🤖</Text>
            <Text style={styles.analyzingTitle}>Analyzing your food...</Text>
            <Text style={styles.analyzingText}>
              Our AI is identifying ingredients and calculating nutrition
            </Text>
          </GlassCard>
        )}

        {/* Results */}
        {result && !isAnalyzing && (
          <>
            {/* Image Preview */}
            <GlassCard style={styles.imageCard} noBorder>
              <Image source={{ uri: result.imageUri }} style={styles.foodImage} />
            </GlassCard>

            {/* Total Calories Card */}
            <GlassCard style={styles.totalCard} gradient={GRADIENTS.fire}>
              <Text style={styles.totalLabel}>Total Calories</Text>
              <Text style={styles.totalValue}>{result.totalCalories}</Text>
              <Text style={styles.totalUnit}>kcal</Text>
            </GlassCard>

            {/* Macros */}
            <GlassCard style={styles.macrosCard}>
              <Text style={styles.sectionTitle}>Macronutrients</Text>
              <View style={styles.macrosGrid}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{result.totalProtein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{result.totalCarbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{result.totalFat}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </GlassCard>

            {/* Detected Foods */}
            <Text style={styles.sectionTitle}>Detected Foods</Text>
            {result.foods.map((food, index) => (
              <GlassCard key={`${index}-${food.name}`} style={styles.foodCard}>
                <View style={styles.foodHeader}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <View style={[styles.confidenceBadge, { opacity: food.confidence }]}>
                    <Text style={styles.confidenceText}>
                      {Math.round(food.confidence * 100)}% match
                    </Text>
                  </View>
                </View>
                <Text style={styles.serving}>{food.serving}</Text>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionText}>{food.calories} cal</Text>
                  <Text style={styles.nutritionText}>•</Text>
                  <Text style={styles.nutritionText}>{food.protein}g protein</Text>
                  <Text style={styles.nutritionText}>•</Text>
                  <Text style={styles.nutritionText}>{food.carbs}g carbs</Text>
                  <Text style={styles.nutritionText}>•</Text>
                  <Text style={styles.nutritionText}>{food.fat}g fat</Text>
                </View>
              </GlassCard>
            ))}

            {/* Action Buttons */}
            <View style={styles.resultActions}>
              <GlassButton
                title="Analyze Another"
                onPress={handleReset}
                style={styles.actionButton}
              />
              <GlassButton
                title="Save to Log"
                onPress={handleSaveToLog}
                variant="primary"
                style={styles.actionButton}
              />
            </View>
          </>
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
    paddingBottom: 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  backText: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    marginLeft: 8,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  actionCard: {
    marginBottom: 24,
    padding: 20,
  },
  actionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  actionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    marginBottom: 0,
  },
  buttonIcon: {
    fontSize: 20,
  },
  analyzingCard: {
    padding: 40,
    alignItems: 'center',
  },
  analyzingEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  analyzingTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  analyzingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  imageCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  totalCard: {
    marginBottom: 16,
    padding: 32,
    alignItems: 'center',
  },
  totalLabel: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  totalValue: {
    ...TYPOGRAPHY.display,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  totalUnit: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textSecondary,
  },
  macrosCard: {
    marginBottom: 24,
    padding: 20,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  macroLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  foodCard: {
    marginBottom: 12,
    padding: 16,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: COLORS.success + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontSize: 10,
  },
  serving: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nutritionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});

export default CalorieCalculatorScreen;
