import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { theme } from '@fishivo/shared';

interface MoreButtonProps {
  onPress: () => void;
  size?: number;
  color?: string;
}

const MoreButton: React.FC<MoreButtonProps> = ({ 
  onPress, 
  size = 20, 
  color = theme.colors.textSecondary 
}) => {
  return (
    <TouchableOpacity 
      style={styles.moreButton}
      onPress={onPress}
    >
      <Icon name="more-vertical" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  moreButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MoreButton;