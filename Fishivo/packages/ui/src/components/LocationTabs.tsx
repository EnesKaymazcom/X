import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import AddButton from './AddButton';
import { theme } from '@fishivo/shared';

interface SavedLocation {
  id: string;
  name: string;
  type: 'manual' | 'spot' | 'current';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  isFavorite: boolean;
}

interface LocationTabsProps {
  data: SavedLocation[];
  activeLocationId: string;
  onLocationPress: (location: SavedLocation) => void;
  onAddPress: () => void;
  getLocationIcon: (type: string) => string;
}

const LocationTabs: React.FC<LocationTabsProps> = ({
  data,
  activeLocationId,
  onLocationPress,
  onAddPress,
  getLocationIcon,
}) => {
  const renderLocationTab = ({ item }: { item: SavedLocation }) => (
    <TouchableOpacity
      style={[
        styles.locationTab,
        item.id === activeLocationId && styles.activeLocationTab
      ]}
      onPress={() => onLocationPress(item)}
    >
      <Icon 
        name={getLocationIcon(item.type)} 
        size={14} 
        color={item.id === activeLocationId ? theme.colors.primary : theme.colors.textSecondary} 
      />
      <Text style={[
        styles.locationTabText,
        item.id === activeLocationId && styles.activeLocationTabText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.locationTabsContainer}>
      <FlatList
        data={data}
        renderItem={renderLocationTab}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.locationTabsList}
      />
      <View style={styles.addButtonContainer}>
        <View style={styles.addButtonBackground}>
          <AddButton
            onPress={onAddPress}
            title="Ekle"
            variant="filled"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  locationTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginHorizontal: -theme.screen.paddingHorizontal, // ScreenContainer padding'ini iptal et
    paddingHorizontal: theme.screen.paddingHorizontal, // Kendi padding'ini ekle
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  locationTabsList: {
    paddingLeft: 0,
    paddingRight: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  locationTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  activeLocationTab: {
    backgroundColor: `${theme.colors.primary}15`,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm - 1,
    paddingVertical: theme.spacing.sm - 1,
  },
  locationTabText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  activeLocationTabText: {
    color: theme.colors.primary,
  },
  addButtonContainer: {
    marginLeft: theme.spacing.sm,
  },
  addButtonBackground: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 2,
  },
});

export default LocationTabs;