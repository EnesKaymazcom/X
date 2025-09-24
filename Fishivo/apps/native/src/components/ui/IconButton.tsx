import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  iconColor?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'sm',
  disabled = false,
  style,
  iconColor,
}) => {
  const { theme } = useTheme();
  const getButtonStyle = (): ViewStyle => {
    // Button ile uyumlu boyutlar (32x32px)
    const sizeStyles = {
      sm: {
        width: 32,
        height: 32,
      },
      md: {
        width: 36,
        height: 36,
      },
      lg: {
        width: 40,
        height: 40,
      },
    };

    return {
      ...sizeStyles[size],
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 16,
      md: 18,
      lg: 20,
    };
    return iconSizes[size];
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon 
        name={icon} 
        size={getIconSize()} 
        color={iconColor || theme.colors.text} 
      />
    </TouchableOpacity>
  );
};

export default IconButton;