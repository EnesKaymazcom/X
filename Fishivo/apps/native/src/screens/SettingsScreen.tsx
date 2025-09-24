import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, ScreenContainer, FishivoModal, CategoryCard, SectionHeader } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, useTranslation } from '@/contexts/LanguageContext';
import { locales } from '@/lib/i18n/config';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigationWithLock } from '@/hooks/useNavigationWithLock';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation: _navigation }) => {
  const navigation = useNavigationWithLock();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { currentLanguage, localeNames, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  
  const renderCountryFlag = (locale: string) => {
    try {
      const Flags = require('react-native-svg-circle-country-flags');
      // tr -> Tr, en -> Gb için mapping
      const flagMapping: { [key: string]: string } = {
        'tr': 'Tr',
        'en': 'Gb'
      };
      const flagName = flagMapping[locale];
      const FlagComponent = Flags[flagName];
      
      if (FlagComponent && typeof FlagComponent === 'function') {
        return <FlagComponent width={18} height={18} />;
      }
      return null;
    } catch (error) {
      return null;
    }
  };
  
  const logout = async () => {
    const supabase = getNativeSupabaseClient();
    await supabase.auth.signOut();
    await AsyncStorage.clear();
  };
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successModalType, setSuccessModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const showInfo = (message: string) => {
    setInfoMessage(message);
    setShowInfoModal(true);
  };

  const confirmLogout = async () => {
    // Önce modal'ı kapat ve hemen navigasyon yap
    setShowLogoutConfirm(false);
    
    // Navigation'ı hemen yap, logout'u arka planda yap
    navigation.dispatch(
      CommonActions.reset({ 
        index: 0, 
        routes: [{ name: 'Auth' }] 
      })
    );
    
    // Logout'u arka planda yap
    try {
      await logout();
    } catch (e) {
      // Sessizce handle et
    }
  };

  const settingsSections = [
    {
      title: '',
      items: [
        {
          icon: 'star',
          title: t('settings.items.manageSubscription.title'),
          subtitle: t('settings.items.manageSubscription.subtitle'),
          onPress: () => showInfo(t('settings.messages.featureComingSoon')),
        },
        {
          icon: 'refresh-cw',
          title: t('settings.items.restorePurchases.title'),
          subtitle: t('settings.items.restorePurchases.subtitle'),
          onPress: () => {
            setSuccessMessage(t('settings.messages.purchasesRestored'));
            setShowSuccessModal(true);
          },
        },
        {
          icon: 'user',
          title: t('settings.items.editProfile.title'),
          subtitle: t('settings.items.editProfile.subtitle'),
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          icon: 'bell',
          title: t('settings.items.notificationSettings.title'),
          subtitle: t('settings.items.notificationSettings.subtitle'),
          onPress: () => navigation.navigate('NotificationSettings'),
        },
        {
          icon: 'message-circle',
          title: t('settings.items.messagePrivacy.title'),
          subtitle: t('settings.items.messagePrivacy.subtitle'),
          onPress: () => showInfo(t('settings.messages.featureComingSoon')),
        },
        {
          icon: 'user-x',
          title: t('settings.items.blockedUsers.title'),
          subtitle: t('settings.items.blockedUsers.subtitle'),
          onPress: () => navigation.navigate('BlockedUsers'),
        },
      ],
    },
    {
      title: t('settings.sections.appSettings'),
      items: [
        {
          icon: 'moon',
          title: t('settings.items.theme.title'),
          subtitle: t(`settings.items.theme.subtitle.${themeMode}`),
          onPress: () => setShowThemeModal(true),
        },
        {
          icon: 'settings',
          title: t('settings.items.language.title'),
          subtitle: localeNames[currentLanguage],
          onPress: () => setShowLanguageModal(true),
        },
        {
          icon: 'ruler',
          title: t('settings.items.units.title'),
          subtitle: t('settings.items.units.subtitle'),
          onPress: () => navigation.navigate('UnitsSettings'),
        },
        {
          icon: 'play',
          title: t('settings.items.autoPlayVideos.title'),
          subtitle: t('settings.items.autoPlayVideos.subtitle'),
          onPress: () => showInfo(t('settings.messages.featureComingSoon')),
        },
      ],
    },
    {
      title: t('settings.sections.other'),
      items: [
        {
          icon: 'help-circle',
          title: t('settings.items.helpCenter.title'),
          subtitle: t('settings.items.helpCenter.subtitle'),
          onPress: () => showInfo(t('settings.messages.featureComingSoon')),
        },
        {
          icon: 'mail',
          title: t('settings.items.feedbackAndSuggestions.title'),
          subtitle: t('settings.items.feedbackAndSuggestions.subtitle'),
          onPress: () => showInfo(t('settings.messages.featureComingSoon')),
        },
        {
          icon: 'check-circle',
          title: t('settings.items.legal.title'),
          subtitle: t('settings.items.legal.subtitle'),
          onPress: () => showInfo(t('settings.messages.featureComingSoon')),
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'log-out',
          title: t('settings.items.logout.title'),
          subtitle: t('settings.items.logout.subtitle'),
          onPress: () => setShowLogoutConfirm(true),
          isDestructive: true,
        },
      ],
    },
  ];

  const renderSettingsItem = (item: any, index: number) => (
    <CategoryCard
      key={index}
      iconName={item.icon}
      title={item.title}
      subtitle={item.subtitle}
      onPress={item.onPress}
      isDestructive={item.isDestructive}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <AppHeader
        title={t('settings.title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }
            }
          }
        ]}
      />

      <ScreenContainer paddingVertical="none">
        <ScrollView contentContainerStyle={[styles.scrollContent, theme.listContentStyle]} showsVerticalScrollIndicator={false}>
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={[styles.section, sectionIndex === 0 && styles.firstSection]}>
              {section.title && <SectionHeader title={section.title} />}
              {section.items.map((item, itemIndex) => 
                renderSettingsItem(item, itemIndex)
              )}
            </View>
          ))}

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>{t('common.appName')} v{t('common.appVersion')}</Text>
          </View>
        </ScrollView>
      </ScreenContainer>

      <FishivoModal
        visible={showSuccessModal}
        title={successModalType === 'error' ? t('common.error') : t('common.success')}
        onClose={() => setShowSuccessModal(false)}
        preset={successModalType === 'error' ? 'error' : 'success'}
        description={successMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowSuccessModal(false)
        }}
      />

      <FishivoModal
        visible={showInfoModal}
        title={t('common.info') || 'Bilgi'}
        onClose={() => setShowInfoModal(false)}
        preset="info"
        description={infoMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowInfoModal(false)
        }}
      />

      <FishivoModal
        visible={showLogoutConfirm}
        title={t('settings.items.logout.title')}
        onClose={() => setShowLogoutConfirm(false)}
        preset="warning"
        description={t('settings.messages.logoutConfirm')}
        primaryButton={{
          text: t('settings.items.logout.title'),
          onPress: confirmLogout
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => setShowLogoutConfirm(false)
        }}
      />

      {/* Language Selection Modal */}
      <FishivoModal
        visible={showLanguageModal}
        title={t('settings.languageModal.title')}
        onClose={() => setShowLanguageModal(false)}
        preset="selector"
      >
        <View style={styles.languageOptions}>
          {locales.map((locale) => {
            const isSelected = currentLanguage === locale;
            return (
              <TouchableOpacity
                key={locale}
                style={[
                  styles.languageOption,
                  isSelected && styles.languageOptionSelected
                ]}
                activeOpacity={0.7}
                onPress={async () => {
                  try {
                    await setLanguage(locale);
                    setShowLanguageModal(false);
                    setSuccessMessage(t('settings.messages.languageChanged'));
                    setSuccessModalType('success');
                    setShowSuccessModal(true);
                  } catch (error) {
                    setShowLanguageModal(false);
                    setSuccessMessage('Dil değiştirilemedi. Lütfen tekrar deneyin.');
                    setSuccessModalType('error');
                    setShowSuccessModal(true);
                  }
                }}
              >
                <View style={[
                  styles.radioCircle,
                  isSelected && styles.radioCircleSelected
                ]}>
                  {isSelected && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View style={styles.flagCircle}>
                  {renderCountryFlag(locale)}
                </View>
                <Text style={[
                  styles.languageLabel,
                  isSelected && styles.languageLabelSelected
                ]}>
                  {localeNames[locale]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </FishivoModal>

      {/* Theme Selection Modal */}
      <FishivoModal
        visible={showThemeModal}
        title={t('settings.themeModal.title')}
        onClose={() => setShowThemeModal(false)}
        preset="selector"
        renderRadioOptions={{
          options: [
            { key: 'light', label: `  ${t('settings.themeModal.light')}`, icon: 'sun' },
            { key: 'dark', label: `  ${t('settings.themeModal.dark')}`, icon: 'moon' },
            { key: 'system', label: `  ${t('settings.themeModal.system')}`, icon: 'settings' }
          ],
          selectedKey: themeMode,
          onSelect: (key) => {
            setThemeMode(key as 'light' | 'dark' | 'system');
            setShowThemeModal(false);
          }
        }}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  scrollContent: {
  },
  container: {
    flex: 1,
  },


  section: {
    marginTop: 0,
  },
  firstSection: {
    marginTop: 0,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  versionText: {
    fontSize: theme.typography.sm,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    minWidth: 200,
  },
  themeOptionActive: {
    borderWidth: 2,
  },
  themeOptionText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    marginLeft: theme.spacing.md,
  },
  // Language Modal Styles
  languageOptions: {
    marginVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  flagCircle: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  languageLabel: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    flex: 1,
    fontWeight: theme.typography.semibold,
  },
  languageLabelSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.semibold,
  },
});

export default SettingsScreen; 