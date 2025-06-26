import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { theme } from '@fishivo/shared';

interface AddButtonProps {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
  variant?: 'primary' | 'text' | 'filled';
}

const AddButton: React.FC<AddButtonProps> = ({
  onPress,
  title = 'Ekle',
  disabled = false,
  variant = 'primary',
}) => {
  if (variant === 'text') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        <Text style={[styles.textButton, disabled && styles.disabledText]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'filled') {
    return (
      <TouchableOpacity 
        style={[styles.filledButton, disabled && styles.filledDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Icon name="plus" size={16} color={disabled ? theme.colors.textSecondary : theme.colors.background} />
        <Text style={[styles.filledButtonText, disabled && styles.disabledText]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.addButton, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon name="plus" size={16} color={disabled ? theme.colors.textSecondary : theme.colors.primary} />
      <Text style={[styles.addButtonText, disabled && styles.disabledText]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  addButtonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
  },
  textButton: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
  },
  filledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  filledButtonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.background,
    fontWeight: theme.typography.medium,
  },
  filledDisabled: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  disabled: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceVariant,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
});

export default AddButton;