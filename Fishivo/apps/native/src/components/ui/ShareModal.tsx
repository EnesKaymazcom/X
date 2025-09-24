import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import * as RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Icon } from '@/components/ui/Icon';
import { QRCodeGenerator, QRCodeGeneratorRef } from '@/components/ui/QRCodeGenerator';
import { FishivoSvgLogo } from '@/components/ui/FishivoSvgLogo';
import { FishivoModal } from '@/components/ui/FishivoModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
import { WEB_BASE_URL } from '@/config';
import { createNativeApiService } from '@fishivo/api/services/native';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  username?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  visible, 
  onClose,
  username = ''
}) => {
  const { theme, isDark } = useTheme();
  const { t, locale } = useTranslation();
  const styles = createStyles(theme);
  const qrRef = useRef<QRCodeGeneratorRef>(null);
  
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (visible && username) {
      loadQRCodeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, username]);

  const loadQRCodeData = async () => {
    try {
      setLoading(true);
      const supabase = getNativeSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Kullanıcı bilgilerini al
      const apiService = createNativeApiService();
      const userProfile = await apiService.user.getUserProfile(user.id);
      
      if (userProfile) {
        const avatar = userProfile.avatar_url;
        const avatarUrl = typeof avatar === 'string'
          ? avatar
          : avatar?.medium || avatar?.original || avatar?.small || avatar?.thumbnail || '';
        setUserAvatar(avatarUrl);
      }
      
      // Referral stats al
      const referralStats = await apiService.referral.getReferralStats(user.id);
      let currentReferralCode = '';
      if (referralStats?.referral_code) {
        currentReferralCode = referralStats.referral_code;
        setReferralCode(currentReferralCode);
      }

      // Referral link ile QR kod oluştur - currentReferralCode kullan, state değil!
      const profileUrl = currentReferralCode 
        ? `https://fishivo.com/${username}?ref=${currentReferralCode}`
        : `https://fishivo.com/${username}`;
      
      setQrCodeData(profileUrl);
    } catch (error) {
      console.error('Error loading QR code:', error);
      setModalMessage(t('profile.share.qrError'));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const requestAndroidPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: t('profile.share.galleryPermissionTitle'),
          message: t('profile.share.galleryPermissionMessage'),
          buttonNegative: t('profile.share.cancel'),
          buttonPositive: t('profile.share.allow'),
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleShare = async () => {
    try {
      const apiService = createNativeApiService();
      const shareUrl = referralCode 
        ? apiService.referral.generateReferralLink(username, referralCode)
        : `${WEB_BASE_URL}/${username}`;
      
      const message = referralCode
        ? apiService.referral.generateReferralMessage(username, referralCode, locale)
        : `${t('profile.share.followMessage')}\n\n${shareUrl}`;
      
      // iOS için sadece message kullan (WhatsApp encoding sorunu için)
      const shareOptions = Platform.OS === 'ios' 
        ? { 
            message,
            title: t('profile.share.title')
          }
        : { 
            message, 
            url: shareUrl,
            title: t('profile.share.title')
          };
      
      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error) {
      setModalMessage(t('profile.share.error'));
      setShowErrorModal(true);
    }
  };

  const handleCopyLink = () => {
    
    const apiService = createNativeApiService();
    const profileUrl = referralCode 
      ? apiService.referral.generateReferralLink(username, referralCode)
      : `${WEB_BASE_URL}/${username}`;
    
    Clipboard.setString(profileUrl);
    setModalMessage(referralCode 
      ? t('profile.share.referralLinkCopied')
      : t('profile.share.linkCopied'));
    setShowSuccessModal(true);
  };

  const handleDownload = async () => {
    try {
      if (!qrCodeData || !qrRef.current) {
        setModalMessage(t('profile.share.qrNotReady'));
        setShowErrorModal(true);
        return;
      }
      
      if (Platform.OS === 'android' && !(await requestAndroidPermission())) {
        return;
      }

      setLoading(true);
      
      // QRCodeGenerator'ın kendi toDataURL metodunu kullan
      const getDataURL = () => new Promise<string>((resolve) => {
        qrRef.current?.toDataURL((data: string) => {
          resolve(data);
        });
      });
      
      const base64Data = await getDataURL();
      
      // Base64'ü dosya yoluna çevir
      const fileName = `fishivo-qr-${username}-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      
      // Base64'ü dosyaya yaz
      await RNFS.writeFile(filePath, base64Data, 'base64');
      
      if (Platform.OS === 'ios') {
        // iOS - Direkt galeriye kaydet
        await CameraRoll.saveAsset(filePath, { type: 'photo' });
        setModalMessage(t('profile.share.qrSaved'));
      } else {
        // Android - Downloads klasörüne kopyala
        const downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        await RNFS.copyFile(filePath, downloadPath);
        
        // Galeriye de ekle
        try {
          await CameraRoll.saveAsset(downloadPath, { type: 'photo' });
        } catch (galleryError) {
          console.warn('Gallery save failed, but file saved to Downloads:', galleryError);
        }
        
        setModalMessage(`QR kod indirildi: ${fileName}`);
      }
      
      // Temp dosyayı sil
      await RNFS.unlink(filePath);
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Download error:', error);
      setModalMessage(t('profile.share.qrSaveError'));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    setModalMessage(t('profile.share.scanQRMessage'));
    setShowInfoModal(true);
  };
  
  const actionButtons = [
    { 
      id: 'share', 
      icon: 'share', 
      label: t('profile.share.buttons.share'), 
      onPress: handleShare 
    },
    { 
      id: 'copy', 
      icon: 'link', 
      label: t('profile.share.buttons.copyLink'), 
      onPress: handleCopyLink 
    },
    { 
      id: 'download', 
      icon: 'download', 
      label: t('profile.share.buttons.download'), 
      onPress: handleDownload 
    },
    { 
      id: 'scan', 
      icon: 'camera', 
      label: t('profile.share.buttons.scanQR'), 
      onPress: handleScanQR 
    },
  ];

  return (
    <FishivoModal
      visible={visible}
      onClose={onClose}
      title={t('profile.share.title', { defaultValue: 'Share profile' })}
      showCloseButton={true}
      showDragIndicator={true}
    >
          
            <View 
              collapsable={false}
              style={[styles.qrContainer, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={styles.username}>{username}</Text>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              ) : qrCodeData ? (
                <View style={styles.qrWrapper}>
                  <QRCodeGenerator
                    ref={qrRef}
                    value={qrCodeData}
                    size={250}
                    logo={userAvatar}
                    logoSize={50}
                  />
                </View>
              ) : null}
              
              <Text style={styles.shareText}>
                {t('profile.share.qrDescription', { defaultValue: 'Share your QR code so others can follow you' })}
              </Text>
              
              <View style={styles.logoContainer}>
                <View style={styles.logoRow}>
                  <FishivoSvgLogo 
                    size="sm"
                    color={isDark ? theme.colors.text : '#3878df'}
                  />
                  <Text style={styles.logoText}>Fishivo</Text>
                </View>
              </View>
            </View>

          <View style={styles.actions}>
            {actionButtons.map((button) => (
              <TouchableOpacity
                key={button.id}
                style={styles.actionButton}
                onPress={button.onPress}
                disabled={loading}
              >
                <Icon name={button.icon} size={24} color={theme.colors.text} />
                <Text style={styles.actionLabel}>{button.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Error Modal */}
          <FishivoModal
            visible={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            preset="error"
            title={t('common.error')}
            description={modalMessage}
            primaryButton={{
              text: t('common.ok'),
              onPress: () => setShowErrorModal(false)
            }}
          />

          {/* Success Modal */}
          <FishivoModal
            visible={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              onClose();
            }}
            preset="success"
            title={t('common.success')}
            description={modalMessage}
            primaryButton={{
              text: t('common.ok'),
              onPress: () => {
                setShowSuccessModal(false);
                onClose();
              }
            }}
          />

          {/* Info Modal */}
          <FishivoModal
            visible={showInfoModal}
            onClose={() => setShowInfoModal(false)}
            preset="info"
            title={t('profile.share.scanQRTitle')}
            description={modalMessage}
            primaryButton={{
              text: t('common.ok'),
              onPress: () => setShowInfoModal(false)
            }}
          />
    </FishivoModal>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  qrContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  username: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  loadingContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  shareText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xl,
    paddingHorizontal: theme.layout.screenHorizontalPadding,
  },
  actionButton: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    minWidth: 60,
  },
  actionLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
});