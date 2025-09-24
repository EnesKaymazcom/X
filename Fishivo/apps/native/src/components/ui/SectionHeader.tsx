import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
  icon?: string; // Deprecated: Use action prop instead
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title,
  subtitle,
  action,
  style,
  icon // Deprecated: ignored
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {action && action}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Alt çizgide hizala
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    minHeight: 32, // Minimum yükseklik 
  },
  title: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    includeFontPadding: false, // Android için font padding'i kaldır
    textAlignVertical: 'bottom', // Android için
  },
});