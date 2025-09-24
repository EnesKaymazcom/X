import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface CategoryCardProps {
  icon?: string;
  iconName?: string; // backwards compatibility
  title: string;
  subtitle: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  iconName, // backwards compatibility
  title,
  subtitle,
  onPress,
  rightElement,
  isDestructive = false,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const finalIconName = icon || iconName;
  const isClickable = !!onPress;

  const CardContent = (
    <>
      {finalIconName && (
        <View style={styles.categoryIcon}>
          <Icon name={finalIconName} size={18} color={isDestructive ? theme.colors.error : theme.colors.primary} />
        </View>
      )}
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categorySubtitle}>{subtitle}</Text>
      </View>
      {rightElement || (isClickable && <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />)}
    </>
  );

  if (isClickable) {
    return (
      <TouchableOpacity 
        style={styles.categoryCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.categoryCard}>
      {CardContent}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
    minHeight: 64,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default CategoryCard;