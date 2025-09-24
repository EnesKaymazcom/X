import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Icon,
  Button,
  LocationCard,
  MapComponent,
  ScreenContainer,
  AppHeader,
  FishivoModal,
  PhotoCropModal,
  SectionHeader,
  ProBadge,
  SpotPhotoUploadSection,
  type AspectRatioType
} from '@/components/ui';
import { LocationMapSelector } from '@/components/ui/LocationMapSelector';
import { useLocation } from '@/hooks/useLocation';
import { createNativeApiService } from '@fishivo/api/services/native';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import type { FishingTechnique } from '@fishivo/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { uploadImage } from '@/utils/unified-upload-service';
import { useUnits } from '@fishivo/hooks';
import { launchImageLibrary } from 'react-native-image-picker';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';


interface AddSpotScreenProps {
  navigation: any;
  route?: any;
}


interface SpotData {
  name: string;
  description: string;
  waterType: 'freshwater' | 'saltwater' | '';
  spotType: 'shore' | 'boat' | 'pier' | '';
  depthMin: string;
  depthMax: string;
  latitude: string;
  longitude: string;
  bottomType: string[];
  facilities: string[];
  image: string; // Single image with 4:3 aspect ratio
  location?: string;
  isPrivate: boolean;
}

const AddSpotScreen: React.FC<AddSpotScreenProps> = ({ navigation, route }) => {
  const { getCurrentLocation, requestPermission } = useLocation();
  const { t, locale } = useTranslation();
  const { theme, isDark } = useTheme();
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
  const spotId = route?.params?.spotId;
  const existingSpotData = route?.params?.spotData;
  const [spotData, setSpotData] = useState<SpotData>({
    name: editMode && existingSpotData ? existingSpotData.name || '' : '',
    description: editMode && existingSpotData ? existingSpotData.description || '' : '',
    waterType: editMode && existingSpotData ? existingSpotData.water_type || '' : '',
    spotType: editMode && existingSpotData ? existingSpotData.spot_type || '' : '',
    depthMin: editMode && existingSpotData ? existingSpotData.depth_min?.toString() || '' : '',
    depthMax: editMode && existingSpotData ? existingSpotData.depth_max?.toString() || '' : '',
    latitude: editMode && existingSpotData?.location ? String(existingSpotData.location.latitude) : '',
    longitude: editMode && existingSpotData?.location ? String(existingSpotData.location.longitude) : '',
    bottomType: editMode && existingSpotData?.bottom_type || [],
    facilities: editMode && existingSpotData?.facilities || [],
    image: editMode && existingSpotData?.images?.length > 0 ? existingSpotData.images[0] : '',
    location: editMode && existingSpotData?.location?.address || '',
    isPrivate: editMode && existingSpotData?.is_private || false,
  });

  const [showBottomTypeModal, setShowBottomTypeModal] = useState(false);
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPrivatePremiumModal, setShowPrivatePremiumModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);

  // formatLocationString fonksiyonu
  const formatLocationString = (location: { latitude: number, longitude: number }) => {
    return `${location.latitude.toFixed(6)}�${t('map.north')}, ${location.longitude.toFixed(6)}�${t('map.east')}`;
  };

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getNativeSupabaseClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        // Check if user is Pro (you may need to fetch this from user profile)
        // For now, we'll assume all users can create spots but need Pro for private spots
        setIsPro(false); // Set based on actual user data
      }
    };
    fetchUser();
  }, []);

  // Konum izni ve ilk konum al
  useEffect(() => {
    const initializeLocation = async () => {
      // Edit mode'da ve koordinat varsa, mevcut koordinatlar1 kullan
      if (editMode && existingSpotData?.location) {
        setSpotData(prev => ({
          ...prev,
          latitude: String(existingSpotData.location.latitude),
          longitude: String(existingSpotData.location.longitude)
        }));
      } else {
        // Yeni spot i�in kullan1c1n1n ger�ek konumunu al
        await requestPermission();
        const location = await getCurrentLocation();
        if (location) {
          setSpotData(prev => ({
            ...prev,
            latitude: String(location.latitude),
            longitude: String(location.longitude)
          }));
        }
      }
    };
    
    initializeLocation();
  }, [editMode, existingSpotData]);
  
  // Pro üyelik kontrolü - Şimdilik sadece private spot için kontrol ediyoruz
  // useEffect(() => {
  //   if (!editMode && user && !user.is_pro) {
  //     setShowPremiumModal(true);
  //   }
  // }, [user, editMode]);

  // Spot type options
  const spotTypeOptions = useMemo(() => [
    { value: 'shore', label: t('spot.types.shore'), icon: 'anchor' },
    { value: 'boat', label: t('spot.types.boat'), icon: 'anchor' },
    { value: 'pier', label: t('spot.types.pier'), icon: 'anchor' },
  ], [t]);

  // Bottom type options
  const bottomTypeOptions = useMemo(() => [
    { value: 'unknown', label: t('spot.bottom.unknown') },
    { value: 'sandy', label: t('spot.bottom.sandy') },
    { value: 'rocky', label: t('spot.bottom.rocky') },
    { value: 'muddy', label: t('spot.bottom.muddy') },
    { value: 'gravel', label: t('spot.bottom.gravel') },
    { value: 'weedy', label: t('spot.bottom.weedy') },
  ], [t]);

  // Facilities options
  const facilitiesOptions = useMemo(() => [
    { value: 'parking', label: t('spot.facilities.parking'), icon: 'car' },
    { value: 'toilet', label: t('spot.facilities.toilet'), icon: 'droplets' },
    { value: 'restaurant', label: t('spot.facilities.restaurant'), icon: 'utensils' },
    { value: 'camping', label: t('spot.facilities.camping'), icon: 'trees' },
    { value: 'boat_ramp', label: t('spot.facilities.boatRamp'), icon: 'anchor' },
  ], [t]);

  const handleSaveSpot = async () => {
    // Validation - Sadece spot ad1 zorunlu
    if (!spotData.name) {
      setModalMessage(t('addSpot.validation.nameRequired'));
      setShowErrorModal(true);
      return;
    }

    if (!spotData.waterType) {
      setModalMessage(t('addSpot.validation.waterTypeRequired'));
      setShowErrorModal(true);
      return;
    }

    // Konum kontrolü - tik'e basılmış olmalı
    if (!locationConfirmed || !spotData.latitude || !spotData.longitude) {
      setModalMessage(t('addSpot.validation.locationRequired'));
      setShowErrorModal(true);
      return;
    }

    try {
      // **B0R0M D�N�^�MLER0 - Kullan1c1 biriminden backend base unit'e �evir**
      const depthMinInM = spotData.depthMin ? convertFromUserUnit(parseFloat(spotData.depthMin), 'depth') : undefined;
      const depthMaxInM = spotData.depthMax ? convertFromUserUnit(parseFloat(spotData.depthMax), 'depth') : undefined;
      
      // Backend API'ye gönderilecek veri
      const createSpotData = {
        name: spotData.name,
        description: spotData.description || undefined,
        latitude: parseFloat(spotData.latitude) || 0,
        longitude: parseFloat(spotData.longitude) || 0,
        waterType: spotData.waterType as 'freshwater' | 'saltwater',
        isPublic: !spotData.isPrivate, // Use the isPrivate toggle instead of accessType
        images: spotData.image ? [spotData.image] : [],
        depth: depthMinInM, // Use min depth as primary depth
        address: spotData.location,
      };

      // Get current user
      const supabase = getNativeSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setModalMessage(t('errors.authRequired'));
        setShowErrorModal(true);
        return;
      }
      
      // API servisi olu_tur
      const apiService = createNativeApiService();
      
      // Edit mode veya yeni spot olu_turma
      let result;
      if (editMode && spotId) {
        // Update existing spot
        result = await apiService.spots.updateSpot(spotId, createSpotData);
      } else {
        // Create new spot
        result = await apiService.spots.createSpot(user.id, createSpotData);
      }
      
      if (result) {
        setSuccessMessage(editMode ? t('addSpot.success.updated') : t('addSpot.success.saved'));
        setShowSuccessModal(true);
        
        // 2 saniye sonra �nceki sayfaya d�n
        setTimeout(() => {
          setShowSuccessModal(false);
          
          // Edit mode'da g�ncellenmi_ spot verisini g�nder
          if (editMode && spotId) {
            navigation.navigate('MainTabs', {
              screen: 'Map',
              params: {
                updatedSpot: {
                  id: spotId,
                  name: spotData.name,
                  description: spotData.description,
                  images: spotData.image ? [spotData.image] : [],
                  waterType: spotData.waterType,
                  latitude: spotData.latitude ? parseFloat(spotData.latitude) : undefined,
                  longitude: spotData.longitude ? parseFloat(spotData.longitude) : undefined
                }
              }
            });
          } else {
            navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs');
          }
        }, 2000);
      } else {
        throw new Error(editMode ? 'Spot g�ncellenemedi' : 'Spot olu_turulamad1');
      }
      
    } catch (error) {
      // Spot kaydedilirken hata
      setModalMessage(t('addSpot.errors.saveFailed'));
      setShowErrorModal(true);
    }
  };

  const handleImagePicker = async () => {
    try {
      launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.8,
        selectionLimit: 1
      }, (response) => {
        if (!response.didCancel && response.assets && response.assets.length > 0) {
          const imageUri = response.assets[0].uri!;
          setSelectedImage(imageUri);
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

  const handleCrop = async (croppedUris: string[]) => {
    setIsUploadingImage(true);
    
    try {
      const croppedUri = croppedUris[0];
      
      // Upload to R2 using unified-upload-service
      const result = await uploadImage(croppedUri, {
        type: 'spot',
        entityId: spotId || `temp_${Date.now()}`,
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85
      });
      
      const uploadedUrl = result.success && result.url ? result.url : croppedUri;
      
      // Update state with single image
      setSpotData(prev => ({ 
        ...prev, 
        image: uploadedUrl
      }));
      
    } catch (error) {
      setModalMessage(t('errors.imageUploadFailed'));
      setShowErrorModal(true);
    } finally {
      setIsUploadingImage(false);
      setShowCropModal(false);
      setSelectedImage('');
    }
  };



  const handleRemoveImage = () => {
    setSpotData(prev => ({
      ...prev,
      image: ''
    }));
  };

  const handleEditImage = () => {
    if (spotData.image) {
      setSelectedImage(spotData.image);
      setShowCropModal(true);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={editMode ? t('addSpot.editTitle') : t('addSpot.title')}
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
            onPress={handleSaveSpot}
          >
            {editMode ? t('addSpot.update') : t('addSpot.save')}
          </Button>
        }
      />

      <ScreenContainer paddingVertical="none">
        <ScrollView contentContainerStyle={[styles.scrollContent, theme.listContentStyle]} showsVerticalScrollIndicator={false}>

        {/* Fotoğraf - Modern Upload Section */}
        <SpotPhotoUploadSection
          image={spotData.image}
          isUploading={isUploadingImage}
          onImagePicker={handleImagePicker}
          onRemoveImage={handleRemoveImage}
          onEditImage={handleEditImage}
        />

        {/* Spot Adı */}
        <View style={styles.section}>
          <SectionHeader title={t('addSpot.sections.spotName')} required />
          <TextInput
            style={styles.input}
            value={spotData.name}
            onChangeText={(text) => setSpotData(prev => ({ ...prev, name: text }))}
            placeholder={t('addSpot.sections.spotNamePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={100}
          />
        </View>

        {/* Açıklama */}
        <View style={styles.section}>
          <SectionHeader 
            title={t('addSpot.sections.description')} 
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={spotData.description}
            onChangeText={(text) => setSpotData(prev => ({ ...prev, description: text }))}
            placeholder={t('addSpot.sections.descriptionPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location Coordinates with Map */}
        <View style={styles.section}>
          <SectionHeader 
            title={t('addSpot.sections.location')}
            required
          />
          
          <LocationMapSelector
            initialLocation={
              spotData.latitude && spotData.longitude 
                ? {
                    latitude: parseFloat(spotData.latitude),
                    longitude: parseFloat(spotData.longitude),
                  }
                : undefined
            }
            onLocationChange={(location) => {
              setSpotData(prev => ({
                ...prev,
                latitude: location.latitude.toString(),
                longitude: location.longitude.toString(),
              }));
            }}
            showCoordinateInputs={true}
            showCrosshair={true}
            showConfirmButton={true}
            onConfirm={() => setLocationConfirmed(true)}
            markerType="spot"
          />
          
          {/* Location Instructions */}
          <View style={styles.mapLocationOverlay}>
            <Text style={[styles.locationName, locationConfirmed && styles.locationConfirmed]}>
              {locationConfirmed ? (
                spotData.location || t('map.locationSelected')
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

        {/* Su Tipi */}
        <View style={styles.section}>
          <SectionHeader title={t('addSpot.sections.waterType')} />
          <View style={styles.selectionRow}>
            <TouchableOpacity
              style={[
                styles.selectionButton,
                spotData.waterType === 'freshwater' && styles.selectedButton
              ]}
              onPress={() => setSpotData(prev => ({ 
                ...prev, 
                waterType: prev.waterType === 'freshwater' ? '' : 'freshwater' 
              }))}
            >
              <Icon 
                name="droplets" 
                size={20} 
                color={spotData.waterType === 'freshwater' ? '#FFFFFF' : theme.colors.primary} 
              />
              <Text style={[
                styles.selectionButtonText,
                spotData.waterType === 'freshwater' && styles.selectedButtonText
              ]}>
                {t('addSpot.waterType.freshwater')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.selectionButton,
                spotData.waterType === 'saltwater' && styles.selectedButton
              ]}
              onPress={() => setSpotData(prev => ({ 
                ...prev, 
                waterType: prev.waterType === 'saltwater' ? '' : 'saltwater' 
              }))}
            >
              <Icon 
                name="waves" 
                size={20} 
                color={spotData.waterType === 'saltwater' ? '#FFFFFF' : theme.colors.primary} 
              />
              <Text style={[
                styles.selectionButtonText,
                spotData.waterType === 'saltwater' && styles.selectedButtonText
              ]}>
                {t('addSpot.waterType.saltwater')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spot Tipi */}
        <View style={styles.section}>
          <SectionHeader title={t('addSpot.sections.spotType')} />
          <View style={styles.selectionRow}>
            {spotTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectionButton,
                  spotData.spotType === option.value && styles.selectedButton
                ]}
                onPress={() => setSpotData(prev => ({ 
                  ...prev, 
                  spotType: prev.spotType === option.value ? '' : option.value 
                }))}
              >
                <Icon 
                  name={option.icon} 
                  size={18} 
                  color={spotData.spotType === option.value ? '#FFFFFF' : theme.colors.primary} 
                />
                <Text style={[
                  styles.selectionButtonTextSmall,
                  spotData.spotType === option.value && styles.selectedButtonText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Derinlik Min ve Max */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: theme.spacing.sm, marginBottom: 0 }]}>
            <SectionHeader title={t('addSpot.sections.depthMin', { unit: getDepthUnit().symbol })} />
            <TextInput
              style={styles.input}
              value={spotData.depthMin}
              onChangeText={(text) => setSpotData(prev => ({ ...prev, depthMin: text }))}
              placeholder={t('addSpot.sections.depthMinPlaceholder', { example: `5 ${getDepthUnit().symbol}` })}
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: theme.spacing.sm, marginBottom: 0 }]}>
            <SectionHeader title={t('addSpot.sections.depthMax', { unit: getDepthUnit().symbol })} />
            <TextInput
              style={styles.input}
              value={spotData.depthMax}
              onChangeText={(text) => setSpotData(prev => ({ ...prev, depthMax: text }))}
              placeholder={t('addSpot.sections.depthMaxPlaceholder', { example: `20 ${getDepthUnit().symbol}` })}
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Zemin Tipi */}
        <View style={styles.section}>
          <SectionHeader title={t('addSpot.sections.bottomType')} />
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowBottomTypeModal(true)}
          >
            <Text style={[styles.dropdownText, spotData.bottomType.length === 0 && styles.placeholder]}>
              {spotData.bottomType.length > 0 ? 
                spotData.bottomType.map(type => 
                  bottomTypeOptions.find(opt => opt.value === type)?.label
                ).join(', ') : 
                t('addSpot.sections.bottomTypePlaceholder')}
            </Text>
            <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Tesisler */}
        <View style={styles.section}>
          <SectionHeader title={t('addSpot.sections.facilities')} />
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowFacilitiesModal(true)}
          >
            <Text style={[styles.dropdownText, spotData.facilities.length === 0 && styles.placeholder]}>
              {spotData.facilities.length > 0 ? 
                spotData.facilities.map(facility => 
                  facilitiesOptions.find(opt => opt.value === facility)?.label
                ).join(', ') : 
                t('addSpot.sections.facilitiesPlaceholder')}
            </Text>
            <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>


        {/* Gizli Spot */}
        <View style={styles.section}>
          <SectionHeader 
            title={t('addSpot.sections.privateSpot')} 
            rightElement={<ProBadge variant="badge" size="sm" />}
          />
          <TouchableOpacity
            style={styles.privateSpotToggle}
            onPress={() => {
              if (!isPro) {
                setModalMessage(t('addSpot.errors.proRequired'));
                setShowInfoModal(true);
                return;
              }
              setSpotData(prev => ({ ...prev, isPrivate: !prev.isPrivate }));
            }}
          >
            <View style={styles.privateSpotContent}>
              <Icon name="lock" size={20} color={theme.colors.textSecondary} />
              <View style={styles.privateSpotTextContainer}>
                <Text style={styles.privateSpotTitle}>
                  {t('addSpot.sections.privateSpotTitle')}
                </Text>
                <Text style={styles.privateSpotDescription}>
                  {t('addSpot.sections.privateSpotDescription')}
                </Text>
              </View>
            </View>
            <View style={[
              styles.switchContainer,
              spotData.isPrivate && styles.switchContainerActive
            ]}>
              <View style={[
                styles.switchThumb,
                spotData.isPrivate && styles.switchThumbActive
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Onay Bilgilendirmesi - Sadece public spotlar için */}
        {!spotData.isPrivate && (
          <View style={styles.infoBox}>
            <Icon name="info" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              {t('addSpot.sections.approvalInfo')}
            </Text>
          </View>
        )}

        </ScrollView>
      </ScreenContainer>

      {/* Modals */}
      
      {/* Photo Crop Modal */}
      {selectedImage && (
        <PhotoCropModal
          visible={showCropModal}
          images={[selectedImage]}
          onClose={() => {
            setShowCropModal(false);
            setSelectedImage('');
          }}
          onCropAll={handleCrop}
          defaultAspectRatio="landscape"
          forSpot={true}
        />
      )}




      {/* Bottom Type Modal */}
      <FishivoModal
        visible={showBottomTypeModal}
        onClose={() => setShowBottomTypeModal(false)}
        preset="selector"
        title={t('addSpot.sections.selectBottomType')}
      >
        <ScrollView style={{ maxHeight: 400 }}>
          {bottomTypeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.techniqueItem, spotData.bottomType.includes(option.value) && styles.selectedTechniqueItem]}
              onPress={() => {
                setSpotData(prev => {
                  // Eğer "Bilinmiyor" seçiliyse
                  if (option.value === 'unknown') {
                    // Zaten seçiliyse kaldır, değilse sadece "Bilinmiyor" seç
                    return { 
                      ...prev, 
                      bottomType: prev.bottomType.includes('unknown') ? [] : ['unknown'] 
                    };
                  }
                  
                  // Diğer seçeneklerden biri seçiliyse
                  // Önce "Bilinmiyor"u kaldır
                  const filteredTypes = prev.bottomType.filter(type => type !== 'unknown');
                  
                  // Seçilen değer varsa kaldır, yoksa ekle
                  const newBottomTypes = filteredTypes.includes(option.value)
                    ? filteredTypes.filter(type => type !== option.value)
                    : [...filteredTypes, option.value];
                    
                  return { ...prev, bottomType: newBottomTypes };
                });
              }}
            >
              <View style={styles.techniqueContent}>
                <View style={styles.techniqueHeader}>
                  <Text style={[styles.techniqueName, spotData.bottomType.includes(option.value) && styles.selectedTechniqueName]}>
                    {option.label}
                  </Text>
                </View>
              </View>
              {spotData.bottomType.includes(option.value) && (
                <Icon name="check" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </FishivoModal>

      {/* Facilities Modal */}
      <FishivoModal
        visible={showFacilitiesModal}
        onClose={() => setShowFacilitiesModal(false)}
        preset="selector"
        title={t('addSpot.sections.selectFacilities')}
      >
        <ScrollView style={{ maxHeight: 400 }}>
          {facilitiesOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.techniqueItem, spotData.facilities.includes(option.value) && styles.selectedTechniqueItem]}
              onPress={() => {
                setSpotData(prev => {
                  const newFacilities = prev.facilities.includes(option.value)
                    ? prev.facilities.filter(facility => facility !== option.value)
                    : [...prev.facilities, option.value];
                  return { ...prev, facilities: newFacilities };
                });
              }}
            >
              <View style={styles.techniqueContent}>
                <View style={styles.techniqueHeader}>
                  <Icon name={option.icon as any} size={20} color={theme.colors.primary} />
                  <Text style={[styles.techniqueName, spotData.facilities.includes(option.value) && styles.selectedTechniqueName]}>
                    {option.label}
                  </Text>
                </View>
              </View>
              {spotData.facilities.includes(option.value) && (
                <Icon name="check" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </FishivoModal>


      <FishivoModal
        visible={showSuccessModal}
        title={t('addSpot.success.info')}
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
        visible={isUploadingImage}
        onClose={() => {}}
        title={t('addSpot.uploadingImage')}
        description={t('addSpot.pleaseWait')}
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
  selectionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  selectionColumn: {
    gap: theme.spacing.sm,
  },
  selectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  selectionButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  selectedButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  selectionButtonText: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#FFFFFF',
  },
  selectionButtonTextSmall: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: '500',
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
  privateSpotToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  privateSpotContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  privateSpotTextContainer: {
    flex: 1,
  },
  privateSpotTitle: {
    fontSize: theme.typography.base,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  privateSpotDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  switchContainer: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    padding: 2,
  },
  switchContainerActive: {
    backgroundColor: theme.colors.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    lineHeight: 18,
  },
});

export default AddSpotScreen;