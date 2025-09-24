import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Icon, FishivoModal, CloseButton, EmptyState, SearchBar } from '@/components/ui/';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { COUNTRIES_WITH_PHONE_CODES } from '@/data/countriesWithPhoneCodes';
import { createNativeApiService } from '@fishivo/api';
import { useLocationStore } from '@/stores/locationStore';

interface CountryCitySelectorProps {
  selectedCountry: string;
  selectedCity: string;
  onSelect: (country: string, city: string, countryCode: string) => void;
  placeholder?: string;
  style?: any;
  mode?: 'location' | 'phoneCode';
  onPhoneCodeSelect?: (dialCode: string, countryCode: string) => void;
  selectedPhoneCode?: string;
}


const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Isparta',
  'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop',
  'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van',
  'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak',
  'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

const CountryCitySelector: React.FC<CountryCitySelectorProps> = ({
  selectedCountry,
  selectedCity,
  onSelect,
  placeholder,
  style,
  mode = 'location',
  onPhoneCodeSelect,
  selectedPhoneCode
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const defaultPlaceholder = placeholder || t('locations.placeholder');
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<'country' | 'city'>('country');
  const [tempCountry, setTempCountry] = useState('');
  const [tempCountryCode, setTempCountryCode] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Bayrak renderla
  const renderCountryFlag = (countryCode: string, size: number = 18) => {
    try {
      const code = countryCode.toUpperCase();
      const flagName = code.charAt(0) + code.slice(1).toLowerCase();
      const Flags = require('react-native-svg-circle-country-flags');
      const FlagComponent = Flags[flagName];
      
      if (FlagComponent && typeof FlagComponent === 'function') {
        return <FlagComponent width={size} height={size} />;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Ülke listesini al ve çevir
  const getCountries = () => {
    return COUNTRIES_WITH_PHONE_CODES.map(country => ({
      code: country.code,
      name: t(`locations.countries.${country.code}`, { defaultValue: country.name }),
      flag: country.flag,
      dialCode: country.dialCode
    }));
  };

  const getDisplayText = () => {
    if (mode === 'phoneCode') {
      if (selectedPhoneCode && !tempCountryCode) {
        const selected = COUNTRIES_WITH_PHONE_CODES.find(p => p.dialCode === selectedPhoneCode);
        return selected ? selected.dialCode : defaultPlaceholder;
      }
      const countryCode = tempCountryCode || selectedCountry;
      const selected = COUNTRIES_WITH_PHONE_CODES.find(p => p.code === countryCode);
      return selected ? selected.dialCode : defaultPlaceholder;
    }
    if (selectedCountry && selectedCity) {
      return `${selectedCity}, ${selectedCountry}`;
    } else if (selectedCountry) {
      return selectedCountry;
    }
    return defaultPlaceholder;
  };
  
  const getSelectedCountryCode = () => {
    if (mode === 'phoneCode') {
      if (selectedPhoneCode && !tempCountryCode) {
        const selected = COUNTRIES_WITH_PHONE_CODES.find(p => p.dialCode === selectedPhoneCode);
        return selected?.code;
      }
      return tempCountryCode || selectedCountry;
    }
    return null;
  };

  const handleCountrySelect = (country: any) => {
    if (mode === 'phoneCode') {
      if (onPhoneCodeSelect) {
        onPhoneCodeSelect(country.dialCode, country.code);
      }
      setTempCountryCode(country.code); // Seçilen ülke kodunu güncelle
      setModalVisible(false);
      return;
    }
    
    setTempCountry(country.name);
    setTempCountryCode(country.code);
    if (country.code === 'TR') {
      setStep('city');
      setSearchText('');
    } else {
      // Türkiye dışındaki ülkeler için şehir seçimi gerekmiyor
      onSelect(country.name, '', country.code);
      setModalVisible(false);
      setStep('country');
    }
  };

  const handleCitySelect = (city: string) => {
    onSelect(tempCountry, city, tempCountryCode);
    setModalVisible(false);
    setStep('country');
    setTempCountry('');
    setTempCountryCode('');
  };

  const getFilteredCities = () => {
    if (!searchText) return TURKISH_CITIES;
    return TURKISH_CITIES.filter(city => 
      city.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getFilteredCountries = () => {
    const countries = getCountries().sort((a, b) => a.name.localeCompare(b.name));
    if (!searchText) return countries;
    return countries.filter(country => 
      country.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const handleBack = () => {
    if (step === 'city') {
      setStep('country');
      setTempCountry('');
      setTempCountryCode('');
      setSearchText('');
    } else {
      setModalVisible(false);
    }
  };

  // LocationStore now handles location and permissions
  const locationStore = useLocationStore();
  const currentLocation = locationStore.currentLocation;
  
  const requestLocationPermission = async () => {
    try {
      await locationStore.getSmartLocation();
      return !!currentLocation;
    } catch (error) {
      return false;
    }
  };

  const findCityFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const apiService = createNativeApiService();
      const result = await apiService.geocoding.reverseGeocode(latitude, longitude, {
        language: 'tr',
        timeout: 15000,
        useCache: true
      });
      
      return {
        city: result.city || '',
        countryCode: result.countryCode
      };
    } catch (error: any) {
      return null;
    }
  };

  const handleFindLocation = async () => {
    setIsLoadingLocation(true);
    
    try {
      await locationStore.getSmartLocation();
      
      if (!currentLocation) {
        setIsLoadingLocation(false);
        setErrorTitle(t('common.error'));
        setErrorMessage(t('locations.locationPermissionDenied'));
        setShowErrorModal(true);
        return;
      }

      const { latitude, longitude } = currentLocation;
      const locationData = await findCityFromCoordinates(latitude, longitude);
      
      if (locationData) {
        const countryName = t(`locations.countries.${locationData.countryCode}`);
        onSelect(countryName, locationData.city || '', locationData.countryCode);
        setModalVisible(false);
      } else {
        setErrorTitle(t('common.error'));
        setErrorMessage(t('locations.locationNotFound'));
        setShowErrorModal(true);
      }
      setIsLoadingLocation(false);
    } catch (error) {
      setIsLoadingLocation(false);
      setErrorTitle(t('common.error'));
      setErrorMessage(t('locations.locationError'));
      setShowErrorModal(true);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={[
          styles.selector, 
          mode === 'phoneCode' && styles.phoneCodeModeSelector,
          style
        ]} 
        onPress={() => {
          if (mode === 'phoneCode') {
            if (selectedPhoneCode) {
              const country = COUNTRIES_WITH_PHONE_CODES.find(p => p.dialCode === selectedPhoneCode);
              if (country) {
                setTempCountryCode(country.code);
              }
            } else if (selectedCountry) {
              setTempCountryCode(selectedCountry);
            }
          }
          setModalVisible(true);
        }}
      >
        {mode === 'phoneCode' && getSelectedCountryCode() && (
          <View style={styles.selectorFlag}>
            {renderCountryFlag(getSelectedCountryCode()!)}
          </View>
        )}
        <Text style={[
          styles.selectorText, 
          mode === 'phoneCode' && styles.phoneCodeModeSelectorText,
          !selectedCountry && !selectedPhoneCode && styles.placeholder
        ]}>
          {getDisplayText()}
        </Text>
        <Icon name="chevron-down" size={mode === 'phoneCode' ? 16 : 20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <FishivoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        showDragIndicator={true}
        showCloseButton={false}
      >
        <View>
          <View style={styles.titleRow}>
              {step === 'city' && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Icon name="arrow-left" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
              <Text style={[styles.modalTitle, step === 'city' && { marginLeft: theme.spacing.sm }]}>
                {mode === 'phoneCode' ? t('locations.selectPhoneCode') : 
                 step === 'country' ? t('locations.selectCountry') : t('locations.selectCity')}
              </Text>
              <CloseButton 
                onPress={() => {
                  setModalVisible(false);
                  setStep('country');
                  setTempCountry('');
                  setTempCountryCode('');
                  setSearchText('');
                }}
              />
            </View>
            
            <Text style={styles.subtitle}>
              {mode === 'phoneCode' ? t('locations.selectPhoneCodeDescription') : 
               step === 'country' ? t('locations.selectCountryDescription') : t('locations.selectCityDescription')}
            </Text>

          {/* Arama */}
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder={mode === 'phoneCode' ? t('locations.searchPhoneCode') : 
                         step === 'country' ? t('locations.searchCountry') : t('locations.searchCity')}
            containerStyle={{ paddingBottom: theme.spacing.sm }}
          />

          {step === 'country' && mode === 'location' && (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleFindLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="navigation" size={16} color="#FFFFFF" />
              )}
              <Text style={styles.locationButtonText}>
                {isLoadingLocation ? t('locations.findingLocation') : t('locations.findMyLocation')}
              </Text>
            </TouchableOpacity>
          )}

          <FlatList<any>
            data={step === 'country' ? getFilteredCountries() : getFilteredCities()}
            keyExtractor={(item, index) => 
              step === 'country' ? (item as any).code : `${item}-${index}`
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => 
                  step === 'country' 
                    ? handleCountrySelect(item as any)
                    : handleCitySelect(item as string)
                }
              >
                {step === 'country' ? (
                  <>
                    <View style={styles.flagContainer}>
                      {renderCountryFlag((item as any).code)}
                    </View>
                    <Text style={styles.itemText}>{(item as any).name}</Text>
                    {mode === 'phoneCode' && (
                      <Text style={styles.dialCode}>{(item as any).dialCode}</Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.itemText}>{item as string}</Text>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <EmptyState
                title={step === 'country' ? t('locations.noCountryFound') : t('locations.noCityFound')}
              />
            )}
          />
        </View>
      </FishivoModal>

      {/* Success Modal */}
      <FishivoModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        preset="success"
        description={successMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowSuccessModal(false)
        }}
      />

      {/* Error Modal */}
      <FishivoModal
        visible={showErrorModal}
        title={errorTitle}
        onClose={() => setShowErrorModal(false)}
        preset="error"
        description={errorMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowErrorModal(false)
        }}
      />
    </>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: Platform.OS === 'android' ? theme.spacing.sm : theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectorText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    flex: 1,
  },
  placeholder: {
    color: theme.colors.textSecondary,
  },
  phoneCodeModeSelector: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: Platform.OS === 'android' ? theme.spacing.sm : theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderColor: theme.colors.border,
  },
  phoneCodeModeSelectorText: {
    fontSize: theme.typography.base,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'left',
    marginBottom: theme.spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  flagContainer: {
    width: 18,
    height: 18,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorFlag: {
    width: 18,
    height: 18,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  dialCode: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 'auto',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    gap: 8,
  },
  locationButtonText: {
    fontSize: theme.typography.sm,
    color: '#FFFFFF',
    fontWeight: theme.typography.medium,
  },
});

export default CountryCitySelector;