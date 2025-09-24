import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import LocationTabs from '@/components/ui/LocationTabs';
import { useTranslation } from '@/contexts/LanguageContext';

interface MapComponentProps {
  showCrosshair?: boolean;
  showCoordinates?: boolean;
  showLocationButton?: boolean;
  showLayerSelector?: boolean;
  show3DToggle?: boolean;
  initialCoordinates?: [number, number];
  onLocationSelect?: (coordinates: [number, number]) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  showCrosshair = false,
  showCoordinates = false,
  showLocationButton = false,
  showLayerSelector = false,
  show3DToggle = false,
  initialCoordinates,
  onLocationSelect,
}) => {
  const { t } = useTranslation();
  const [activeLocationId, setActiveLocationId] = React.useState<string | null>(null);

  // Empty locations - no default coordinates
  const mockLocations: any[] = [];

  const handleLocationPress = (location: any) => {
    setActiveLocationId(location.id);
    if (onLocationSelect) {
      onLocationSelect([location.coordinates.longitude, location.coordinates.latitude]);
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'spot':
        return 'fish';
      case 'current':
        return 'map-pin';
      default:
        return 'map-pin';
    }
  };

  return (
    <View style={styles.container}>
      <LocationTabs
        data={mockLocations}
        activeLocationId={activeLocationId}
        onLocationPress={handleLocationPress}
        onAddPress={() => {/* Add location functionality */ }}
        getLocationIcon={getLocationIcon}
      />
      
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>🗺️</Text>
          <Text style={styles.mapText}>{t('map.mapView')}</Text>
          <Text style={styles.mapSubText}>
            OpenFreeMap kullanılıyor
          </Text>
        </View>

        {showCrosshair && (
          <View style={styles.crosshair}>
            <View style={styles.crosshairVertical} />
            <View style={styles.crosshairHorizontal} />
          </View>
        )}

        {showCoordinates && initialCoordinates && (
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesText}>
              {`${initialCoordinates[1].toFixed(6)}° ${t('map.north')}, ${initialCoordinates[0].toFixed(6)}° ${t('map.east')}`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 48,
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  mapSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
  },
  crosshairVertical: {
    position: 'absolute',
    left: 9,
    top: 0,
    width: 2,
    height: 20,
    backgroundColor: theme.colors.primary,
  },
  crosshairHorizontal: {
    position: 'absolute',
    left: 0,
    top: 9,
    width: 20,
    height: 2,
    backgroundColor: theme.colors.primary,
  },
  coordinatesContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  coordinatesText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});

export default MapComponent;