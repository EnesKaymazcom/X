import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, AppHeader, ScreenContainer, SegmentedControl } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUnits } from '@fishivo/hooks';
import { UNIT_DEFINITIONS } from '@fishivo/types';

interface UnitsSettingsScreenProps {
  navigation: any;
}

const UnitsSettingsScreen: React.FC<UnitsSettingsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { 
    units, 
    updateWeightUnit, 
    updateLengthUnit, 
    updateTemperatureUnit, 
    updateDepthUnit,
    updateWindSpeedUnit,
    isLoading 
  } = useUnits();
  const styles = createStyles(theme);

  const handleDepthUnitChange = async (newDepthUnit: 'meters' | 'feet') => {
    try {
      await updateDepthUnit(newDepthUnit);
    } catch (error) {
      console.error('Depth unit update error:', error);
    }
  };

  const handleWeightUnitChange = async (newWeightUnit: 'kg' | 'lbs') => {
    try {
      await updateWeightUnit(newWeightUnit);
    } catch (error) {
      console.error('Weight unit update error:', error);
    }
  };

  const handleLengthUnitChange = async (newLengthUnit: 'cm' | 'inch') => {
    try {
      await updateLengthUnit(newLengthUnit);
    } catch (error) {
      console.error('Length unit update error:', error);
    }
  };

  const handleTemperatureUnitChange = async (newTempUnit: 'celsius' | 'fahrenheit') => {
    try {
      await updateTemperatureUnit(newTempUnit);
    } catch (error) {
      console.error('Temperature unit update error:', error);
    }
  };

  const handleWindSpeedUnitChange = async (newWindUnit: 'ms' | 'kmh' | 'mph' | 'knots') => {
    try {
      await updateWindSpeedUnit(newWindUnit);
    } catch (error) {
      console.error('Wind speed unit update error:', error);
    }
  };

  const getUnitLabel = (unit: string) => {
    return UNIT_DEFINITIONS[unit]?.label || unit;
  };

  const renderUnitOption = (
    title: string,
    currentValue: string,
    options: Array<{value: string, label: string}>,
    onSelect: (value: any) => void
  ) => (
    <View style={styles.unitSection}>
      <Text style={styles.unitTitle}>{title}</Text>
      <SegmentedControl
        segments={options}
        selectedValue={currentValue}
        onValueChange={onSelect}
        disabled={isLoading}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('settings.units.title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
          }
        ]}
      />

      <ScreenContainer paddingVertical="none">
        <ScrollView contentContainerStyle={[styles.scrollContent, theme.listContentStyle]} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.description}>
              {t('settings.units.description')}
            </Text>

            {renderUnitOption(
              t('settings.units.waterDepth'),
              units.depth,
              [
                { value: 'meters', label: getUnitLabel('meters') },
                { value: 'feet', label: getUnitLabel('feet') }
              ],
              handleDepthUnitChange
            )}

            {renderUnitOption(
              t('settings.units.fishWeight'),
              units.weight,
              [
                { value: 'kg', label: getUnitLabel('kg') },
                { value: 'lbs', label: getUnitLabel('lbs') }
              ],
              handleWeightUnitChange
            )}

            {renderUnitOption(
              t('settings.units.fishLength'),
              units.length,
              [
                { value: 'cm', label: getUnitLabel('cm') },
                { value: 'inch', label: getUnitLabel('inch') }
              ],
              handleLengthUnitChange
            )}

            {renderUnitOption(
              t('settings.units.temperature'),
              units.temperature,
              [
                { value: 'celsius', label: getUnitLabel('celsius') },
                { value: 'fahrenheit', label: getUnitLabel('fahrenheit') }
              ],
              handleTemperatureUnitChange
            )}

            {renderUnitOption(
              t('settings.units.windSpeed'),
              units.windSpeed,
              [
                { value: 'ms', label: 'm/s' },
                { value: 'kmh', label: 'km/h' },
                { value: 'mph', label: 'mph' },
                { value: 'knots', label: 'kts' }
              ],
              handleWindSpeedUnitChange
            )}

            <View style={styles.infoBox}>
              <Icon name="info" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                {t('settings.units.infoText')}
              </Text>
            </View>

          </View>
        </ScrollView>
      </ScreenContainer>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  scrollContent: {
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingTop: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  unitSection: {
    marginBottom: theme.spacing.lg,
  },
  unitTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: theme.spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

export default UnitsSettingsScreen; 