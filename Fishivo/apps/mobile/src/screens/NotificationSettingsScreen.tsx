import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { Icon, AppHeader, ScreenContainer } from '@fishivo/ui';
import { theme } from '@fishivo/shared';

interface NotificationSettingsScreenProps {
  navigation: any;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const [socialNotifications, setSocialNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
  });

  const [systemNotifications, setSystemNotifications] = useState({
    spots: true,
    weather: true,
    updates: true,
    marketing: false,
  });

  const toggleSocial = (key: keyof typeof socialNotifications) => {
    setSocialNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleSystem = (key: keyof typeof systemNotifications) => {
    setSystemNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Bildirim Ayarları"
        canGoBack
        onBackPress={() => navigation.goBack()}
      />
      <ScreenContainer>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sosyal Bildirimler</Text>
            <View style={styles.sectionContent}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="heart" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>Beğeniler</Text>
                    <Text style={styles.notificationDescription}>Gönderileriniz beğenildiğinde bildirim al</Text>
                  </View>
                </View>
                <Switch
                  value={socialNotifications.likes}
                  onValueChange={() => toggleSocial('likes')}
                  thumbColor={socialNotifications.likes ? theme.colors.primary : theme.colors.textSecondary}
                  trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="message-circle" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>Yorumlar</Text>
                    <Text style={styles.notificationDescription}>Gönderilerinize yorum yapıldığında bildirim al</Text>
                  </View>
                </View>
                <Switch
                  value={socialNotifications.comments}
                  onValueChange={() => toggleSocial('comments')}
                  thumbColor={socialNotifications.comments ? theme.colors.primary : theme.colors.textSecondary}
                  trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="user-plus" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>Yeni Takipçiler</Text>
                    <Text style={styles.notificationDescription}>Sizi takip eden yeni kullanıcılar için bildirim al</Text>
                  </View>
                </View>
                <Switch
                  value={socialNotifications.follows}
                  onValueChange={() => toggleSocial('follows')}
                  thumbColor={socialNotifications.follows ? theme.colors.primary : theme.colors.textSecondary}
                  trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                />
              </View>

              <View style={[styles.notificationItem, styles.lastItem]}>
                <View style={styles.notificationLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="at-sign" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>Etiketlenmeler</Text>
                    <Text style={styles.notificationDescription}>Bir gönderide etiketlendiğinizde bildirim al</Text>
                  </View>
                </View>
                <Switch
                  value={socialNotifications.mentions}
                  onValueChange={() => toggleSocial('mentions')}
                  thumbColor={socialNotifications.mentions ? theme.colors.primary : theme.colors.textSecondary}
                  trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sistem Bildirimleri</Text>
            <View style={styles.sectionContent}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="map-pin" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>Yeni Spot Noktaları</Text>
                    <Text style={styles.notificationDescription}>Yakınınızda yeni spot noktaları eklendiğinde bildirim al</Text>
                  </View>
                </View>
                <Switch
                  value={systemNotifications.spots}
                  onValueChange={() => toggleSystem('spots')}
                  thumbColor={systemNotifications.spots ? theme.colors.primary : theme.colors.textSecondary}
                  trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="cloud" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>Hava Durumu</Text>
                    <Text style={styles.notificationDescription}>Balıkçılık için uygun hava koşulları hakkında bildirim al</Text>
                  </View>
                </View>
                <Switch
                  value={systemNotifications.weather}
                  onValueChange={() => toggleSystem('weather')}
                  thumbColor={systemNotifications.weather ? theme.colors.primary : theme.colors.textSecondary}
                  trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                />
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="download" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>Uygulama Güncellemeleri</Text>
                    <Text style={styles.notificationDescription}>Yeni özellikler ve güncellemeler hakkında bildirim al</Text>
                  </View>
                </View>
                <Switch
                  value={systemNotifications.updates}
                  onValueChange={() => toggleSystem('updates')}
                  thumbColor={systemNotifications.updates ? theme.colors.primary : theme.colors.textSecondary}
                  trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                />
              </View>

              <View style={[styles.notificationItem, styles.lastItem]}>
                <View style={styles.notificationLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="tag" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>Pazarlama</Text>
                    <Text style={styles.notificationDescription}>Özel teklifler ve kampanyalar hakkında bildirim al</Text>
                  </View>
                </View>
                <Switch
                  value={systemNotifications.marketing}
                  onValueChange={() => toggleSystem('marketing')}
                  thumbColor={systemNotifications.marketing ? theme.colors.primary : theme.colors.textSecondary}
                  trackColor={{ false: theme.colors.surface, true: `${theme.colors.primary}30` }}
                />
              </View>
            </View>
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </ScreenContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  width: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.semibold,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 0,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default NotificationSettingsScreen;