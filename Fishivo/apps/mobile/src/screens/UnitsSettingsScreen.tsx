import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Button, AppHeader, ConfirmModal, SuccessModal, ScreenContainer } from '@fishivo/ui';
import { theme, UserUnits, UNITS_STORAGE_KEY, defaultUnits } from '@fishivo/shared';

interface UnitsSettingsScreenProps {
  navigation: any;
}

const UnitsSettingsScreen: React.FC<UnitsSettingsScreenProps> = ({ navigation }) => {
  const [units, setUnits] = useState<UserUnits>(defaultUnits);
  const [originalUnits, setOriginalUnits] = useState<UserUnits>(defaultUnits);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const savedUnits = await AsyncStorage.getItem(UNITS_STORAGE_KEY);
      if (savedUnits) {
        const parsedUnits = JSON.parse(savedUnits);
        setUnits(parsedUnits);
        setOriginalUnits(parsedUnits);
      }
    } catch (error) {
      console.log('Units yüklenirken hata:', error);
    }
  };

  const saveUnits = async () => {
    try {
      await AsyncStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(units));
      setOriginalUnits(units);
      setHasChanges(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.log('Units kaydedilirken hata:', error);
      setShowErrorModal(true);
    }
  };

  const checkForChanges = (newUnits: UserUnits) => {
    const changed = JSON.stringify(newUnits) !== JSON.stringify(originalUnits);
    setHasChanges(changed);
  };

  const handleDepthUnitChange = (newDepthUnit: 'meters' | 'feet' | 'fathoms') => {
    const newUnits = { ...units, depth: newDepthUnit };
    setUnits(newUnits);
    checkForChanges(newUnits);
  };

  const handleWeightUnitChange = (newWeightUnit: 'kg' | 'lbs' | 'g' | 'oz') => {
    const newUnits = { ...units, weight: newWeightUnit };
    setUnits(newUnits);
    checkForChanges(newUnits);
  };

  const handleLengthUnitChange = (newLengthUnit: 'cm' | 'inch' | 'm' | 'ft') => {
    const newUnits = { ...units, length: newLengthUnit };
    setUnits(newUnits);
    checkForChanges(newUnits);
  };

  const handleTemperatureUnitChange = (newTempUnit: 'celsius' | 'fahrenheit') => {
    const newUnits = { ...units, temperature: newTempUnit };
    setUnits(newUnits);
    checkForChanges(newUnits);
  };

  const handleDistanceUnitChange = (newDistanceUnit: 'km' | 'miles' | 'm' | 'nm') => {
    const newUnits = { ...units, distance: newDistanceUnit };
    setUnits(newUnits);
    checkForChanges(newUnits);
  };

  const handleSpeedUnitChange = (newSpeedUnit: 'kmh' | 'mph' | 'knots' | 'ms') => {
    const newUnits = { ...units, speed: newSpeedUnit };
    setUnits(newUnits);
    checkForChanges(newUnits);
  };

  const handlePressureUnitChange = (newPressureUnit: 'hpa' | 'inhg' | 'mbar' | 'mmhg') => {
    const newUnits = { ...units, pressure: newPressureUnit };
    setUnits(newUnits);
    checkForChanges(newUnits);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setUnits(originalUnits);
    setHasChanges(false);
    setShowResetConfirm(false);
  };

  const getDepthUnitLabel = (unit: string) => {
    switch (unit) {
      case 'meters': return 'Metre (m)';
      case 'feet': return 'Feet (ft)';
      case 'fathoms': return 'Fathom (ftm)';
      default: return 'Metre (m)';
    }
  };

  const getWeightUnitLabel = (unit: string) => {
    switch (unit) {
      case 'kg': return 'Kilogram (kg)';
      case 'lbs': return 'Pound (lbs)';
      case 'g': return 'Gram (g)';
      case 'oz': return 'Ounce (oz)';
      default: return 'Kilogram (kg)';
    }
  };

  const getLengthUnitLabel = (unit: string) => {
    switch (unit) {
      case 'cm': return 'Santimetre (cm)';
      case 'inch': return 'İnç (in)';
      case 'm': return 'Metre (m)';
      case 'ft': return 'Feet (ft)';
      default: return 'Santimetre (cm)';
    }
  };

  const getTemperatureUnitLabel = (unit: string) => {
    switch (unit) {
      case 'celsius': return 'Celsius (°C)';
      case 'fahrenheit': return 'Fahrenheit (°F)';
      default: return 'Celsius (°C)';
    }
  };

  const getDistanceUnitLabel = (unit: string) => {
    switch (unit) {
      case 'km': return 'Kilometre (km)';
      case 'miles': return 'Mil (mi)';
      case 'm': return 'Metre (m)';
      case 'nm': return 'Nautical Mile (nm)';
      default: return 'Kilometre (km)';
    }
  };

  const getSpeedUnitLabel = (unit: string) => {
    switch (unit) {
      case 'kmh': return 'Kilometre/Saat (km/h)';
      case 'mph': return 'Mil/Saat (mph)';
      case 'knots': return 'Knot (kn)';
      case 'ms': return 'Metre/Saniye (m/s)';
      default: return 'Kilometre/Saat (km/h)';
    }
  };

  const getPressureUnitLabel = (unit: string) => {
    switch (unit) {
      case 'hpa': return 'Hektopaskal (hPa)';
      case 'inhg': return 'İnç Civa (inHg)';
      case 'mbar': return 'Millibar (mbar)';
      case 'mmhg': return 'Milimetre Civa (mmHg)';
      default: return 'Hektopaskal (hPa)';
    }
  };

  const renderUnitOption = (
    title: string,
    currentValue: string,
    options: Array<{value: string, label: string}>,
    onSelect: (value: any) => void
  ) => (
    <View style={styles.unitSection}>
      <Text style={styles.unitTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              currentValue === option.value && styles.selectedOption
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.optionText,
              currentValue === option.value && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
            {currentValue === option.value && (
              <Icon name="check" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Birimler ve Ölçüler"
        canGoBack
        onBackPress={() => {
          if (hasChanges) {
            setShowExitConfirm(true);
          } else {
            navigation.goBack();
          }
        }}
        rightComponent={hasChanges ? (
          <Button
            variant="primary"
            onPress={saveUnits}
            size="sm"
          >
            Kaydet
          </Button>
        ) : undefined}
      />

      <ScreenContainer>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.description}>
              Uygulamada kullanılacak ölçü birimlerini seçin. Bu ayarlar tüm spot ve balık kayıtlarınızda kullanılacak.
            </Text>

            {renderUnitOption(
              'Su Derinliği',
              units.depth,
              [
                { value: 'meters', label: 'Metre (m)' },
                { value: 'feet', label: 'Feet (ft)' },
                { value: 'fathoms', label: 'Fathom (ftm)' }
              ],
              handleDepthUnitChange
            )}

            {renderUnitOption(
              'Balık Ağırlığı',
              units.weight,
              [
                { value: 'kg', label: 'Kilogram (kg)' },
                { value: 'lbs', label: 'Pound (lbs)' },
                { value: 'g', label: 'Gram (g)' },
                { value: 'oz', label: 'Ounce (oz)' }
              ],
              handleWeightUnitChange
            )}

            {renderUnitOption(
              'Balık Boyu',
              units.length,
              [
                { value: 'cm', label: 'Santimetre (cm)' },
                { value: 'inch', label: 'İnç (in)' },
                { value: 'm', label: 'Metre (m)' },
                { value: 'ft', label: 'Feet (ft)' }
              ],
              handleLengthUnitChange
            )}

            {renderUnitOption(
              'Su Sıcaklığı',
              units.temperature,
              [
                { value: 'celsius', label: 'Celsius (°C)' },
                { value: 'fahrenheit', label: 'Fahrenheit (°F)' }
              ],
              handleTemperatureUnitChange
            )}

            {renderUnitOption(
              'Mesafe',
              units.distance,
              [
                { value: 'km', label: 'Kilometre (km)' },
                { value: 'miles', label: 'Mil (mi)' },
                { value: 'm', label: 'Metre (m)' },
                { value: 'nm', label: 'Nautical Mile (nm)' }
              ],
              handleDistanceUnitChange
            )}

            {renderUnitOption(
              'Rüzgar Hızı',
              units.speed,
              [
                { value: 'kmh', label: 'Kilometre/Saat (km/h)' },
                { value: 'mph', label: 'Mil/Saat (mph)' },
                { value: 'knots', label: 'Knot (kn)' },
                { value: 'ms', label: 'Metre/Saniye (m/s)' }
              ],
              handleSpeedUnitChange
            )}

            {renderUnitOption(
              'Hava Basıncı',
              units.pressure,
              [
                { value: 'hpa', label: 'Hektopaskal (hPa)' },
                { value: 'inhg', label: 'İnç Civa (inHg)' },
                { value: 'mbar', label: 'Millibar (mbar)' },
                { value: 'mmhg', label: 'Milimetre Civa (mmHg)' }
              ],
              handlePressureUnitChange
            )}

            <View style={styles.infoBox}>
              <Icon name="info" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                Bu ayarlar değiştirildiğinde, yeni girişleriniz seçilen birimlerle kaydedilir. 
                Mevcut kayıtlarınız otomatik olarak dönüştürülmez.
              </Text>
            </View>

            {/* Action Buttons */}
            {hasChanges && (
              <View style={styles.actionButtons}>
                <Button
                  variant="secondary"
                  onPress={handleReset}
                  style={styles.resetButton}
                >
                  Sıfırla
                </Button>
                <Button
                  variant="primary"
                  onPress={saveUnits}
                  style={styles.saveButton}
                >
                  Kaydet
                </Button>
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>

      {/* Modals */}
      <ConfirmModal
        visible={showExitConfirm}
        title="Kaydedilmemiş Değişiklikler"
        message="Değişikliklerinizi kaydetmeden çıkmak istediğinizden emin misiniz?"
        onConfirm={() => {
          setShowExitConfirm(false);
          navigation.goBack();
        }}
        onCancel={() => setShowExitConfirm(false)}
        confirmText="Çık"
        cancelText="İptal"
        type="warning"
      />

      <ConfirmModal
        visible={showResetConfirm}
        title="Sıfırla"
        message="Tüm değişiklikleri geri almak istediğinizden emin misiniz?"
        onConfirm={confirmReset}
        onCancel={() => setShowResetConfirm(false)}
        confirmText="Sıfırla"
        cancelText="İptal"
        type="warning"
      />

      <SuccessModal
        visible={showSuccessModal}
        title="Başarılı!"
        message="Birim ayarlarınız kaydedildi"
        onClose={() => setShowSuccessModal(false)}
      />

      <SuccessModal
        visible={showErrorModal}
        title="Hata"
        message="Ayarlar kaydedilemedi"
        onClose={() => setShowErrorModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: theme.spacing.xl,
  },
  unitTitle: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: theme.spacing.md,
  },
  optionsContainer: {
    gap: theme.spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  resetButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default UnitsSettingsScreen;