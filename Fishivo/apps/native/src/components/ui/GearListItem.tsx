import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';

interface GearListItemProps {
  name: string;
  subtitle: string;
  usageCount?: number;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  icon?: string;
  onPress: () => void;
}

const GearListItem: React.FC<GearListItemProps> = ({
  name,
  subtitle,
  usageCount,
  rating,
  reviewCount,
  imageUrl,
  icon = 'package',
  onPress
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <View style={styles.iconContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.iconBackground}>
            <Icon name="backpack" size={20} color={theme.colors.primary} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">{subtitle}</Text>
        
        {/* Rating Row */}
        {rating && rating > 0 && (
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
            {reviewCount && reviewCount > 0 && (
              <Text style={styles.reviewCount}>
                • {reviewCount} inceleme
              </Text>
            )}
          </View>
        )}
        
        {/* Usage Count */}
        {usageCount && usageCount > 0 && (
          <Text style={styles.usage}>{usageCount} kişi kullanıyor</Text>
        )}
      </View>
      
      <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  usage: {
    fontSize: theme.typography.xs,
    color: theme.colors.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs / 2,
    marginBottom: theme.spacing.xs / 2,
    gap: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  reviewCount: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
});

export default GearListItem;