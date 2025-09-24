import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import * as CircleFlags from 'react-native-svg-circle-country-flags';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import ProBadge from '@/components/ui/ProBadge';
import Avatar from '@/components/ui/Avatar';
import UserDisplayName from '@/components/ui/UserDisplayName';
import MoreButton from '@/components/ui/MoreButton';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { FishivoModal } from '@/components/ui/FishivoModal';
import ImageViewerModal from '@/components/ui/ImageViewerModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import RotatingCatchDetailsBadge from '@/components/ui/RotatingCatchDetailsBadge';
import LikeButton from '@/components/ui/LikeButton';
import { Theme } from '@/theme';
import { useLikeStore } from '@/stores/likeStore';

export interface CatchCardProps {
  currentUserId?: string | null;
  hideSpeciesImage?: boolean;
  hideMoreButton?: boolean;
  hideShareButton?: boolean;
  hideBadge?: boolean;
  item: {
    id: number; // Database BIGINT
    user: {
      id: string;
      name: string;
      avatar?: string | null;
      location: string;
      country?: string;
      isPro?: boolean;
    };
    fish: {
      species: string;
      speciesId?: string;
      weight: string;
      length: string;
      weightUnit?: string;
      lengthUnit?: string;
      speciesImage?: string;
    };
    image: string;
    images?: string[];
    likes: number;
    comments: number;
    timeAgo: string;
    description?: string | null | undefined;
    isLiked?: boolean;
    hasUserCommented?: boolean;
    isSecret?: boolean;
    coordinates?: [number, number]; // [longitude, latitude]
    equipmentDetails?: Array<{
      id: string;
      name: string;
      category: string;
      brand?: string;
      icon: string;
      condition: 'excellent' | 'good' | 'fair';
    }>;
  };
  isFollowing: boolean;
  isPending: boolean;
  onFollowToggle: () => Promise<void>;
  onUserPress: (userId: string) => void;
  onPostPress: () => void;
  onMorePress: () => void;
  onCommentPress?: () => void;
  badgeActive?: boolean;
  actionsStyle?: {
    paddingHorizontal?: number;
    paddingVertical?: number;
    [key: string]: number | undefined;
  };
}

