import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@fishivo/shared';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      gap: theme.spacing.xs,
    };

    // Size styles
    const sizeStyles = {
      sm: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        minHeight: 32,
      },
      md: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
      },
      lg: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        minHeight: 40,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      destructive: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
      },
      success: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
      },
    };

    let combinedStyle = {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };

    if (fullWidth) {
      combinedStyle.width = '100%';
    }

    if (disabled || loading) {
      combinedStyle.opacity = 0.5;
    }

    return combinedStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseFontSize = {
      sm: theme.typography.sm,
      md: theme.typography.sm,
      lg: theme.typography.sm,
    };

    const variantTextColors = {
      primary: theme.colors.background,
      secondary: theme.colors.text,
      outline: theme.colors.primary,
      ghost: theme.colors.text,
      destructive: theme.colors.background,
      success: theme.colors.background,
    };

    return {
      fontSize: baseFontSize[size],
      fontWeight: theme.typography.medium,
      color: variantTextColors[variant],
    };
  };

  const renderContent = () => {
    // For now, just render text content - icon support will be added when Icon component is ready
    if (!children) {
      return null;
    }

    return (
      <Text style={[getTextStyle(), textStyle]}>{children}</Text>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};