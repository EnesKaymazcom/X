import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { theme } from '@fishivo/shared';

interface WeatherDetailCard {
  icon: string;
  title: string;
  value: string;
  unit?: string;
  color?: string;
}

interface WeatherDetailsGridProps {
  weatherDetails: WeatherDetailCard[];
}

const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({
  weatherDetails,
}) => {
  return (
    <View style={styles.weatherDetailsGrid}>
      {weatherDetails.map((detail, index) => (
        <View key={index} style={styles.detailCard}>
          <View style={[styles.detailIcon, { backgroundColor: `${detail.color}20` }]}>
            <Icon name={detail.icon} size={16} color={detail.color} />
          </View>
          <Text style={styles.detailTitle}>{detail.title}</Text>
          <Text style={[styles.detailValue, { color: detail.color }]}>
            {detail.value}{detail.unit}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  weatherDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  detailCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default WeatherDetailsGrid;