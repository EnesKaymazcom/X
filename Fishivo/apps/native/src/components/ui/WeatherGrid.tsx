import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Thermometer, Wind, Activity, Sun, Moon, Droplet } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';

interface WeatherGridProps {
  temperature?: string;
  wind?: string;
  windDirection?: string;
  pressure?: string;
  humidity?: string;
  sunDirection?: string;
  moonPhase?: string;
}

export const WeatherGrid: React.FC<WeatherGridProps> = ({
  temperature = '-',
  wind = '-',
  windDirection,
  pressure = '-',
  sunDirection = '-',
  moonPhase = '-',
  humidity = '-',
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  return (
    <View style={styles.weatherGrid}>
      <View style={styles.weatherItem}>
        <Thermometer size={24} color={theme.colors.accent} />
        <Text style={styles.weatherLabel}>{t('postDetail.temperature')}</Text>
        <Text style={styles.weatherValue}>{temperature}</Text>
      </View>
      
      <View style={styles.weatherItem}>
        <Wind size={24} color={theme.colors.secondary} />
        <Text style={styles.weatherLabel}>{t('postDetail.wind')}</Text>
        <Text style={styles.weatherValue}>
          {wind}
          {windDirection ? ` - ${windDirection}` : ''}
        </Text>
      </View>
      
      <View style={styles.weatherItem}>
        <Activity size={24} color={theme.colors.primary} />
        <Text style={styles.weatherLabel}>{t('postDetail.pressure')}</Text>
        <Text style={styles.weatherValue}>{pressure}</Text>
      </View>
      
      {humidity && (
        <View style={styles.weatherItem}>
          <Droplet size={24} color={theme.colors.info || '#4FC3F7'} />
          <Text style={styles.weatherLabel}>{t('postDetail.humidity')}</Text>
          <Text style={styles.weatherValue}>{humidity}</Text>
        </View>
      )}
      
      <View style={styles.weatherItem}>
        <Sun size={24} color="#FFA500" />
        <Text style={styles.weatherLabel}>{t('postDetail.sun')}</Text>
        <Text style={styles.weatherValue}>{sunDirection}</Text>
      </View>
      
      <View style={styles.weatherItem}>
        <Moon size={24} color="#C0C0C0" />
        <Text style={styles.weatherLabel}>{t('postDetail.moon')}</Text>
        <Text style={styles.weatherValue}>{moonPhase}</Text>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  weatherGrid: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '32%',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  weatherLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  weatherValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default WeatherGrid;