import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@/components/ui/Icon';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  color?: string;
  spacing?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'medium',
  onRatingChange,
  readonly = false,
  color = '#FFC107',
  spacing = 4,
}) => {
  const sizes = {
    small: 14,
    medium: 20,
    large: 28,
  };

  const starSize = sizes[size];

  const handlePress = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <View style={[styles.container, { gap: spacing }]}>
      {Array.from({ length: maxRating }, (_, index) => {
        const filled = index < rating;
        
        if (readonly) {
          return (
            <Icon
              key={index}
              name="star"
              size={starSize}
              color={filled ? color : '#E0E0E0'}
              filled={filled}
            />
          );
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(index)}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <Icon
              name="star"
              size={starSize}
              color={filled ? color : '#E0E0E0'}
              filled={filled}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 2,
  },
});

export default StarRating;