import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Icon,
  Button,
  ScreenContainer,
  AppHeader,
  FishSpeciesSelectorModal,
  FishingTechniqueSelectorModal,
  FishivoModal,
  PhotoCropModal,
  SectionHeader,
  WeatherGrid,
  type AspectRatioType
} from '@/components/ui';
import { LocationMapSelector } from '@/components/ui/LocationMapSelector';
import { useLocation } from '@/hooks/useLocation';
import { createNativeApiService, getNativeSupabaseClient } from '@fishivo/api';
import { getNativeGeocodingService } from '@fishivo/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { uploadImage } from '@/utils/unified-upload-service';
import { useUnits } from '@fishivo/hooks';
import { launchImageLibrary } from 'react-native-image-picker';
import { ExifParserService, type ExifMetadata } from '@/services/ExifParserService';
import { HistoricalWeatherService } from '@/services/HistoricalWeatherService';


interface AddCatchScreenProps {
  navigation: any;
  route?: any;
}


interface CatchData {
  species: string;
  speciesId?: string;
  waterType: 'freshwater' | 'saltwater' | '';
  weight: string;
  length: string;
  latitude: string;
  longitude: string;
  date: string;
  time: string;
  technique: string;
  techniqueId?: number;
  weather: string;
  weatherTemperature?: string;
  weatherHumidity?: string;
  weatherWind?: string;
  weatherPressure?: string;
  weatherSun?: string;
  weatherMoon?: string;
  notes: string;
  privateNote: string;
  images: string[];
  equipment: string[];
  useLiveBait: boolean;
  liveBait: string;
  location?: string;
  isSecret: boolean;
  released: boolean;
}

