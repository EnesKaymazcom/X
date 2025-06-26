import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { theme } from '../../theme';

// Utility function for weather condition icons
const getConditionIcon = (condition: string): string => {
  const conditionLower = condition?.toLowerCase() || '';
  
  if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return 'sun';
  } else if (conditionLower.includes('cloud')) {
    return 'cloud';
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'cloud-rain';
  } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
    return 'cloud-lightning';
  } else if (conditionLower.includes('snow')) {
    return 'cloud-snow';
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return 'cloud-fog';
  } else {
    return 'sun';
  }
};

interface DailyForecastCardProps {
  dailyData: any[];
  formattedDailyTemps: {[key: number]: {high: string, low: string}};
}

const DailyForecastCard: React.FC<DailyForecastCardProps> = ({
  dailyData,
  formattedDailyTemps,
}) => {
  return (
    <View style={styles.dailyForecast}>
      {dailyData.map((day: any, index: number) => (
        <View key={index} style={styles.dailyItem}>
          <Text style={styles.dailyDay}>{day.day}</Text>
          <Icon 
            name={getConditionIcon(day.condition)} 
            size={20} 
            color={theme.colors.primary} 
          />
          <View style={styles.dailyTemps}>
            <Text style={styles.dailyHigh}>{formattedDailyTemps[index]?.high}</Text>
            <Text style={styles.dailyLow}>{formattedDailyTemps[index]?.low}</Text>
          </View>
          <View style={styles.dailyWeatherInfo}>
            <Text style={styles.dailyRain}>{day.rain}%</Text>
            <View style={styles.dailyWind}>
              <Icon name="wind" size={12} color="#3B82F6" />
              <Text style={styles.dailyWindText}>{day.windSpeed ? Math.round(day.windSpeed) : 'N/A'}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dailyForecast: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dailyDay: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    width: 80,
  },
  dailyTemps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    width: 80,
    justifyContent: 'flex-end',
  },
  dailyHigh: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  dailyLow: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
  },
  dailyRain: {
    fontSize: theme.typography.sm,
    color: theme.colors.secondary,
    width: 40,
    textAlign: 'center',
  },
  dailyWeatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dailyWind: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dailyWindText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default DailyForecastCard;