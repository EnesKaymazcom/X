import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, View, Platform, Animated } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg';
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

const Button: React.FC<ButtonProps> = ({
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
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      gap: theme.spacing.xs,
      overflow: 'hidden',
    };

    // Size styles - IconButton ile uyumlu yükseklikler
    const sizeStyles = {
      sm: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        minHeight: 32,
        ...(Platform.OS === 'android' && { minWidth: 60 }),
      },
      md: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
        ...(Platform.OS === 'android' && { minWidth: 80 }),
      },
      lg: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        minHeight: 40,
        ...(Platform.OS === 'android' && { minWidth: 100 }),
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

    // Disabled durumda opacity ekle
    if (disabled || loading) {
      combinedStyle.opacity = 0.6;
    }

    return combinedStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseFontSize = {
      sm: theme.typography.sm,
      md: theme.typography.base,
      lg: theme.typography.lg,
    };

    const variantTextColors = {
      primary: theme.colors.white,
      secondary: theme.colors.text,
      outline: theme.colors.primary,
      ghost: theme.colors.text,
      destructive: theme.colors.white,
      success: theme.colors.white,
    };

    const textStyle: TextStyle = {
      fontSize: baseFontSize[size],
      fontWeight: theme.typography.medium,
      color: variantTextColors[variant],
    };

    // Primary buton için hafif text shadow
    if (variant === 'primary') {
      textStyle.textShadowColor = 'rgba(0, 0, 0, 0.2)';
      textStyle.textShadowOffset = { width: 0, height: 1 };
      textStyle.textShadowRadius = 2;
    }

    return textStyle;
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 18,
    };
    return iconSizes[size];
  };

  const getIconColor = () => {
    const variantIconColors = {
      primary: theme.colors.white,
      secondary: theme.colors.text,
      outline: theme.colors.primary,
      ghost: theme.colors.text,
      destructive: theme.colors.white,
      success: theme.colors.white,
    };
    return variantIconColors[variant];
  };

  const renderContent = () => {
    const iconElement = icon ? (
      variant === 'primary' ? (
        <View>
          <Icon 
            name={icon} 
            size={getIconSize()} 
            color={getIconColor()} 
          />
        </View>
      ) : (
        <Icon 
          name={icon} 
          size={getIconSize()} 
          color={getIconColor()} 
        />
      )
    ) : null;

    // If no children, just show icon
    if (!children) {
      return iconElement;
    }

    if (iconPosition === 'right') {
      return (
        <>
          <Text style={[getTextStyle(), textStyle]} numberOfLines={1} ellipsizeMode="tail">{children}</Text>
          {iconElement}
        </>
      );
    }

    return (
      <>
        {iconElement}
        <Text style={[getTextStyle(), textStyle]} numberOfLines={1} ellipsizeMode="tail">{children}</Text>
      </>
    );
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.99,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  const handlePress = () => {
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        style={({ pressed }) => [
          getButtonStyle(),
          style,
          pressed && Platform.OS === 'android' && { elevation: 2 }
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        android_ripple={Platform.OS === 'android' ? {
          color: 'rgba(255,255,255,0.2)',
          borderless: false,
        } : undefined}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
};

export default Button; 