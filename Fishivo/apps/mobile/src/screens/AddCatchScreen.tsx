import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  FlatList,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Icon, 
  Button, 
  ScreenContainer,
  AppHeader,
  SuccessModal,
  PhotoPickerModal,
  FishSpeciesSelectorModal,
  FishingTechniqueSelectorModal,
  EquipmentSelectorModal,
  WeatherSelectorModal,
  MapComponent
} from '@fishivo/ui';
import { theme, useUnits, apiService, imageUploadService, formatLocationString, getMapboxCoordinates, FishingTechnique } from '@fishivo/shared';
import { useLocation } from '../hooks/useLocation';

interface AddCatchScreenProps {
  navigation: any;
  route?: any;
}

// Map coordinate types - Mapbox dokümantasyonuna göre
interface MapCenter {
  lat: number;
  lng: number;
}

interface CatchData {
  species: string;
  waterType: 'freshwater' | 'saltwater' | '';
  weight: string;
  length: string;
  location: string;
  date: string;
  time: string;
  technique: FishingTechnique | null;
  weather: string;
  notes: string;
  images: string[];
  equipment: string[];
  useLiveBait: boolean;
  liveBait: string;
}

const AddCatchScreen: React.FC<AddCatchScreenProps> = ({ navigation, route }) => {
  const { getCurrentLocation, requestPermission } = useLocation();
  const { 
    units, 
    getWeightUnit, 
    getLengthUnit, 
    getDepthUnit, 
    getTemperatureUnit,
    convertFromUserUnit,
    isLoading: unitsLoading 
  } = useUnits();
  
  const [catchData, setCatchData] = useState<CatchData>({
    species: '',
    waterType: '',
    weight: '',
    length: '',
    location: '',
    date: new Date().toLocaleDateString('tr-TR'),
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    technique: null,
    weather: '',
    notes: '',
    images: [],
    equipment: [],
    useLiveBait: false,
    liveBait: '',
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhotoPickerModal, setShowPhotoPickerModal] = useState(false);
  const [showFishSpeciesModal, setShowFishSpeciesModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showSpotModal, setShowSpotModal] = useState(false);

  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<MapCenter>({
    lat: 41.0082,
    lng: 28.9784
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // API'den spot verilerini çek
  const [savedSpots, setSavedSpots] = useState<any[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);

  // API'den veri state'leri
  const [fishSpecies, setFishSpecies] = useState<string[]>([]);
  const [techniques, setTechniques] = useState<FishingTechnique[]>([]);
  const [weatherConditions, setWeatherConditions] = useState<string[]>([]);

  // AddSpot'tan gelen yeni spot'u dinle
  useEffect(() => {
    if (route?.params?.newSpot) {
      const newSpot = route.params.newSpot;
      setCatchData(prev => ({ ...prev, location: newSpot.name }));
      // Params'ı temizle
      navigation.setParams({ newSpot: undefined });
    }
  }, [route?.params?.newSpot]);

  // MapScreen'deki gibi konum izni ve ilk konum al
  useEffect(() => {
    const initializeLocation = async () => {
      console.log('🎯 AddCatch: Konum izni kontrol ediliyor...');
      await requestPermission();
      
      console.log('🎯 AddCatch: İlk konum alınıyor...');
      const location = await getCurrentLocation();
      if (location) {
        setMapCenter({ lat: location.latitude, lng: location.longitude });
        console.log('✅ AddCatch: İlk konum alındı:', location.latitude.toFixed(6), location.longitude.toFixed(6));
      }
    };
    
    initializeLocation();
  }, []);

  // API'den verileri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fish species yükle
        const speciesData = await apiService.getSpecies();
        const speciesNames = speciesData.map((species: any) => species.name);
        setFishSpecies(speciesNames);

        // Spots yükle
        const spotsData = await apiService.getSpots();
        setSavedSpots(spotsData.items || []);

        // Sabit veriler (JSON'dan API'ye taşınana kadar)
        setTechniques(['Olta', 'Spin', 'Jigging', 'Trolling', 'Fly Fishing']);
        setWeatherConditions(['Güneşli', 'Bulutlu', 'Yağmurlu', 'Rüzgarlı', 'Sisli']);
        
      } catch (error) {
        console.error('Balık türleri getirilemedi:', error);
        // Fallback veriler
        setFishSpecies(['Levrek', 'Çupra', 'Kalkan', 'Lüfer', 'Hamsi']);
        setTechniques(['Olta', 'Spin', 'Jigging', 'Trolling', 'Fly Fishing']);
        setWeatherConditions(['Güneşli', 'Bulutlu', 'Yağmurlu', 'Rüzgarlı', 'Sisli']);
        setSavedSpots([]);
      }
    };

    loadData();
  }, []);

  const handleSaveCatch = async () => {
    // Validation
    if (!catchData.species || !catchData.weight || !catchData.length) {
      Alert.alert('Eksik Bilgi', 'Lütfen balık türü, ağırlık ve boy bilgilerini girin.');
      return;
    }

    try {
      // **BİRİM DÖNÜŞÜMLERİ - Kullanıcı biriminden backend base unit'e çevir**
      const weightInKg = await convertFromUserUnit(parseFloat(catchData.weight), 'weight');
      const lengthInCm = await convertFromUserUnit(parseFloat(catchData.length), 'length');
      
      // Backend API'ye gönderilecek veri
      const postData = {
        content: catchData.notes || `${catchData.species} avı paylaştı`,
        images: catchData.images,
        location: {
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
          address: catchData.location
        },
        spot_id: selectedSpot?.id || null, // Seçilen spot'un ID'si
        catch_details: {
          species_name: catchData.species,
          weight: weightInKg, // Base unit (kg)
          length: lengthInCm, // Base unit (cm)
          bait_used: catchData.liveBait || 'Belirtilmemiş',
          technique: catchData.technique,
          weather_conditions: catchData.weather,
          time_of_day: getTimeOfDay() as 'morning' | 'afternoon' | 'evening' | 'night', // Mevcut saate göre
          equipment_used: catchData.equipment
        }
      };

      // Backend API çağrısı (gerçek implementasyon)
      console.log('Backend API\'ye gönderilen veri:', postData);
      
      // Gerçek API çağrısı
      const response = await apiService.createPost(postData);
      console.log('API Response:', response);
      
      setSuccessMessage('Avınız başarıyla kaydedildi! 🎣');
      setShowSuccessModal(true);
      
      // 2 saniye sonra önceki sayfaya dön
      setTimeout(() => {
        setShowSuccessModal(false);
        navigation.goBack();
      }, 2000);
      
    } catch (error) {
      console.error('Catch kaydedilirken hata:', error);
      Alert.alert('Hata', 'Av kaydedilirken bir hata oluştu.');
    }
  };

  // Zamanı belirle (time_of_day için)
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  const handleImagePicker = () => {
    if (catchData.images.length >= 5) {
      setSuccessMessage('Maksimum 5 fotoğraf ekleyebilirsiniz.');
      setShowSuccessModal(true);
      return;
    }

    setShowPhotoPickerModal(true);
  };

  const handleCamera = async () => {
    try {
      const result = await imageUploadService.pickImage('camera');
      
      if (result && !result.didCancel && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setCatchData(prev => ({ 
          ...prev, 
          images: [...prev.images, imageUri] 
        }));
      }
    } catch (error) {
      console.error('Kamera hatası:', error);
    }
  };

  const handleGallery = async () => {
    try {
      const result = await imageUploadService.pickImage('gallery');
      
      if (result && !result.didCancel && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setCatchData(prev => ({ 
          ...prev, 
          images: [...prev.images, imageUri] 
        }));
      }
    } catch (error) {
      console.error('Galeri hatası:', error);
    }
  };

  const handleRemoveImage = (index: number) => {
    setCatchData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    if (activeImageIndex >= catchData.images.length - 1) {
      setActiveImageIndex(Math.max(0, catchData.images.length - 2));
    }
  };

  const renderImageItem = ({ item, index }: { item: string, index: number }) => (
    <View style={styles.imageSlide}>
      <Image source={{ uri: item }} style={styles.slideImage} />
      <TouchableOpacity 
        style={styles.removeImageButton}
        onPress={() => handleRemoveImage(index)}
      >
        <Icon name="close" size={16} color={theme.colors.background} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer>
      <AppHeader 
        title="Av Ekle" 
        canGoBack 
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Fotoğraf Bölümü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotoğraflar</Text>
          
          {catchData.images.length > 0 ? (
            <View style={styles.imageContainer}>
              <FlatList
                data={catchData.images}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
                  setActiveImageIndex(index);
                }}
              />
              
              <View style={styles.imageIndicators}>
                {catchData.images.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.indicator, 
                      index === activeImageIndex && styles.activeIndicator
                    ]} 
                  />
                ))}
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleImagePicker}>
              <Icon name="camera" size={32} color={theme.colors.textSecondary} />
              <Text style={styles.addPhotoText}>Fotoğraf Ekle</Text>
            </TouchableOpacity>
          )}
          
          {catchData.images.length > 0 && catchData.images.length < 5 && (
            <TouchableOpacity style={styles.addMoreButton} onPress={handleImagePicker}>
              <Icon name="plus" size={20} color={theme.colors.primary} />
              <Text style={styles.addMoreText}>Daha Fazla Ekle ({catchData.images.length}/5)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Balık Türü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balık Türü *</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowFishSpeciesModal(true)}
          >
            <Text style={[styles.selectorText, !catchData.species && styles.placeholderText]}>
              {catchData.species || 'Balık türü seçin'}
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Ağırlık ve Boy */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: theme.spacing.sm }]}>
            <Text style={styles.sectionTitle}>Ağırlık * ({getWeightUnit()})</Text>
            <TextInput
              style={styles.input}
              value={catchData.weight}
              onChangeText={(text) => setCatchData(prev => ({ ...prev, weight: text }))}
              placeholder={`Ağırlık (${getWeightUnit()})`}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          
          <View style={[styles.section, { flex: 1, marginLeft: theme.spacing.sm }]}>
            <Text style={styles.sectionTitle}>Boy * ({getLengthUnit()})</Text>
            <TextInput
              style={styles.input}
              value={catchData.length}
              onChangeText={(text) => setCatchData(prev => ({ ...prev, length: text }))}
              placeholder={`Boy (${getLengthUnit()})`}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Konum */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konum</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowMapModal(true)}
          >
            <Text style={[styles.selectorText, !catchData.location && styles.placeholderText]}>
              {catchData.location || 'Konum seçin'}
            </Text>
            <Icon name="map-pin" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Teknik */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avlanma Tekniği</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowTechniqueModal(true)}
          >
            <Text style={[styles.selectorText, !catchData.technique && styles.placeholderText]}>
              {catchData.technique || 'Teknik seçin'}
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hava Durumu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hava Durumu</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowWeatherModal(true)}
          >
            <Text style={[styles.selectorText, !catchData.weather && styles.placeholderText]}>
              {catchData.weather || 'Hava durumu seçin'}
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Ekipman */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kullanılan Ekipman</Text>
          <TouchableOpacity 
            style={styles.selectorButton}
            onPress={() => setShowEquipmentModal(true)}
          >
            <Text style={[styles.selectorText, catchData.equipment.length === 0 && styles.placeholderText]}>
              {catchData.equipment.length > 0 
                ? `${catchData.equipment.length} ekipman seçildi`
                : 'Ekipman seçin'
              }
            </Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Notlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notlar</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={catchData.notes}
            onChangeText={(text) => setCatchData(prev => ({ ...prev, notes: text }))}
            placeholder="Avınız hakkında notlar..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Kaydet Butonu */}
        <View style={styles.saveButtonContainer}>
          <Button
            title="Avı Kaydet"
            onPress={handleSaveCatch}
            variant="primary"
            size="lg"
          />
        </View>
      </ScrollView>

      {/* Modals */}
      <PhotoPickerModal
        visible={showPhotoPickerModal}
        onClose={() => setShowPhotoPickerModal(false)}
        onCamera={handleCamera}
        onGallery={handleGallery}
      />

      <FishSpeciesSelectorModal
        visible={showFishSpeciesModal}
        onClose={() => setShowFishSpeciesModal(false)}
        onSelect={(species, waterType) => {
          setCatchData(prev => ({ ...prev, species, waterType }));
          setShowFishSpeciesModal(false);
        }}
      />

      <FishingTechniqueSelectorModal
        visible={showTechniqueModal}
        onClose={() => setShowTechniqueModal(false)}
        techniques={techniques}
        onSelect={(technique) => {
          setCatchData(prev => ({ ...prev, technique }));
          setShowTechniqueModal(false);
        }}
      />

      <WeatherSelectorModal
        visible={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
        onSelect={(weather) => {
          setCatchData(prev => ({ ...prev, weather }));
          setShowWeatherModal(false);
        }}
      />

      <EquipmentSelectorModal
        visible={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        onSelect={(equipment) => {
          setCatchData(prev => ({ ...prev, equipment }));
          setShowEquipmentModal(false);
        }}
      />

      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity
              style={styles.mapModalCloseButton}
              onPress={() => setShowMapModal(false)}
            >
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <Text style={styles.mapModalTitle}>Konum Seç</Text>
            
            <TouchableOpacity
              style={styles.mapModalSaveButton}
              onPress={() => {
                // Konum kaydet
                setCatchData(prev => ({ 
                  ...prev, 
                  location: `${mapCenter.lat.toFixed(6)}, ${mapCenter.lng.toFixed(6)}` 
                }));
                setShowMapModal(false);
              }}
            >
              <Text style={styles.mapModalSaveText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
          
          <MapComponent
            center={mapCenter}
            onCenterChange={setMapCenter}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  selectorText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  addPhotoButton: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  addPhotoText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  imageContainer: {
    height: 250,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  imageSlide: {
    width: Dimensions.get('window').width - (theme.spacing.md * 2),
    height: 250,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: theme.colors.primary,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  addMoreText: {
    fontSize: theme.typography.base,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  saveButtonContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
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
  mapModalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapModalTitle: {
    fontSize: theme.typography.lg,
    fontWeight: '600',
    color: theme.colors.text,
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
});

export default AddCatchScreen;