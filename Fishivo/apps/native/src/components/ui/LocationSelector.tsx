import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface LocationSelectorProps {
  location?: string;
  coordinates?: [number, number];
  onSelectLocation: () => void;
  onClearLocation?: () => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  coordinates,
  onSelectLocation,
  onClearLocation,
  label,
  required = false,
  placeholder = 'Konum eklemek için dokunun',
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label} {required && '*'}
          </Text>
          <TouchableOpacity 
            style={styles.gpsButton}
            onPress={onSelectLocation}
            activeOpacity={0.7}
          >
            <Icon name="my-location" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      
      {location && coordinates ? (
        <View style={styles.selectedLocation}>
          <Icon name="map-pin" size={20} color={theme.colors.primary} />
          <Text style={styles.locationText} numberOfLines={2}>
            {location}
          </Text>
          {onClearLocation && (
            <TouchableOpacity 
              onPress={onClearLocation}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Icon name="x" size={16} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.emptyLocation}
          onPress={onSelectLocation}
          activeOpacity={0.7}
        >
          <Icon name="map-pin" size={24} color={theme.colors.textSecondary} />
          <Text style={styles.placeholderText}>{placeholder}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
  },
  gpsButton: {
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  locationText: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  emptyLocation: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  placeholderText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default LocationSelector;