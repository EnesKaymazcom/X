import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@/components/ui/Icon';
import StarRating from '@/components/ui/StarRating';
import { useTheme } from '@/contexts/ThemeContext';

interface RatingDisplayProps {
  rating: number;
  count?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  onPress?: () => void;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  count = 0,
  size = 'medium',
  showCount = true,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const sizeConfig = {
    small: {
      starSize: 14,
      fontSize: 12,
      gap: 2,
    },
    medium: {
      starSize: 16,
      fontSize: 14,
      gap: 4,
    },
    large: {
      starSize: 20,
      fontSize: 16,
      gap: 6,
    },
  };

  const config = sizeConfig[size];

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={[styles.container, { gap: config.gap }]} onPress={onPress}>
      <StarRating
        rating={rating}
        size={size}
        readonly
        color="#FFC107"
      />
      {showCount && (
        <Text style={[styles.ratingText, { fontSize: config.fontSize }]}>
          {rating.toFixed(1)} {count > 0 && `(${count})`}
        </Text>
      )}
    </Container>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
});

export default RatingDisplay;