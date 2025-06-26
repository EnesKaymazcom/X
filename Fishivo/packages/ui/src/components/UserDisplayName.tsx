import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/index';

interface UserDisplayNameProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showFullName?: boolean;
  style?: any;
}

const UserDisplayName: React.FC<UserDisplayNameProps> = ({
  name,
  size = 'md',
  showFullName = false,
  style,
}) => {
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

  const displayText = showFullName ? name : generateUsername(name);

  return (
    <Text 
      style={[
        styles.username,
        {
          fontSize: getFontSize(),
        },
        style
      ]}
    >
      {displayText}
    </Text>
  );
};

const styles = StyleSheet.create({
  username: {
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
});

export default UserDisplayName;