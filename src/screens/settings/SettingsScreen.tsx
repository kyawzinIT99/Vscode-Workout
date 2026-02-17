/**
 * SettingsScreen
 * App preferences and settings
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientBackground from '../../components/ui/GradientBackground';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Language } from '../../constants/languages';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'th' as Language, name: 'ไทย (Thai)', flag: '🇹🇭' },
    { code: 'my' as Language, name: 'မြန်မာ (Myanmar)', flag: '🇲🇲' },
  ];

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
    setShowLanguageMenu(false);
    Alert.alert('✅ Success', `Language changed to ${languages.find(l => l.code === lang)?.name}`);
  };

  const handleThemeToggle = async () => {
    await toggleTheme();
    Alert.alert('✅ Success', `Theme changed to ${!isDark ? 'Dark' : 'Light'} Mode`);
  };

  const handleClearData = () => {
    Alert.alert(
      '⚠️ Warning',
      t('clearDataWarning'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all data except language and theme preferences
              const keys = await AsyncStorage.getAllKeys();
              const dataKeys = keys.filter(key =>
                key !== '@workout_app_language' && key !== '@workout_app_theme'
              );
              await AsyncStorage.multiRemove(dataKeys);
              Alert.alert('✅ Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = await AsyncStorage.multiGet(keys);
      const dataObject = Object.fromEntries(data);
      const dataString = JSON.stringify(dataObject, null, 2);

      Alert.alert(
        'Export Data',
        `Data size: ${(dataString.length / 1024).toFixed(2)} KB\n\nIn production, this would save to a file or share via email.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to export data');
    }
  };

  return (
    <GradientBackground colors={GRADIENTS.ocean}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings')}</Text>
        </View>

        {/* Language Selection */}
        <GlassCard style={styles.card} gradient={['rgba(102, 126, 234, 0.19)', 'rgba(118, 75, 162, 0.19)']}>
          <View style={styles.cardHeader}>
            <Ionicons name="language" size={24} color="#667EEA" />
            <Text style={styles.cardTitle}>{t('language')}</Text>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageMenu(!showLanguageMenu)}
          >
            <View style={styles.settingLeft}>
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

        {/* Notifications */}
        <GlassCard style={styles.card} gradient={['rgba(255, 107, 107, 0.19)', 'rgba(255, 165, 0, 0.19)']}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications" size={24} color="#FF6B6B" />
            <Text style={styles.cardTitle}>{t('notifications')}</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingText}>{t('enableNotifications')}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.textTertiary, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingText}>Workout Reminders</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.textTertiary, true: COLORS.primary}}
              thumbColor={COLORS.white}
            />
          </View>
        </GlassCard>

        {/* Appearance */}
        <GlassCard style={styles.card} gradient={['rgba(74, 0, 224, 0.19)', 'rgba(142, 45, 226, 0.19)']}>
          <View style={styles.cardHeader}>
            <Ionicons name="color-palette" size={24} color="#8E2DE2" />
            <Text style={styles.cardTitle}>{t('theme')}</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingText}>{t('darkMode')}</Text>
              <Text style={styles.settingSubtext}>{isDark ? '🌙 Dark' : '☀️ Light'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: COLORS.textTertiary, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </GlassCard>

        {/* Data & Storage */}
        <GlassCard style={styles.card} gradient={['rgba(17, 153, 142, 0.19)', 'rgba(56, 239, 125, 0.19)']}>
          <View style={styles.cardHeader}>
            <Ionicons name="server" size={24} color="#38EF7D" />
            <Text style={styles.cardTitle}>{t('dataStorage')}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="phone-portrait" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>All data is saved locally on your device</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <Ionicons name="download" size={20} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>Export Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash" size={20} color="#FF6B6B" />
              <Text style={[styles.settingText, styles.dangerText]}>{t('clearData')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </GlassCard>

        {/* About */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>About</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Developer</Text>
            <Text style={styles.infoValue}>Mr. Kyaw Zin Tun</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact</Text>
            <Text style={styles.infoValue}>itsolutions.mm@gmail.com</Text>
          </View>
        </GlassCard>

        {/* Back Button */}
        <GlassButton
          title={t('back')}
          onPress={() => navigation.goBack()}
          size="large"
          style={styles.backButtonLarge}
          icon={<Ionicons name="arrow-back" size={24} color={COLORS.white} />}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 36,
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
    flex: 1,
  },
  settingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  settingSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
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
  divider: {
    height: 1,
    backgroundColor: COLORS.white + '20',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  dangerText: {
    color: '#FF6B6B',
  },
  backButtonLarge: {
    marginTop: 16,
  },
});

export default SettingsScreen;
