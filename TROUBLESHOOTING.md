# Workout App — Troubleshooting & Developer Guide

## Quick Reference: Known Fixes Already Applied

| Issue | Root Cause | File Fixed |
|-------|-----------|------------|
| Buttons unresponsive on all screens | `GradientBackground` used reanimated worklets (disabled) | `GradientBackground.tsx` |
| GlassButton press not registering on Android | Double-wrap: `Animated.View` + `TouchableOpacity` | `GlassButton.tsx` |
| "cannot set prop 'color' on Android" | 8-digit hex `#RRGGBBAA` in LinearGradient colors | `HomeScreen`, `SettingsScreen`, `ProfileScreen`, `WorkoutLibraryScreen` |
| Workout buttons not visible | Buttons inside ScrollView, users had to scroll | `ActiveWorkoutScreen.tsx` |
| Profile edit unresponsive on Android | Missing `keyboardShouldPersistTaps` + status bar padding | `ProfileScreen.tsx` |
| Android build: Java not found | System Java is a stub | Set `JAVA_HOME` to Android Studio JDK |
| Android build: SDK not found | Missing `local.properties` | `android/local.properties` |
| iOS build: CocoaPods encoding error | Terminal locale not UTF-8 | Set `LANG=en_US.UTF-8` |
| Exposed API key | Hardcoded in source | `foodRecognition.ts` → env variable |
| App crash on Android (LinearGradient) | `gradientColors.map(c => c + '30')` 8-digit hex | `WorkoutLibraryScreen.tsx` → `hexToRgba()` |

---

## 1. App Won't Start / White Screen

**Check Metro bundler:**
```bash
cd vscode-workout
npx expo start --clear
```

**Check for JS errors:**
- Shake device → "Show Dev Menu" → "Show Error"
- Metro terminal shows red error with stack trace

**Common causes:**
- Missing import (check the file named in the error)
- `react-native-reanimated` usage (plugin is disabled in `babel.config.js`)
- Syntax error in recently edited file

---

## 2. Reanimated / WorkletsError

**Symptom:** App crashes with `WorkletsError` or blank screen

**Cause:** `react-native-reanimated/plugin` is commented out in `babel.config.js`

**Rule:** Do NOT use any of these in any file:
```typescript
// ❌ These will crash the app
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
```

**Safe alternative — use React Native built-in Animated:**
```typescript
// ✅ Safe
import { Animated } from 'react-native';
const scale = useRef(new Animated.Value(1)).current;
Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
```

**To re-enable reanimated (requires native rebuild):**
```javascript
// babel.config.js — uncomment this line:
plugins: ['react-native-reanimated/plugin']
// Then run: npx expo run:ios  OR  npx expo run:android
```

---

## 3. "Cannot Set Prop 'color' on Android"

**Cause:** Android API < 26 does not support 8-digit hex colors (`#RRGGBBAA`)

**Where this breaks:** Inside `LinearGradient colors={[...]}` prop and `GlassCard gradient={[...]}` prop

**Safe pattern — always use rgba():**
```typescript
// ❌ Crashes on Android
gradient={['#667EEA30', '#764BA230']}
backgroundColor: '#667EEA30'

// ✅ Safe everywhere
gradient={['rgba(102, 126, 234, 0.19)', 'rgba(118, 75, 162, 0.19)']}
backgroundColor: 'rgba(102, 126, 234, 0.19)'
```

**Helper to convert (already in WorkoutLibraryScreen.tsx):**
```typescript
const hexToRgba = (hex: string, alpha: number): string => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
// Usage: hexToRgba('#667EEA', 0.19)  →  'rgba(102, 126, 234, 0.19)'
```

**Note:** `COLORS.white + '30'` in StyleSheet `backgroundColor`/`borderColor` is OK — only LinearGradient colors prop is affected.

---

## 4. Touch / Button Not Working

**Diagnostic checklist:**

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Nothing responds anywhere | GradientBackground using reanimated | Check `GradientBackground.tsx` for reanimated imports |
| Button visually scales but press misses | Double-wrap `Animated.View` + `TouchableOpacity` | Use `Animated.createAnimatedComponent(TouchableOpacity)` |
| ScrollView swallow taps | Missing `keyboardShouldPersistTaps` | Add `keyboardShouldPersistTaps="handled"` to ScrollView |
| Buttons cut off at bottom | Buttons inside ScrollView | Move buttons to fixed `View` outside ScrollView |
| Android only: tap registers wrong position | `useNativeDriver: true` + layout transforms | Verify TouchableOpacity is the animated component, not a wrapper |

**Pattern for workout action buttons (already implemented in ActiveWorkoutScreen):**
```tsx
// ✅ Correct: fixed bottom bar outside ScrollView
<View style={styles.container}>
  <ScrollView>
    {/* Content only — no buttons here */}
  </ScrollView>
  <View style={styles.bottomBar}>
    <GlassButton title="Complete Set" onPress={handleCompleteSet} />
  </View>
</View>
```

---

## 5. Android Build Failures

### Java Not Found
```bash
# Error: The operation couldn't be completed. Unable to locate a Java Runtime.
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
```

### SDK Location Not Found
```bash
# Error: SDK location not found. Define a valid SDK location with an ANDROID_HOME env var
echo "sdk.dir=/Users/$USER/Library/Android/sdk" > android/local.properties
```

### Full Android Build Command
```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
npx expo run:android
```

---

## 6. iOS Build Failures

### CocoaPods Encoding Error
```bash
# Error: ... encoding issues
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
npx expo run:ios
```

