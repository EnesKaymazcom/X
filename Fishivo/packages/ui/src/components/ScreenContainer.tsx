import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { theme } from '@fishivo/shared';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  paddingHorizontal?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'global';
  paddingVertical?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'global';
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  paddingHorizontal = 'global', // Default olarak global theme değeri
  paddingVertical = 'global',
}) => {
  const getHorizontalPadding = () => {
    if (paddingHorizontal === 'none') return 0;
    if (paddingHorizontal === 'global') return theme.screen.paddingHorizontal;
    return theme.spacing[paddingHorizontal];
  };

  const getVerticalPadding = () => {
    if (paddingVertical === 'none') return 0;
    if (paddingVertical === 'global') return theme.screen.paddingVertical;
    return theme.spacing[paddingVertical];
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