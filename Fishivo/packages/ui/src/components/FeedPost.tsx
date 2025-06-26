import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from './Icon';
import { theme } from '@fishivo/shared';

// Placeholder components that would need to be implemented
const ProBadge = ({ variant, size }: any) => (
  <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
    <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>PRO</Text>
  </View>
);

const LikeSystem = ({ postId, initialCount, size, onLikeChange, onShowLikers }: any) => (
  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <Icon name="heart" size={size || 20} color={theme.colors.textSecondary} />
    <Text style={{ fontSize: theme.typography.fontSizes.sm, color: theme.colors.textSecondary }}>
      {initialCount}
    </Text>
  </TouchableOpacity>
);

interface User {
  id: string;
  name: string;
  avatar?: string;
  isPro?: boolean;
  location?: string;
}

interface FeedPostData {
  id: string;
  user: User;
  imageUrl?: string;
  photo?: string;
  description?: string;
  fish?: {
    species: string;
    weight: string | { value: number; unit: string; originalUnit: string; displayValue: string };
    length?: string | { value: number; unit: string; originalUnit: string; displayValue: string };
  };
  location?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked?: boolean;
}

interface FeedPostProps {
  post: FeedPostData;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onUserPress?: (userId: string) => void;
  onLikeChange?: (postId: string, newCount: number) => void;
}

const FeedPost: React.FC<FeedPostProps> = ({
  post,
  onPress,
  onLike,
  onComment,
  onUserPress,
  onLikeChange,
}) => {
  const handleProfilePress = (userId: string) => {
    if (onUserPress) onUserPress(userId);
  };

  const formatFishWeight = (weight: string | { value: number; unit: string; originalUnit: string; displayValue: string }) => {
    if (typeof weight === 'string') {
      return weight;
    }
    return weight.displayValue || `${weight.value} ${weight.unit}`;
  };

  const formatFishLength = (length: string | { value: number; unit: string; originalUnit: string; displayValue: string }) => {
    if (typeof length === 'string') {
      return length;
    }
    return length.displayValue || `${length.value} ${length.unit}`;
  };

  return (
    <View style={styles.container}>
      {/* User Header */}
      <TouchableOpacity 
        style={styles.userHeader}
        onPress={() => handleProfilePress(post.user.id)}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.user.avatar || '👤'}</Text>
          </View>
          
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{post.user.name}</Text>
              {post.user.isPro && (
                <ProBadge variant="badge" size="sm" />
              )}
            </View>
            
            {post.location && (
              <Text style={styles.postLocation}>📍 {post.location}</Text>
            )}
          </View>
        </View>
        
        <Text style={styles.timeAgo}>{post.timeAgo}</Text>
      </TouchableOpacity>

      {/* Post Image */}
      <TouchableOpacity style={styles.imageContainer} onPress={onPress}>
        {post.imageUrl ? (
          <Image 
            source={{ uri: post.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoText}>{post.photo}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Post Content */}
      <View style={styles.content}>
        {/* Fish Info */}
        {post.fish && (
          <View style={styles.fishInfo}>
            <Icon name="fish" size={16} color={theme.colors.primary} />
            <Text style={styles.fishDetails}>
              {post.fish.species} • {formatFishWeight(post.fish.weight)}
              {post.fish.length && ` • ${formatFishLength(post.fish.length)}`}
            </Text>
          </View>
        )}

        {/* Description */}
        {post.description && (
          <Text style={styles.description} numberOfLines={3}>
            {post.description}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <LikeSystem 
              postId={post.id} 
              initialCount={post.likes} 
              size={20}
              onLikeChange={(liked: boolean, newCount: number) => {
                if (onLikeChange) {
                  onLikeChange(post.id, newCount);
                }
              }}
              onShowLikers={(postId: string) => {
                console.log('Show likers for post:', postId);
              }}
            />
          </View>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onComment}
          >
            <Icon name="message-circle" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  userDetails: {
    gap: 2,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  userName: {
    fontSize: theme.typography.fontSizes.base,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  },
  postLocation: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  timeAgo: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceVariant,
  },
  photoText: {
    fontSize: 64,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  fishInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  fishDetails: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  description: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeights.medium,
  },
});

export default FeedPost;