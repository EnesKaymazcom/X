import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@fishivo/shared';

interface DefaultAvatarProps {
  size?: number;
  style?: any;
  name?: string;
}

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  size = 40,
  style,
  name = '',
}) => {
  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getBackgroundColor = (name: string) => {
    if (!name) return theme.colors.surfaceVariant;
    
    const colors = [
      '#6366F1', // Indigo
      '#8B5CF6', // Violet  
      '#06B6D4', // Cyan
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#EC4899', // Pink
      '#3B82F6', // Blue
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <View 
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getBackgroundColor(name),
        },
        style
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeights.bold,
    textAlign: 'center',
  },
});

export default DefaultAvatar;