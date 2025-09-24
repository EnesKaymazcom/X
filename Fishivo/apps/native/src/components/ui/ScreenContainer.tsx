import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  paddingHorizontal?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'global';
  paddingVertical?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'global';
  useGlobalHorizontalPadding?: boolean;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  paddingHorizontal = 'global',
  paddingVertical = 'global',
  useGlobalHorizontalPadding = true,
}) => {
  const { theme } = useTheme();
  
  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  };

  const getHorizontalPadding = () => {
    if (!useGlobalHorizontalPadding) return 0;
    if (paddingHorizontal === 'none') return 0;
    if (paddingHorizontal === 'global') return theme.layout.screenHorizontalPadding;
    return spacing[paddingHorizontal];
  };

  const getVerticalPadding = () => {
    if (paddingVertical === 'none') return 0;
    if (paddingVertical === 'global') return 16; // Default vertical padding
    return spacing[paddingVertical];
  };

  const containerStyle = [
    styles.container,
    { 
      paddingHorizontal: getHorizontalPadding(),
      paddingVertical: getVerticalPadding(),
    },
    style,
  ];

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenContainer;