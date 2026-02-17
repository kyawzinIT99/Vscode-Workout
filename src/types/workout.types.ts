/**
 * TypeScript Type Definitions
 * Complete type system for the workout app
 */

// ============================================================================
// EXERCISE TYPES
// ============================================================================

export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'yoga';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body'
  | 'cardio';

export type Equipment =
  | 'none'
  | 'dumbbells'
  | 'barbell'
  | 'kettlebell'
  | 'resistance_bands'
  | 'pull_up_bar'
  | 'bench'
  | 'yoga_mat'
  | 'foam_roller'
  | 'medicine_ball'
  | 'jump_rope';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: Difficulty;

  // YouTube Integration
  youtubeUrl: string;
  videoId: string; // Extracted from URL
  thumbnailUrl: string;
  videoDuration: number; // seconds

  // Exercise Metrics
  defaultSets?: number;
  defaultReps?: number;
  defaultDuration?: number; // seconds (for timed exercises)
  restTime: number; // seconds between sets
  caloriesPerRep?: number; // Estimated

  // Instructions
  instructions: string[];
  tips: string[];
  commonMistakes: string[];

  // Metadata
  tags: string[];
  alternativeExercises: string[]; // Exercise IDs
  isPopular: boolean;
  difficulty_score: number; // 1-10
}

// ============================================================================
// WORKOUT TYPES
// ============================================================================

export type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'yoga' | 'hiit' | 'hybrid';

export type WorkoutType = 'circuit' | 'straight_sets' | 'superset' | 'amrap' | 'emom';

export type FitnessGoal = 'strength' | 'endurance' | 'flexibility' | 'weight_loss' | 'muscle_gain';

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  duration?: number; // seconds (for timed)
  restTime: number;
  notes?: string;
  superset_with?: string; // Exercise ID if supersetted
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  category: WorkoutCategory;
  difficulty: Difficulty;

  // Workout Composition
  exercises: WorkoutExercise[];
  estimatedDuration: number; // minutes
  estimatedCalories: number;

  // Organization
  type: WorkoutType;
  rounds?: number; // For circuits

  // Metadata
  equipment: Equipment[];
  targetMuscles: MuscleGroup[];
  tags: string[];
  goals: FitnessGoal[];

  // Gradients & Styling
  primaryColor: string;
  gradientColors: string[];
  iconEmoji: string;

  // Analytics
  completionCount: number;
  averageRating: number;
  isPopular: boolean;
  isFeatured: boolean;
}

// ============================================================================
// USER & PROGRESS TYPES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  fitnessLevel: Difficulty;
  goals: FitnessGoal[];
  preferences: UserPreferences;
  stats: UserStats;
  createdAt: Date;
}

export interface UserPreferences {
  measurementSystem: 'metric' | 'imperial';
  defaultRestTime: number; // seconds
  hapticFeedback: boolean;
  soundEffects: boolean;
  voiceGuidance: boolean;
  theme: 'dark' | 'light' | 'auto';
}

export interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  totalCalories: number;
  favoriteCategory: string;
  achievements: Achievement[];
  personalRecords: PersonalRecord[];
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutName: string;
  date: Date;
  duration: number; // actual seconds

  // Performance
  exercisesCompleted: CompletedExercise[];
  totalSets: number;
  totalReps: number;
  estimatedCalories: number;

  // Tracking
  startTime: Date;
  endTime: Date;
  completionRate: number; // 0-100%

  // User Feedback
  difficultyRating?: number; // 1-5
  notes?: string;
  mood?: 'energized' | 'tired' | 'motivated' | 'sore';
}

export interface CompletedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: CompletedSet[];
  videoWatched: boolean;
}

export interface CompletedSet {
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  completed: boolean;
  restTaken: number; // actual rest seconds
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  type: 'max_weight' | 'max_reps' | 'best_time';
  value: number;
  unit: string;
  achievedAt: Date;
}

// ============================================================================
// ACHIEVEMENT TYPES
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'workouts' | 'exercises' | 'milestones';
  requirement: number;
  progress?: number; // 0-100%
  unlockedAt?: Date;
  gradientColors: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ============================================================================
// BODY MEASUREMENT TYPES
// ============================================================================

export interface BodyMeasurement {
  id: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
  photoUri?: string;
}

// ============================================================================
// WATER INTAKE TYPES
// ============================================================================

export interface WaterIntake {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // in ml
  timestamp: number; // epoch ms
}

export interface WaterDailyLog {
  date: string; // YYYY-MM-DD
  entries: WaterIntake[];
  totalMl: number;
  goalMl: number;
}

// ============================================================================
// YOUTUBE VIDEO TYPES
// ============================================================================

export interface VideoData {
  videoId: string;
  url: string;
  title: string;
  channel: string;
  duration: number;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
    maxres?: string;
  };
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  MainTabs: undefined;
  OnboardingFlow: undefined;
  WorkoutDetail: { workoutId: string };
  ExerciseDetail: { exerciseId: string };
  ActiveWorkout: { workoutId: string };
  WorkoutHistory: undefined;
  Settings: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Workouts: undefined;
  Exercises: undefined;
  Progress: undefined;
  Profile: undefined;
};

// ============================================================================
// CONTEXT STATE TYPES
// ============================================================================

export interface WorkoutContextState {
  currentWorkout: WorkoutProgram | null;
  activeSession: WorkoutSession | null;
  currentExerciseIndex: number;
  isWorkoutActive: boolean;
  isPaused: boolean;
  elapsedTime: number;
  startWorkout: (workout: WorkoutProgram) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  completeSet: (exerciseIndex: number, setIndex: number, setData: Partial<CompletedSet>) => void;
  nextExercise: () => void;
  previousExercise: () => void;
  endWorkout: () => Promise<void>;
}

export interface UserContextState {
  user: User | null;
  workoutHistory: WorkoutSession[];
  isLoading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addWorkoutSession: (session: WorkoutSession) => Promise<void>;
  loadUserData: () => Promise<void>;
  clearUserData: () => Promise<void>;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  stop: () => void;
}

export interface UseProgressReturn {
  stats: UserStats;
  recentWorkouts: WorkoutSession[];
  weeklyStats: {
    workouts: number;
    minutes: number;
    calories: number;
  };
  monthlyStats: {
    workouts: number;
    minutes: number;
    calories: number;
  };
  calculateProgress: () => void;
}
