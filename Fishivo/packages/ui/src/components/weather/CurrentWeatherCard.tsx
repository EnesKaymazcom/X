import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { theme } from '../../theme';

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

interface CurrentWeatherCardProps {
  weatherData: any;
  location: SavedLocation;
  formattedTemperature: string;
  formattedWindSpeed: string;
}

const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weatherData,
  location,
  formattedTemperature,
  formattedWindSpeed,
}) => {
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'current':
        return 'map-pin';
      case 'spot':
        return 'map';
      default:
        return 'map-pin';
    }
  };

  const getConditionIcon = (condition: string) => {
    if (condition?.toLowerCase().includes('sun')) return 'sun';
    if (condition?.toLowerCase().includes('cloud')) return 'cloud';
    if (condition?.toLowerCase().includes('rain')) return 'cloud-rain';
    return 'sun';
  };

  return (
    <View style={styles.currentWeatherCard}>
      <View style={styles.locationInfo}>
        <Icon 
          name={getLocationIcon(location?.type)} 
          size={14} 
          color={theme.colors.primary} 
        />
        <Text style={styles.locationName}>{location?.name}</Text>
      </View>
      
      <View style={styles.temperatureSection}>
        <Text style={styles.temperature}>{formattedTemperature}</Text>
        <View style={styles.conditionSection}>
          <Icon 
            name={getConditionIcon(weatherData.current.condition)} 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text style={styles.condition}>{weatherData.current.condition}</Text>
        </View>
      </View>
      
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <Icon name="wind" size={12} color={theme.colors.textSecondary} />
          <Text style={styles.quickStatText}>{formattedWindSpeed}</Text>
        </View>
        <View style={styles.quickStatItem}>
          <Icon name="droplets" size={12} color={theme.colors.textSecondary} />
          <Text style={styles.quickStatText}>{weatherData.current.humidity}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  currentWeatherCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  locationName: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  temperatureSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  temperature: {
    fontSize: 32,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  conditionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  condition: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.spacing.sm,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  quickStatText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default CurrentWeatherCard;