import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, MapComponent, AppHeader, ScreenContainer, FishivoModal, SearchBar } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api/services/native';

interface AddLocationScreenProps {
  navigation: any;
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const AddLocationScreen: React.FC<AddLocationScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customName, setCustomName] = useState('');
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCurrentLocationConfirm, setShowCurrentLocationConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Mock veriler kaldırıldı - gerçek database araması yapılacak

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // API'den spot arama yap
      const apiService = createNativeApiService();
      const spotsResponse = await apiService.spots.searchSpots({ query });
      
      // Spot verilerini SearchResult formatına çevir
      const searchResults = spotsResponse.map((spot: any) => ({
        id: spot.id.toString(),
        name: spot.name,
        address: spot.description || spot.name,
        coordinates: {
          latitude: spot.location.latitude,
          longitude: spot.location.longitude
        }
      }));
      
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Spot arama hatası:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    searchLocations(text);
  };

  const addLocation = (location: SearchResult) => {
    const locationName = customName.trim() || location.name;
    
    // Burada gerçek uygulamada API'ye kaydedilecek
    setSuccessMessage(t('locations.addLocation.successMessage', { name: locationName }));
    setShowSuccessModal(true);
    
    // Modal kapandıktan sonra navigate et
    setTimeout(() => {
      navigation.navigate('Weather', {
        selectedLocation: {
          id: Date.now().toString(),
          name: locationName,
          type: 'manual',
          coordinates: location.coordinates,
          address: location.address,
          isFavorite: false
        }
      });
    }, 1500);
  };

  const useCurrentLocation = () => {
    setShowCurrentLocationConfirm(true);
  };

  const confirmCurrentLocation = () => {
    setShowCurrentLocationConfirm(false);
    const locationName = customName.trim() || t('common.currentLocation');
    navigation.navigate('Weather', {
      selectedLocation: {
        id: Date.now().toString(),
        name: locationName,
        type: 'manual',
        coordinates: null,
        address: t('common.defaultLocation'),
        isFavorite: false
      }
    });
  };

  const addLocationFromMap = () => {
    if (!mapCenter) return;
    
    const locationName = customName.trim() || `Konum ${mapCenter.latitude.toFixed(6)}, ${mapCenter.longitude.toFixed(6)}`;

    navigation.navigate('Weather', {
      selectedLocation: {
        id: Date.now().toString(),
        name: locationName,
        type: 'manual',
        coordinates: { latitude: mapCenter.latitude, longitude: mapCenter.longitude },
        address: `${mapCenter.latitude.toFixed(6)}°${t('map.north')}, ${mapCenter.longitude.toFixed(6)}°${t('map.east')}`,
        isFavorite: false
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('locations.addLocation.title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
          }
        ]}
        searchBar={{
          value: searchQuery,
          onChangeText: handleSearchChange,
          placeholder: t('locations.addLocation.searchPlaceholder')
        }}
      />

      <ScreenContainer paddingVertical="none">
        <ScrollView style={styles.content} contentContainerStyle={[styles.scrollContent, theme.listContentStyle]} showsVerticalScrollIndicator={false}>
          {/* Custom Name Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('locations.addLocation.customName')}</Text>
            <View style={styles.inputContainer}>
              <Icon name="edit-3" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                placeholder={t('locations.addLocation.customNamePlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={customName}
                onChangeText={setCustomName}
              />
            </View>
          </View>

          {isSearching && (
            <View style={styles.section}>
              <Text style={styles.loadingText}>{t('common.searching')}</Text>
            </View>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('common.searchResults')}</Text>
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.resultItem}
                  onPress={() => addLocation(result)}
                >
                  <Icon name="map-pin" size={20} color={theme.colors.primary} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.resultAddress}>{result.address}</Text>
                  </View>
                  <Icon name="plus" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.quickActions')}</Text>
            
            <TouchableOpacity style={styles.quickAction} onPress={useCurrentLocation}>
              <Icon name="crosshair" size={24} color={theme.colors.primary} />
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>{t('locations.addLocation.useCurrentLocation')}</Text>
                <Text style={styles.quickActionDescription}>{t('locations.addLocation.useCurrentLocationDesc')}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => {
              setModalMessage('Map feature coming soon');
              setShowInfoModal(true);
            }}>
              <Icon name="map" size={24} color={theme.colors.primary} />
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>{t('locations.addLocation.selectFromMap')}</Text>
                <Text style={styles.quickActionDescription}>{t('locations.addLocation.selectFromMapDesc')}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>

      <FishivoModal
        visible={showSuccessModal}
        title={t('locations.addLocation.locationAdded')}
        onClose={() => setShowSuccessModal(false)}
        preset="success"
        description={successMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowSuccessModal(false)
        }}
      />

      <FishivoModal
        visible={showCurrentLocationConfirm}
        title={t('locations.addLocation.currentLocationConfirmTitle')}
        onClose={() => setShowCurrentLocationConfirm(false)}
        preset="confirm"
        description={t('locations.addLocation.currentLocationConfirmMessage')}
        primaryButton={{
          text: t('common.add'),
          onPress: confirmCurrentLocation
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => setShowCurrentLocationConfirm(false)
        }}
      />

      {/* Info Modal */}
      <FishivoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        preset="info"
        title={t('common.info')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowInfoModal(false)
        }}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs,
  },
  loadingText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
  },
  resultsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  tipsSection: {
    marginTop: theme.spacing.xl,
  },
  tipsTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: theme.spacing.md,
  },
  tipsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  tipText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,

    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: 2,
  },
  quickActionDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  mapModalTitle: {
    fontSize: theme.typography.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  mapModalSave: {
    color: '#FFFFFF',
    fontSize: theme.typography.base,
    fontWeight: '600',
  },
});

export default AddLocationScreen; 