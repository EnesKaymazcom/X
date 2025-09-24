import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';
import { useTranslation } from 'react-i18next';

interface PhotoUploaderProps {
  imageUri?: string;
  onSelectImage: () => void;
  onRemoveImage?: () => void;
  label?: string;
  aspectRatio?: number;
  uploading?: boolean;
  optional?: boolean;
  maxPhotos?: number;
  currentPhotoCount?: number;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  imageUri,
  onSelectImage,
  onRemoveImage,
  label = 'Fotoğraf',
  aspectRatio = 1.5, // 3:2 ratio default
  uploading = false,
  optional = true,
  maxPhotos = 1,
  currentPhotoCount = 0,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation('addSpot');
  const styles = createStyles(theme, aspectRatio);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          {imageUri && onRemoveImage && (
            <TouchableOpacity 
              onPress={onRemoveImage} 
              style={styles.removeButton}
              activeOpacity={0.7}
            >
              <Icon name="trash-2" size={16} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={onSelectImage}
        activeOpacity={0.8}
        disabled={uploading}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <Icon name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.changePhotoText}>
                {t('sections.changePhoto')}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Icon name="image" size={32} color={theme.colors.textSecondary} />
            <Text style={styles.addPhotoText}>
              {t('sections.addPhoto')}
            </Text>
            {optional && (
              <Text style={styles.optionalText}>
                {t('sections.photoOptional')}
              </Text>
            )}
            {maxPhotos > 1 && (
              <Text style={styles.photoCountText}>
                {currentPhotoCount}/{maxPhotos}
              </Text>
            )}
          </View>
        )}
        
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.uploadingText}>
              {t('sections.uploading')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme, aspectRatio: number) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  imageContainer: {
    aspectRatio: aspectRatio,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  addPhotoText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  optionalText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textTertiary,
  },
  photoCountText: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  uploadingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
  },
});

export default PhotoUploader;