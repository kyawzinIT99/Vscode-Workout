/**
 * AppNavigator
 * Main navigation stack for the app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import WorkoutDetailScreen from '../screens/workouts/WorkoutDetailScreen';
import ActiveWorkoutScreen from '../screens/workouts/ActiveWorkoutScreen';
import ExerciseDetailScreen from '../screens/exercises/ExerciseDetailScreen';
import CalorieCalculatorScreen from '../screens/nutrition/CalorieCalculatorScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import BodyMeasurementsScreen from '../screens/measurements/BodyMeasurementsScreen';
import WaterTrackerScreen from '../screens/water/WaterTrackerScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  WorkoutDetail: { workoutId: string };
  ActiveWorkout: undefined;
  ExerciseDetail: { exerciseId: string };
  CalorieCalculator: undefined;
  Settings: undefined;
  BodyMeasurements: undefined;
  WaterTracker: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
        <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
        <Stack.Screen name="CalorieCalculator" component={CalorieCalculatorScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} />
        <Stack.Screen name="WaterTracker" component={WaterTrackerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
