import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing, 
  Vibration,
  Platform,
  ActivityIndicator
} from 'react-native';
import Icon from './Icon';
import { theme } from '@fishivo/shared';

// Placeholder for API service
const apiService = {
  getBatchLikeCounts: async (postIds: number[]) => {
    // Mock implementation
    const counts: { [key: number]: number } = {};
    postIds.forEach(id => {
      counts[id] = Math.floor(Math.random() * 100);
    });
    return counts;
  },
  isPostLiked: async (postId: number) => {
    // Mock implementation
    return Math.random() > 0.5;
  },
  likePost: async (postId: number) => {
    // Mock implementation
    return Promise.resolve();
  },
  unlikePost: async (postId: number) => {
    // Mock implementation
    return Promise.resolve();
  }
};

interface LikeSystemProps {
  postId: string;
  initialCount?: number;
  size?: number;
  showCount?: boolean;
  disabled?: boolean;
  hideAnimation?: boolean;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  onShowLikers?: (postId: string) => void;
}

const LikeSystem: React.FC<LikeSystemProps> = ({ 
  postId, 
  initialCount = 0, 
  size = 20,
  showCount = true,
  disabled = false,
  hideAnimation = false,
  onLikeChange,
  onShowLikers
}) => {
  // State management
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Animation refs
  const scale = React.useRef(new Animated.Value(1)).current;
  
  // Initialize like count and status
  useEffect(() => {
    const initializeLikeData = async () => {
      try {
        console.log('🔍 LikeSystem: Loading like data for postId:', postId);
        
        // Get like count
        const likeCounts = await apiService.getBatchLikeCounts([parseInt(postId)]);
        const newCount = likeCounts[parseInt(postId)] || 0;
        setCount(newCount);
        
        // Get like status
        const isLiked = await apiService.isPostLiked(parseInt(postId));
        setLiked(isLiked);
        
        console.log('🔍 LikeSystem: Initialized - count:', newCount, 'liked:', isLiked);
      } catch (error) {
        console.error('❌ LikeSystem: Error loading like data:', error);
        setCount(initialCount || 0);
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeLikeData();
  }, [postId, initialCount]);

  // Animate the heart when liked
  const animateHeart = useCallback(() => {
    if (hideAnimation) return;
    
    scale.setValue(1);
    
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 150,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      scale.setValue(1);
    });
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      if (Platform.constants.osVersion >= '10.0' && !hideAnimation) {
        // @ts-ignore
        Vibration.vibrate('selection');
      }
    } else {
      Vibration.vibrate(10);
    }
  }, [scale, hideAnimation]);

  // Handle like/unlike action
  const handleLikeAction = useCallback(async () => {
    if (disabled || isLoading || !isInitialized) return;
    
    setIsLoading(true);
    
    try {
      if (liked) {
        // Unlike
        await apiService.unlikePost(parseInt(postId));
        console.log('✅ LikeSystem: Post unliked successfully');
        setLiked(false);
        setCount(prev => Math.max(0, prev - 1));
        onLikeChange?.(false, count - 1);
      } else {
        // Like
        await apiService.likePost(parseInt(postId));
        console.log('✅ LikeSystem: Post liked successfully');
        setLiked(true);
        setCount(prev => prev + 1);
        onLikeChange?.(true, count + 1);
        animateHeart();
      }
      
    } catch (error) {
      console.error('❌ LikeSystem: Error handling like action:', error);
      // Revert state on error
      setLiked(!liked);
      setCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsLoading(false);
    }
  }, [postId, liked, count, disabled, isLoading, isInitialized, onLikeChange, animateHeart]);

  // Show loading state
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={size} color={theme.colors.textSecondary} />
        {showCount && (
          <View style={styles.countContainer}>
            <Text style={styles.countText}>...</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Like Button */}
      <TouchableOpacity 
        onPress={handleLikeAction}
        disabled={disabled || isLoading}
        style={[
          styles.likeButton,
          isLoading && styles.likeButtonDisabled
        ]}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.iconContainer, { transform: [{ scale }] }]}>
          {isLoading ? (
            <ActivityIndicator size={size * 0.8} color={theme.colors.textSecondary} />
          ) : (
            <Icon 
              name="heart" 
              size={size} 
              color={liked ? theme.colors.error : theme.colors.textSecondary} 
            />
          )}
        </Animated.View>
      </TouchableOpacity>
      
      {/* Like Count */}
      {showCount && count > 0 && (
        <TouchableOpacity 
          onPress={() => {
            console.log('🔍 LikeSystem: Like count pressed for postId:', postId);
            onShowLikers?.(postId);
          }} 
          style={styles.countContainer}
          activeOpacity={0.7}
        >
          <Text style={styles.countText}>
            {count} {count === 1 ? 'beğeni' : 'beğeni'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  likeButton: {
    padding: 4,
    borderRadius: 20,
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButtonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  countContainer: {
    paddingVertical: 2,
    minWidth: 20,
  },
  countText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default LikeSystem;