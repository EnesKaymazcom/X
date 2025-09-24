import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import {
  AppHeader,
  WeatherMapComponent
} from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUnits } from '@fishivo/hooks';

const WeatherScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { units } = useUnits();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    // Units değiştiğinde screen'i komple yeniden render et
    setKey(prev => prev + 1);
  }, [units.windSpeed, units.temperature, units.distance]);

  return (
    <View key={key} style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <AppHeader title={t('weather.title')} />
      <View style={styles.mapContainer}>
        <WeatherMapComponent
          style={styles.weatherMap}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  weatherMap: {
    height: 250,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
});

export default WeatherScreen;