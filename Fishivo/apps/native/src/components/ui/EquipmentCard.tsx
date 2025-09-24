import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FishingGearUI } from '@fishivo/types';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';

interface EquipmentCardProps {
  item: FishingGearUI;
  onDelete?: (gearId: string) => void;
  rating?: number;
  reviewCount?: number;
  usageCount?: number;
  showStats?: boolean;
  variant?: 'default' | 'recommendation';
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ 
  item, 
  onDelete,
  rating,
  reviewCount,
  usageCount,
  showStats = false,
  variant = 'default'
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <View style={styles.card}>
      <View style={styles.iconArea}>
        <Icon name="backpack" size={32} color={theme.colors.primary} />
        {onDelete && (
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => onDelete(item.id)}
          >
            <Icon name="trash-2" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.textArea}>
        {/* Equipment Name */}
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        
        {/* Brand */}
        {item.brand && (
          <Text style={styles.brand} numberOfLines={1} ellipsizeMode="tail">
            {item.brand}
          </Text>
        )}
        
        {/* Category (only for default variant) */}
        {variant === 'default' && (
          <Text style={styles.category} numberOfLines={1} ellipsizeMode="tail">
            {item.category}
          </Text>
        )}
        
        {/* Rating Row - Only for recommendation variant */}
        {showStats && variant === 'recommendation' && rating && rating > 0 && (
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
        
        {/* Usage Count Row */}
        {showStats && variant === 'recommendation' && usageCount && usageCount > 0 && (
          <Text style={styles.usageCount}>
            {usageCount} kişi öneriyor
          </Text>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconArea: {
    width: '100%',
    height: 100,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  deleteBtn: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    width: '100%',
    padding: theme.spacing.sm,
    minHeight: 85,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
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
  usageCount: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs / 2,
  },
  reviewCount: {
    fontSize: theme.typography.xs,
    color: theme.colors.textTertiary,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  category: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  brand: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs / 2,
  },
});

export default EquipmentCard;
