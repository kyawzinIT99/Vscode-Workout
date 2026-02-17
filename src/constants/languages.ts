/**
 * Multi-language support
 * Translations for English, Thai, and Myanmar
 */

export type Language = 'en' | 'th' | 'my';

export interface Translations {
  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  close: string;
  back: string;
  next: string;
  previous: string;

  // Home Screen
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  welcome: string;
  legendaryDay: string;
  startWorkout: string;
  choosePrograms: string;
  dayStreak: string;
  workouts: string;
  minutes: string;
  calories: string;
  badges: string;
  featuredWorkouts: string;
  exploreWorkouts: string;

  // Profile
  profile: string;
  personalInfo: string;
  name: string;
  email: string;
  yourStats: string;
  fitnessGoals: string;
  preferences: string;
  developer: string;
  notifications: string;
  theme: string;
  language: string;
  saveChanges: string;
  profileUpdated: string;
  tapToChange: string;
  removePhoto: string;

  // Workout
  activeWorkout: string;
  completeSet: string;
  nextExercise: string;
  finishWorkout: string;
  endWorkoutEarly: string;
  restTime: string;
  getReady: string;
  sets: string;
  reps: string;
  duration: string;
  allSetsCompleted: string;

  // Settings
  settings: string;
  selectLanguage: string;
  enableNotifications: string;
  darkMode: string;
  dataStorage: string;
  clearData: string;
  clearDataWarning: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',

    // Home Screen
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    welcome: 'Welcome',
    legendaryDay: "Let's make today legendary",
    startWorkout: 'Start Your Workout',
    choosePrograms: 'Choose from {count}+ programs',
    dayStreak: 'Day Streak',
    workouts: 'Workouts',
    minutes: 'Minutes',
    calories: 'Calories',
    badges: 'Badges',
    featuredWorkouts: 'Featured Workouts',
    exploreWorkouts: 'Explore All Workouts',

    // Profile
    profile: 'Profile',
    personalInfo: 'Personal Information',
    name: 'Name',
    email: 'Email',
    yourStats: 'Your Stats',
    fitnessGoals: 'Fitness Goals',
    preferences: 'Preferences',
    developer: 'Developer',
    notifications: 'Notifications',
    theme: 'Theme',
    language: 'Language',
    saveChanges: 'Save Changes',
    profileUpdated: 'Your profile has been updated successfully!',
    tapToChange: 'Tap to change photo',
    removePhoto: 'Remove Photo',

    // Workout
    activeWorkout: 'Active Workout',
    completeSet: 'Complete Set',
    nextExercise: 'Next Exercise',
    finishWorkout: 'Finish Workout',
    endWorkoutEarly: 'End Workout Early',
    restTime: 'Rest Time',
    getReady: 'Get ready for the next set!',
    sets: 'Sets',
    reps: 'Reps',
    duration: 'Duration',
    allSetsCompleted: 'All sets completed!',

