import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Icon, 
  Button,
  AppHeader,
  ProBadge,
  MapComponent,
  ScreenContainer,
  ConfirmModal
} from '@fishivo/ui';
import { theme } from '@fishivo/shared/theme';
import { useLocation, formatLocationString } from '@fishivo/shared/services';
import { useAuth } from '@fishivo/shared/contexts';
import { useUnits } from '@fishivo/shared/hooks';

interface AddSpotScreenProps {
  navigation: any;
  route?: any;
}

interface SpotData {
  name: string;
  location: string;
  description: string;
  depth: string;
  isPrivate: boolean;
  imageUri?: string;
  coordinates?: [number, number]; // Mapbox formatı [lng, lat]
}

const AddSpotScreen: React.FC<AddSpotScreenProps> = ({ navigation, route }) => {
  const { getCurrentLocation, requestPermission } = useLocation();
  const { user } = useAuth();
  const { getDepthUnit } = useUnits();
  const [spotData, setSpotData] = useState<SpotData>({
    name: '',
    location: '',
    description: '',
    depth: '',
    isPrivate: false,
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 29.0100 }); // Istanbul default
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // AddCatch'den gelen konum parametrelerini dinle
  useEffect(() => {
    if (route?.params?.preSelectedLocation) {
      const preLocation = route.params.preSelectedLocation;
      setSpotData(prev => ({
        ...prev,
        location: preLocation.locationString,
        coordinates: [preLocation.lng, preLocation.lat] // Mapbox formatı [lng, lat]
      }));
    }
  }, [route?.params?.preSelectedLocation]);

  // MapScreen'deki gibi konum izni ve ilk konum al
  useEffect(() => {
    const initializeLocation = async () => {
      console.log('🎯 AddSpot: Konum izni kontrol ediliyor...');
      await requestPermission();
      
      console.log('🎯 AddSpot: İlk konum alınıyor...');
      const location = await getCurrentLocation();
      if (location) {
        setMapCenter({ lat: location.latitude, lng: location.longitude });
        console.log('✅ AddSpot: İlk konum alındı:', location.latitude.toFixed(6), location.longitude.toFixed(6));
      }
    };
    
    initializeLocation();
  }, []);

  const handleImagePicker = () => {
    // Gerçek image picker çağrısı yapılacak
    // TODO: react-native-image-picker implementasyonu
    console.log('Image picker açılacak');
    
    // Gerçek image picker implementasyonu
    // TODO: react-native-image-picker ile gerçek görsel seçimi
  };

  const handleCurrentLocation = async () => {
    setShowLocationModal(false);
    console.log('🎯 AddSpot Modal GPS: Gerçek konum alınıyor...');
    const location = await getCurrentLocation();
    if (location) {
      const gpsLocation = formatLocationString(location);
      setSpotData(prev => ({ 
        ...prev, 
        location: `GPS: ${gpsLocation}`,
        coordinates: [location.longitude, location.latitude] // Mapbox formatı [lng, lat]
      }));
      setMapCenter({ lat: location.latitude, lng: location.longitude });
      console.log('✅ AddSpot Modal GPS: Gerçek konum alındı:', gpsLocation);
    } else {
      console.log('❌ AddSpot Modal GPS: Konum alınamadı');
    }
  };

  const handleMapSelection = () => {
    setShowLocationModal(false);
    setShowMapModal(true);
  };

  const handlePrivateToggle = () => {
    // Kullanıcının premium durumunu kontrol et
    const isPremium = user?.isPremium || false;
    
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    
    setSpotData(prev => ({ ...prev, isPrivate: !prev.isPrivate }));
  };

  const handlePremiumUpgrade = () => {
    setShowPremiumModal(false);
    navigation.navigate('Profile'); // Premium sayfası henüz yok, Profile'a yönlendir
  };

  const handleSave = () => {
    if (!spotData.name.trim()) {
      Alert.alert('Hata', 'Lütfen spot adını girin.');
      return;
    }

    if (!spotData.location.trim()) {
      Alert.alert('Hata', 'Lütfen lokasyon seçin.');
      return;
    }

    // Check if coming from AddCatch
    const comeFromAddCatch = route?.params?.comeFromAddCatch;
    
    if (comeFromAddCatch) {
      // AddCatch'e spot bilgisi ile geri dön
      navigation.navigate('AddCatch', {
        newSpot: {
          id: Date.now().toString(),
          name: spotData.name,
          address: spotData.location,
          type: spotData.isPrivate ? 'private-spot' : 'spot',
          coordinates: spotData.coordinates,
          isFavorite: false,
          isPrivate: spotData.isPrivate,
          lastUsed: new Date(),
        }
      });
    } else {
      // Normal spot ekleme akışı
      Alert.alert('Başarılı', 'Spot başarıyla eklendi!', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Spot Ekle"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <Button
            variant="primary"
            size="sm"
            onPress={handleSave}
          >
            Kaydet
          </Button>
        }
      />

      <ScreenContainer>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Fotoğraf */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotoğraf</Text>
            <TouchableOpacity style={styles.imageContainer} onPress={handleImagePicker}>
              {spotData.imageUri ? (
                <Image source={{ uri: spotData.imageUri }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="camera" size={32} color={theme.colors.textSecondary} />
                  <Text style={styles.imagePlaceholderText}>Spot Fotoğrafı Ekle</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Spot Adı */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spot Adı</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Spot adı girin..."
              placeholderTextColor={theme.colors.textSecondary}
              value={spotData.name}
              onChangeText={(text) => setSpotData(prev => ({ ...prev, name: text }))}
            />
          </View>

          {/* Açıklama */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Spot hakkında açıklama ekle..."
              placeholderTextColor={theme.colors.textSecondary}
              value={spotData.description}
              onChangeText={(text) => setSpotData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Derinlik */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Su Derinliği</Text>
            <View style={styles.depthContainer}>
              <TextInput
                style={[styles.textInput, styles.depthInput]}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                value={spotData.depth}
                onChangeText={(text) => {
                  // Sadece sayı ve nokta karakterine izin ver
                  const numericText = text.replace(/[^0-9.]/g, '');
                  setSpotData(prev => ({ ...prev, depth: numericText }));
                }}
                keyboardType="numeric"
              />
              <Text style={styles.depthUnit}>{getDepthUnit()}</Text>
            </View>
            <Text style={styles.depthHint}>
              Ortalama su derinliğini girin (isteğe bağlı)
            </Text>
          </View>

          {/* Lokasyon */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Lokasyon</Text>
              <View style={styles.locationActions}>
                <TouchableOpacity 
                  style={styles.locationActionButton}
                  onPress={async () => {
                    const location = await getCurrentLocation();
                    if (location) {
                      const gpsLocation = formatLocationString(location);
                      setSpotData(prev => ({ 
                        ...prev, 
                        location: `GPS: ${gpsLocation}`,
                        coordinates: [location.longitude, location.latitude]
                      }));
                      setMapCenter({ lat: location.latitude, lng: location.longitude });
                      console.log('✅ GERÇEK GPS ADDSPOT:', gpsLocation);
                    }
                  }}
                >
                  <Icon name="my-location" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.locationActionButton}
                  onPress={() => {
                    // Eğer daha önce GPS'ten konum alınmışsa haritayı o koordinatlarda aç
                    if (spotData.location && spotData.location.startsWith('GPS:')) {
                      // GPS verilerinden koordinatları çıkar
                      const coords = spotData.location.match(/(\d+\.\d+)°K, (\d+\.\d+)°D/);
                      if (coords) {
                        setMapCenter({ 
                          lat: parseFloat(coords[1]), 
                          lng: parseFloat(coords[2]) 
                        });
                      }
                    }
                    setShowMapModal(true);
                  }}
                >
                  <Icon name="map" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {spotData.location ? (
              <TouchableOpacity 
                style={styles.selectedLocationContainer}
                onPress={() => setShowLocationModal(true)}
              >
                <Icon name="map-pin" size={20} color={theme.colors.primary} />
                <Text style={styles.selectedLocationText}>{spotData.location}</Text>
                <TouchableOpacity 
                  style={styles.removeLocationButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSpotData(prev => ({ ...prev, location: '', coordinates: undefined }));
                  }}
                >
                  <Icon name="x" size={16} color={theme.colors.error} />
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.emptyLocationContainer}
                onPress={() => setShowLocationModal(true)}
              >
                <Icon name="map-pin" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>Lokasyon seçilmedi</Text>
                <Text style={styles.emptySubtext}>GPS, harita, spotlar veya yeni ekle</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Gizlilik */}
          <View style={styles.section}>
            <View style={styles.privacyRow}>
              <View style={styles.privacyInfo}>
                <View style={styles.privacyTitleRow}>
                  <Text style={styles.sectionTitle}>Özel Spot</Text>
                  <ProBadge 
                    variant="badge" 
                    size="sm" 
                    style={styles.proBadgeStyle}
                  />
                </View>
                <Text style={styles.privacyDescription}>
                  Sadece siz görebilirsiniz
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.privacyToggle, spotData.isPrivate && styles.privacyToggleActive]}
                onPress={handlePrivateToggle}
              >
                {spotData.isPrivate && (
                  <Icon name="check" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </ScreenContainer>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocationModal(false)}
        >
          <View style={styles.locationModal}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>Lokasyon Seç</Text>
            </View>
            <Text style={styles.modalSubtitle}>Konum seçme yöntemini belirleyin</Text>

            <View style={styles.locationOptions}>
              <TouchableOpacity style={styles.locationOption} onPress={handleCurrentLocation}>
                <Icon name="crosshair" size={24} color={theme.colors.primary} />
                <View style={styles.locationOptionContent}>
                  <Text style={styles.locationOptionTitle}>Mevcut Konum</Text>
                  <Text style={styles.locationOptionDescription}>GPS ile otomatik konum al</Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.locationOption} onPress={handleMapSelection}>
                <Icon name="map" size={24} color={theme.colors.primary} />
                <View style={styles.locationOptionContent}>
                  <Text style={styles.locationOptionTitle}>Haritadan Seç</Text>
                  <Text style={styles.locationOptionDescription}>Harita üzerinden nokta belirle</Text>
                </View>
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Map Selection Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity 
              style={styles.mapModalCloseButton}
              onPress={() => setShowMapModal(false)}
            >
              <Icon name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>Konum Seç</Text>
            <TouchableOpacity 
              style={styles.mapModalSaveButton}
              onPress={() => {
                const locationString = `${mapCenter.lat.toFixed(6)}°K, ${mapCenter.lng.toFixed(6)}°D`;
                setSpotData(prev => ({ 
                  ...prev, 
                  location: `Harita: ${locationString}`,
                  coordinates: [mapCenter.lng, mapCenter.lat] // Mapbox formatı [lng, lat]
                }));
                setShowMapModal(false);
              }}
            >
              <Text style={styles.mapModalSaveText}>Kaydet</Text>
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

      <ConfirmModal
        visible={showPremiumModal}
        title="Premium Özellik"
        message="Özel spot oluşturma sadece premium üyeler için mevcut."
        onConfirm={handlePremiumUpgrade}
        onCancel={() => setShowPremiumModal(false)}
        confirmText="Premium'a Geç"
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
  scrollView: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: theme.spacing.sm,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  imagePlaceholderText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.sm,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  privacyInfo: {
    flex: 1,
  },
  privacyDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  privacyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  privacyToggle: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyToggleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  locationModal: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  locationOptions: {
    gap: theme.spacing.xs,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  locationOptionContent: {
    flex: 1,
  },
  locationOptionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  locationOptionDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  locationActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  locationActionButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  removeLocationButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${theme.colors.error}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLocationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  mapModalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapModalSaveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  mapModalSaveText: {
    color: '#FFFFFF',
    fontSize: theme.typography.base,
    fontWeight: '600',
  },
  proBadgeStyle: {
    marginTop: -4,
    marginLeft: theme.spacing.sm,
  },
  depthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  depthInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlign: 'right',
    fontSize: theme.typography.lg,
  },
  depthUnit: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  depthHint: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});

export default AddSpotScreen;