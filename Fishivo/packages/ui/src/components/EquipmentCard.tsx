import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { theme } from '@fishivo/shared';

interface FishingGear {
  id: string;
  name: string;
  category: string;
  brand?: string;
  icon: string;
  imageUrl?: string;
  condition: 'excellent' | 'good' | 'fair';
}

interface EquipmentCardProps {
  item: FishingGear;
  onDelete?: (gearId: string) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ item, onDelete }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconArea}>
        <Text style={styles.icon}>{item.icon}</Text>
        {onDelete && (
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => onDelete(item.id)}
          >
            <Icon name="trash-2" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.textArea}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  iconArea: {
    width: '100%',
    height: 100,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 32,
  },
  deleteBtn: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    width: '100%',
    padding: theme.spacing.md,
  },
  name: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  category: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  brand: {
    fontSize: theme.typography.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
  },
});

export default EquipmentCard;