const AddCatchScreen: React.FC<AddCatchScreenProps> = ({ navigation, route }) => {
  const { getCurrentLocation, requestPermission } = useLocation();
  const { t, locale } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { 
    units, 
    getWeightUnit, 
    getLengthUnit, 
    getDepthUnit, 
    getTemperatureUnit,
    convertFromUserUnit,
    isLoading: unitsLoading 
  } = useUnits();
  const styles = createStyles(theme);
  
  // Edit mode parameters
  const editMode = route?.params?.editMode || false;
  const postId = route?.params?.postId;
  const existingPostData = route?.params?.postData;
  const [catchData, setCatchData] = useState<CatchData>({
    species: editMode && existingPostData ? existingPostData.fish?.species || '' : '',
    speciesId: editMode && existingPostData ? existingPostData.fish?.speciesId : undefined,
    waterType: '',
    weight: editMode && existingPostData ? existingPostData.fish?.weight?.replace(/[^\d.]/g, '') || '' : '',
    length: editMode && existingPostData ? existingPostData.fish?.length?.replace(/[^\d.]/g, '') || '' : '',
    latitude: editMode && existingPostData?.coordinates ? String(existingPostData.coordinates[1]) : '',
    longitude: editMode && existingPostData?.coordinates ? String(existingPostData.coordinates[0]) : '',
    date: new Date().toLocaleDateString('tr-TR'),
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    technique: editMode && existingPostData?.equipmentDetails?.[0]?.name || '',
    weather: '',
    notes: editMode && existingPostData ? existingPostData.description || '' : '',
    privateNote: editMode && existingPostData?.privateNote || '',
    images: editMode && existingPostData ? existingPostData.images || [] : [],
    equipment: editMode && existingPostData?.equipmentDetails ? existingPostData.equipmentDetails.map((e: any) => e.name) : [],
    useLiveBait: editMode && existingPostData?.useLiveBait || false,
    liveBait: editMode && existingPostData?.liveBait || '',
    location: '', // Edit mode'da bile boş başlat, geocoding ile güncellenecek
    isSecret: editMode && existingPostData?.isSecret || false,
    released: editMode && existingPostData?.released || false,
  });

  const [showFishSpeciesModal, setShowFishSpeciesModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageAspectRatios, setImageAspectRatios] = useState<Record<string, AspectRatioType>>({});
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [editingImageUri, setEditingImageUri] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // EXIF metadata ve smart suggestions
  const [imageMetadata, setImageMetadata] = useState<ExifMetadata[]>([]);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<{
    date?: string;
    time?: string;
    location?: { latitude: number; longitude: number; address?: string };
    weather?: { description: string; icon: string; temperature?: number };
  }>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  const [selectedSpot, setSelectedSpot] = useState<any>(null);

  // formatLocationString fonksiyonu
  const formatLocationString = (location: { latitude: number, longitude: number }) => {
    return `${location.latitude.toFixed(6)}°${t('map.north')}, ${location.longitude.toFixed(6)}°${t('map.east')}`;
  };

  // AddSpot'tan gelen yeni spot'u dinle
  useEffect(() => {
    if (route?.params?.newSpot) {
      const newSpot = route.params.newSpot;
      if (newSpot.latitude && newSpot.longitude) {
        setCatchData(prev => ({ 
          ...prev, 
          latitude: newSpot.latitude.toString(),
          longitude: newSpot.longitude.toString()
        }));
      }
      // Params'ı temizle
      navigation.setParams({ newSpot: undefined });
    }
  }, [route?.params?.newSpot]);

  // Konum izni ve ilk konum al
  useEffect(() => {
    const initializeLocation = async () => {
      // Edit mode'da ve koordinat varsa, mevcut koordinatları kullan
      if (editMode && existingPostData?.coordinates) {
        setCatchData(prev => ({
          ...prev,
          latitude: String(existingPostData.coordinates[1]),
          longitude: String(existingPostData.coordinates[0])
        }));
      } else {
        // Yeni post için kullanıcının gerçek konumunu al
        await requestPermission();
        const location = await getCurrentLocation();
        if (location) {
          setCatchData(prev => ({
            ...prev,
            latitude: String(location.latitude),
            longitude: String(location.longitude)
          }));
        }
      }
    };
    
    initializeLocation();
  }, [editMode, existingPostData]);
  
  // Edit mode'da görsel aspect ratio'larını yükle
  useEffect(() => {
    if (editMode && existingPostData?.images && existingPostData.images.length > 0) {
      // Varsayılan olarak tüm görseller için square aspect ratio ata
      // (Gerçek aspect ratio'lar görsel yüklendiğinde güncellenebilir)
      const newAspectRatios: Record<string, AspectRatioType> = {};
      existingPostData.images.forEach((imageUri: string) => {
        newAspectRatios[imageUri] = 'square'; // Varsayılan
      });
      setImageAspectRatios(newAspectRatios);
    }
  }, [editMode, existingPostData]);


  const handleSaveCatch = async () => {
    // Validation - Sadece balık türü zorunlu
    if (!catchData.species) {
      setModalMessage(t('addCatch.validation.speciesRequired'));
      setShowErrorModal(true);
      return;
    }

    try {
      // **BİRİM DÖNÜŞÜMLERİ - Kullanıcı biriminden backend base unit'e çevir**
      const weightInKg = catchData.weight ? convertFromUserUnit(parseFloat(catchData.weight), 'weight') : undefined;
      const lengthInCm = catchData.length ? convertFromUserUnit(parseFloat(catchData.length), 'length') : undefined;
      
      // Koordinatlardan lokasyon adını al - HER ZAMAN yeniden geocoding yap (edit mode dahil)
      let geocodedLocationName = null;
      let geocodedCountryCode = null;
      if (catchData.latitude && catchData.longitude) {
        try {
          const geocodingService = getNativeGeocodingService();
          const result = await geocodingService.reverseGeocode(
            parseFloat(catchData.latitude),
            parseFloat(catchData.longitude),
            { 
              language: locale === 'tr' ? 'tr' : 'en',
              useCache: editMode ? false : true // Edit mode'da cache kullanma, her zaman güncel bilgi al
            }
          );
          if (result.formattedAddress) {
            geocodedLocationName = result.formattedAddress;
            geocodedCountryCode = result.countryCode;
          }
        } catch (error) {
          // Geocoding başarısız olursa null kalır
        }
      }
      
      // Backend API'ye gönderilecek veri
      const postData = {
        content: catchData.notes || `${catchData.species} avı paylaştı`,
        images: catchData.images,
        is_secret: catchData.isSecret, // Gizli av flag'i
        private_note: catchData.privateNote || null, // Private note - sadece kullanıcı görecek
        location: {
          latitude: parseFloat(catchData.latitude) || 0,
          longitude: parseFloat(catchData.longitude) || 0,
          name: geocodedLocationName || catchData.location,
          address: geocodedLocationName || catchData.location,
          country_code: geocodedCountryCode || null
        },
        spot_id: selectedSpot?.id || null, // Seçilen spot'un ID'si
        catch_details: {
          species: catchData.species, // Balık türü adı - zorunlu alan
          species_name: catchData.species,
          species_id: catchData.speciesId || undefined,
          weight: weightInKg, // Base unit (kg)
          length: lengthInCm, // Base unit (cm)
          bait_used: catchData.liveBait || 'Belirtilmemiş',
          technique: catchData.technique,
          fishing_technique_id: catchData.techniqueId || null,
          weather_conditions: catchData.weather,
          time_of_day: getTimeOfDay() as 'morning' | 'afternoon' | 'evening' | 'night', // Mevcut saate göre
          equipment_used: catchData.equipment,
          released: catchData.released
        }
      };

      // Get current user
      const supabase = getNativeSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setModalMessage(t('errors.authRequired'));
        setShowErrorModal(true);
        return;
      }
      
      // API servisi oluştur
      const apiService = createNativeApiService();
      
      // Edit mode veya yeni post oluşturma
      let result;
      if (editMode && postId) {
        // Update existing post
        result = await apiService.posts.updatePost(postId, {
          content: catchData.notes || `${catchData.species} avı paylaştı`,
          images: catchData.images,
          is_secret: catchData.isSecret,
          private_note: catchData.privateNote || null,
          fishing_technique_id: catchData.techniqueId || null,
          location: catchData.latitude && catchData.longitude ? {
            latitude: parseFloat(catchData.latitude),
            longitude: parseFloat(catchData.longitude),
            name: geocodedLocationName, // Her zaman geocoding'den gelen değeri kullan
            country_code: geocodedCountryCode || null
          } : undefined,
          catch_details: {
            species: catchData.species, // Balık türü adı - zorunlu alan  
            species_name: catchData.species,
            species_id: catchData.speciesId,
            weight: weightInKg,
            length: lengthInCm,
            technique: catchData.technique,
            fishing_technique_id: catchData.techniqueId || null,
            weather_conditions: catchData.weather,
            equipment_used: catchData.equipment,
            released: catchData.released
          }
        });
      } else {
        // Create new post
        result = await apiService.posts.createPost(user.id, {
          type: 'catch',
          content: catchData.notes || `${catchData.species} avı paylaştı`,
          images: catchData.images,
          location: catchData.latitude && catchData.longitude ? {
            latitude: parseFloat(catchData.latitude),
            longitude: parseFloat(catchData.longitude),
            name: geocodedLocationName || catchData.location,
            country_code: geocodedCountryCode || null
          } : undefined,
          species: catchData.species,
          weight: weightInKg,
          length: lengthInCm,
          technique: catchData.technique,
          gear: catchData.equipment,
          weather: catchData.weather
        });
      }
      
      if (result) {
        setSuccessMessage(editMode ? t('addCatch.success.updated') : t('addCatch.success.saved'));
        setShowSuccessModal(true);
        
        // 2 saniye sonra önceki sayfaya dön
        setTimeout(() => {
          setShowSuccessModal(false);
          
          // Edit mode'da güncellenmiş post verisini gönder
          if (editMode && postId) {
            navigation.navigate('MainTabs', {
              screen: 'Home',
              params: {
                updatedPost: {
                  id: postId,
                  content: catchData.notes || `${catchData.species} avı paylaştı`,
                  images: catchData.images,
                  species: catchData.species,
                  speciesId: catchData.speciesId,
                  weight: weightInKg,
                  length: lengthInCm,
                  technique: catchData.technique,
                  equipment: catchData.equipment,
                  weather: catchData.weather,
                  latitude: catchData.latitude ? parseFloat(catchData.latitude) : undefined,
                  longitude: catchData.longitude ? parseFloat(catchData.longitude) : undefined
                }
              }
            });
          } else {
            navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs');
          }
        }, 2000);
      } else {
        throw new Error(editMode ? 'Post güncellenemedi' : 'Post oluşturulamadı');
      }
      
    } catch (error) {
      // Catch kaydedilirken hata
      setModalMessage(t('addCatch.errors.saveFailed'));
      setShowErrorModal(true);
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

  const handleImagePicker = async () => {
    if (catchData.images.length >= 3) {
      setSuccessMessage(t('addCatch.sections.maxPhotos', { count: 3 }));
      setShowSuccessModal(true);
      return;
    }

    try {
      const remainingSlots = 3 - catchData.images.length;
      
      launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        quality: 1.0,
        selectionLimit: remainingSlots
      }, async (response) => {
        if (!response.didCancel && response.assets && response.assets.length > 0) {
          const imageUris = response.assets.map(asset => asset.uri!);
          setSelectedImages(imageUris);
          
          // EXIF metadata'sını çek ve suggestions oluştur
          await processImageMetadata(imageUris);
          
          setShowCropModal(true);
        }
      });
    } catch (error: any) {
      if (!error.message.includes('cancelled')) {
        setModalMessage(t('errors.imageSelectError'));
        setShowErrorModal(true);
      }
    }
  };

  // EXIF metadata işleme ve smart suggestions oluşturma
  const processImageMetadata = async (imageUris: string[]) => {
    try {
      setLoadingSuggestions(true);
      
      // İlk görselin EXIF metadata'sını çek
      const firstImageUri = imageUris[0];
      const exifData = await ExifParserService.extractCatchMetadata(firstImageUri);
      
      if (!exifData.hasDateTime && !exifData.hasLocation) {
        return; // EXIF yoksa devam etme
      }
      
      const smartSuggestionsList: any[] = [];

      // Tarih ve saat önerisi
      if (exifData.hasDateTime && exifData.captureDate && exifData.captureTime) {
        // Sadece geçerli tarih değilse öner
        const today = new Date().toLocaleDateString('tr-TR');
        if (exifData.captureDate !== today) {
          smartSuggestionsList.push({
            type: 'date',
            displayValue: `${exifData.captureDate} ${exifData.captureTime}`,
            value: { date: exifData.captureDate, time: exifData.captureTime },
            confidence: 1.0
          });
          
          // suggestions state'i de güncelle (acceptSuggestion için)
          setSuggestions(prev => ({
            ...prev,
            date: exifData.captureDate!,
            time: exifData.captureTime!
          }));
        }
      }

      // Konum önerisi
      if (exifData.hasLocation && exifData.coordinates) {
        const { latitude, longitude } = exifData.coordinates;
        
        smartSuggestionsList.push({
          type: 'location',
          displayValue: `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`,
          value: { latitude, longitude },
          confidence: 1.0
        });
        
        // suggestions state'i güncelle
        setSuggestions(prev => ({
          ...prev,
          location: { latitude, longitude }
        }));

        // Hava durumu önerisi (konum ve tarih varsa)
        if (exifData.captureDateTime) {
          try {
            const historicalWeather = await HistoricalWeatherService.getWeatherForCaptureTime(
              latitude,
              longitude,
              exifData.captureDateTime
            );
            
            if (historicalWeather) {
              smartSuggestionsList.push({
                type: 'weather',
                displayValue: `${historicalWeather.icon} ${historicalWeather.description} (${historicalWeather.temperature}°C)`,
                value: historicalWeather,
                confidence: 0.9
              });
              
              // suggestions state'i güncelle
              setSuggestions(prev => ({
                ...prev,
                weather: {
                  description: historicalWeather.description,
                  icon: historicalWeather.icon,
                  temperature: historicalWeather.temperature
                }
              }));
            }
          } catch (error) {
            // Hava durumu alınamazsa sessizce devam et
          }
        }
      }

      // Smart suggestions state'ini güncelle
      setSmartSuggestions(smartSuggestionsList);
      
      // Eğer öneriler varsa modal göster
      if (smartSuggestionsList.length > 0) {
        setShowSmartSuggestions(true);
      }
      
    } catch (error) {
      // EXIF işleme hatası - sessizce devam et
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Suggestion kabul etme fonksiyonu
  const acceptSuggestion = (suggestion: any) => {
    if (suggestion.type === 'date' && suggestion.value) {
      setCatchData(prev => ({
        ...prev,
        date: suggestion.value.date,
        time: suggestion.value.time
      }));
      // Kabul edilen öneriyi listeden çıkar
      setSmartSuggestions(prev => prev.filter(s => s.type !== 'date'));
    }
    
    if (suggestion.type === 'location' && suggestion.value) {
      setCatchData(prev => ({
        ...prev,
        latitude: String(suggestion.value.latitude),
        longitude: String(suggestion.value.longitude)
      }));
      setLocationConfirmed(true);
      // Kabul edilen öneriyi listeden çıkar
      setSmartSuggestions(prev => prev.filter(s => s.type !== 'location'));
    }
    
    if (suggestion.type === 'weather' && suggestion.value) {
      setCatchData(prev => ({
        ...prev,
        weather: suggestion.value.description
      }));
      // Kabul edilen öneriyi listeden çıkar
      setSmartSuggestions(prev => prev.filter(s => s.type !== 'weather'));
    }
    
    // Eğer başka öneri kalmadıysa modal'ı kapat
    if (smartSuggestions.length <= 1) {
      setShowSmartSuggestions(false);
    }
  };

  // Tüm önerileri kabul et
  const acceptAllSuggestions = () => {
    const updates: Partial<CatchData> = {};
    
    smartSuggestions.forEach(suggestion => {
      if (suggestion.type === 'date' && suggestion.value) {
        updates.date = suggestion.value.date;
        updates.time = suggestion.value.time;
      }
      
      if (suggestion.type === 'location' && suggestion.value) {
        updates.latitude = String(suggestion.value.latitude);
        updates.longitude = String(suggestion.value.longitude);
        setLocationConfirmed(true);
      }
      
      if (suggestion.type === 'weather' && suggestion.value) {
        updates.weather = suggestion.value.description;
      }
    });
    
    setCatchData(prev => ({ ...prev, ...updates }));
    setShowSmartSuggestions(false);
    setSmartSuggestions([]);
  };

  const handleCropAll = async (croppedUris: string[], aspectRatios?: AspectRatioType[]) => {
    setIsUploadingImages(true);
    
    try {
      const uploadedUrls: string[] = [];
      
      // Upload each cropped image to R2
      for (let i = 0; i < croppedUris.length; i++) {
        const croppedUri = croppedUris[i];
        
        // Upload to R2 using unified-upload-service
        const result = await uploadImage(croppedUri, {
          type: 'catch',
          entityId: postId || `temp_${Date.now()}`, // Temporary ID if post not saved yet
          aspectRatio: aspectRatios?.[i] || 'square'
        });
        
        if (result.success && result.url) {
          uploadedUrls.push(result.url);
        } else {
          // Fallback to data-uri if upload fails
          uploadedUrls.push(croppedUri);
        }
      }
      
      // Update state with R2 URLs
      if (editingImageIndex !== null) {
        // Re-editing existing image
        setCatchData(prev => {
          const newImages = [...prev.images];
          newImages[editingImageIndex] = uploadedUrls[0];
          return { ...prev, images: newImages };
        });
        
        // Update aspect ratio for edited image
        if (aspectRatios && aspectRatios[0]) {
          const newAspectRatios = { ...imageAspectRatios };
          // Remove old URI's aspect ratio
          const oldUri = catchData.images[editingImageIndex];
          if (oldUri) delete newAspectRatios[oldUri];
          // Add new URI's aspect ratio
          newAspectRatios[uploadedUrls[0]] = aspectRatios[0];
          setImageAspectRatios(newAspectRatios);
        }
        
        setEditingImageIndex(null);
        setEditingImageUri(null);
      } else {
        // Adding new images
        setCatchData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...uploadedUrls] 
        }));
        
        // Store aspect ratios for each image
        if (aspectRatios) {
          const newAspectRatios = { ...imageAspectRatios };
          uploadedUrls.forEach((url, index) => {
            if (aspectRatios[index]) {
              newAspectRatios[url] = aspectRatios[index];
            }
          });
          setImageAspectRatios(newAspectRatios);
        }
      }
      
    } catch (error) {
      // Show error to user
      setModalMessage(t('errors.imageUploadFailed'));
      setShowErrorModal(true);
    } finally {
      setIsUploadingImages(false);
      setShowCropModal(false);
      setSelectedImages([]);
    }
  };



  const handleRemoveImage = (index: number) => {
    const imageToRemove = catchData.images[index];
    setCatchData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Remove aspect ratio data for this image
    if (imageToRemove && imageAspectRatios[imageToRemove]) {
      const newAspectRatios = { ...imageAspectRatios };
      delete newAspectRatios[imageToRemove];
      setImageAspectRatios(newAspectRatios);
    }
  };

  const handleEditImage = (index: number) => {
    const imageUri = catchData.images[index];
    if (imageUri) {
      setEditingImageIndex(index);
      setEditingImageUri(imageUri);
      setSelectedImages([imageUri]); // Keep the single image in array for PhotoCropModal
      setShowCropModal(true);
    }
  };



  // Spot selection handlers
  // Removed unused handleSpotSelect

  // Removed unused handleMapLocationConfirm

  // Removed unused handleMapRegionDidChange





  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={editMode ? t('addCatch.editTitle') : t('addCatch.title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
          }
        ]}
        rightComponent={
          <Button
            variant="primary"
            size="sm"
            onPress={handleSaveCatch}
          >
            {editMode ? t('addCatch.update') : t('addCatch.save')}
          </Button>
        }
      />

      <ScreenContainer paddingVertical="none">
        <ScrollView contentContainerStyle={[styles.scrollContent, theme.listContentStyle]} showsVerticalScrollIndicator={false}>
        {/* Fotoğraflar - Basit Grid */}
        <View style={styles.section}>
          <SectionHeader title={t('addCatch.sections.photos')} />
          <View style={styles.photosGrid}>
            {catchData.images.map((image, index) => {
              const aspectRatio = imageAspectRatios[image];
              const aspectLabel = aspectRatio === 'square' ? '1:1' : 
                                  aspectRatio === 'portrait' ? '4:5' : 
                                  aspectRatio === 'landscape' ? '4:3' : null;
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.photoItem}
                  onPress={() => handleEditImage(index)}
                >
                  <Image 
                    source={{ uri: image }} 
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  {aspectLabel && (
                    <View style={styles.aspectRatioLabel}>
                      <Text style={styles.aspectRatioText}>{aspectLabel}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Icon name="x" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
            {catchData.images.length < 3 && (
              <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={handleImagePicker}
              >
                <Icon name="plus" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.addPhotoText}>{t('addCatch.sections.addPhoto')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Açıklama */}
        <View style={styles.section}>
          <SectionHeader 
            title={t('addCatch.sections.description')} 
            action={<Text style={styles.characterCount}>{catchData.notes.length}/280</Text>}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={catchData.notes}
            onChangeText={(text) => {
              if (text.length <= 280) {
                setCatchData(prev => ({ ...prev, notes: text }));
              }
            }}
            placeholder={t('addCatch.sections.descriptionPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={280}
            textAlignVertical="top"
          />
        </View>

        {/* Balık Türü */}
        <View style={styles.section}>
          <SectionHeader title={t('addCatch.sections.fishSpecies')} />
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowFishSpeciesModal(true)}
          >
            <Text style={[styles.dropdownText, !catchData.species && styles.placeholder]}>
              {catchData.species || t('addCatch.sections.fishSpeciesPlaceholder')}
            </Text>
            <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Released (Serbest Bırakıldı) Toggle */}
        <View style={[styles.section, styles.secretCatchSection]}>
          <View style={styles.secretCatchContainer}>
            <View style={styles.secretCatchLeft}>
              <Icon name="refresh-cw" size={28} color={catchData.released ? theme.colors.success : theme.colors.textSecondary} />
              <View style={styles.secretCatchTextContainer}>
                <Text style={styles.secretCatchTitle}>{t('addCatch.released.label')}</Text>
                <Text style={styles.secretCatchDescription}>{t('addCatch.released.description')}</Text>
              </View>
            </View>
            <Switch
              value={catchData.released}
              onValueChange={(value) => setCatchData(prev => ({ ...prev, released: value }))}
              trackColor={{ false: theme.colors.inputBorder, true: theme.colors.success }}
              thumbColor={catchData.released ? theme.colors.background : theme.colors.inputBackground}
              ios_backgroundColor={theme.colors.inputBorder}
              style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
            />
          </View>
        </View>

        {/* Ağırlık ve Boy */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: theme.spacing.sm, marginBottom: 0 }]}>
            <SectionHeader title={t('addCatch.sections.weight', { unit: getWeightUnit().symbol })} />
            <TextInput
              style={styles.input}
              value={catchData.weight}
              onChangeText={(text) => setCatchData(prev => ({ ...prev, weight: text }))}
              placeholder={t('addCatch.sections.weightPlaceholder', { example: `2.5 ${getWeightUnit().symbol}` })}
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: theme.spacing.sm, marginBottom: 0 }]}>
            <SectionHeader title={t('addCatch.sections.length', { unit: getLengthUnit().symbol })} />
            <TextInput
              style={styles.input}
              value={catchData.length}
              onChangeText={(text) => setCatchData(prev => ({ ...prev, length: text }))}
              placeholder={t('addCatch.sections.lengthPlaceholder', { example: `35 ${getLengthUnit().symbol}` })}
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Location Coordinates with Map */}
        <View style={styles.section}>
          <SectionHeader 
            title={t('addCatch.sections.spot')}
          />
          
          <LocationMapSelector
            initialLocation={
              catchData.latitude && catchData.longitude 
                ? {
                    latitude: parseFloat(catchData.latitude),
                    longitude: parseFloat(catchData.longitude),
                  }
                : undefined
            }
            onLocationChange={(location) => {
              setCatchData(prev => ({
                ...prev,
                latitude: location.latitude.toString(),
                longitude: location.longitude.toString(),
              }));
            }}
            showCoordinateInputs={true}
            showCrosshair={true}
            showConfirmButton={true}
            onConfirm={async () => {
              setLocationConfirmed(true);
              // Otomatik hava durumu çek - Fishivo Meteo API kullan
              if (catchData.latitude && catchData.longitude) {
                try {
                  // Fishivo Weather API'yi kullan
                  const { FISHIVO_WEATHER_API_KEY } = await import('@/config');
                  const lat = parseFloat(catchData.latitude);
                  const lng = parseFloat(catchData.longitude);
                  
                  // Fishivo API sadece tam sayı koordinatlar için veri veriyor, yuvarla
                  const roundedLat = Math.round(lat);
                  const roundedLng = Math.round(lng);
                  
                  // Fishivo Open-Meteo API'yi kullan (tam veri seti)
                  const fishivoUrl = `https://meteo.fishivo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code&daily=sunrise,sunset&hourly=wind_speed_10m,wind_direction_10m&timezone=auto`;
                  
                  const fishivoResponse = await fetch(fishivoUrl, {
                    headers: {
                      'X-API-Key': FISHIVO_WEATHER_API_KEY
                    }
                  });
                  
                  let windSpeed = 0;
                  let windDirection = 0;
                  let temp = 0;
                  let humidity = 0;
                  let pressure = 0;
                  let sunInfo = '-';
                  
                  if (fishivoResponse.ok) {
                    const fishivoData = await fishivoResponse.json();
                    
                    // Current weather data (bizim sync ettiğimiz veriler)
                    if (fishivoData?.current) {
                      temp = Math.round(fishivoData.current.temperature_2m || 0);
                      humidity = Math.round(fishivoData.current.relative_humidity_2m || 0);
                      pressure = Math.round(fishivoData.current.surface_pressure || 0);
                      windSpeed = Math.round(fishivoData.current.wind_speed_10m || 0);
                      windDirection = fishivoData.current.wind_direction_10m || 0;
                    }
                    
                    // Hourly wind data (fallback)
                    if (windSpeed === 0 && fishivoData?.hourly?.wind_speed_10m?.[0] !== null) {
                      windSpeed = Math.round(fishivoData.hourly.wind_speed_10m[0] || 0);
                      windDirection = fishivoData.hourly.wind_direction_10m?.[0] || 0;
                    }
                    
                    // Daily sunrise/sunset
                    if (fishivoData.daily?.sunrise?.[0] && fishivoData.daily?.sunset?.[0]) {
                      const sunrise = new Date(fishivoData.daily.sunrise[0]).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                      const sunset = new Date(fishivoData.daily.sunset[0]).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                      sunInfo = `↑${sunrise} ↓${sunset}`;
                    }
                  }
                  
                  // Ay evresi hesaplama (basit)
                  const getMoonPhase = () => {
                    const date = new Date();
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    
                    let r = year % 100;
                    r = r % 19;
                    if (r > 9) r = r - 19;
                    r = ((r * 11) % 30) + month + day;
                    if (month < 3) r = r + 2;
                    r = r % 30;
                    
                    if (r === 0) return 'Yeni Ay 🌑';
                    else if (r < 8) return 'Hilal 🌒';
                    else if (r < 15) return 'İlk Dördün 🌓';
                    else if (r < 22) return 'Dolunay 🌕';
                    else return 'Son Dördün 🌗';
                  };
                  
                  // Fishivo API'den veri geldi mi kontrol et
                  if (temp > 0 || humidity > 0 || windSpeed > 0) {
                    // Fishivo API başarılı, tüm verileri kullan
                    const weatherDescription = `${temp}°C, Nem: ${humidity}%, Rüzgar: ${windSpeed} km/h`;
                    
                    setCatchData(prev => ({
                      ...prev,
                      weather: weatherDescription,
                      weatherTemperature: `${temp}°C`,
                      weatherHumidity: `${humidity}%`,
                      weatherWind: `${windSpeed} km/h`,
                      weatherPressure: pressure ? `${pressure} hPa` : '-',
                      weatherSun: sunInfo,
                      weatherMoon: getMoonPhase()
                    }));
                  } else {
                    // Fishivo API'den veri gelmedi, Open-Meteo fallback
                    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code&daily=sunrise,sunset&timezone=auto`;
                    const response = await fetch(openMeteoUrl);
                    
                    if (response.ok) {
                      const weatherData = await response.json();
                      
                      if (weatherData?.current) {
                        const fallbackTemp = Math.round(weatherData.current.temperature_2m || 0);
                        const fallbackHumidity = Math.round(weatherData.current.relative_humidity_2m || 0);
                        const fallbackWindSpeed = Math.round(weatherData.current.wind_speed_10m || 0);
                        const fallbackPressure = Math.round(weatherData.current.surface_pressure || 0);
                        
                        // Güneş doğuş/batış zamanları
                        if (weatherData.daily?.sunrise?.[0] && weatherData.daily?.sunset?.[0]) {
                          const sunrise = new Date(weatherData.daily.sunrise[0]).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                          const sunset = new Date(weatherData.daily.sunset[0]).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                          sunInfo = `↑${sunrise} ↓${sunset}`;
                        }
                        
                        const weatherDescription = `${fallbackTemp}°C, Nem: ${fallbackHumidity}%, Rüzgar: ${fallbackWindSpeed} km/h`;
                        
                        setCatchData(prev => ({
                          ...prev,
                          weather: weatherDescription,
                          weatherTemperature: `${fallbackTemp}°C`,
                          weatherHumidity: `${fallbackHumidity}%`,
                          weatherWind: `${fallbackWindSpeed} km/h`,
                          weatherPressure: fallbackPressure ? `${fallbackPressure} hPa` : '-',
                          weatherSun: sunInfo,
                          weatherMoon: getMoonPhase()
                        }));
                      }
                    }
                  }
                } catch (error) {
                  // Sessizce devam et, hata mesajı gösterme
                }
              }
            }}
            isEditMode={editMode}
          />
          
          {/* Location Instructions */}
          <View style={styles.mapLocationOverlay}>
            <Text style={[styles.locationName, locationConfirmed && styles.locationConfirmed]}>
              {locationConfirmed ? (
                selectedSpot?.name || catchData.location || t('map.locationSelected')
              ) : (
                <>
                  {t('map.dragMapInstruction')}
                  {'\n'}
                  <Text style={styles.locationInstructionSub}>
                    {t('map.confirmLocation')}
                  </Text>
                </>
              )}
            </Text>
          </View>
        </View>

        {/* Tarih ve Saat */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: theme.spacing.sm, marginBottom: 0 }]}>
            <SectionHeader title={t('addCatch.sections.date')} />
            <TextInput
              style={styles.input}
              value={catchData.date}
              onChangeText={(text) => setCatchData(prev => ({ ...prev, date: text }))}
              placeholder={t('addCatch.sections.datePlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: theme.spacing.sm, marginBottom: 0 }]}>
            <SectionHeader title={t('addCatch.sections.time')} />
            <TextInput
              style={styles.input}
              value={catchData.time}
              onChangeText={(text) => setCatchData(prev => ({ ...prev, time: text }))}
              placeholder={t('addCatch.sections.timePlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Ekipman */}
        <View style={styles.section}>
          <SectionHeader 
            title={t('addCatch.sections.equipment')}
            action={
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  setModalMessage(t('addCatch.success.comingSoon', { feature: t('addCatch.sections.equipment') }));
                  setShowInfoModal(true);
                }}
              >
                <Icon name="plus" size={16} color={theme.colors.primary} />
                <Text style={styles.addButtonText}>{t('addCatch.sections.equipmentAdd')}</Text>
              </TouchableOpacity>
            }
          />
          {catchData.equipment.length > 0 ? (
            <View style={styles.equipmentGrid}>
              {catchData.equipment.map((item, index) => (
                <View key={index} style={styles.equipmentCard}>
                  <View style={styles.equipmentIcon}>
                    <Icon name="package" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.equipmentContent}>
                    <Text style={styles.equipmentName} numberOfLines={1}>{item}</Text>
                    <Text style={styles.equipmentCategory}>{t('addCatch.sections.equipmentCategory')}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeEquipmentButton}
                    onPress={() => setCatchData(prev => ({ 
                      ...prev, 
                      equipment: prev.equipment.filter((_, i) => i !== index) 
                    }))}
                  >
                    <Icon name="x" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyEquipmentContainer}>
              <Icon name="backpack" size={32} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>{t('addCatch.sections.equipmentEmpty')}</Text>
              <Text style={styles.emptySubtext}>{t('addCatch.sections.equipmentEmptySubtext')}</Text>
            </View>
          )}
        </View>

        {/* Teknik */}
        <View style={styles.section}>
          <SectionHeader title={t('addCatch.sections.technique')} />
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowTechniqueModal(true)}
          >
            <Text style={[styles.dropdownText, !catchData.technique && styles.placeholder]}>
              {catchData.technique || t('addCatch.sections.techniquePlaceholder')}
            </Text>
            <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hava Durumu */}
        <View style={styles.section}>
          <SectionHeader title={t('addCatch.sections.weather')} />
          {catchData.weatherTemperature ? (
            <WeatherGrid
              temperature={catchData.weatherTemperature || '-'}
              wind={catchData.weatherWind || '-'}
              pressure={catchData.weatherPressure || '-'}
              humidity={catchData.weatherHumidity}
              sunDirection="-"
              moonPhase="-"
            />
          ) : (
            <View style={styles.emptyWeatherContainer}>
              <Icon name="cloud-off" size={32} color={theme.colors.textSecondary} />
              <Text style={styles.emptyWeatherText}>{t('addCatch.sections.weatherNotSet')}</Text>
              <Text style={styles.emptyWeatherSubtext}>{t('addCatch.sections.weatherAutoAdd')}</Text>
            </View>
          )}
        </View>

        {/* Private Note Section */}
        <View style={styles.section}>
          <SectionHeader title={t('addCatch.sections.privateNote')} icon="lock" />
          <View style={styles.privateNoteInfo}>
            <Icon name="shield-check" size={16} color={theme.colors.primary} />
            <Text style={styles.privateNoteInfoText}>
              {t('addCatch.sections.privateNoteInfo')}
            </Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea, { minHeight: 80 }]}
            value={catchData.privateNote}
            onChangeText={(text) => {
              if (text.length <= 500) {
                setCatchData(prev => ({ ...prev, privateNote: text }));
              }
            }}
            placeholder={t('addCatch.sections.privateNotePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {catchData.privateNote.length}/500
          </Text>
        </View>

        {/* Gizli Av Toggle */}
        <View style={[styles.section, styles.secretCatchSection]}>
          <View style={styles.secretCatchContainer}>
            <View style={styles.secretCatchLeft}>
              <Icon name="lock" size={28} color={catchData.isSecret ? theme.colors.primary : theme.colors.textSecondary} />
              <View style={styles.secretCatchTextContainer}>
                <Text style={styles.secretCatchTitle}>{t('addCatch.secretCatch.label')}</Text>
                <Text style={styles.secretCatchDescription}>{t('addCatch.secretCatch.description')}</Text>
              </View>
            </View>
            <Switch
              value={catchData.isSecret}
              onValueChange={(value) => setCatchData(prev => ({ ...prev, isSecret: value }))}
              trackColor={{ false: theme.colors.inputBorder, true: theme.colors.primary }}
              thumbColor={catchData.isSecret ? theme.colors.background : theme.colors.inputBackground}
              ios_backgroundColor={theme.colors.inputBorder}
              style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
            />
          </View>
        </View>

        </ScrollView>
      </ScreenContainer>

      {/* Modals */}
      
      {/* Photo Crop Modal */}
      {selectedImages.length > 0 && (
        <PhotoCropModal
          visible={showCropModal}
          images={selectedImages} // Always pass the images array
          onClose={() => {
            setShowCropModal(false);
            setSelectedImages([]);
            setEditingImageIndex(null);
            setEditingImageUri(null);
          }}
          onCropAll={handleCropAll} // Always use onCropAll for consistency
          defaultAspectRatio={editingImageIndex !== null && editingImageUri && imageAspectRatios[editingImageUri] ? 
            imageAspectRatios[editingImageUri] : 'square'
          }
        />
      )}

      <FishSpeciesSelectorModal
        visible={showFishSpeciesModal}
        onClose={() => setShowFishSpeciesModal(false)}
        onSelect={(species, waterType, speciesId) => setCatchData(prev => ({ 
          ...prev, 
          species, 
          waterType,
          speciesId 
        }))}
        selectedSpecies={catchData.species}
        selectedSpeciesId={catchData.speciesId}
      />

      <FishingTechniqueSelectorModal
        visible={showTechniqueModal}
        onClose={() => setShowTechniqueModal(false)}
        onSelect={(technique, techniqueId) => {
          setCatchData(prev => ({ 
            ...prev, 
            technique,
            techniqueId
          }));
        }}
        selectedTechnique={catchData.technique}
        selectedTechniqueId={catchData.techniqueId}
      />


      {/* Spot Selection Modal - TODO: SpotSelectorModal component olarak yeniden yazılacak */}


      <FishivoModal
        visible={showSuccessModal}
        title={t('addCatch.success.info')}
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
        onClose={() => setShowErrorModal(false)}
        preset="error"
        title={t('common.error')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowErrorModal(false)
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

      {/* Upload Progress Modal */}
      <FishivoModal
        visible={isUploadingImages}
        onClose={() => {}} // Prevent closing while uploading
        preset="loading"
        title={t('addCatch.uploadingImages')}
        description={t('addCatch.pleaseWait')}
      />

      {/* Smart Suggestion Modal */}
      <FishivoModal
        visible={showSmartSuggestions && smartSuggestions.length > 0}
        onClose={() => setShowSmartSuggestions(false)}
        preset="info"
        title={t('addCatch.smartSuggestions.title')}
        description={t('addCatch.smartSuggestions.description')}
      >
        <ScrollView style={{ maxHeight: 400 }}>
          {smartSuggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionIcon}>
                  <Icon 
                    name={suggestion.type === 'date' ? 'calendar' : 
                          suggestion.type === 'location' ? 'map-pin' : 'cloud'}
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle}>
                    {suggestion.type === 'date' ? t('addCatch.smartSuggestions.date') :
                     suggestion.type === 'location' ? t('addCatch.smartSuggestions.location') :
                     t('addCatch.smartSuggestions.weather')}
                  </Text>
                  <Text style={styles.suggestionValue}>{suggestion.displayValue}</Text>
                  {suggestion.confidence && (
                    <Text style={styles.suggestionConfidence}>
                      {t('addCatch.smartSuggestions.confidence')}: {Math.round(suggestion.confidence * 100)}%
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => acceptSuggestion(suggestion)}
                >
                  <Text style={styles.acceptButtonText}>
                    {t('addCatch.smartSuggestions.accept')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {smartSuggestions.length > 1 && (
            <TouchableOpacity
              style={styles.acceptAllButton}
              onPress={acceptAllSuggestions}
            >
              <Text style={styles.acceptAllButtonText}>
                {t('addCatch.smartSuggestions.acceptAll')}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </FishivoModal>

    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  scrollContent: {
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  photoItem: {
    width: (Dimensions.get('window').width - theme.layout.screenHorizontalPadding * 2 - theme.spacing.sm * 2) / 3,
    height: (Dimensions.get('window').width - theme.layout.screenHorizontalPadding * 2 - theme.spacing.sm * 2) / 3,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.surface,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
  },
  addPhotoText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  photoCount: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  photosScrollContainer: {
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aspectRatioLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aspectRatioText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addPhotoButton: {
    width: (Dimensions.get('window').width - theme.layout.screenHorizontalPadding * 2 - theme.spacing.sm * 2) / 3,
    height: (Dimensions.get('window').width - theme.layout.screenHorizontalPadding * 2 - theme.spacing.sm * 2) / 3,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  dropdownText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  placeholder: {
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  locationButton: {
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
  locationInput: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  equipmentCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    position: 'relative',
    minHeight: 80,
  },
  equipmentIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  equipmentContent: {
    flex: 1,
  },
  equipmentName: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: 2,
  },
  equipmentCategory: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  removeEquipmentButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${theme.colors.error}dd`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEquipmentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    height: 32,
    gap: 4,
  },
  addButtonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
  },
  mapLocationOverlay: {
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  locationName: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  locationInstructionSub: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.regular,
    marginTop: 2,
  },
  locationConfirmed: {
    color: theme.colors.success,
    fontWeight: theme.typography.semibold,
  },
  textArea: {
    height: 100,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techniqueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedTechniqueItem: {
    backgroundColor: theme.colors.primary + '10',
  },
  techniqueContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  techniqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  techniqueName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  selectedTechniqueName: {
    color: theme.colors.primary,
  },
  techniqueDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  techniqueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  techniqueSeason: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secretCatchSection: {
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  privateNoteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  privateNoteInfoText: {
    fontSize: 12,
    color: theme.colors.primary,
    flex: 1,
  },
  secretCatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secretCatchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  secretCatchTextContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  secretCatchTitle: {
    fontSize: theme.typography.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  secretCatchDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  // Smart Suggestions Modal Styles
  suggestionCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}20`,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: theme.typography.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  suggestionValue: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    marginBottom: 2,
  },
  suggestionConfidence: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  acceptButtonText: {
    fontSize: theme.typography.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  acceptAllButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  acceptAllButtonText: {
    fontSize: theme.typography.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyWeatherContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyWeatherText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  emptyWeatherSubtext: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});

export default AddCatchScreen;