const CatchCardBase = ({ 
  item,
  currentUserId,
  hideSpeciesImage = false,
  hideMoreButton = false,
  hideShareButton = false,
  hideBadge = false,
  isFollowing,
  isPending,
  onFollowToggle,
  onUserPress, 
  onPostPress, 
  onMorePress,
  onCommentPress,
  badgeActive = true,
  actionsStyle,
}: CatchCardProps) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const { user } = useSupabaseUser();
  const styles = createStyles(theme);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  
  // Like store integration - Single source of truth
  const likeStore = useLikeStore();
  const postId = item.id.toString();
  
  // Initialize store state if not exists (only on first render)
  useEffect(() => {
    const existingState = likeStore.getPostLikeState(postId);
    if (!existingState && item.isLiked !== undefined) {
      likeStore.setPostLikeState(postId, {
        isLiked: item.isLiked || false,
        likesCount: item.likes || 0,
        lastUpdated: Date.now()
      });
    }
  }, [postId, item.isLiked, item.likes, likeStore]);
  
  // Always use store as single source of truth
  const postLikeState = likeStore.getPostLikeState(postId);
  const isLiked = postLikeState?.isLiked ?? false;
  const likesCount = postLikeState?.likesCount ?? 0;
  const isLiking = likeStore.isPending(postId, 'post');
  
  const handleLikePress = useCallback(async () => {
    if (isLiking) return;
    
    try {
      // Use the store's toggle method which handles everything
      const success = await likeStore.togglePostLike(postId, likesCount);
      
      if (!success) {
        setModalMessage(t('common.error'));
        setShowErrorModal(true);
      }
    } catch (error) {
      setModalMessage(t('common.error'));
      setShowErrorModal(true);
    }
  }, [isLiking, likeStore, postId, likesCount, t]);
  
  const handleLikesPress = useCallback(() => {
    navigation.navigate('Likers', { postId: item.id });
  }, [navigation, item.id]);

  // onPostPress referansını stabilize et
  const onPostPressRef = useRef(onPostPress);
  useEffect(() => {
    onPostPressRef.current = onPostPress;
  }, [onPostPress]);

  // handleFollowToggle SİLİNDİ - onFollowToggle direkt kullanılıyor


  const handleShare = async () => {
    try {
      // Development'ta localhost, production'da gerçek URL kullanacak
      const baseUrl = __DEV__ ? 'http://localhost:3000' : 'https://fishivo.com';
      
      // Locale bilgisini al (varsayılan: tr)
      const currentLocale = locale || 'tr';
      
      // Kullanıcı bilgilerini al
      const referrerId = user?.id || '';
      const referrerFirstName = user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
      
      // Kısaltılmış query parametreleri
      const shortReferrerId = referrerId.split('-')[0]; // İlk 8 karakter
      const postUrl = `${baseUrl}/${currentLocale}/catches/${item.id}?r=${shortReferrerId}&n=${encodeURIComponent(referrerFirstName)}`;
      
      // Weight ve length formatını düzelt - duplicate unit kontrolü
      const parseWeightLength = (value: string, defaultUnit: string) => {
        if (!value) return '';
        // Eğer değer zaten unit içeriyorsa, direkt kullan
        if (value.includes('kg') || value.includes('lbs') || value.includes('g') || value.includes('oz')) {
          return value;
        }
        if (value.includes('cm') || value.includes('in') || value.includes('m') || value.includes('ft')) {
          return value;
        }
        // Unit yoksa default unit ekle
        return `${value} ${defaultUnit}`;
      };
      
      const weight = parseWeightLength(item.fish.weight, item.fish.weightUnit || 'kg');
      const length = parseWeightLength(item.fish.length, item.fish.lengthUnit || 'cm');
      
      const message = t('common.sharePostMessage', {
        userName: item.user.name,
        fishSpecies: item.fish.species,
        weight: weight,
        length: length
      });

      // Platform'a göre paylaşım
      const shareOptions = Platform.OS === 'ios' 
        ? {
            message: `${message}\n\n${postUrl}`,
          }
        : {
            title: t('common.sharePostTitle'),
            message: `${message}\n\n${postUrl}`,
          };

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          
        } else {
          
        }
      } else if (result.action === Share.dismissedAction) {
        
      }
    } catch (error) {
      setModalMessage(t('common.shareError'));
      setShowErrorModal(true);
    }
  };

  const images = useMemo(() => (
    item.images && item.images.length > 0 ? item.images : [item.image]
  ), [item.images, item.image]);

  const onImagePressHandler = useCallback((index: number) => {
    setViewerInitialIndex(index);
    setShowImageViewer(true);
  }, []);


  return (
    <View style={styles.catchCard}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => onUserPress(item.user.id)}
        >
          <Avatar
            uri={item.user.avatar}
            size={40}
            name={item.user.name}
          />
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <UserDisplayName name={item.user.name} size="md" />
              {item.user.isPro && (
                <ProBadge variant="icon" size="sm" showText={false} />
              )}
              {item.isSecret && currentUserId === item.user.id && (
                <View style={styles.secretBadge}>
                  <Icon name="lock" size={16} color={theme.colors.warning} />
                </View>
              )}
            </View>
            <View style={styles.locationRow}>
              <Icon name="map-pin" size={12} color={theme.colors.textSecondary} />
              <View style={styles.locationContent}>
                <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                  {(() => {
                    if (!item.user.location) return '';
                    
                    // Parse location: "Mahalle, İlçe, İl, Ülke" formatında
                    const parts = item.user.location.split(', ').map(p => p.trim());
                    
                    if (parts.length >= 4) {
                      // 4 veya daha fazla parça var: Mahalle, İlçe, İl, Ülke
                      // İlçe ve İl'i göster (sondan 3. ve 2.)
                      return `${parts[parts.length - 3]}, ${parts[parts.length - 2]}`;
                    } else if (parts.length === 3) {
                      // 3 parça var: İlçe, İl, Ülke
                      // İlçe ve İl'i göster
                      return `${parts[0]}, ${parts[1]}`;
                    } else if (parts.length === 2) {
                      // 2 parça var: İl, Ülke
                      // Sadece İl'i göster
                      return parts[0];
                    }
                    // Başka durumda olduğu gibi göster
                    return item.user.location;
                  })()}
                </Text>
                {item.user.country && (
                  <View style={styles.flagIcon}>
                    {(() => {
                      try {
                        // Convert country code to component name (TR -> Tr, US -> Us)
                        const flagName = item.user.country.charAt(0).toUpperCase() + item.user.country.slice(1).toLowerCase();
                        
                        const FlagComponent = (CircleFlags as any)[flagName];
                        
                        if (FlagComponent && typeof FlagComponent === 'function') {
                          return <FlagComponent width={14} height={14} />;
                        }
                        return null;
                      } catch (error) {
                        return null;
                      }
                    })()}
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.userActions}>
          {currentUserId === item.user.id ? (
            <View style={styles.spacer} />
          ) : (
            <Button 
              variant={isFollowing ? 'secondary' : 'primary'} 
              size="sm" 
              onPress={async () => {
                if (isPending) return;
                try {
                  await onFollowToggle();
                } catch (error) {
                  const message = error instanceof Error ? error.message : t('common.error');
                  setModalMessage(message);
                  setShowErrorModal(true);
                }
              }}
              icon={isFollowing ? 'user' : 'user-plus'}
              disabled={isPending}
            >
              {isFollowing ? t('profile.unfollow') : t('profile.follow')}
            </Button>
          )}
          {!hideMoreButton && <MoreButton onPress={onMorePress} />}
        </View>
      </View>

      {/* Description - Below user info */}
      {item.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
      )}

      {/* Catch Images */}
      <View style={styles.catchImageContainer}>
        <ImageCarousel
          images={images}
          aspectRatio="1:1"
          showCounter={false}
          onImagePress={onImagePressHandler}
        />

        {!hideBadge && (
          <RotatingCatchDetailsBadge 
            onPress={onPostPress}
            size={78}
            bottom={-21}
            left={-21}
            active={badgeActive}
          />
        )}
      </View>

      {/* Actions */}
      <View style={[styles.actions, actionsStyle]}>
        <LikeButton 
          likes={likesCount}
          isLiked={isLiked}
          size={20}
          onPress={handleLikePress}
          onCountPress={handleLikesPress}
        />
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onCommentPress || onPostPress}
        >
          <Icon 
            name="message-circle" 
            size={20} 
            color={item.hasUserCommented ? theme.colors.primary : theme.colors.textSecondary} 
          />
          {item.comments > 0 && (
            <Text style={styles.actionText}>{item.comments}</Text>
          )}
        </TouchableOpacity>
        {!hideShareButton && (
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {/* Species Image */}
        {!hideSpeciesImage && item.fish.speciesImage && (
          <TouchableOpacity 
            style={styles.speciesContainer}
            onPress={() => {
              if (item.fish.speciesId) {
                navigation.navigate('FishDetail', { 
                  species: {
                    id: item.fish.speciesId,
                    common_name: item.fish.species || '',
                    scientific_name: '',
                    family: '',
                    created_at: new Date().toISOString()
                  }
                });
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.speciesImageWrapper}>
              <Image 
                source={{ uri: item.fish.speciesImage }}
                style={styles.speciesImage}
              />
            </View>
            <Text 
              style={styles.speciesName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.fish.species}
            </Text>
          </TouchableOpacity>
        )}
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
      
      {/* Image Viewer Modal */}
      {images && images.length > 0 && (
        <ImageViewerModal
          visible={showImageViewer}
          images={images}
          initialIndex={viewerInitialIndex}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  catchCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
    marginRight: theme.spacing.sm, // Butonlardan uzaklık
    minWidth: 0, // Flex shrink için
  },
  userDetails: {
    flex: 1,
    minWidth: 0, // Text overflow için
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  secretBadge: {
    backgroundColor: theme.colors.warningBackground,
    borderRadius: theme.borderRadius.sm,
    padding: 5,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    flex: 1,
  },
  location: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexShrink: 0, // Butonların küçülmesini engelle
  },
  catchImageContainer: {
    aspectRatio: 1,
    backgroundColor: theme.colors.surfaceVariant,
    position: 'relative',
    overflow: 'hidden',
  },

  descriptionContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  descriptionText: {
    color: theme.colors.text,
    fontSize: theme.typography.base,
    lineHeight: 20,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',  // Tüm elemanları dikey ortala
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm, // md'den sm'ye düşürdük (%10 genişleme)
    paddingVertical: theme.spacing.md, // sm'den md'ye çıkardık (daha yüksek)
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: theme.typography.base * 1.2, // %20 büyütüldü
    color: theme.colors.textSecondary,
  },
  speciesContainer: {
    marginLeft: 'auto',
    marginRight: theme.spacing.xs,
    alignItems: 'flex-end', // Sağa hizala
    marginTop: -theme.spacing.sm, // Üst padding'i iptal et
  },
  speciesImageWrapper: {
    width: 53, // %10 büyütüldü (48 → 53)
    height: 44, // %10 büyütüldü (40 → 44)
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  speciesName: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: -10,
    textAlign: 'right',
    maxWidth: 132, // %10 büyütüldü
  },
  spacer: {
    width: 90,
  },
  flagIcon: {
    marginLeft: 4,
  },
});

const CatchCard = CatchCardBase;

export default CatchCard;