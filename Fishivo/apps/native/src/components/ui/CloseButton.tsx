import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';

interface CloseButtonProps {
  onPress: () => void;
  size?: number;
  containerStyle?: any;
  color?: string;
}

export const CloseButton: React.FC<CloseButtonProps> = ({ 
  onPress, 
  size = 24,
  containerStyle,
  color
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <TouchableOpacity 
      style={[styles.button, containerStyle]}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon name="x" size={size} color={color || theme.colors.white} />
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  button: {
    padding: theme.spacing.sm,
  },
});