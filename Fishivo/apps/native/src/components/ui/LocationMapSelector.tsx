import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
// Permission handling moved to LocationStore - imports removed
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { UniversalMapView } from '@/components/ui/maps';
import { IconButton, Icon } from '@/components/ui';
import { SpotMarker } from '@/components/ui/maps/markers/SpotMarker';
import { FishivoMarker } from '@/components/ui/maps/markers/FishivoMarker';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useLocationStore } from '@/stores/locationStore';
import type { CameraConfig, MapMarker, Region } from '@/components/ui/maps/types';
interface LocationMapSelectorProps {
  initialLocation?: { latitude: number; longitude: number };
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
  style?: ViewStyle;
  showCoordinateInputs?: boolean;
  showCrosshair?: boolean;
  showConfirmButton?: boolean;
  onConfirm?: () => void;
  markerType?: 'spot' | 'catch';
  isEditMode?: boolean;
}

export const LocationMapSelector: React.FC<LocationMapSelectorProps> = ({
  initialLocation,
  onLocationChange,
  style,
  showCoordinateInputs = true,
  showCrosshair = true,
  showConfirmButton = true,
  onConfirm,
  markerType = 'catch',
  isEditMode = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const locationStore = useLocationStore();
  const currentLocation = locationStore.currentLocation;
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(initialLocation || null);
  const [confirmedLocation, setConfirmedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [waitingForLocation, setWaitingForLocation] = useState(!initialLocation);
  // currentLocation now comes from LocationStore
  // hasLocationPermission now handled by LocationStore
  const [_hasLocationPermission, _setHasLocationPermission] = useState<boolean>(false);
  const [showUserDot, setShowUserDot] = useState(false);
  const [latitudeInput, setLatitudeInput] = useState(initialLocation?.latitude ? initialLocation.latitude.toFixed(6) : '');
  const [longitudeInput, setLongitudeInput] = useState(initialLocation?.longitude ? initialLocation.longitude.toFixed(6) : '');
  const [isManualMode, setIsManualMode] = useState(false);
  const [inputErrors, setInputErrors] = useState<{lat?: string; lng?: string}>({});
  const mapRef = useRef<any>(null);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Permission handling moved to LocationStore - no need for separate permission logic

  const handleRegionChange = useCallback((region: Region) => {
    const centerCoords = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    
    setMapCenter(centerCoords);
    setLatitudeInput(region.latitude.toFixed(6));
    setLongitudeInput(region.longitude.toFixed(6));
  }, []);
  
  const handleRegionChangeComplete = useCallback((region: Region) => {
    const centerCoords = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    
    setMapCenter(centerCoords);
    
    if (isManualMode) {
      setIsManualMode(false);
      Keyboard.dismiss();
      setLatitudeInput(region.latitude.toFixed(6));
      setLongitudeInput(region.longitude.toFixed(6));
    }
    
    if (!showConfirmButton) {
      onLocationChange(centerCoords);
    }
  }, [showConfirmButton, onLocationChange, isManualMode]);

  const handleConfirmLocation = useCallback(() => {
    if (mapCenter) {
      setConfirmedLocation(mapCenter);
      onLocationChange(mapCenter);
      onConfirm?.();
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }
  }, [mapCenter, onLocationChange, onConfirm]);


  const handleNavigateToLocation = useCallback(async (isInitialLoad = false) => {
    setWaitingForLocation(false);
    
    try {
      await locationStore.getSmartLocation();
      
      if (currentLocation) {
        const userLocation: [number, number] = [
          currentLocation.longitude,
          currentLocation.latitude
        ];
        
        setShowUserDot(true);
        
        const gpsLocation = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        };
        
        setMapCenter(gpsLocation);
        
        if (mapRef.current) {
          mapRef.current.setCamera({
            centerCoordinate: userLocation,
            zoomLevel: 14,
            animationDuration: isInitialLoad ? 0 : 1000,
            animationMode: isInitialLoad ? 'none' : 'flyTo',
          } as CameraConfig);
        }
      }
    } catch (error) {
      // Handle error silently
    }
  }, [locationStore, currentLocation]);

  useEffect(() => {
    if (initialLocation) {
      setMapCenter(initialLocation);
      setLatitudeInput(initialLocation.latitude.toFixed(6));
      setLongitudeInput(initialLocation.longitude.toFixed(6));
      setWaitingForLocation(false);
    } else if (!initialLocation && waitingForLocation) {
      handleNavigateToLocation(true);
    }
  }, [initialLocation, waitingForLocation, handleNavigateToLocation]);
  
  useEffect(() => {
    const timer = updateTimerRef.current;
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  const validateCoordinate = useCallback((value: string, type: 'latitude' | 'longitude') => {
    if (!value || value === '-' || value === '.' || value === '-.') {
      return { isValid: false, error: null, isIntermediate: true };
    }
    
    const formatRegex = /^-?\d*\.?\d*$/;
    if (!formatRegex.test(value)) {
      return { isValid: false, error: t('map.invalidFormat') };
    }
    
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      return { isValid: false, error: null, isIntermediate: true };
    }
    
    const range = type === 'latitude' ? { min: -90, max: 90 } : { min: -180, max: 180 };
    if (parsed < range.min || parsed > range.max) {
      return {
        isValid: false,
        error: type === 'latitude' ? t('map.latitudeError') : t('map.longitudeError')
      };
    }
    
    return { isValid: true, value: parsed, error: null };
  }, [t]);

  // Manuel koordinat girişi - Enlem
  const handleLatitudeChange = (text: string) => {
    // Sadece sayı, nokta ve eksi kabul et
    let cleanText = text.replace(/[^0-9.-]/g, '');
    const isDeleting = text.length < latitudeInput.length;
    if (cleanText === '') {
      setLatitudeInput('');
      setIsManualMode(true);
      return;
    }
    
    // Birden fazla nokta varsa sadece ilkini tut
    const dotCount = (cleanText.match(/\./g) || []).length;
    if (dotCount > 1) {
      const firstDotIndex = cleanText.indexOf('.');
      cleanText = cleanText.substring(0, firstDotIndex + 1) + 
                  cleanText.substring(firstDotIndex + 1).replace(/\./g, '');
    }

    const minusCount = (cleanText.match(/-/g) || []).length;
    if (minusCount > 1) {
      cleanText = cleanText.replace(/-/g, '');
      cleanText = '-' + cleanText;
    }

    if (cleanText.indexOf('-') > 0) {
      cleanText = cleanText.replace(/-/g, '');
      cleanText = '-' + cleanText;
    }

    if (!cleanText.includes('.')) {
      const hasNegative = cleanText.startsWith('-');
      const numbers = cleanText.replace('-', '');

      if (numbers.length === 3 && !isDeleting) {
        cleanText = (hasNegative ? '-' : '') + numbers.substring(0, 2) + '.' + numbers.substring(2);
      } else if (numbers.length > 3) {
        // Kopyala-yapıştır veya hızlı yazım durumu
        cleanText = (hasNegative ? '-' : '') + numbers.substring(0, 2) + '.' + numbers.substring(2);
      }
    }
    
    // Nokta varsa - noktadan sonra maksimum 6 basamak kontrolü
    if (cleanText.includes('.')) {
      const parts = cleanText.split('.');
      if (parts[1] && parts[1].length > 6) {
        cleanText = parts[0] + '.' + parts[1].substring(0, 6);
      }
    }
    
    // Sadece eksi işareti veya diğer ara değerler
    if (cleanText === '-') {
      setLatitudeInput(cleanText);
      setIsManualMode(true);
      return;
    }
    
    setLatitudeInput(cleanText);
    setIsManualMode(true);
    
    const validation = validateCoordinate(cleanText, 'latitude');
    
    if (validation.error) {
      setInputErrors(prev => ({ ...prev, lat: validation.error }));
    } else {
      setInputErrors(prev => ({ ...prev, lat: undefined }));
      
    }
  };

  // Manuel koordinat girişi - Boylam
  const handleLongitudeChange = (text: string) => {
    // Sadece sayı, nokta ve eksi kabul et
    let cleanText = text.replace(/[^0-9.-]/g, '');
    
    // Silme kontrolü
    const isDeleting = text.length < longitudeInput.length;
    
    // Boş string ise direkt izin ver
    if (cleanText === '') {
      setLongitudeInput('');
      setIsManualMode(true);
      return;
    }
    
    // Birden fazla nokta varsa sadece ilkini tut
    const dotCount = (cleanText.match(/\./g) || []).length;
    if (dotCount > 1) {
      const firstDotIndex = cleanText.indexOf('.');
      cleanText = cleanText.substring(0, firstDotIndex + 1) + 
                  cleanText.substring(firstDotIndex + 1).replace(/\./g, '');
    }
    
    // Birden fazla eksi işareti engelle
    const minusCount = (cleanText.match(/-/g) || []).length;
    if (minusCount > 1) {
      cleanText = cleanText.replace(/-/g, '');
      cleanText = '-' + cleanText;
    }
    
    // Eksi işareti sadece başta olabilir
    if (cleanText.indexOf('-') > 0) {
      cleanText = cleanText.replace(/-/g, '');
      cleanText = '-' + cleanText;
    }
    
    if (!cleanText.includes('.')) {
      const hasNegative = cleanText.startsWith('-');
      const numbers = cleanText.replace('-', '');
      
      if (numbers.length === 3 && !isDeleting) {
        cleanText = (hasNegative ? '-' : '') + numbers.substring(0, 2) + '.' + numbers.substring(2);
      } else if (numbers.length > 3) {
        // Kopyala-yapıştır veya hızlı yazım durumu
        cleanText = (hasNegative ? '-' : '') + numbers.substring(0, 2) + '.' + numbers.substring(2);
      }
    }

    if (cleanText.includes('.')) {
      const parts = cleanText.split('.');
      if (parts[1] && parts[1].length > 6) {
        cleanText = parts[0] + '.' + parts[1].substring(0, 6);
      }
    }

    if (cleanText === '-') {
      setLongitudeInput(cleanText);
      setIsManualMode(true);
      return;
    }
    
    setLongitudeInput(cleanText);
    setIsManualMode(true);
    
    const validation = validateCoordinate(cleanText, 'longitude');
    
    if (validation.error) {
      setInputErrors(prev => ({ ...prev, lng: validation.error }));
    } else {
      setInputErrors(prev => ({ ...prev, lng: undefined }));
      
    }
  };
  
  const handleInputFocus = useCallback(() => {
    setIsManualMode(true);
  }, []);
  
  const handleInputBlur = useCallback(() => {
    // Blur'da sadece format ekle, harita güncelleme yok
    const latValidation = validateCoordinate(latitudeInput, 'latitude');
    const lngValidation = validateCoordinate(longitudeInput, 'longitude');
    
    // Format ekle (opsiyonel)
    if (latValidation.isValid && latValidation.value !== undefined) {
      setLatitudeInput(latValidation.value.toFixed(6));
    }
    if (lngValidation.isValid && lngValidation.value !== undefined) {
      setLongitudeInput(lngValidation.value.toFixed(6));
    }

  }, [latitudeInput, longitudeInput, validateCoordinate]);
  const styles = createStyles(theme);
  // Edit mode'da initialLocation varsa hemen marker göster
  // Normal mode'da sadece confirmed location'da marker göster
  const markerLocation = isEditMode && initialLocation 
    ? initialLocation 
    : confirmedLocation;
    
  const markers: MapMarker[] = markerLocation 
    ? [{
        id: isEditMode ? 'edit-location' : 'confirmed-location',
        coordinate: {
          latitude: markerLocation.latitude,
          longitude: markerLocation.longitude,
        },
        customView: markerType === 'spot' 
          ? <SpotMarker />
          : <FishivoMarker />,
      }]
    : [];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapContainer}>
        {mapCenter && (
          <UniversalMapView
            ref={mapRef}
            style={styles.map}
            provider="maplibre"
            fallbackProvider="maplibre"
            initialRegion={{
              latitude: mapCenter.latitude,
              longitude: mapCenter.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            mapStyle="https://tiles.openfreemap.org/styles/bright"
            showUserLocation={showUserDot}
            showCompass={false}
            showScale={false}
            onRegionChange={handleRegionChange}
            onRegionChangeComplete={handleRegionChangeComplete}
            markers={markers}
          />
        )}

        {showCrosshair && (
          <View style={styles.crosshair} pointerEvents="none">
            <View style={styles.crosshairHorizontal} />
            <View style={styles.crosshairVertical} />
            <View style={styles.crosshairCenter} />
          </View>
        )}

        <View style={styles.mapControls}>
          <IconButton
            icon="navigation"
            size="md"
            iconColor={currentLocation ? theme.colors.primary : theme.colors.textSecondary}
            onPress={() => handleNavigateToLocation(false)}
            style={styles.mapControlButton}
          />
          {showConfirmButton && (
            <IconButton
              icon="check-circle"
              size="md"
              iconColor={theme.colors.success}
              onPress={handleConfirmLocation}
              style={StyleSheet.flatten([styles.mapControlButton, styles.confirmButton])}
            />
          )}
        </View>
      </View>

      {showCoordinateInputs && (
        <View style={styles.coordinateInputContainer}>
          <View style={styles.coordinateInputRow}>
            <Text style={styles.coordinateLabel}>{t('map.latitude')}:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.coordinateInput,
                  isManualMode && styles.coordinateInputActive,
                  inputErrors.lat && styles.coordinateInputError
                ]}
                value={latitudeInput}
                onChangeText={handleLatitudeChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numbers-and-punctuation"
                placeholder="41.807416"
                returnKeyType="done"
              />
              {latitudeInput.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setLatitudeInput('');
                    setIsManualMode(true);
                  }}
                >
                  <Icon name="x" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[
              styles.coordinateSuffix,
              inputErrors.lat && styles.coordinateTextError
            ]}>
              °{mapCenter && mapCenter.latitude >= 0 ? t('map.north') : t('map.south')}
            </Text>
          </View>

          <View style={styles.coordinateInputRow}>
            <Text style={styles.coordinateLabel}>{t('map.longitude')}:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.coordinateInput,
                  isManualMode && styles.coordinateInputActive,
                  inputErrors.lng && styles.coordinateInputError
                ]}
                value={longitudeInput}
                onChangeText={handleLongitudeChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numbers-and-punctuation"
                placeholder="2.174030"
                returnKeyType="done"
              />
              {longitudeInput.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setLongitudeInput('');
                    setIsManualMode(true);
                  }}
                >
                  <Icon name="x" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[
              styles.coordinateSuffix,
              inputErrors.lng && styles.coordinateTextError
            ]}>
              °{mapCenter && mapCenter.longitude >= 0 ? t('map.east') : t('map.west')}
            </Text>
          </View>
          
          {/* Manuel modda Git butonu */}
          {isManualMode && (
            <TouchableOpacity
              style={styles.goButton}
              onPress={() => {
                const latValidation = validateCoordinate(latitudeInput, 'latitude');
                const lngValidation = validateCoordinate(longitudeInput, 'longitude');
                
                if (latValidation.isValid && lngValidation.isValid) {
                  const newLocation = {
                    latitude: latValidation.value!,
                    longitude: lngValidation.value!
                  };
                  setMapCenter(newLocation);
                  
                  // Haritayı güncelle
                  if (mapRef.current) {
                    mapRef.current.setCamera({
                      centerCoordinate: [newLocation.longitude, newLocation.latitude],
                      zoomLevel: 14,
                      animationDuration: 1000,
                      animationMode: 'flyTo',
                    } as CameraConfig);
                  }
                  
                  if (!showConfirmButton) {
                    onLocationChange(newLocation);
                  }
                  
                  // Format input'ları
                  setLatitudeInput(latValidation.value!.toFixed(6));
                  setLongitudeInput(lngValidation.value!.toFixed(6));
                  
                  Keyboard.dismiss();
                }
              }}
              activeOpacity={0.8}
            >
              <Icon name="map-pin" size={18} color={theme.colors.white} />
              <Text style={styles.goButtonText}>{t('map.showOnMap')}</Text>
            </TouchableOpacity>
          )}
          
          {/* Error messages */}
          {(inputErrors.lat || inputErrors.lng) && (
            <View style={styles.errorContainer}>
              {inputErrors.lat && (
                <Text style={styles.errorText}>• {inputErrors.lat}</Text>
              )}
              {inputErrors.lng && (
                <Text style={styles.errorText}>• {inputErrors.lng}</Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    mapContainer: {
      height: 250,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      position: 'relative',
    },
    map: {
      flex: 1,
    },
    crosshair: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 80,
      height: 80,
      marginTop: -40,
      marginLeft: -40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    crosshairHorizontal: {
      position: 'absolute',
      width: 80,
      height: 2,
      backgroundColor: theme.colors.primary,
      elevation: 5,
    },
    crosshairVertical: {
      position: 'absolute',
      width: 2,
      height: 80,
      backgroundColor: theme.colors.primary,
    },
    crosshairCenter: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: '#FF0000',
    },
    mapControls: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      gap: 5,
      zIndex: 1000,
      flexDirection: 'column',
    },
    mapControlButton: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    confirmButton: {
      marginTop: 2,
    },
    coordinateInputContainer: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
    },
    coordinateInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    coordinateLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      width: 70,
    },
    inputWrapper: {
      flex: 1,
      position: 'relative',
    },
    coordinateInput: {
      height: 40,
      paddingHorizontal: theme.spacing.sm,
      paddingRight: 35,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontSize: 14,
    },
    clearButton: {
      position: 'absolute',
      right: 8,
      top: 10,
      padding: 2,
    },
    coordinateSuffix: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      width: 30,
    },
    coordinateInputActive: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    coordinateInputError: {
      borderColor: theme.colors.error,
      borderWidth: 2,
    },
    coordinateTextError: {
      color: theme.colors.error,
    },
    errorContainer: {
      marginTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 2,
    },
    goButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm + 2,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.md,
      gap: theme.spacing.xs,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    goButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.white,
      letterSpacing: 0.3,
    },
  });