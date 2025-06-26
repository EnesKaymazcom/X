import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import EquipmentCard from './EquipmentCard';
import AddButton from './AddButton';
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

interface EquipmentSectionProps {
  equipment: FishingGear[];
  title: string;
  showAddButton?: boolean;
  onAddPress?: () => void;
  onDeleteGear?: (gearId: string) => void;
}

const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  equipment,
  title,
  showAddButton = false,
  onAddPress,
  onDeleteGear,
}) => {
  const renderEquipmentItem = ({ item }: { item: FishingGear }) => (
    <EquipmentCard 
      item={item}
      onDelete={onDeleteGear ? () => onDeleteGear(item.id) : undefined}
    />
  );

  return (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showAddButton && onAddPress && (
          <AddButton onPress={onAddPress} />
        )}
      </View>
      <View style={styles.equipmentGrid}>
        {equipment.map((item) => (
          <View 
            key={item.id} 
            style={[
              styles.equipmentItem,
              equipment.length === 1 ? { width: 140 } : { width: '48%' }
            ]}
          >
            <EquipmentCard 
              item={item}
              onDelete={onDeleteGear ? () => onDeleteGear(item.id) : undefined}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  gearRow: {
    gap: theme.spacing.sm,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  equipmentItem: {
  },
});

export default EquipmentSection;