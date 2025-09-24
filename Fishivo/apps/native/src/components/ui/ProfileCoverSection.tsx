import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions, Text, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Icon from '@/components/ui/Icon';
import { FishivoModal } from '@/components/ui/FishivoModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';

const { width: screenWidth } = Dimensions.get('window');

const COVER_HEIGHT = screenWidth * 0.32;
const AVATAR_SIZE = 69;

interface ProfileCoverSectionProps {
  coverImage?: string;
  avatar?: string;
  name: string;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  isEditMode?: boolean;
  onAvatarPress?: () => void;
  onButtonPress?: () => void;
  onSharePress?: () => void;
  onFindFriendsPress?: () => void;
  onCoverImagePress?: () => void;
  onDeleteAvatar?: () => void;
  onDeleteCover?: () => void;
  followDisabled?: boolean;
  isLoadingAvatar?: boolean;
  isLoadingCover?: boolean;
}

const ProfileCoverSection: React.FC<ProfileCoverSectionProps> = ({
  coverImage,
  avatar,
  name,
  isOwnProfile = false,
  isFollowing = false,
  isEditMode = false,
  onAvatarPress,
  onButtonPress,
  onSharePress,
  onFindFriendsPress,
  onCoverImagePress,
  onDeleteAvatar,
  onDeleteCover,
  followDisabled = false,
  isLoadingAvatar = false,
  isLoadingCover = false,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  const handleAvatarLongPress = () => {
    if (!isEditMode) return;
    
    if (avatar) {
      setShowAvatarModal(true);
    } else {
      onAvatarPress?.();
    }
  };

  const handleCoverLongPress = () => {
    if (!isEditMode) return;
    
    if (coverImage) {
      setShowCoverModal(true);
    } else {
      onCoverImagePress?.();
    }
  };

  const handleAvatarChange = () => {
    setShowAvatarModal(false);
    setTimeout(() => {
      onAvatarPress?.();
    }, 300);
  };

  const handleAvatarDelete = () => {
    setShowAvatarModal(false);
    onDeleteAvatar?.();
  };

  const handleCoverChange = () => {
    setShowCoverModal(false);
    setTimeout(() => {
      onCoverImagePress?.();
    }, 300);
  };

  const handleCoverDelete = () => {
    setShowCoverModal(false);
    onDeleteCover?.();
  };


  return (
    <>
      <View style={styles.container}>
        {/* Cover Image Section */}
        <TouchableOpacity 
          style={styles.coverImageContainer}
          onPress={isEditMode ? (coverImage ? handleCoverLongPress : onCoverImagePress) : undefined}
          activeOpacity={1}
          disabled={!isEditMode || isLoadingCover}
        >
          {coverImage ? (
            <Image 
              source={{ uri: coverImage }} 
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
            colors={isDark ? ['#36454F', '#1a202c'] : ['#42A5F5', '#90CAF9']}
            style={styles.coverImage}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            />
          )}
          
          {/* Edit Mode Camera/Delete Icon */}
          {isEditMode && !isLoadingCover && (
          <View style={styles.coverEditButton}>
              <Icon name={coverImage ? 'more-vertical' : 'camera'} size={18} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Section - Avatar + Buttons */}
        <View style={styles.profileSection}>
        {/* Avatar - Half overlapping cover image */}
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={isEditMode ? (avatar ? handleAvatarLongPress : onAvatarPress) : onAvatarPress}
          activeOpacity={1}
          disabled={(!isEditMode && !onAvatarPress) || isLoadingAvatar}
        >
          <View style={styles.avatarWrapper}>
            <Avatar 
              uri={avatar} 
              size={AVATAR_SIZE} 
              name={name}
            />
            {/* Edit Mode Camera/Delete Icon for Avatar */}
            {isEditMode && !isLoadingAvatar && (
              <View style={styles.avatarEditButton}>
                  <Icon name={avatar ? 'more-vertical' : 'camera'} size={14} color="#FFFFFF" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Action Buttons - Only show if not in edit mode */}
        {!isEditMode && (
          <View style={styles.buttonsContainer}>
            {isOwnProfile ? (
              <>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon="edit"
                  onPress={onButtonPress || (() => {})}
                >
                  {t('profile.editProfile')}
                </Button>
                
                <IconButton 
                  icon="users"
                  size="sm"
                  onPress={onFindFriendsPress || (() => {})}
                />

                <IconButton 
                  icon="share"
                  size="sm"
                  onPress={onSharePress || (() => {})}
                />
              </>
            ) : (
            <>
              <Button 
                variant={isFollowing ? 'secondary' : 'primary'}
                size="sm" 
                onPress={onButtonPress || (() => {})}
                disabled={followDisabled}
              >
                {isFollowing ? t('profile.stats.following') : t('profile.follow')}
              </Button>
              
              <IconButton 
                icon="share"
                size="sm"
                onPress={onSharePress || (() => {})}
              />
            </>
            )}
          </View>
        )}
        </View>
      </View>

      {/* Avatar Options Modal */}
      <FishivoModal
        visible={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title={t('profile.edit.profilePhoto')}
        buttons={[
          {
            text: t('profile.edit.changePhoto'),
            variant: 'secondary',
            onPress: handleAvatarChange,
            icon: 'camera'
          },
          {
            text: t('profile.edit.deletePhoto'),
            variant: 'destructive',
            onPress: handleAvatarDelete,
            icon: 'trash-2'
          }
        ]}
        buttonLayout="horizontal"
      />

      {/* Cover Options Modal */}
      <FishivoModal
        visible={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        title={t('profile.edit.coverImage')}
        buttons={[
          {
            text: t('profile.edit.changeCover'),
            variant: 'secondary',
            onPress: handleCoverChange,
            icon: 'camera'
          },
          {
            text: t('profile.edit.deleteCover'),
            variant: 'destructive',
            onPress: handleCoverDelete,
            icon: 'trash-2'
          }
        ]}
        buttonLayout="horizontal"
      />
    </>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    width: '100%',
  },
  coverImageContainer: {
    width: '100%',
    height: COVER_HEIGHT,
    borderRadius: theme.spacing.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  avatarContainer: {
    marginTop: -(AVATAR_SIZE / 2), // Half overlap with cover image
  },
  avatarWrapper: {
    padding: theme.spacing.xs / 2,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  coverEditButton: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    padding: 4,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  modalContent: {
    paddingVertical: theme.spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOptionTextDanger: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
});

export default ProfileCoverSection;