import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface UserDisplayNameProps {
  name?: string;
  user?: {
    username: string;
    full_name?: string;
    is_pro?: boolean;
  };
  fontSize?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showFullName?: boolean;
  style?: any;
}

const UserDisplayName: React.FC<UserDisplayNameProps> = ({
  name,
  user,
  fontSize,
  color,
  size = 'md',
  showFullName = false,
  style,
}) => {
  const { theme } = useTheme();
  const generateUsername = (fullName: string) => {
    if (!fullName) return 'user';
    
    // "Ahmet Yılmaz" -> "ahmetyilmaz"
    const cleanName = fullName
      .toLowerCase()
      .replace(/[çğıöşü]/g, (char) => {
        const map: { [key: string]: string } = {
          'ç': 'c', 'ğ': 'g', 'ı': 'i', 
          'ö': 'o', 'ş': 's', 'ü': 'u'
        };
        return map[char] || char;
      })
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
    
    return cleanName;
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return theme.typography.sm;
      case 'lg': return theme.typography.lg;
      default: return theme.typography.base;
    }
  };

  // Handle both name prop and user prop
  const displayName = user ? user.username : (name || 'user');
  const fullName = user?.full_name || name || '';
  
  const displayText = showFullName ? fullName : displayName;

  return (
    <Text 
      style={[
        {
          color: color || theme.colors.text,
          fontWeight: theme.typography.semibold,
          fontSize: fontSize || getFontSize(),
        },
        style
      ]}
    >
      {displayText}
    </Text>
  );
};

export default UserDisplayName; 