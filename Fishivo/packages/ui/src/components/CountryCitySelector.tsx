import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import Icon from './Icon';
import { theme } from '@fishivo/shared';

interface CountryCitySelectorProps {
  selectedCountry: string;
  selectedCity: string;
  onSelect: (country: string, city: string) => void;
  placeholder?: string;
  style?: any;
}

const COUNTRIES = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
  { code: 'US', name: 'Amerika Birleşik Devletleri', flag: '🇺🇸' },
  { code: 'GB', name: 'İngiltere', flag: '🇬🇧' },
  { code: 'DE', name: 'Almanya', flag: '🇩🇪' },
  { code: 'FR', name: 'Fransa', flag: '🇫🇷' },
  { code: 'IT', name: 'İtalya', flag: '🇮🇹' },
  { code: 'ES', name: 'İspanya', flag: '🇪🇸' },
  { code: 'NL', name: 'Hollanda', flag: '🇳🇱' },
  { code: 'GR', name: 'Yunanistan', flag: '🇬🇷' },
];

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
  placeholder = "Ülke, Şehir seçin",
  style
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<'country' | 'city'>('country');
  const [tempCountry, setTempCountry] = useState('');
  const [searchText, setSearchText] = useState('');

  const getDisplayText = () => {
    if (selectedCountry && selectedCity) {
      return `${selectedCity}, ${selectedCountry}`;
    } else if (selectedCountry) {
      return selectedCountry;
    }
    return placeholder;
  };

  const handleCountrySelect = (country: any) => {
    setTempCountry(country.name);
    if (country.code === 'TR') {
      setStep('city');
      setSearchText('');
    } else {
      // Türkiye dışındaki ülkeler için şehir seçimi gerekmiyor
      onSelect(country.name, '');
      setModalVisible(false);
      setStep('country');
    }
  };

  const handleCitySelect = (city: string) => {
    onSelect(tempCountry, city);
    setModalVisible(false);
    setStep('country');
    setTempCountry('');
  };

  const getFilteredCities = () => {
    if (!searchText) return TURKISH_CITIES;
    return TURKISH_CITIES.filter(city => 
      city.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getFilteredCountries = () => {
    if (!searchText) return COUNTRIES;
    return COUNTRIES.filter(country => 
      country.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const handleBack = () => {
    if (step === 'city') {
      setStep('country');
      setTempCountry('');
      setSearchText('');
    } else {
      setModalVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.selector, style]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[
          styles.selectorText, 
          !selectedCountry && styles.placeholder
        ]}>
          {getDisplayText()}
        </Text>
        <Icon name="chevron-down" size={20} color={theme.colors.gray} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {step === 'country' ? 'Ülke Seçin' : 'Şehir Seçin'}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setModalVisible(false);
                setStep('country');
                setTempCountry('');
              }}
              style={styles.closeButton}
            >
              <Icon name="x" size={24} color={theme.colors.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={theme.colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder={step === 'country' ? "Ülke ara..." : "Şehir ara..."}
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={theme.colors.gray}
            />
          </View>

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
                    <Text style={styles.flag}>{(item as any).flag}</Text>
                    <Text style={styles.itemText}>{(item as any).name}</Text>
                  </>
                ) : (
                  <Text style={styles.itemText}>{item as string}</Text>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.gray + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray + '30',
  },
  selectorText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  placeholder: {
    color: theme.colors.gray,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '30',
  },
  backButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.gray + '20',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray + '20',
    marginLeft: 16,
  },
});

export default CountryCitySelector;