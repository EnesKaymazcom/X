import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  style?: any;
  name?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 40,
  style,
  name = '',
}) => {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);

  const avatarUrl = typeof uri === 'string' ? uri : null;

  // Reset error state when URI changes
  useEffect(() => {
    setImageError(false);
  }, [uri]);

  // Helper functions for initials
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
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.success,
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + (hash * 31);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Return placeholder with initials if no avatar URL or error
  if (!avatarUrl || imageError) {
    return (
      <View
        style={[
          styles.placeholderContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: getBackgroundColor(name),
          },
          style
        ]}
      >
        <Text style={[
          styles.placeholderText,
          { fontSize: size * 0.35 }
        ]}>
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ 
        uri: avatarUrl || undefined
      }}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style
      ]}
      onError={() => {
        setImageError(true);
      }}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: 'transparent',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Avatar;