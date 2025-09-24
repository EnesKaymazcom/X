import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface StatItem {
  value: number;
  label: string;
}

interface StatsRowProps {
  stats: StatItem[];
  onStatPress?: (index: number, stat: StatItem) => void;
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats, onStatPress }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => {
        const StatContainer = onStatPress ? TouchableOpacity : View;
        return (
          <StatContainer 
            key={index} 
            style={styles.statItem}
            onPress={onStatPress ? () => onStatPress(index, stat) : undefined}
            activeOpacity={onStatPress ? 0.7 : 1}
          >
            <Text style={styles.statNumber}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </StatContainer>
        );
      })}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  statLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});