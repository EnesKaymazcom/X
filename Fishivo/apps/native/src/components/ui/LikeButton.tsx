import React, { useRef } from 'react';
import { TouchableOpacity, Animated, Text, StyleSheet, View, Easing } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface LikeButtonProps {
  likes?: number;
  isLiked?: boolean;
  size?: number;
  showCount?: boolean;
  onPress?: () => void;
  onCountPress?: () => void;
  hitSlop?: { top: number; bottom: number; left: number; right: number };
}

const LikeButton: React.FC<LikeButtonProps> = ({
  likes = 0,
  isLiked = false,
  size = 20,
  showCount = true,
  onPress,
  onCountPress,
  hitSlop,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme, size);
  const heartScale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    const willBeLiked = !isLiked;
    
    if (willBeLiked) {
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.2,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 0.9,
          duration: 100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    if (onPress) {
      onPress();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
        hitSlop={hitSlop}
      >
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <Icon 
            name="heart" 
            size={size} 
            color={isLiked ? theme.colors.error : theme.colors.textSecondary} 
            filled={isLiked}
          />
        </Animated.View>
      </TouchableOpacity>
      {showCount && likes > 0 && (
        <TouchableOpacity 
          onPress={onCountPress}
          disabled={!onCountPress}
          activeOpacity={onCountPress ? 0.7 : 1}
        >
          <Text style={styles.likesText}>{likes}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: Theme, iconSize: number) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likesText: {
    fontSize: iconSize >= 20 ? theme.typography.base * 1.2 : theme.typography.base, // Size 20 ve üzeri için büyük font
    color: theme.colors.textSecondary,
  },
});

export default LikeButton;