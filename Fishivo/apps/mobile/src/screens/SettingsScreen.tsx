import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, SuccessModal, ConfirmModal, AppHeader, ScreenContainer } from '@fishivo/ui';
import { theme, apiService } from '@fishivo/shared';
import { useAuth } from '../contexts/AuthContext';
import { CommonActions } from '@react-navigation/native';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { logout } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const showInfo = (message: string) => {
    setInfoMessage(message);
    setShowInfoModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logout();
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] })
      );
    } catch (e) {
      console.warn('Logout error', e);
    }
  };

  const settingsSections = [
    {
      title: '',
      items: [
        {
          icon: 'star',
          title: 'Aboneliği Yönet',
          subtitle: 'Premium özellikler ve faturalandırma',
          onPress: () => showInfo('Bu özellik yakında aktif olacak'),
        },
        {
          icon: 'refresh-cw',
          title: 'Satın Alımları Geri Yükle',
          subtitle: 'Önceki satın alımlarınızı geri yükleyin',
          onPress: () => {
            setSuccessMessage('Satın alımlarınız geri yüklendi');
            setShowSuccessModal(true);
          },
        },
        {
          icon: 'user',
          title: 'Profili Düzenle',
          subtitle: 'Profil bilgilerinizi güncelleyin',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          icon: 'bell',
          title: 'Bildirim Ayarları',
          subtitle: 'Hangi bildirimleri alacağınızı seçin',
          onPress: () => navigation.navigate('NotificationSettings'),
        },
        {
          icon: 'message-circle',
          title: 'Mesaj Gizliliği',
          subtitle: 'Kimler size mesaj gönderebilir',
          onPress: () => showInfo('Bu özellik yakında aktif olacak'),
        },
        {
          icon: 'user-x',
          title: 'Engellenen Kullanıcılar',
          subtitle: 'Engellediğiniz kullanıcıları yönetin',
          onPress: () => navigation.navigate('BlockedUsers'),
        },
      ],
    },
    {
      title: 'Uygulama Ayarları',
      items: [
        {
          icon: 'moon',
          title: 'Tema',
          subtitle: 'Koyu',
          onPress: () => showInfo('Tema değiştirme özelliği yakında gelecek'),
        },
        {
          icon: 'ruler',
          title: 'Birimler ve Ölçüler',
          subtitle: 'Metrik sistem ayarları',
          onPress: () => navigation.navigate('UnitsSettings'),
        },
        {
          icon: 'play',
          title: 'Videoları Otomatik Oynat',
          subtitle: 'Sadece Wi-Fi',
          onPress: () => showInfo('Bu özellik yakında aktif olacak'),
        },
      ],
    },
    {
      title: 'Diğer',
      items: [
        {
          icon: 'help-circle',
          title: 'Yardım Merkezi & SSS',
          subtitle: 'Sıkça sorulan sorular ve yardım',
          onPress: () => showInfo('Yardım merkezi yakında aktif olacak'),
        },
        {
          icon: 'check-circle',
          title: 'Yasal',
          subtitle: 'Gizlilik politikası ve kullanım şartları',
          onPress: () => showInfo('Yasal sayfalar yakında aktif olacak'),
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'log-out',
          title: 'Çıkış Yap',
          subtitle: 'Hesabınızdan güvenli şekilde çıkış yapın',
          onPress: () => setShowLogoutConfirm(true),
          isDestructive: true,
        },
      ],
    },
  ];

  const renderSettingsItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.settingsItem,
        item.isDestructive && styles.destructiveItem,
      ]}
      onPress={item.onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[
          styles.iconContainer,
          item.isDestructive && styles.destructiveIconContainer,
        ]}>
          <Icon 
            name={item.icon} 
            size={20} 
            color={item.isDestructive ? theme.colors.error : theme.colors.primary} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.settingsTitle,
            item.isDestructive && styles.destructiveText,
          ]}>
            {item.title}
          </Text>
          <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Icon 
        name="chevron-right" 
        size={20} 
        color={theme.colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Ayarlar"
        canGoBack
        onBackPress={() => navigation.goBack()}
      />

      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={[styles.section, sectionIndex === 0 && styles.firstSection]}>
              {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => 
                  renderSettingsItem(item, itemIndex)
                )}
              </View>
            </View>
          ))}

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Fishivo v1.0.0</Text>
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </ScreenContainer>

      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      <SuccessModal
        visible={showInfoModal}
        title="Bilgi"
        message={infoMessage}
        onClose={() => setShowInfoModal(false)}
      />

      <ConfirmModal
        visible={showLogoutConfirm}
        title="Çıkış Yap"
        message="Hesabınızdan çıkış yapmak istediğinizden emin misiniz?"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        confirmText="Çıkış Yap"
        cancelText="İptal"
        type="warning"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  firstSection: {
    marginTop: 0,
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
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingsItemLeft: {
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
  destructiveIconContainer: {
    backgroundColor: `${theme.colors.error}15`,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    marginBottom: 2,
  },
  destructiveText: {
    color: theme.colors.error,
  },
  settingsSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  destructiveItem: {
    borderBottomWidth: 0,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  versionText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default SettingsScreen;