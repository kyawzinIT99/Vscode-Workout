/**
 * MainTabs
 * Bottom tab navigator with glassmorphism styling
 */

import React from 'react';
import { Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './AppNavigator';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import WorkoutLibraryScreen from '../screens/workouts/WorkoutLibraryScreen';
import ExerciseLibraryScreen from '../screens/exercises/ExerciseLibraryScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Constants
import { COLORS, GLASS } from '../constants/colors';

export type MainTabsParamList = {
  Home: undefined;
  Workouts: undefined;
  CalorieScanner: undefined;
  Exercises: undefined;
  Progress: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

// Floating Action Button for Calorie Scanner
// IMPORTANT: Must be defined before MainTabs to avoid hoisting issues
const FloatingActionButton: React.FC = () => {
  return (
    <View style={styles.fabContainer}>
      <View style={styles.fabShadow} />
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53', '#FFA500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fabGradient}
      >
        <BlurView intensity={20} tint="light" style={styles.fabBlur}>
          <Ionicons name="camera" size={32} color={COLORS.white} />
        </BlurView>
      </LinearGradient>
      <View style={styles.fabRing} />
    </View>
  );
};

// Modern glassmorphism tab icon component
const TabIcon: React.FC<{ icon: keyof typeof Ionicons.glyphMap; focused: boolean }> = ({
  icon,
  focused,
}) => {
  return (
    <View style={styles.iconContainer}>
      {focused && (
        <View style={styles.activeBackground}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          />
        </View>
      )}
      <Ionicons
        name={icon}
        size={focused ? 28 : 24}
        color={focused ? COLORS.white : COLORS.textTertiary}
        style={styles.icon}
      />
    </View>
  );
};

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : GLASS.background,
          elevation: 0,
          height: 85,
          paddingBottom: 10,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: GLASS.background,
              borderTopWidth: 1,
              borderTopColor: GLASS.border,
            }}
          />
        ),
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutLibraryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="barbell" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CalorieScanner"
        component={HomeScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate('CalorieCalculator');
          },
        })}
        options={{
          tabBarIcon: () => <FloatingActionButton />,
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExerciseLibraryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="play-circle" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="trending-up" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="person-circle" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeBackground: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
  },
  icon: {
    zIndex: 1,
  },
  // Floating Action Button Styles
  fabContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    marginTop: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabShadow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B6B',
    opacity: 0.3,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fabBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
  },
  fabRing: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
});

export default MainTabs;
