import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  message?: string;
  iconName?: string;
  icon?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  message,
  iconName,
  icon,
  description
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const displayText = message || title;
  const displaySubtitle = subtitle || description;

  return (
    <View style={styles.container}>
      {displayText && <Text style={styles.title}>{displayText}</Text>}
      {displaySubtitle && <Text style={styles.subtitle}>{displaySubtitle}</Text>}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  title: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});