### Simulator Not Booting
```bash
# Boot simulator first:
xcrun simctl boot "iPhone 17 Pro"
# Then run:
npx expo run:ios
```

### Full iOS Build Command
```bash
export LANG=en_US.UTF-8 && npx expo run:ios
```

---

## 7. Running Both Simulators Simultaneously

```bash
# Terminal 1 — iOS
export LANG=en_US.UTF-8
npx expo run:ios

# Terminal 2 — Android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
npx expo run:android

# Hot reload (after JS changes — no rebuild needed):
# Press 'r' in Metro terminal  OR  shake device → Reload
```

---

## 8. AI Food Recognition Not Working

**Check 1:** Is the API key configured?
```bash
# In .env.local (never commit this file):
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

**Check 2:** Is mock data showing instead of real AI?
- If `EXPO_PUBLIC_OPENAI_API_KEY` is empty → app automatically uses mock data
- Mock data is realistic demo data (random food items)
- Real AI requires a valid, unrevoked OpenAI key

**Check 3:** Key was compromised?
- Go to platform.openai.com/api-keys
- Delete old key → Create new key
- Paste new key in `.env.local`
- Restart Metro: `npx expo start --clear`

---

## 9. Navigation Errors

**"navigate() called with unknown route"**
- Check `AppNavigator.tsx` for the screen name spelling
- All valid routes: `MainTabs`, `WorkoutDetail`, `ActiveWorkout`, `ExerciseDetail`, `CalorieCalculator`, `Settings`

**"No active workout" shown on ActiveWorkoutScreen**
- `startWorkout()` must be called from `WorkoutContext` before navigating
- Verify `WorkoutDetailScreen` calls `startWorkout(workout)` before `navigation.navigate('ActiveWorkout')`

**Screen missing from tabs**
- Check `MainTabs.tsx` for the tab configuration
- Tabs: `Home`, `Workouts`, `Exercises`, `Progress`, `Profile`

---

## 10. AsyncStorage / Data Not Persisting

**Check storage keys in `storage.ts`:**
```typescript
const STORAGE_KEYS = {
  USER: '@workout_user',
  WORKOUT_HISTORY: '@workout_history',
  USER_STATS: '@workout_stats',
};
```

**Clear all data (for testing fresh state):**
```typescript
// From SettingsScreen — "Clear Data" button calls:
await AsyncStorage.multiRemove([...Object.values(STORAGE_KEYS)]);
```

**Debug stored data:**
```typescript
const allKeys = await AsyncStorage.getAllKeys();
console.log('Stored keys:', allKeys);
```

---

## 11. Performance Issues

**Slow list screens:**
- `WorkoutLibraryScreen` and `ExerciseLibraryScreen` use `FlatList` (virtualized) — OK
- If adding more screens with lists, always use `FlatList` not `ScrollView + .map()`

**Jank during animations:**
- All animations use `useNativeDriver: true` — runs on UI thread
- If adding new animations, always include `useNativeDriver: true`

**Memory leaks:**
- Timer in `ActiveWorkoutScreen` uses `clearTimeout` in cleanup — OK
- `useTimer` hook uses `clearInterval` in cleanup — OK
- If adding new intervals/timeouts, always return cleanup from `useEffect`

---

## 12. Git & Deployment

### Push Changes to GitHub
```bash
git add src/           # or specific files
git status             # verify what's staged
git commit -m "Fix: describe what you fixed"
git push
```

### Files That Must NEVER Be Committed
- `.env.local` — contains API key (gitignored automatically)
- `android/local.properties` — contains machine-specific SDK path
- `node_modules/` — dependencies (gitignored)
- `ios/` and `android/` — native folders (regenerated with `npx expo prebuild`)

### Before EAP Submission Checklist
- [ ] OpenAI API key rotated (old one was exposed)
- [ ] New key in `.env.local`
- [ ] `npx expo prebuild` to regenerate native folders
- [ ] Test on physical iPhone (not just simulator) for haptics
- [ ] Test on physical Android device for blur effects
- [ ] Verify all gradients display correctly on Android

---

## 13. Design System Quick Reference

### Safe Color Formats
```typescript
// ✅ Always safe (use these)
'rgba(255, 255, 255, 0.1)'
COLORS.primary                    // #667EEA (6-digit hex)

// ✅ OK in StyleSheet only (backgroundColor, borderColor, color)
COLORS.white + '20'               // Produces #FFFFFF20 — works in StyleSheet
COLORS.primary + '30'             // Produces #667EEA30 — works in StyleSheet

// ❌ NEVER in LinearGradient colors prop
'#667EEA30'                       // 8-digit hex — crashes Android API < 26
COLORS.primary + '30'             // Same issue in gradient prop
```

### Gradient Usage
```typescript
// ✅ Correct — use named gradients from colors.ts
<GradientBackground colors={GRADIENTS.fire} />
<GlassCard gradient={GRADIENTS.ocean} />

// ✅ Correct — dynamic colors from data, converted to rgba
const safeGradient = workout.gradientColors.map(c => hexToRgba(c, 0.19));
<GlassCard gradient={safeGradient} />
```

### Available Gradients (in `colors.ts`)
| Name | Colors | Used For |
|------|--------|---------|
| `GRADIENTS.fire` | Red → Orange → Yellow | Active workout, HIIT |
| `GRADIENTS.ocean` | Purple → Violet | Cardio, Calorie screen |
| `GRADIENTS.forest` | Teal → Green | Flexibility |
| `GRADIENTS.cosmos` | Deep purple | Yoga, Finish button |
| `GRADIENTS.sunrise` | Pink → Orange | Strength |
