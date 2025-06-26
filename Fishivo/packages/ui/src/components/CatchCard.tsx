import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from './Icon';
import Button from './Button';
import Avatar from './Avatar';
import { theme } from '@fishivo/shared';

// Placeholder components that would need to be implemented
const ProBadge = ({ variant, size, showText }: any) => null;
const UserDisplayName = ({ name, size }: any) => <Text style={{ fontWeight: '600' }}>{name}</Text>;
const MoreButton = ({ onPress }: any) => (
  <TouchableOpacity onPress={onPress}>
    <Icon name="more-horizontal" size={20} color={theme.colors.textSecondary} />
  </TouchableOpacity>
);
const CountryFlag = ({ countryCode, size }: any) => <Text>🏳️</Text>;
const LikeSystem = ({ postId, initialCount, showCount, onLikeChange, onShowLikers }: any) => (
  <TouchableOpacity style={styles.actionButton}>
    <Icon name="heart" size={20} color={theme.colors.textSecondary} />
    <Text style={styles.actionText}>{initialCount}</Text>
  </TouchableOpacity>
);

interface CatchCardProps {
  item: {
    id: string;
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
      weight: string;
      length: string;
    };
    image: string;
    images?: string[];
    likes: number;
    comments: number;
    timeAgo: string;
    equipmentDetails?: Array<{
      id: string;
      name: string;
      category: string;
      brand?: string;
      icon: string;
      condition: 'excellent' | 'good' | 'fair';
    }>;
  };
  onUserPress: (userId: string) => void;
  onPostPress: () => void;
  onMorePress: () => void;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  onShowLikers?: (postId: string) => void;
}

const CatchCard: React.FC<CatchCardProps> = ({ 
  item, 
  onUserPress, 
  onPostPress, 
  onMorePress,
  onLikeChange,
  onShowLikers
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width - (theme.spacing.sm * 2));
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  const handleProfilePress = (userId: string) => {
    onUserPress(userId);
  };

  const handleFollowToggle = async () => {
    if (isLoadingFollow) return;
    setIsLoadingFollow(true);
    try {
      setIsFollowing(!isFollowing);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'İşlem sırasında hata oluştu';
      Alert.alert('Hata', message);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  // Görselleri belirle: images varsa onu kullan, yoksa tek image
  const images = item.images && item.images.length > 0 ? item.images : [item.image];

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
            </View>
            <View style={styles.locationRow}>
              <Icon name="map-pin" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                {item.user.location}
                {item.user.country && (
                  <Text> <CountryFlag countryCode={item.user.country} size={14} /></Text>
                )}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.userActions}>
          <Button 
            variant={isFollowing ? 'secondary' : 'primary'} 
            size="sm" 
            onPress={handleFollowToggle}
            icon={isFollowing ? 'user' : 'user-plus'}
            disabled={isLoadingFollow}
          >
            {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
          </Button>
          <MoreButton onPress={onMorePress} />
        </View>
      </View>

      {/* Catch Images */}
      <View style={styles.catchImageContainer}>
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={containerWidth}
          decelerationRate="fast"
          keyExtractor={(_, index) => index.toString()}
          onLayout={(e) => {
            setContainerWidth(e.nativeEvent.layout.width);
          }}
          renderItem={({ item: imageUrl }) => (
            <TouchableOpacity
              style={[styles.imageSlide, { width: containerWidth }]}
              onPress={onPostPress}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.catchImage}
              />
            </TouchableOpacity>
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
            setCurrentImageIndex(index);
          }}
        />
        
        {images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{currentImageIndex + 1}/{images.length}</Text>
          </View>
        )}
      </View>

      {/* Fish Details */}
      <TouchableOpacity 
        style={styles.fishDetails}
        onPress={onPostPress}
      >
        <Text style={styles.fishSpeciesName}>Av Detayı</Text>
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <LikeSystem 
          postId={item.id} 
          initialCount={item.likes} 
          showCount={true}
          onLikeChange={onLikeChange}
          onShowLikers={onShowLikers}
        />
        <TouchableOpacity style={styles.actionButton} onPress={onPostPress}>
          <Icon name="message-circle" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  catchCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
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
    marginRight: theme.spacing.sm,
    minWidth: 0,
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
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
    flex: 1,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flexShrink: 0,
  },
  catchImageContainer: {
    aspectRatio: 1,
    backgroundColor: theme.colors.surfaceVariant,
  },
  imageSlide: {
    height: '100%',
  },
  catchImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  imageCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fishDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  fishSpeciesName: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  timeAgo: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginLeft: 'auto',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default CatchCard;