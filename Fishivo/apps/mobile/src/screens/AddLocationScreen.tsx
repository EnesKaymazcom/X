import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Icon, 
  MapComponent,
  AppHeader,
  ScreenContainer,
  ConfirmModal,
  SuccessModal
} from '@fishivo/ui';
import { theme } from '@fishivo/shared';
import { apiService } from '@fishivo/shared';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customName, setCustomName] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 29.0100 });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCurrentLocationConfirm, setShowCurrentLocationConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // API'den spot arama yap
      const spotsResponse = await apiService.searchSpots(query);
      
      // Spot verilerini SearchResult formatına çevir
      const searchResults = spotsResponse.items.map((spot: any) => ({
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
    setSuccessMessage(`"${locationName}" başarıyla eklendi!`);
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
    const locationName = customName.trim() || 'Mevcut Konum';
    navigation.navigate('Weather', {
      selectedLocation: {
        id: Date.now().toString(),
        name: locationName,
        type: 'manual',
        coordinates: { latitude: 41.0082, longitude: 28.9784 }, // Varsayılan İstanbul koordinatı
        address: 'İstanbul, Türkiye',
        isFavorite: false
      }
    });
  };

  const addLocationFromMap = () => {
    const locationName = customName.trim() || `Konum ${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}`;

    navigation.navigate('Weather', {
      selectedLocation: {
        id: Date.now().toString(),
        name: locationName,
        type: 'manual',
        coordinates: { latitude: mapCenter.lat, longitude: mapCenter.lng },
        address: `${mapCenter.lat.toFixed(6)}°K, ${mapCenter.lng.toFixed(6)}°D`,
        isFavorite: false
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Lokasyon Ekle"
        canGoBack
        onBackPress={() => navigation.goBack()}
      />

      <ScreenContainer>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Custom Name Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Özel İsim (İsteğe Bağlı)</Text>
            <View style={styles.inputContainer}>
              <Icon name="edit-3" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                placeholder="Lokasyon için özel bir isim verin..."
                placeholderTextColor={theme.colors.textSecondary}
                value={customName}
                onChangeText={setCustomName}
              />
            </View>
          </View>

          {/* Location Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lokasyon Ara</Text>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Şehir, bölge veya nokta ara..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearchChange}
              />
              {isSearching && (
                <Text style={styles.loadingText}>Aranıyor...</Text>
              )}
            </View>
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Arama Sonuçları</Text>
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
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            
            <TouchableOpacity style={styles.quickAction} onPress={useCurrentLocation}>
              <Icon name="crosshair" size={24} color={theme.colors.primary} />
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>Mevcut Konumu Kullan</Text>
                <Text style={styles.quickActionDescription}>GPS ile şu anki konumunuzu ekleyin</Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => setShowMapModal(true)}>
              <Icon name="map" size={24} color={theme.colors.primary} />
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>Haritadan Seç</Text>
                <Text style={styles.quickActionDescription}>Harita üzerinden konum belirleyin</Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </ScreenContainer>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Icon name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>Konum Seç</Text>
            <TouchableOpacity onPress={addLocationFromMap}>
              <Text style={styles.mapModalSave}>Kaydet</Text>
            </TouchableOpacity>
          </View>

          <MapComponent
            initialCoordinates={[mapCenter.lng, mapCenter.lat]}
            onLocationSelect={(coordinates) => {
              setMapCenter({ lat: coordinates[1], lng: coordinates[0] });
            }}
            showCrosshair={true}
            showCoordinates={true}
            showLocationButton={true}
          />
        </SafeAreaView>
      </Modal>

      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      <ConfirmModal
        visible={showCurrentLocationConfirm}
        title="Mevcut Konumu Kullan"
        message="Mevcut konumunuz lokasyon olarak eklensin mi?"
        onConfirm={confirmCurrentLocation}
        onCancel={() => setShowCurrentLocationConfirm(false)}
        confirmText="Ekle"
        cancelText="İptal"
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
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
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
    paddingHorizontal: theme.spacing.sm,
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
    paddingHorizontal: theme.spacing.sm,
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
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
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
    paddingHorizontal: theme.spacing.sm,
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
    color: theme.colors.primary,
    fontSize: theme.typography.base,
    fontWeight: '600',
  },
});

export default AddLocationScreen;