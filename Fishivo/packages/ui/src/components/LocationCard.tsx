import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from './Icon';

interface LocationCardProps {
  location: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  variant?: 'list' | 'grid';
  onPress?: (location: any) => void;
  onToggleFavorite?: (locationId: string) => void;
  onDelete?: (locationId: string) => void;
  showActions?: boolean;
  style?: any;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  variant = 'list',
  onPress,
  onToggleFavorite,
  onDelete,
  showActions = true,
  style
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, variant === 'grid' && styles.gridContainer, style]}
      onPress={() => onPress?.(location)}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{location.name}</Text>
        {location.address && (
          <Text style={styles.address}>{location.address}</Text>
        )}
      </View>
      {showActions && (
        <View style={styles.actions}>
          {onToggleFavorite && (
            <TouchableOpacity onPress={() => onToggleFavorite(location.id)}>
              <Icon name="heart" size={20} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(location.id)}>
              <Icon name="trash" size={20} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridContainer: {
    margin: 8,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default LocationCard;