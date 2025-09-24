import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { FishivoModal } from './FishivoModal';
import ProBadge from './ProBadge';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';

interface PremiumMapLockModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  mapName?: string;
}

const PremiumMapLockModal: React.FC<PremiumMapLockModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  mapName = '3D Harita',
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  return (
    <FishivoModal
      visible={visible}
      onClose={onClose}
      title={t('premium.mapLocked', { defaultValue: 'Premium Özellik' })}
      preset="info"
    >
      <View style={styles.container}>
        {/* Premium Badge */}
        <View style={styles.badgeContainer}>
          <ProBadge variant="banner" />
        </View>

        {/* Map Preview Placeholder */}
        <View style={styles.previewContainer}>
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewIcon}>🗺️</Text>
            <Text style={styles.previewText}>3D Terrain Map</Text>
          </View>
          <View style={styles.lockOverlay}>
            <View style={styles.lockIcon}>
              <Text style={styles.lockEmoji}>🔒</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.content}>
          <Text style={styles.title}>
            {t('premium.map3DTitle', { defaultValue: `${mapName} Özelliği` })}
          </Text>
          
          <Text style={styles.description}>
            {t('premium.map3DDescription', { 
              defaultValue: 'Gerçek 3D arazi görünümü ile dağları, vadileri ve yükseltileri detaylı olarak görün. Premium üyelik ile tüm 3D harita özelliklerine erişin.'
            })}
          </Text>

          {/* Features List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏔️</Text>
              <Text style={styles.featureText}>
                {t('premium.feature3DTerrain', { defaultValue: 'Gerçek 3D arazi görünümü' })}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🛰️</Text>
              <Text style={styles.featureText}>
                {t('premium.feature3DSatellite', { defaultValue: '3D uydu görüntüleri' })}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🗺️</Text>
              <Text style={styles.featureText}>
                {t('premium.featureAdvancedMaps', { defaultValue: 'Gelişmiş harita özellikleri' })}
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📍</Text>
              <Text style={styles.featureText}>
                {t('premium.featureUnlimitedPins', { defaultValue: 'Sınırsız konum işaretleme' })}
              </Text>
            </View>
          </View>

          {/* Upgrade Button */}
          <View style={styles.buttonContainer}>
            <ProBadge 
              variant="button" 
              onPress={() => {
                onClose();
                if (onUpgrade) {
                  onUpgrade();
                }
              }}
            />
          </View>

          {/* Close Button */}
          <Text style={styles.closeText} onPress={onClose}>
            {t('common.maybeLater', { defaultValue: 'Belki Daha Sonra' })}
          </Text>
        </View>
      </View>
    </FishivoModal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  previewContainer: {
    position: 'relative',
    marginHorizontal: -theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    height: 200,
    overflow: 'hidden',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockEmoji: {
    fontSize: 30,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  featuresList: {
    marginBottom: theme.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
    width: 30,
  },
  featureText: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  closeText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default PremiumMapLockModal;