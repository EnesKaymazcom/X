import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import Icon from '@/components/ui/Icon';
import ProBadge from '@/components/ui/ProBadge';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface PrivacyToggleProps {
  isPrivate: boolean;
  onToggle: () => void;
  label?: string;
  description?: string;
  showProBadge?: boolean;
  disabled?: boolean;
}

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  isPrivate,
  onToggle,
  label = 'Özel Spot',
  description = 'Bu spotu sadece sen görebilirsin',
  showProBadge = false,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.infoSection}>
        <View style={styles.header}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>
            {label}
          </Text>
          {showProBadge && <ProBadge variant="badge" size="sm" />}
        </View>
        {description && (
          <Text style={[styles.description, disabled && styles.descriptionDisabled]}>
            {description}
          </Text>
        )}
      </View>
      
      <Switch
        value={isPrivate}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ 
          false: theme.colors.border, 
          true: theme.colors.primary 
        }}
        thumbColor={isPrivate ? '#FFFFFF' : '#F4F4F4'}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  infoSection: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
  },
  labelDisabled: {
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  descriptionDisabled: {
    color: theme.colors.textTertiary,
  },
});

export default PrivacyToggle;