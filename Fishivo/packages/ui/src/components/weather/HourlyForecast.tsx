import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { theme } from '../../theme';

interface HourlyData {
  time: string;
  condition: string;
  temp: number;
  rain: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
}

interface HourlyForecastProps {
  data: HourlyData[];
  getConditionIcon: (condition: string) => string;
  showDetails?: boolean;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ data, getConditionIcon, showDetails = false }) => {
  // Data undefined ise boş component döndür
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const getWindDirectionText = (degrees: number) => {
    const directions = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GKD', 'G', 'GKB', 'KB', 'KKB'];
    const index = Math.round(degrees / 30) % 12;
    return directions[index];
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Saatlik Tahmin</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
        {data.map((hour, index) => (
          <View key={index} style={[styles.hourlyItem, { width: showDetails ? 80 : 70 }]}>
            <Text style={styles.hourlyTime}>{hour.time}</Text>
            <Icon name={getConditionIcon(hour.condition)} size={18} color={theme.colors.primary} />
            <Text style={styles.hourlyTemp}>{hour.temp}°</Text>
            
            {/* Yağış bilgisi */}
            <View style={styles.rainInfo}>
              <Icon name="droplets" size={10} color={theme.colors.secondary} />
              <Text style={styles.rainText}>{hour.rain}%</Text>
            </View>

            {/* Detaylı bilgiler (opsiyonel) */}
            {showDetails && (
              <>
                {/* Rüzgar bilgisi */}
                {hour.windSpeed !== undefined && (
                  <View style={styles.detailInfo}>
                    <Icon name="wind" size={8} color="#3B82F6" />
                    <Text style={styles.detailText}>{Math.round(hour.windSpeed)}</Text>
                  </View>
                )}
                
                {/* Rüzgar yönü */}
                {hour.windDirection !== undefined && (
                  <View style={styles.detailInfo}>
                    <Icon name="compass" size={8} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{getWindDirectionText(hour.windDirection)}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: theme.spacing.md,
  },
  hourlyScroll: {
    marginHorizontal: -theme.screen.paddingHorizontal, // ScreenContainer padding'ini iptal et
    paddingLeft: theme.screen.paddingHorizontal, // Sol tarafta global padding
    paddingRight: theme.screen.paddingHorizontal, // Sağ tarafta global padding
  },
  hourlyItem: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  hourlyTime: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  hourlyTemp: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  rainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rainText: {
    fontSize: theme.typography.xs,
    color: theme.colors.secondary,
  },
  detailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  detailText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
});

export default HourlyForecast;