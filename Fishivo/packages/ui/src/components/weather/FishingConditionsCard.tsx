import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { theme } from '../../theme';

// Utility function for rating colors
const getRatingColor = (rating: number): string => {
  if (rating <= 1) return '#6B7280';
  if (rating <= 2) return '#EF4444';
  if (rating <= 3) return '#F59E0B';
  return '#10B981';
};

interface FishingConditionsCardProps {
  fishingData: any;
}

const FishingConditionsCard: React.FC<FishingConditionsCardProps> = ({
  fishingData,
}) => {
  // Balıkçılık skoruna göre ikon ve renk belirleme
  const getFishingIndicator = (score: number) => {
    if (score <= 1) {
      return { icon: '🦴', color: '#6B7280', label: 'Çok Düşük' };
    } else if (score <= 2) {
      return { icon: '🐟', color: '#EF4444', label: 'Düşük' };
    } else if (score <= 3) {
      return { icon: '🐟🐟', color: '#F59E0B', label: 'Orta' };
    } else {
      return { icon: '🐟🐟🐟', color: '#10B981', label: 'Yüksek' };
    }
  };

  const indicator = getFishingIndicator(fishingData.score || 0);

  return (
    <View style={styles.fishingCard}>
      <View style={styles.fishingHeader}>
        <Text style={styles.fishingTitle}>Balıkçılık Koşulları</Text>
        <View style={styles.fishingScore}>
          <Text style={[styles.fishingScoreText, { color: indicator.color }]}>{indicator.icon}</Text>
        </View>
      </View>
      <View style={styles.fishingLabel}>
        <Text style={[styles.fishingLabelText, { color: indicator.color }]}>
          {indicator.label} Olasılık
        </Text>
      </View>
      <View style={styles.fishingFactors}>
        {fishingData.factors.map((factor: any, index: number) => (
          <View key={index} style={styles.factorItem}>
            <Icon name={factor.icon} size={14} color={factor.color} />
            <Text style={styles.factorLabel}>{factor.label}</Text>
            <Text style={[styles.factorValue, { color: factor.color }]}>{factor.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fishingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  fishingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  fishingTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  fishingScore: {
    minWidth: 60,
    alignItems: 'center',
  },
  fishingScoreText: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
  },
  fishingLabel: {
    marginBottom: theme.spacing.lg,
  },
  fishingLabelText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    textAlign: 'center',
  },
  fishingFactors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
    minWidth: '45%',
  },
  factorLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  factorValue: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
  },
});

export default FishingConditionsCard;