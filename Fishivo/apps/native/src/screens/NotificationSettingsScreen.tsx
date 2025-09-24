import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, ScreenContainer, CategoryCard, SectionHeader } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';

interface NotificationSettingsScreenProps {
  navigation: any;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [socialNotifications, setSocialNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
  });

  const [systemNotifications, setSystemNotifications] = useState({
    spots: false,
    weather: true,
    updates: false,
    marketing: false,
  });

  const toggleSocial = (key: keyof typeof socialNotifications) => {
    setSocialNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSystem = (key: keyof typeof systemNotifications) => {
    setSystemNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('notifications.settings.title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
          }
        ]}
      />

      <ScreenContainer paddingVertical="none">
        <ScrollView contentContainerStyle={[styles.scrollContent, theme.listContentStyle]} showsVerticalScrollIndicator={false}>
          <SectionHeader title={t('notifications.settings.socialNotifications')} />
          
          <CategoryCard
            icon="heart"
            title={t('notifications.settings.likes')}
            subtitle={t('notifications.settings.likesDesc')}
            rightElement={
              <Switch
                value={socialNotifications.likes}
                onValueChange={() => toggleSocial('likes')}
                thumbColor={socialNotifications.likes ? theme.colors.primary : theme.colors.textSecondary}
                trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                style={{ transform: [{ scale: 0.85 }] }}
              />
            }
          />

          <CategoryCard
            icon="message-circle"
            title={t('notifications.settings.comments')}
            subtitle={t('notifications.settings.commentsDesc')}
            rightElement={
              <Switch
                value={socialNotifications.comments}
                onValueChange={() => toggleSocial('comments')}
                thumbColor={socialNotifications.comments ? theme.colors.primary : theme.colors.textSecondary}
                trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                style={{ transform: [{ scale: 0.85 }] }}
              />
            }
          />

          <CategoryCard
            icon="user-plus"
            title={t('notifications.settings.newFollowers')}
            subtitle={t('notifications.settings.newFollowersDesc')}
            rightElement={
              <Switch
                value={socialNotifications.follows}
                onValueChange={() => toggleSocial('follows')}
                thumbColor={socialNotifications.follows ? theme.colors.primary : theme.colors.textSecondary}
                trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                style={{ transform: [{ scale: 0.85 }] }}
              />
            }
          />

          <CategoryCard
            icon="at-sign"
            title={t('notifications.settings.mentions')}
            subtitle={t('notifications.settings.mentionsDesc')}
            rightElement={
              <Switch
                value={socialNotifications.mentions}
                onValueChange={() => toggleSocial('mentions')}
                thumbColor={socialNotifications.mentions ? theme.colors.primary : theme.colors.textSecondary}
                trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                style={{ transform: [{ scale: 0.85 }] }}
              />
            }
          />

          <SectionHeader title={t('notifications.settings.systemNotifications')} />

          <CategoryCard
            icon="map-pin"
            title={t('notifications.settings.newSpots')}
            subtitle={t('notifications.settings.newSpotsDesc')}
            rightElement={
              <Switch
                value={systemNotifications.spots}
                onValueChange={() => toggleSystem('spots')}
                thumbColor={systemNotifications.spots ? theme.colors.primary : theme.colors.textSecondary}
                trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                style={{ transform: [{ scale: 0.85 }] }}
              />
            }
          />

          <CategoryCard
            icon="cloud"
            title={t('notifications.settings.weather')}
            subtitle={t('notifications.settings.weatherDesc')}
            rightElement={
              <Switch
                value={systemNotifications.weather}
                onValueChange={() => toggleSystem('weather')}
                thumbColor={systemNotifications.weather ? theme.colors.primary : theme.colors.textSecondary}
                trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                style={{ transform: [{ scale: 0.85 }] }}
              />
            }
          />

          <CategoryCard
            icon="download"
            title={t('notifications.settings.appUpdates')}
            subtitle={t('notifications.settings.appUpdatesDesc')}
            rightElement={
              <Switch
                value={systemNotifications.updates}
                onValueChange={() => toggleSystem('updates')}
                thumbColor={systemNotifications.updates ? theme.colors.primary : theme.colors.textSecondary}
                trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                style={{ transform: [{ scale: 0.85 }] }}
              />
            }
          />

          <CategoryCard
            icon="tag"
            title={t('notifications.settings.marketing')}
            subtitle={t('notifications.settings.marketingDesc')}
            rightElement={
              <Switch
                value={systemNotifications.marketing}
                onValueChange={() => toggleSystem('marketing')}
                thumbColor={systemNotifications.marketing ? theme.colors.primary : theme.colors.textSecondary}
                trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                style={{ transform: [{ scale: 0.85 }] }}
              />
            }
          />
        </ScrollView>
      </ScreenContainer>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
});

export default NotificationSettingsScreen; 