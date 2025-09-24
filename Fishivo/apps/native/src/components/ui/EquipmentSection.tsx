import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { FishingGearUI } from '@fishivo/types';
import EquipmentCard from '@/components/ui/EquipmentCard';
import AddButton from '@/components/ui/AddButton';
import Icon from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';

interface EquipmentSectionProps {
  equipment: (FishingGearUI & { rating?: number; reviewCount?: number })[];
  onDeleteGear?: (gearId: string) => void;
  showStats?: boolean;
  variant?: 'default' | 'recommendation';
}

const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  equipment,
  onDeleteGear,
  showStats = false,
  variant = 'default'
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const renderEquipmentItem = ({ item }: { item: FishingGearUI & { rating?: number; reviewCount?: number } }) => (
    <EquipmentCard 
      item={item}
      onDelete={onDeleteGear ? () => onDeleteGear(item.id) : undefined}
      rating={item.rating}
      reviewCount={item.reviewCount}
      showStats={showStats}
      variant={variant}
    />
  );

  return (
    <View style={styles.tabContent}>
      {equipment.length === 0 ? (
        <EmptyState 
          title={t('profile.equipment.noEquipment')}
          subtitle={t('profile.equipment.addFirstEquipment')}
        />
      ) : (
        <View style={styles.equipmentGrid}>
          {equipment.map((item) => (
            <View key={item.id} style={styles.equipmentItem}>
              <EquipmentCard 
                item={item}
                onDelete={onDeleteGear ? () => onDeleteGear(item.id) : undefined}
                rating={item.rating}
                reviewCount={item.reviewCount}
                showStats={showStats}
                variant={variant}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  tabContent: {
  },
  gearRow: {
    gap: theme.spacing.sm,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs / 2,
  },
  equipmentItem: {
    width: '50%',
    paddingHorizontal: theme.spacing.xs / 2,
    paddingBottom: theme.spacing.xs,
  },
});

export default EquipmentSection; 