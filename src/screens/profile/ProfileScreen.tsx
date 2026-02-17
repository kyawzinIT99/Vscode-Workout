/**
 * ProfileScreen
 * User profile and settings
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Platform, StatusBar, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useUserContext } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../constants/languages';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useUserContext();
  const { language, setLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || 'Champion');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(user?.avatar);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'th' as Language, name: 'ไทย (Thai)', flag: '🇹🇭' },
    { code: 'my' as Language, name: 'မြန်မာ (Myanmar)', flag: '🇲🇲' },
  ];

  // Update local state when user context changes
  useEffect(() => {
    if (user) {
      setEditedName(user.name || 'Champion');
      setEditedEmail(user.email || '');
      setProfilePhoto(user.avatar);
    }
  }, [user]);

  const pickImage = async () => {
    // Request media library permission on Android
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to change your profile photo.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
      Alert.alert('Success', 'Profile photo updated! Tap Save Changes to apply.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update user context with new values
      await updateUser({
        name: editedName,
        email: editedEmail,
        avatar: profilePhoto,
      });

      setIsEditing(false);
      Alert.alert('✅ Success', 'Your profile has been updated successfully!');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
    setShowLanguageMenu(false);
    Alert.alert('✅ Success', `Language changed to ${languages.find(l => l.code === lang)?.name}`);
  };

  return (
    <GradientBackground colors={GRADIENTS.ocean}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons
              name={isEditing ? "close-circle" : "create"}
              size={28}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View style={styles.photoContainer}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.photoGradient}
                >
                  <Ionicons name="person" size={64} color={COLORS.white} />
                </LinearGradient>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color={COLORS.white} />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.photoLabel}>Tap to change photo</Text>
          {isEditing && profilePhoto && (
            <TouchableOpacity onPress={() => setProfilePhoto(undefined)} style={styles.removePhotoButton}>
              <Text style={styles.removePhotoText}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* User Info Card */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={24} color="#667EEA" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textTertiary}
              />
            ) : (
              <Text style={styles.infoValue}>{editedName}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedEmail}
                onChangeText={setEditedEmail}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{editedEmail || 'Not set'}</Text>
            )}
          </View>
        </GlassCard>

        {/* Stats Card */}
        <GlassCard style={styles.card} gradient={['rgba(255, 107, 107, 0.19)', 'rgba(255, 165, 0, 0.19)']}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>Your Stats</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats.totalWorkouts || 0}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats.currentStreak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.stats.totalMinutes || 0}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>
        </GlassCard>

        {/* Fitness Goals Card */}
        <GlassCard style={styles.card} gradient={['rgba(17, 153, 142, 0.19)', 'rgba(56, 239, 125, 0.19)']}>
          <View style={styles.cardHeader}>
            <Ionicons name="trophy" size={24} color="#38EF7D" />
            <Text style={styles.cardTitle}>Fitness Goals</Text>
          </View>
          <Text style={styles.cardText}>
            {user?.goals?.join(' • ') || 'Build Strength • Improve Flexibility • Weight Loss'}
          </Text>
          {isEditing && (
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Goals</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </GlassCard>

        {/* Settings Card */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings" size={24} color="#764BA2" />
            <Text style={styles.cardTitle}>Preferences</Text>
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Settings' as never)}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Settings' as never)}>
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette" size={20} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>Theme</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageMenu(!showLanguageMenu)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={20} color={COLORS.textSecondary} />
              <Text style={styles.languageFlag}>
                {languages.find(l => l.code === language)?.flag}
              </Text>
              <Text style={styles.settingText}>
                {languages.find(l => l.code === language)?.name}
              </Text>
            </View>
            <Ionicons
              name={showLanguageMenu ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>

          {showLanguageMenu && (
            <View style={styles.languageMenu}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    language === lang.code && styles.languageOptionActive,
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={styles.languageOptionText}>{lang.name}</Text>
                  {language === lang.code && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </GlassCard>

        {/* Developer Info Card */}
        <GlassCard style={styles.card} gradient={['rgba(74, 0, 224, 0.19)', 'rgba(142, 45, 226, 0.19)']}>
          <View style={styles.cardHeader}>
            <Ionicons name="code-slash" size={24} color="#8E2DE2" />
            <Text style={styles.cardTitle}>Developer</Text>
          </View>

          <View style={styles.developerInfo}>
            <View style={styles.developerItem}>
              <Ionicons name="person" size={18} color={COLORS.textSecondary} />
              <Text style={styles.developerText}>Mr. Kyaw Zin Tun</Text>
            </View>
            <View style={styles.developerItem}>
              <Ionicons name="location" size={18} color={COLORS.textSecondary} />
              <Text style={styles.developerText}>Thailand</Text>
            </View>
            <View style={styles.developerItem}>
              <Ionicons name="mail" size={18} color={COLORS.textSecondary} />
              <Text style={styles.developerText}>itsolutions.mm@gmail.com</Text>
            </View>
          </View>
        </GlassCard>

        {/* Save Button */}
        {isEditing && (
          <GlassButton
            title="Save Changes"
            onPress={handleSaveProfile}
            size="large"
            style={styles.saveButton}
            icon={<Ionicons name="checkmark-circle" size={24} color={COLORS.white} />}
          />
        )}

        {/* App Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    fontSize: 36,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  photoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white + '30',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  photoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  photoImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    overflow: 'hidden',
  },
  photoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white + '30',
  } as ImageStyle,
  removePhotoButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 16,
  },
  removePhotoText: {
    ...TYPOGRAPHY.caption,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  cardText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textPrimary,
    fontSize: 17,
  },
  input: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.white + '20',
    marginVertical: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  editButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageMenu: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.white + '20',
    paddingTop: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  languageOptionActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
  },
  languageOptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  developerInfo: {
    gap: 12,
  },
  developerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  developerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  saveButton: {
    marginTop: 16,
  },
  version: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 24,
  },
});

export default ProfileScreen;