    // Settings
    settings: 'Settings',
    selectLanguage: 'Select Language',
    enableNotifications: 'Enable Notifications',
    darkMode: 'Dark Mode',
    dataStorage: 'Data Storage',
    clearData: 'Clear All Data',
    clearDataWarning: 'This will delete all your workout history and profile data. This action cannot be undone.',
  },

  th: {
    // Common
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    delete: 'ลบ',
    edit: 'แก้ไข',
    close: 'ปิด',
    back: 'กลับ',
    next: 'ถัดไป',
    previous: 'ก่อนหน้า',

    // Home Screen
    goodMorning: 'สวัสดีตอนเช้า',
    goodAfternoon: 'สวัสดีตอนบ่าย',
    goodEvening: 'สวัสดีตอนเย็น',
    welcome: 'ยินดีต้อนรับ',
    legendaryDay: 'มาทำให้วันนี้เป็นตำนานกัน',
    startWorkout: 'เริ่มออกกำลังกาย',
    choosePrograms: 'เลือกจากโปรแกรม {count}+',
    dayStreak: 'วันต่อเนื่อง',
    workouts: 'การออกกำลังกาย',
    minutes: 'นาที',
    calories: 'แคลอรี่',
    badges: 'ตราสัญลักษณ์',
    featuredWorkouts: 'โปรแกรมแนะนำ',
    exploreWorkouts: 'สำรวจทุกโปรแกรม',

    // Profile
    profile: 'โปรไฟล์',
    personalInfo: 'ข้อมูลส่วนตัว',
    name: 'ชื่อ',
    email: 'อีเมล',
    yourStats: 'สถิติของคุณ',
    fitnessGoals: 'เป้าหมายฟิตเนส',
    preferences: 'การตั้งค่า',
    developer: 'ผู้พัฒนา',
    notifications: 'การแจ้งเตือน',
    theme: 'ธีม',
    language: 'ภาษา',
    saveChanges: 'บันทึกการเปลี่ยนแปลง',
    profileUpdated: 'อัปเดตโปรไฟล์สำเร็จแล้ว!',
    tapToChange: 'แตะเพื่อเปลี่ยนรูปภาพ',
    removePhoto: 'ลบรูปภาพ',

    // Workout
    activeWorkout: 'กำลังออกกำลังกาย',
    completeSet: 'เสร็จสิ้นชุด',
    nextExercise: 'ท่าถัดไป',
    finishWorkout: 'เสร็จสิ้น',
    endWorkoutEarly: 'จบก่อนกำหนด',
    restTime: 'เวลาพัก',
    getReady: 'เตรียมพร้อมสำหรับชุดถัดไป!',
    sets: 'ชุด',
    reps: 'ครั้ง',
    duration: 'ระยะเวลา',
    allSetsCompleted: 'ทำครบทุกชุดแล้ว!',

    // Settings
    settings: 'การตั้งค่า',
    selectLanguage: 'เลือกภาษา',
    enableNotifications: 'เปิดการแจ้งเตือน',
    darkMode: 'โหมดมืด',
    dataStorage: 'การจัดเก็บข้อมูล',
    clearData: 'ลบข้อมูลทั้งหมด',
    clearDataWarning: 'การดำเนินการนี้จะลบประวัติการออกกำลังกายและข้อมูลโปรไฟล์ทั้งหมด ไม่สามารถยกเลิกได้',
  },

  my: {
    // Common (Myanmar/Burmese)
    save: 'သိမ်းဆည်းမည်',
    cancel: 'ပယ်ဖျက်မည်',
    delete: 'ဖျက်မည်',
    edit: 'တည်းဖြတ်မည်',
    close: 'ပိတ်မည်',
    back: 'နောက်သို့',
    next: 'ရှေ့သို့',
    previous: 'ယခင်',

    // Home Screen
    goodMorning: 'မင်္ဂလာနံနက်ခင်းပါ',
    goodAfternoon: 'မင်္ဂလာနေ့လည်ခင်းပါ',
    goodEvening: 'မင်္ဂလာညနေခင်းပါ',
    welcome: 'ကြိုဆိုပါတယ်',
    legendaryDay: 'ဒီနေ့ကို ထူးခြားအောင်လုပ်ကြမယ်',
    startWorkout: 'လေ့ကျင့်ခန်းစတင်မည်',
    choosePrograms: 'အစီအစဉ် {count}+ မှ ရွေးချယ်ပါ',
    dayStreak: 'ဆက်တိုက်ရက်',
    workouts: 'လေ့ကျင့်ခန်းများ',
    minutes: 'မိနစ်',
    calories: 'ကယ်လိုရီ',
    badges: 'တံဆိပ်',
    featuredWorkouts: 'အထူးအစီအစဉ်များ',
    exploreWorkouts: 'အားလုံးကြည့်မည်',

    // Profile
    profile: 'ပရိုဖိုင်',
    personalInfo: 'ကိုယ်ပိုင်အချက်အလက်',
    name: 'အမည်',
    email: 'အီးမေးလ်',
    yourStats: 'သင့်စာရင်း',
    fitnessGoals: 'ကြံ့ခိုင်ရေးပန်းတိုင်',
    preferences: 'ရွေးချယ်မှုများ',
    developer: 'ဖန်တီးသူ',
    notifications: 'အကြောင်းကြားချက်',
    theme: 'အပြင်အဆင်',
    language: 'ဘာသာစကား',
    saveChanges: 'ပြောင်းလဲမှုသိမ်းမည်',
    profileUpdated: 'ပရိုဖိုင်ကို အောင်မြင်စွာ အပ်ဒိတ်လုပ်ပြီးပါပြီ!',
    tapToChange: 'ဓာတ်ပုံပြောင်းရန် နှိပ်ပါ',
    removePhoto: 'ဓာတ်ပုံဖျက်မည်',

    // Workout
    activeWorkout: 'လက်ရှိလေ့ကျင့်ခန်း',
    completeSet: 'အစုပြီးမည်',
    nextExercise: 'နောက်အခန်း',
    finishWorkout: 'ပြီးမြောက်ပြီ',
    endWorkoutEarly: 'စောစောပိတ်မည်',
    restTime: 'အနားယူချိန်',
    getReady: 'နောက်အစုအတွက် အဆင်သင့်ဖြစ်ပါ!',
    sets: 'အစု',
    reps: 'အကြိမ်',
    duration: 'ကြာချိန်',
    allSetsCompleted: 'အစုအားလုံးပြီးပါပြီ!',

    // Settings
    settings: 'ဆက်တင်များ',
    selectLanguage: 'ဘာသာစကားရွေးပါ',
    enableNotifications: 'အကြောင်းကြားချက်ဖွင့်မည်',
    darkMode: 'မှောင်မိုက်စနစ်',
    dataStorage: 'ဒေတာသိမ်းဆည်းမှု',
    clearData: 'ဒေတာအားလုံးဖျက်မည်',
    clearDataWarning: 'ဒီလုပ်ဆောင်ချက်က သင့်လေ့ကျင့်ခန်းမှတ်တမ်းနှင့် ပရိုဖိုင်ဒေတာအားလုံးကို ဖျက်ပစ်မှာဖြစ်ပါတယ်။ ပြန်ပြင်၍မရပါ။',
  },
};

export const getTranslation = (lang: Language, key: keyof Translations, params?: Record<string, string | number>): string => {
  let text = translations[lang][key];

  // Replace parameters in text like {count}
  if (params) {
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, String(params[param]));
    });
  }

  return text;
};
