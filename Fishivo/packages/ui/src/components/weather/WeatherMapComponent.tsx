import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from '../Icon';
import { theme } from '../../theme';

// Note: This is a simplified version of WeatherMapComponent
// The original uses @rnmapbox/maps which requires additional setup
// For full functionality, install and configure @rnmapbox/maps

interface WeatherMapComponentProps {
  onLocationSelect?: (coordinates: [number, number]) => void;
  initialCoordinates?: [number, number];
  style?: any;
}

const WeatherMapComponent: React.FC<WeatherMapComponentProps> = ({
  onLocationSelect,
  initialCoordinates = [29.0158, 41.0053],
  style,
}) => {
  const [currentCoordinates, setCurrentCoordinates] = useState<[number, number]>(initialCoordinates);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [crosshairCoordinates, setCrosshairCoordinates] = useState<[number, number]>(initialCoordinates);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLocationLoading(false);
      setCrosshairCoordinates(initialCoordinates);
    }, 1000);

    return () => clearTimeout(timer);
  }, [initialCoordinates]);

  const goToUserLocation = () => {
    // Simulate getting user location
    const userLocation: [number, number] = [29.0100, 41.0082]; // İstanbul
    setCurrentCoordinates(userLocation);
    setCrosshairCoordinates(userLocation);
    
    if (onLocationSelect) {
      onLocationSelect(userLocation);
    }
  };

  if (isLocationLoading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <View style={styles.loadingContent}>
          <Icon name="map" size={40} color={theme.colors.primary} />
          <Text style={styles.loadingText}>Harita yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Placeholder for map - replace with actual map implementation */}
      <View style={styles.mapPlaceholder}>
        <Icon name="map" size={60} color={theme.colors.textSecondary} />
        <Text style={styles.placeholderText}>Harita Component'i</Text>
        <Text style={styles.placeholderSubtext}>
          @rnmapbox/maps kurulumu gerekli
        </Text>
      </View>

      {/* Center Crosshair */}
      <View style={styles.crosshair}>
        <View style={styles.crosshairHorizontal} />
        <View style={styles.crosshairVertical} />
        <View style={styles.crosshairCenter} />
      </View>

      {/* Crosshair Coordinates */}
      <View style={styles.locationInfo}>
        <Text style={styles.locationText}>
          {crosshairCoordinates && crosshairCoordinates[0] !== undefined && crosshairCoordinates[1] !== undefined
            ? `${crosshairCoordinates[1].toFixed(6)}°K, ${crosshairCoordinates[0].toFixed(6)}°D`
            : 'Koordinatlar yükleniyor...'}
        </Text>
      </View>

      {/* Geolocation Button */}
      <View style={styles.geolocateContainer}>
        <TouchableOpacity
          style={styles.geolocateButton}
          onPress={goToUserLocation}
          activeOpacity={0.7}
        >
          <Icon
            name="my-location"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  placeholderText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  placeholderSubtext: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  // Sniper Crosshair
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 120,
    height: 120,
    marginTop: -60,
    marginLeft: -60,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: 120,
    height: 1,
    backgroundColor: '#FF0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: 120,
    backgroundColor: '#FF0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  crosshairCenter: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  locationInfo: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 10,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  geolocateContainer: {
    position: 'absolute',
    top: 20,
    right: theme.spacing.md,
  },
  geolocateButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default WeatherMapComponent;