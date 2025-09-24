import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useLocationStore, getCoordinates } from '@/stores/locationStore';
import { ScreenContainer, Icon, AppHeader, FishivoModal, FishivoMarker, IconButton, UniversalMapView } from '@/components/ui';
import MapLayerModal from '@/components/ui/maps/MapLayerModal';
import { MapLayerSelection } from '@/components/ui/maps/layers/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api';
import { calculateDistance } from '@fishivo/utils';
import { Theme } from '@/theme';
// LocationStore now handles location management
import type { CameraConfig } from '@/components/ui/maps/types';

// TypeScript interfaces
interface MarkerData {
  id: string;
  coordinates: [number, number];
  name: string;
  type: 'favorite' | 'private' | 'myspot' | 'catch' | 'current';
  data: any;
}

interface SpotData {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  water_type?: 'freshwater' | 'saltwater';
  fish_species?: string[];
  is_public?: boolean;
  images?: string[];
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface CatchData {
  id: number;
  catch_details?: {
    species_name?: string;
    weight?: number;
    length?: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  images?: string[];
  created_at: string;
}

interface MarkerDetailModalProps {
  marker: MarkerData | null;
  isVisible: boolean;
  onClose: () => void;
  onPressProfile: (userId: string) => void;
  onPressDetails: (postId: string) => void;
  onShowInfoModal: (message: string) => void;
}

interface YourMapScreenProps {
  navigation: any;
}

type CameraRef = {
  setCamera: (options: Partial<CameraConfig>) => void;
};

const YourMapScreen: React.FC<YourMapScreenProps> = ({ navigation }) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const userInteractedRef = useRef(false);
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<CameraRef | null>(null);
  // Location now managed by centralized LocationStore
  const locationStore = useLocationStore();
  const currentLocation = locationStore.currentLocation;
  const locationLoading = locationStore.isLoading;
  const [layersModalVisible, setLayersModalVisible] = useState(false);
  const [layerSelection, setLayerSelection] = useState<MapLayerSelection>({
    baseMapId: 'openfreemap-liberty',
    overlayIds: ['openseamap']
  });
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states  
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const styles = createStyles(theme);
  const apiService = createNativeApiService();

  // currentUserId no longer needed – all data comes from API
  
  // API'den veri çek
  const [spots, setSpots] = useState<SpotData[]>([]);
  const [catches, setCatches] = useState<CatchData[]>([]);
  const [loading, setLoading] = useState(true);

  // API'den verileri yükle
  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const [spotsResponse, catchesResponse] = await Promise.all([
        apiService.spots.getSpots(50, 0),
        apiService.posts.getPosts(100, 0)
      ]);
      
      setSpots(spotsResponse || []);
      setCatches(catchesResponse.filter(post => post.type === 'catch') || []);
    } catch (error) {
      // Hata durumunda boş array kullan
      setSpots([]);
      setCatches([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserSpots = () => spots;
  const getUserCatches = () => catches;

  const getCoordinatesForCatch = (catchData: CatchData): [number, number] | null => {
    // Catch'in location bilgisi varsa kullan
    if (catchData.location?.latitude && catchData.location?.longitude) {
      return [catchData.location.longitude, catchData.location.latitude];
    }
    // Lokasyon yoksa null döndür
    return null;
  };

  // Tüm gerçek API'den veri al
  const allMarkers: MarkerData[] = [
    // Spotlar (API'den)
    ...spots.filter(spot => spot.latitude && spot.longitude).map(spot => ({
      id: spot.id.toString(),
      coordinates: [spot.longitude, spot.latitude] as [number, number],
      name: spot.name,
      type: spot.is_public ? 'myspot' : 'private' as const,
      data: spot
    })),
    // Av geçmişi (API'den) 
    ...catches.map(catch_ => {
      const coords = getCoordinatesForCatch(catch_);
      if (!coords) return null;
      return {
        id: catch_.id.toString(),
        coordinates: coords,
        name: `${catch_.catch_details?.species_name || t('yourMapScreen.unknownFish')} - ${catch_.catch_details?.weight || 0}kg`,
        type: 'catch' as const,
        data: catch_
      };
    }).filter(marker => marker !== null) as MarkerData[]
  ];

  // Favoriler de eklenebilir (ileride)
  const displayMarkers = allMarkers;

  // Get user location with LocationStore
  useEffect(() => {
    const initLocation = async () => {
      await locationStore.getSmartLocation();
    };
    initLocation();
  }, [locationStore]);
  
  // Subscribe to location updates from LocationStore
  useEffect(() => {
    const unsubscribe = locationStore.subscribe((location) => {
      // Location updates are automatically reflected in currentLocation hook
      // No need to manually update state as useCurrentLocation() handles it
    });
    
    return () => {
      unsubscribe();
    };
  }, [locationStore]);

  // Get current base layer style URL - MapScreen'den kopyalandı
  const getCurrentStyleURL = () => {
    // Static style URLs to prevent runtime errors
    const OPENFREEMAP_STYLES = {
      liberty: 'https://tiles.openfreemap.org/styles/liberty',
      bright: 'https://tiles.openfreemap.org/styles/bright',
      dark: 'https://tiles.openfreemap.org/styles/dark'
    };
    
    // Map layer IDs to style URLs
    const styleMap: Record<string, string> = {
      'openfreemap-liberty': OPENFREEMAP_STYLES.liberty,
      'openfreemap-bright': OPENFREEMAP_STYLES.bright,
      'openfreemap-dark': OPENFREEMAP_STYLES.dark,
      '3d-terrain': OPENFREEMAP_STYLES.liberty, // 3D terrain uses liberty as base
    };
    
    const baseMapId = layerSelection?.baseMapId || 'openfreemap-liberty';
    return styleMap[baseMapId] || OPENFREEMAP_STYLES.liberty;
  };

  // Handle layer selection change
  const handleLayerSelectionChange = async (selection: MapLayerSelection) => {
    setLayerSelection(selection);
  };

  // Konuma git fonksiyonu - LocationStore ile
  const goToUserLocation = async () => {
    if (currentLocation && cameraRef.current) {
      smartSetCamera({
        centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
        zoomLevel: 14,
        animationDuration: 1000,
        animationMode: 'flyTo',
      });
    } else {
      // LocationStore'dan güncel konum al
      await locationStore.getSmartLocation();
      if (locationStore.currentLocation) {
        smartSetCamera({
          centerCoordinate: [
            locationStore.currentLocation.longitude,
            locationStore.currentLocation.latitude
          ],
          zoomLevel: 14,
          animationDuration: 1000,
          animationMode: 'flyTo',
        });
      }
    }
  };

  // Smart camera controls
  const MIN_DISTANCE_METERS = 10;
  const MIN_CAMERA_INTERVAL_MS = 700;
  const FAST_DISTANCE_METERS = 50;
  const lastCameraUpdateTsRef = useRef(0);
  const lastCameraCenterRef = useRef<[number, number] | null>(null);
  const cameraAnimatingUntilRef = useRef<number | null>(null);
  const smartSetCamera = React.useCallback((cfg: Partial<CameraConfig>) => {
    const now = Date.now();

    if (cameraAnimatingUntilRef.current && now < cameraAnimatingUntilRef.current) {
      return;
    }

    if (cfg.centerCoordinate && lastCameraCenterRef.current) {
      const dMeters = calculateDistance(
        lastCameraCenterRef.current[1],
        lastCameraCenterRef.current[0],
        cfg.centerCoordinate[1],
        cfg.centerCoordinate[0]
      ) * 1000;
      if (dMeters < MIN_DISTANCE_METERS && !cfg.zoomLevel && typeof cfg.pitch !== 'number' && typeof cfg.heading !== 'number') {
        return;
      }
    }

    if (now - lastCameraUpdateTsRef.current < MIN_CAMERA_INTERVAL_MS) {
      if (cfg.centerCoordinate && lastCameraCenterRef.current) {
        const dMeters2 = calculateDistance(
          lastCameraCenterRef.current[1],
          lastCameraCenterRef.current[0],
          cfg.centerCoordinate[1],
          cfg.centerCoordinate[0]
        ) * 1000;
        if (dMeters2 < FAST_DISTANCE_METERS && !cfg.zoomLevel && typeof cfg.pitch !== 'number' && typeof cfg.heading !== 'number') {
          return;
        }
      } else if (!cfg.zoomLevel && typeof cfg.pitch !== 'number' && typeof cfg.heading !== 'number') {
        return;
      }
    }

    if (cameraRef.current) {
      cameraRef.current.setCamera(cfg);
      lastCameraUpdateTsRef.current = now;
      if (cfg.centerCoordinate) lastCameraCenterRef.current = cfg.centerCoordinate;
      cameraAnimatingUntilRef.current = now + (cfg.animationDuration ?? 600);
    }
  }, [calculateDistance]);

  // currentLocation ilk geldiğinde bir kez otomatik merkezle (map hazır olduğunda ve kullanıcı müdahalesi yoksa)
  const hasCenteredInitiallyRef = useRef(false);
  useEffect(() => {
    if (hasCenteredInitiallyRef.current) return;
    if (userInteractedRef.current) return;
    if (!currentLocation) return;
    if (!cameraRef.current) return;
    if (!isMapReady) return;

    hasCenteredInitiallyRef.current = true;
    smartSetCamera({
      centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
      zoomLevel: 14,
      animationDuration: 800,
      animationMode: 'flyTo',
      pitch: 0,
      heading: 0,
    });
  }, [currentLocation, smartSetCamera, isMapReady]);

  // Marker'a tıklayınca detay göster
  const handleMarkerPress = (marker: MarkerData) => {
    setSelectedMarker(marker);
    setShowDetailModal(true);
  };

  // Marker rengi ve ikonu
  const getMarkerStyle = (type: string) => {
    switch (type) {
      case 'favorite':
        return { color: '#E91E63', icon: 'heart' };
      case 'private':
        return { color: '#9C27B0', icon: 'lock' };
      case 'myspot':
        return { color: '#2196F3', icon: 'map-pin' };
      case 'catch':
        return { color: '#4CAF50', icon: 'fish' };
      default:
        return { color: theme.colors.primary, icon: 'map-pin' };
    }
  };

  // Measurement object'ini formatla
  const formatMeasurementValue = (measurement: any) => {
    if (!measurement) return '';
    if (typeof measurement === 'string') return measurement;
    if (measurement.displayValue) return measurement.displayValue;
    if (measurement.value && measurement.unit) {
      return `${measurement.value} ${measurement.unit}`;
    }
    return '';
  };

  if (locationLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader
          title={t('common.yourMapScreen.title')}
          leftButtons={[
            {
              icon: 'arrow-left',
              onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
            }
          ]}
        />
        <ScreenContainer paddingVertical="none">
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('common.yourMapScreen.loading')}</Text>
          </View>
        </ScreenContainer>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('common.yourMapScreen.title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
          }
        ]}
      />
      
      <View style={styles.mapContainer}>
          <UniversalMapView
            ref={cameraRef}
            provider={'maplibre'}
            mapStyle={getCurrentStyleURL()}
            layerSelection={layerSelection}
            initialRegion={{
              latitude: currentLocation?.latitude || 0,
              longitude: currentLocation?.longitude || 0,
              latitudeDelta: currentLocation ? 0.1 : 180, // World view if no location
              longitudeDelta: currentLocation ? 0.1 : 360,
            }}
            showUserLocation={!!currentLocation}
            showCompass={false}
            showScale={false}
            onMapReady={() => setIsMapReady(true)}
            onRegionIsChanging={() => { userInteractedRef.current = true; }}
            markers={displayMarkers.filter(marker => 
              marker.coordinates && 
              marker.coordinates.length === 2 &&
              !isNaN(marker.coordinates[0]) && 
              !isNaN(marker.coordinates[1])
            ).map((marker) => {
              const style = getMarkerStyle(marker.type);
              return {
                id: marker.id,
                coordinate: {
                  latitude: marker.coordinates[1],
                  longitude: marker.coordinates[0]
                },
                customView: marker.type === 'catch' ? (
                  <FishivoMarker />
                ) : (
                  <View style={[styles.markerContainer, { backgroundColor: style.color }]}>
                    <Icon name={style.icon} size={16} color="#FFFFFF" />
                  </View>
                )
              };
            })}
            onMarkerPress={(markerId) => {
              try {
                const marker = displayMarkers.find(m => m.id === markerId);
                if (marker) handleMarkerPress(marker);
              } catch (error) {
              }
            }}
            enableCaching={true}
            debugMode={false}
           />

          {/* Map Controls */}
          <View style={styles.mapControls}>
            {/* Current location button */}
            <IconButton
              icon="navigation"
              size="md"
              iconColor={currentLocation ? theme.colors.primary : theme.colors.textSecondary}
              onPress={goToUserLocation}
              style={styles.mapControlButton}
            />

            {/* Layers button */}
            <IconButton
              icon="layers"
              size="md"
              iconColor={theme.colors.primary}
              onPress={() => setLayersModalVisible(true)}
              style={styles.mapControlButton}
            />
          </View>

          {/* Center Crosshair - MapComponent'ten birebir */}
          <View style={styles.crosshair}>
            <View style={styles.crosshairHorizontal} />
            <View style={styles.crosshairVertical} />
            <View style={styles.crosshairCenter} />
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {t('common.yourMapScreen.pointsInfo', { count: displayMarkers.length })}
            </Text>
          </View>

          {/* Legend - Simple Tags */}
          <View style={styles.legend}>
            <View style={[styles.legendTag, { backgroundColor: theme.colors.primary }]}>
              <Icon name="heart" size={12} color="#FFFFFF" />
              <Text style={styles.legendTagText}>Favorites</Text>
            </View>
            <View style={[styles.legendTag, { backgroundColor: theme.colors.error || '#FF6B6B' }]}>
              <Icon name="lock" size={12} color="#FFFFFF" />
              <Text style={styles.legendTagText}>Private</Text>
            </View>
            <View style={[styles.legendTag, { backgroundColor: theme.colors.warning || '#FFA726' }]}>
              <Icon name="map-pin" size={12} color="#FFFFFF" />
              <Text style={styles.legendTagText}>My Spots</Text>
            </View>
            <View style={[styles.legendTag, { backgroundColor: theme.colors.success || '#4CAF50' }]}>
              <Icon name="fish" size={12} color="#FFFFFF" />
              <Text style={styles.legendTagText}>Catches</Text>
            </View>
          </View>

        </View>

        {/* Marker Detail Modal */}
        <MarkerDetailModal
          marker={selectedMarker}
          isVisible={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onPressProfile={(userId) => {}}
          onPressDetails={(postId) => {}}
          onShowInfoModal={(message: string) => {
            setModalMessage(message);
            setShowInfoModal(true);
          }}
        />

        <FishivoModal
          visible={showSuccessModal}
          title={t('common.info')}
          description={successMessage}
          onClose={() => setShowSuccessModal(false)}
          preset="success"
        />

        {/* Info Modal */}
        <FishivoModal
          visible={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          preset="success"
          title={t('common.success')}
          description={modalMessage}
          primaryButton={{
            text: t('common.ok'),
            onPress: () => setShowInfoModal(false)
          }}
        />

        {/* Map Layer Modal */}
        <MapLayerModal
          visible={layersModalVisible}
          onClose={() => setLayersModalVisible(false)}
          selection={layerSelection}
          onSelectionChange={handleLayerSelectionChange}
        />

    </View>
  );
};

// Marker detay modal bileşeni
const MarkerDetailModal: React.FC<MarkerDetailModalProps> = ({ 
  marker, 
  isVisible, 
  onClose, 
  onPressProfile, 
  onPressDetails,
  onShowInfoModal
}) => {
  const { t, locale } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!isVisible || !marker) return null;

  const shareLocation = () => {
    const message = t('yourMapScreen.shareLocationMessage', {
      name: marker.name,
      latitude: marker.coordinates[1].toFixed(6),
      longitude: marker.coordinates[0].toFixed(6)
    });
    // Clipboard kullanımı için import gerekli
    onShowInfoModal(t('yourMapScreen.copied'));
    onClose();
  };

  // Measurement object'ini formatla
  const formatMeasurementValue = (measurement: any) => {
    if (!measurement) return '';
    if (typeof measurement === 'string') return measurement;
    if (measurement.displayValue) return measurement.displayValue;
    if (measurement.value && measurement.unit) {
      return `${measurement.value} ${measurement.unit}`;
    }
    return '';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const renderContent = () => {
    switch (marker.type) {
      case 'favorite':
        const favData = marker.data;
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            {favData.image && (
              <Image source={{ uri: favData.image }} style={styles.modalImage} />
            )}
            
            {/* Title & Rating */}
            <View style={styles.modalHeaderSection}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{marker.name}</Text>
                <View style={styles.spotTypeContainer}>
                  <Icon name="heart" size={16} color="#E91E63" />
                  <Text style={styles.spotTypeText}>{t('yourMapScreen.favoriteSpot') || 'Favori Spot'}</Text>
                </View>
              </View>
              {favData.rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{favData.rating}</Text>
                </View>
              )}
            </View>

            {/* Basic Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('common.yourMapScreen.information')}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="droplet" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.waterType')}</Text>
                  <Text style={styles.infoValue}>{favData.waterType === 'saltwater' ? t('common.yourMapScreen.saltwater') : t('common.yourMapScreen.freshwater')}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="trending-down" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.depth')}</Text>
                  <Text style={styles.infoValue}>{favData.depth}m</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="award" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.difficulty')}</Text>
                  <Text style={styles.infoValue}>{favData.difficulty}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="user" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('yourMapScreen.addedBy')}</Text>
                  <Text style={styles.infoValue}>{favData.addedBy}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('common.yourMapScreen.description')}</Text>
              <Text style={styles.description}>{favData.description}</Text>
            </View>

            {/* Fish Species */}
            {favData.fishSpecies && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.fishSpecies')}</Text>
                <View style={styles.speciesContainer}>
                  {favData.fishSpecies.map((species: string, index: number) => (
                    <View key={index} style={styles.speciesTag}>
                      <Text style={styles.speciesText}>{species}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tips */}
            {favData.tips && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.tips')}</Text>
                {favData.tips.map((tip: string, index: number) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="lightbulb" size={14} color={theme.colors.primary} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Last Catch */}
            {favData.lastCatch && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.lastCatch')}</Text>
                <View style={styles.catchInfo}>
                  <Text style={styles.catchText}>
                    {favData.lastCatch.species} - {favData.lastCatch.weight || '-'}
                  </Text>
                  <Text style={styles.catchDate}>{favData.lastCatch.date}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.dateText}>
                {t('common.yourMapScreen.addedDate')} {formatDate(favData.addedDate)}
              </Text>
            </View>
          </ScrollView>
        );

      case 'private':
        const privData = marker.data;
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            {privData.image && (
              <Image source={{ uri: privData.image }} style={styles.modalImage} />
            )}
            
            {/* Title & Rating */}
            <View style={styles.modalHeaderSection}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{marker.name}</Text>
                <View style={styles.spotTypeContainer}>
                  <Icon name="lock" size={16} color="#9C27B0" />
                  <Text style={styles.spotTypeText}>{t('yourMapScreen.privateSpot') || 'Gizli Spot'}</Text>
                </View>
              </View>
              {privData.rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{privData.rating}</Text>
                </View>
              )}
            </View>

            {/* Basic Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('common.yourMapScreen.information')}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="droplet" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.waterType')}</Text>
                  <Text style={styles.infoValue}>{privData.waterType === 'saltwater' ? t('common.yourMapScreen.saltwater') : t('common.yourMapScreen.freshwater')}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="trending-down" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.depth')}</Text>
                  <Text style={styles.infoValue}>{privData.depth}m</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="award" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.difficulty')}</Text>
                  <Text style={styles.infoValue}>{privData.difficulty}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="calendar" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Son Ziyaret</Text>
                  <Text style={styles.infoValue}>{formatDate(privData.lastVisited)}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('common.yourMapScreen.description')}</Text>
              <Text style={styles.description}>{privData.description}</Text>
            </View>

            {/* Fish Species */}
            {privData.fishSpecies && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.fishSpecies')}</Text>
                <View style={styles.speciesContainer}>
                  {privData.fishSpecies.map((species: string, index: number) => (
                    <View key={index} style={styles.speciesTag}>
                      <Text style={styles.speciesText}>{species}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Catch History */}
            {privData.catchHistory && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('yourMapScreen.catchHistory')}</Text>
                {privData.catchHistory.map((catch_: any, index: number) => (
                  <View key={index} style={styles.catchHistoryItem}>
                    <View style={styles.catchHistoryInfo}>
                      <Text style={styles.catchHistorySpecies}>{catch_.species}</Text>
                      <Text style={styles.catchHistoryWeight}>{catch_.weight || '-'}</Text>
                    </View>
                    <Text style={styles.catchHistoryDate}>{catch_.date}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            {privData.tips && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.tips')}</Text>
                {privData.tips.map((tip: string, index: number) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="lightbulb" size={14} color={theme.colors.primary} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.dateText}>
                {t('common.yourMapScreen.created')} {formatDate(privData.createdDate)}
              </Text>
            </View>
          </ScrollView>
        );

      case 'myspot':
        const myData = marker.data;
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            {myData.image && (
              <Image source={{ uri: myData.image }} style={styles.modalImage} />
            )}
            
            {/* Title & Stats */}
            <View style={styles.modalHeaderSection}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{marker.name}</Text>
                <View style={styles.spotTypeContainer}>
                  <Icon name="map-pin" size={16} color="#2196F3" />
                  <Text style={styles.spotTypeText}>{t('yourMapScreen.mySpot') || 'Benim Spotım'}</Text>
                </View>
              </View>
              {myData.rating && (
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{myData.rating}</Text>
                </View>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="heart" size={16} color="#E91E63" />
                <Text style={styles.statNumber}>{myData.likes}</Text>
                <Text style={styles.statLabel}>Beğeni</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="eye" size={16} color={theme.colors.primary} />
                <Text style={styles.statNumber}>{myData.views}</Text>
                <Text style={styles.statLabel}>{t('common.yourMapScreen.views')}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="share" size={16} color={theme.colors.primary} />
                <Text style={styles.statNumber}>{myData.shares}</Text>
                <Text style={styles.statLabel}>{t('common.yourMapScreen.shares')}</Text>
              </View>
            </View>

            {/* Basic Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('common.yourMapScreen.information')}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="droplet" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.waterType')}</Text>
                  <Text style={styles.infoValue}>{myData.waterType === 'saltwater' ? t('common.yourMapScreen.saltwater') : t('common.yourMapScreen.freshwater')}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="trending-down" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.depth')}</Text>
                  <Text style={styles.infoValue}>{myData.depth}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="award" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.difficulty')}</Text>
                  <Text style={styles.infoValue}>{myData.difficulty}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="globe" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.status')}</Text>
                  <Text style={styles.infoValue}>{myData.isPublic ? t('common.yourMapScreen.public') : t('common.yourMapScreen.private_status')}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('common.yourMapScreen.description')}</Text>
              <Text style={styles.description}>{myData.description}</Text>
            </View>

            {/* Fish Species */}
            {myData.fishSpecies && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.fishSpecies')}</Text>
                <View style={styles.speciesContainer}>
                  {myData.fishSpecies.map((species: string, index: number) => (
                    <View key={index} style={styles.speciesTag}>
                      <Text style={styles.speciesText}>{species}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tips */}
            {myData.tips && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.tips')}</Text>
                {myData.tips.map((tip: string, index: number) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="lightbulb" size={14} color={theme.colors.primary} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Last Catch */}
            {myData.lastCatch && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.lastCatch')}</Text>
                <View style={styles.catchInfo}>
                  <Text style={styles.catchText}>
                    {myData.lastCatch.species} - {myData.lastCatch.weight || '-'}
                  </Text>
                  <Text style={styles.catchDate}>{myData.lastCatch.date}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.dateText}>
                {t('common.yourMapScreen.created')} {formatDate(myData.createdDate)}
              </Text>
            </View>
          </ScrollView>
        );

      case 'catch':
        const catchData = marker.data;
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Image */}
            {catchData.image && (
              <Image source={{ uri: catchData.image }} style={styles.modalImage} />
            )}
            
            {/* Title */}
            <View style={styles.modalHeaderSection}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{catchData.species}</Text>
                <View style={styles.spotTypeContainer}>
                  <Icon name="fish" size={16} color="#4CAF50" />
                  <Text style={styles.spotTypeText}>{t('yourMapScreen.catchRecord')}</Text>
                </View>
              </View>
            </View>

            {/* Catch Stats */}
            <View style={styles.catchStatsContainer}>
              <View style={styles.catchStatItem}>
                <Icon name="package" size={20} color={theme.colors.primary} />
                <Text style={styles.catchStatNumber}>{catchData.weight || '-'}</Text>
                <Text style={styles.catchStatLabel}>{t('common.yourMapScreen.weight')}</Text>
              </View>
              {catchData.length && (
                <View style={styles.catchStatItem}>
                  <Icon name="maximize" size={20} color={theme.colors.primary} />
                  <Text style={styles.catchStatNumber}>{catchData.length || '-'}</Text>
                  <Text style={styles.catchStatLabel}>Uzunluk</Text>
                </View>
              )}
            </View>

            {/* Basic Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('common.yourMapScreen.catchInfo')}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="calendar" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.date')}</Text>
                  <Text style={styles.infoValue}>{formatDate(catchData.date)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="clock" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Saat</Text>
                  <Text style={styles.infoValue}>{catchData.time}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="map-pin" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.location')}</Text>
                  <Text style={styles.infoValue}>{catchData.location}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="cloud" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.weather')}</Text>
                  <Text style={styles.infoValue}>{catchData.weather}</Text>
                </View>
              </View>
            </View>

            {/* Technique & Bait */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{t('common.yourMapScreen.techniqueAndBait')}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Icon name="tool" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.technique')}</Text>
                  <Text style={styles.infoValue}>{catchData.technique}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="package" size={16} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>{t('common.yourMapScreen.bait')}</Text>
                  <Text style={styles.infoValue}>{catchData.bait}</Text>
                </View>
              </View>
            </View>

            {/* Equipment */}
            {catchData.equipment && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.usedEquipment')}</Text>
                <View style={styles.equipmentList}>
                  {catchData.equipment.map((item: any, index: number) => (
                    <View key={index} style={styles.equipmentItem}>
                      <Icon name="tool" size={14} color={theme.colors.primary} />
                      <Text style={styles.equipmentText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Notes */}
            {catchData.notes && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.notes')}</Text>
                <Text style={styles.description}>{catchData.notes}</Text>
              </View>
            )}

            {/* Images */}
            {catchData.images && catchData.images.length > 1 && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.yourMapScreen.photos', { count: catchData.images.length })}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.imageGallery}>
                    {catchData.images.slice(1).map((image: string, index: number) => (
                      <Image key={index} source={{ uri: image }} style={styles.galleryImage} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={styles.modalFooter}>
              <Text style={styles.dateText}>
                {t('common.yourMapScreen.caughtDate')} {formatDate(catchData.date)}
              </Text>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <FishivoModal
      visible={isVisible}
      onClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeaderBar}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Icon name="x" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalShareButton} onPress={shareLocation}>
            <Icon name="share" size={20} color={theme.colors.primary} />
            <Text style={styles.modalShareText}>{t('common.share')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          {renderContent()}
        </View>
      </SafeAreaView>

    </FishivoModal>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },

  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  userLocationInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },

  mapControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 12,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  mapControlButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    pointerEvents: 'auto',
  },

  infoCard: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  // MapComponent'ten birebir kopyalanmış crosshair stilleri
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 120,
    height: 120,
    marginTop: -60,
    marginLeft: -60,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: 120,
    height: 1,
    backgroundColor: '#FF0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: 120,
    backgroundColor: '#FF0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  crosshairCenter: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  legend: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  legendTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  legendTagText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  modalSection: {
    marginBottom: theme.spacing.md,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  // Yeni modal stilleri
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  modalHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalCloseButton: {
    padding: theme.spacing.sm,
  },
  modalShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  modalShareText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  modalHeaderSection: {
    marginBottom: theme.spacing.lg,
  },
  modalTitleContainer: {
    marginBottom: theme.spacing.sm,
  },
  spotTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  spotTypeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  infoSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  infoItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  speciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  speciesTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  speciesText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  catchInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  catchText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  catchDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  catchHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  catchHistoryInfo: {
    flex: 1,
  },
  catchHistorySpecies: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  catchHistoryWeight: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  catchHistoryDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  catchStatsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  catchStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  catchStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  catchStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  equipmentList: {
    gap: theme.spacing.xs,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  equipmentText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  imageGallery: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.sm,
  },
  modalFooter: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default YourMapScreen;