import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Icon } from './Icon';
import { SectionHeader } from './SectionHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';

interface SpotPhotoUploadSectionProps {
  image?: string;
  isUploading?: boolean;
  onImagePicker: () => void;
  onRemoveImage: () => void;
  onEditImage: () => void;
}

export const SpotPhotoUploadSection: React.FC<SpotPhotoUploadSectionProps> = ({
  image,
  isUploading = false,
  onImagePicker,
  onRemoveImage,
  onEditImage,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <SectionHeader title={t('addSpot.sections.photo')} />
      
      {image ? (
        <TouchableOpacity 
          style={styles.singlePhotoContainer}
          onPress={onEditImage}
          disabled={isUploading}
        >
          <Image 
            source={{ uri: image }} 
            style={styles.singlePhoto}
            resizeMode="cover"
          />
          
          {/* Aspect Ratio Label - 4:3 for spots */}
          <View style={styles.aspectRatioLabel}>
            <Text style={styles.aspectRatioText}>4:3</Text>
          </View>
          
          {/* Remove Button */}
          <TouchableOpacity
            style={styles.removePhotoButton}
            onPress={onRemoveImage}
            disabled={isUploading}
          >
            <Icon name="x" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* Upload Loading Overlay */}
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="#FFFFFF" size="small" />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.addSinglePhotoButton}
          onPress={onImagePicker}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <ActivityIndicator color={theme.colors.textSecondary} size="small" />
              <Text style={styles.addPhotoText}>{t('addSpot.uploadingImage')}</Text>
            </>
          ) : (
            <>
              <Icon name="plus" size={32} color={theme.colors.textSecondary} />
              <Text style={styles.addPhotoText}>{t('addSpot.sections.addPhoto')}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  section: {
    marginBottom: theme.spacing.md,
  },
  singlePhotoContainer: {
    width: '100%',
    aspectRatio: 4 / 3, // 4:3 ratio - fotoğraf yüklendiğinde büyük alan
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.surface,
  },
  singlePhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
  },
  addSinglePhotoButton: {
    width: (Dimensions.get('window').width - theme.layout.screenHorizontalPadding * 2 - theme.spacing.sm * 2) / 3,
    height: (Dimensions.get('window').width - theme.layout.screenHorizontalPadding * 2 - theme.spacing.sm * 2) / 3,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  aspectRatioLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aspectRatioText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});