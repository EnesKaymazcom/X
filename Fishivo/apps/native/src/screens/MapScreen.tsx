import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform,
  TouchableOpacity,
  StatusBar,
  InteractionManager,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Icon, UniversalMapView, MapCatchMarker, MapClusterMarker, IconButton } from '@/components/ui';
import MapLayerModal from '@/components/ui/maps/MapLayerModal';
import { MapLayerSelection } from '@/components/ui/maps/layers/types';
import { getLayerById } from '@/components/ui/maps/layers/layerDefinitions';
import CitySearchModal from '@/components/ui/maps/CitySearchModal';
import { LinearCompass } from '@/components/ui/maps';
import CoordinateInputModal from '@/components/ui/maps/CoordinateInputModal';
import PremiumMapLockModal from '@/components/ui/PremiumMapLockModal';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api';
import type { CameraConfig } from '@/components/ui/maps/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocationStore } from '@/stores/locationStore';
import { calculateDistance } from '@fishivo/utils';
import { calculateCOG, type GPSPosition } from '@fishivo/utils';


// Performance: Extract heavy calculation function outside component
const calculateDistanceThrottled = (() => {
  let lastCall = 0;
  let lastResult = 0;
  let lastParams: [number, number, number, number] | null = null;
  
  return (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const now = Date.now();
    const currentParams: [number, number, number, number] = [lat1, lon1, lat2, lon2];
    
    // Return cached result if called within 50ms with same params
    if (now - lastCall < 50 && lastParams && 
        lastParams[0] === currentParams[0] && 
        lastParams[1] === currentParams[1] &&
        lastParams[2] === currentParams[2] && 
        lastParams[3] === currentParams[3]) {
      return lastResult;
    }
    
    lastCall = now;
    lastParams = currentParams;
    lastResult = calculateDistance(lat1, lon1, lat2, lon2);
    return lastResult;
  };
})();
import {
  useSharedValue,
  useDerivedValue,
  withSpring
} from 'react-native-reanimated';

type CameraRef = {
  setCamera: (options: Partial<CameraConfig>) => void;
};

// Type definitions for map state
type MapState = {
  latitude?: number;
  longitude?: number;
  properties?: {
    center?: {
      coordinates?: [number, number];
    };
    zoom?: number;
    bounds?: {
      ne?: [number, number];
      sw?: [number, number];
    };
  };
};

const MapScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  const cameraRef = useRef<CameraRef | null>(null);
  const { isPremium } = usePremiumStatus();

  // Location state now managed by LocationStore - CENTRALIZED
  // Selector tabanlı stabil referanslar (Zustand)
  const currentLocation = useLocationStore(s => s.currentLocation);
  const getSmartLocation = useLocationStore(s => s.getSmartLocation);
  const startWatching = useLocationStore(s => s.startWatching);
  const stopWatching = useLocationStore(s => s.stopWatching);
  const subscribeToLocation = useLocationStore(s => s.subscribe);
  const [, setIsLocationLoading] = useState(false);
  const [layersModalVisible, setLayersModalVisible] = useState(false);
  const [showCitySearchModal, setShowCitySearchModal] = useState(false);
  const [showCoordinateModal, setShowCoordinateModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<{ne: [number, number], sw: [number, number]} | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(14);
  const currentZoomRef = useRef<number>(14); // Use ref to prevent dependency issues
  // 🎯 60 FPS OPTIMIZED CROSSHAIR STATE - Separated for better performance
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [crosshairCoords, setCrosshairCoords] = useState<[number, number] | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showCompass, setShowCompass] = useState(true);
  const crosshairAnimFrameRef = useRef<number | null>(null);
  const locationAnimFrameRef = useRef<number | null>(null);
  const pendingCoordinatesRef = useRef<{lat: number, lng: number, timestamp: number} | null>(null);
  const isFollowingUserRef = useRef<boolean>(false);
  const hasCenteredInitiallyRef = useRef<boolean>(false);
  // 🧭 Course Over Ground (COG) state and previous position ref
  const [cog, setCog] = useState<number | undefined>(undefined);
  const prevPosRef = useRef<GPSPosition | null>(null);

  // 🚀 ULTRA-RESPONSIVE REANIMATED COORDINATES
  const animatedLat = useSharedValue(0);
  const animatedLng = useSharedValue(0);

  // 💫 SMOOTH SPRING ANIMATIONS (Apple-like UX)
  // Future use: smooth coordinate transitions
  useDerivedValue(() => {
    return withSpring(animatedLat.value, {
      damping: 20,
      stiffness: 300,
      mass: 0.5,
      restDisplacementThreshold: 0.000001,
      restSpeedThreshold: 0.000001
    });
  });

  useDerivedValue(() => {
    return withSpring(animatedLng.value, {
      damping: 20,
      stiffness: 300,
      mass: 0.5,
      restDisplacementThreshold: 0.000001,
      restSpeedThreshold: 0.000001
    });
  });
  
  const [layerSelection, setLayerSelection] = useState<MapLayerSelection>({
    baseMapId: 'openfreemap-bright',
    overlayIds: [], // Performance optimization: Start with no overlays
    enable3DTerrain: false,
    enableEmodnet: false
  });
  
  const currentProvider = useMemo(() => {
    const layer = getLayerById(layerSelection?.baseMapId || 'openfreemap-bright');
    return layer?.config?.provider === 'mapbox' || layerSelection?.enable3DTerrain ? 'mapbox' : 'maplibre';
  }, [layerSelection?.baseMapId, layerSelection?.enable3DTerrain]);
  
  useEffect(() => {
    cameraRef.current = null;
  }, [currentProvider]);

  // Kamera güncellemeleri için akıllı throttle ve minimal hareket eşiği
  const lastCameraCenterRef = useRef<[number, number] | null>(null);
  const lastCameraUpdateTsRef = useRef<number>(0);
  const animatingUntilRef = useRef<number>(0);
  const MIN_DISTANCE_METERS = 10;
  const MIN_CAMERA_INTERVAL_MS = 700;
  const FAST_DISTANCE_METERS = 50;


  const smartSetCamera = useCallback((cfg: Partial<CameraConfig>) => {
    const now = Date.now();
  
    if (cfg.centerCoordinate && lastCameraCenterRef.current) {
      const dMeters = calculateDistanceThrottled(
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
        const dMeters2 = calculateDistanceThrottled(
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
      
      animatingUntilRef.current = now + (cfg.animationDuration ?? 600);
    }
  }, []); // No dependencies - all values are refs
  // clearRefineWatch removed - LocationStore handles location watching

  const startRefineWatch = useCallback(() => {
    // LocationStore now handles all location watching and accuracy refinement
    startWatching();
    isFollowingUserRef.current = true;
  }, [startWatching]);

  useEffect(() => {
    return () => {
      // Stop watching on unmount
      if (isFollowingUserRef.current) {
        stopWatching();
        isFollowingUserRef.current = false;
      }
      // 🎯 PERFORMANCE: Clean up all timers and animation frames
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (crosshairAnimFrameRef.current) {
        cancelAnimationFrame(crosshairAnimFrameRef.current);
        crosshairAnimFrameRef.current = null;
      }
      if (locationAnimFrameRef.current) {
        cancelAnimationFrame(locationAnimFrameRef.current);
        locationAnimFrameRef.current = null;
      }
      pendingCoordinatesRef.current = null;
    };
  }, [stopWatching]); // Cleanup on unmount

  // 🎯 PERFORMANCE: Optimized crosshair sync with current location
  useEffect(() => {
    if (currentLocation) {
      // Use RAF-based update to prevent jank
      const updateCrosshairLocation = () => {
        setCrosshairCoords([currentLocation.longitude, currentLocation.latitude]);
      };
      
      if (locationAnimFrameRef.current) {
        cancelAnimationFrame(locationAnimFrameRef.current);
      }
      locationAnimFrameRef.current = requestAnimationFrame(updateCrosshairLocation);
    }
  }, [currentLocation]);

  // Auto-set bounds when location is available
  useEffect(() => {
    if (currentLocation && !currentBounds) {
      const defaultBounds = {
        ne: [currentLocation.longitude + 0.1, currentLocation.latitude + 0.1] as [number, number],
        sw: [currentLocation.longitude - 0.1, currentLocation.latitude - 0.1] as [number, number]
      };
      setCurrentBounds(defaultBounds);
    }
  }, [currentLocation, currentBounds]);


  // Focus spot from search
  const [focusSpot, setFocusSpot] = useState<{
    id: number;
    coordinates: [number, number];
    name: string;
  } | null>(null);


  // Direct API call - same as YourMapScreen
  const [catches, setCatches] = useState<any[]>([]);
  const [, setLoading] = useState(false);
  const apiService = createNativeApiService();

  // Load catches with InteractionManager for better performance
  useEffect(() => {
    const loadCatches = async () => {
      try {
        setLoading(true);
        
        // Optimized: Process all at once for small datasets
        const postsResponse = await apiService.posts.getPosts(30, 0); // Further reduced for performance
        const mapCatches = postsResponse
          .filter(post => 
            post.type === 'catch' && 
            post.location?.latitude && 
            post.location?.longitude
          )
          .map(post => ({
            id: post.id,
            coordinates: [post.location!.longitude, post.location!.latitude],
            user: {
              id: post.user_id,
              full_name: post.user?.full_name || 'Unknown',
              avatar_url: post.user?.avatar_url,
              is_pro: post.user?.is_pro || false
            },
            species: post.catch_details?.species_name || post.catch_details?.species || 'Unknown Fish',
            weight: post.catch_details?.weight,
            length: post.catch_details?.length,
            created_at: post.created_at,
            image_url: post.images?.[0],
            images: post.images || []
          }));
        
        setCatches(mapCatches);
      } catch (err) {
        setLoading(false);
        setCatches([]);
      }
    };

    loadCatches();
  }, [apiService.posts]);
  
  const clusters: any[] = []; // Empty clusters for now

  // Katman tercihleri yüklendi mi? (2D→3D ilk mount sıçramasını engellemek için)
  const [layerPrefsReady, setLayerPrefsReady] = useState(false);

  // Load saved layer preferences
  useEffect(() => {
    const loadLayerPreferences = async () => {
      try {
        const saved = await AsyncStorage.getItem('mapLayerSelection');
        if (saved) {
          const parsed = JSON.parse(saved);
          const base = getLayerById(parsed.baseMapId || 'openfreemap-bright');
          const allow3D = !!(base && (base as any).config && (base as any).config.provider === 'mapbox');
          // Ensure overlayIds is an array and 3D only allowed for Mapbox bases
          setLayerSelection({
            baseMapId: parsed.baseMapId || 'openfreemap-bright',
            overlayIds: parsed.overlayIds || [],
            enable3DTerrain: allow3D ? (parsed.enable3DTerrain || false) : false,
            enableEmodnet: parsed.enableEmodnet || false,
          });
        }
      } catch (err) {
        // Use default
      } finally {
        setLayerPrefsReady(true);
      }
    };
    loadLayerPreferences();
  }, []);

  // Initialize location with centralized LocationStore - ONLY ONCE
  useEffect(() => {
    // Get smart location with fallback strategy
    const initLocation = async () => {
      await getSmartLocation();
    };
    initLocation();
  }, [getSmartLocation]);

  // İlk konum geldiğinde otomatik olarak kullanıcı konumuna merkezle (yalnızca bir kez)
  useEffect(() => {
    if (!hasCenteredInitiallyRef.current && currentLocation && cameraRef.current) {
      hasCenteredInitiallyRef.current = true;
      smartSetCamera({
        centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
        animationDuration: 0,
        animationMode: 'easeTo',
      });
    }
  }, [currentLocation, smartSetCamera]);

  // Subscribe to location updates from LocationStore
  useEffect(() => {
    // Subscribe to location updates
    const unsubscribe = subscribeToLocation((location) => {
      if (location) {
        const currentPos: GPSPosition = {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp,
          speed: location.speed ?? undefined,
          heading: location.heading ?? undefined,
          accuracy: location.accuracy,
        }
        if (prevPosRef.current) {
          try {
            const nextCog = calculateCOG(prevPosRef.current, currentPos)
            if (Number.isFinite(nextCog)) setCog(nextCog)
          } catch {}
        }
        prevPosRef.current = currentPos
      }
      if (location && isFollowingUserRef.current && cameraRef.current) {
        // Update camera when location changes and we're following user
        smartSetCamera({
          centerCoordinate: [location.longitude, location.latitude],
          zoomLevel: currentZoomRef.current, // Use ref instead of state
          animationDuration: 600,
          animationMode: 'easeTo',
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToLocation, smartSetCamera]);

  // Focus spot from route params
  useEffect(() => {
    if (route?.params?.focusSpot) {
      const spot = route.params.focusSpot;
      setFocusSpot(spot);
      
      // Fly to spot
      if (cameraRef.current) {
        // Manuel uçuşta takip modunu devre dışı bırak
        isFollowingUserRef.current = false;
        smartSetCamera({
          centerCoordinate: spot.coordinates,
          zoomLevel: 14,
          animationDuration: 1000,
          animationMode: 'flyTo',
        });
      }
    }
  }, [route?.params?.focusSpot, smartSetCamera]);

  // Handle coordinate navigation from modal
  const handleCoordinateNavigate = useCallback((lat: number, lng: number) => {
    // Stop user following mode
    isFollowingUserRef.current = false;
    
    // Navigate to coordinates with high zoom for precise view
    smartSetCamera({
      centerCoordinate: [lng, lat], // MapLibre expects [lng, lat]
      zoomLevel: 16, // High zoom for precise coordinate viewing
      animationDuration: 1000,
      animationMode: 'flyTo',
    });
  }, [smartSetCamera]);

  // Sağlayıcı remount sonrası kamera durumunu geri yükle
  const handleMapReady = useCallback(() => {
    const center = lastCameraCenterRef.current;
    const zoom = currentZoomRef.current;

    if (cameraRef.current && center && typeof zoom === 'number') {
      const camera: Partial<CameraConfig> = {
        centerCoordinate: center,
        zoomLevel: zoom,
        animationDuration: 0,
        animationMode: 'easeTo',
      };

      if (currentProvider === 'maplibre') {
        camera.pitch = 0;
        camera.heading = 0;
      } else {
        const is3D = !!(layerSelection?.baseMapId?.includes('3d') || layerSelection?.enable3DTerrain);
        camera.pitch = is3D ? 60 : 0;
      }

      smartSetCamera(camera);
      return;
    }

    // Fallback: elimizde merkez yoksa mevcut konuma ortala
    if (cameraRef.current && currentLocation) {
      const camera: Partial<CameraConfig> = {
        centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
        animationDuration: 0,
        animationMode: 'easeTo',
      };

      if (currentProvider === 'maplibre') {
        camera.pitch = 0;
        camera.heading = 0;
      }

      smartSetCamera(camera);
    }
  }, [currentProvider, layerSelection?.baseMapId, layerSelection?.enable3DTerrain, currentLocation, smartSetCamera]);

  // 🎯 60 FPS OPTIMIZED CROSSHAIR SYSTEM - RequestAnimationFrame Debouncing
  const showCrosshairWithCoords = useCallback((lat?: number, lng?: number) => {
    // RAF-based debouncing for 60 FPS performance
    if (typeof lat === 'number' && typeof lng === 'number') {
      const now = Date.now();
      pendingCoordinatesRef.current = { lat, lng, timestamp: now };
      
      // Cancel previous animation frame to prevent stacking
      if (crosshairAnimFrameRef.current) {
        cancelAnimationFrame(crosshairAnimFrameRef.current);
      }
      
      // Use RAF for 60 FPS synchronized updates
      crosshairAnimFrameRef.current = requestAnimationFrame(() => {
        const pending = pendingCoordinatesRef.current;
        if (pending && pending.timestamp === now) {
          // Separated state updates for better performance
          setShowCrosshair(true);
          setCrosshairCoords([pending.lng, pending.lat]);
          
          // Smart timer management - clear previous timer
          if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
          }
          
          // Background timer to hide crosshair
          InteractionManager.runAfterInteractions(() => {
            hideTimerRef.current = setTimeout(() => {
              setShowCrosshair(false);
            }, 2000);
          });
        }
        crosshairAnimFrameRef.current = null;
      });
    }
  }, []);

  // 🎯 60 FPS OPTIMIZED: Handle region changing with RAF throttling
  const handleRegionIsChanging = useCallback((state: MapState) => {
    // Only process if we have valid coordinates to prevent unnecessary calls
    if (state?.latitude && state?.longitude) {
      showCrosshairWithCoords(state.latitude, state.longitude);
    }
  }, [showCrosshairWithCoords]);

  // 🎯 60 FPS OPTIMIZED: Handle region change with smart coordinate extraction
  const handleRegionDidChange = useCallback((state: MapState) => {
    let lat: number | undefined;
    let lng: number | undefined;
    
    // 🎯 PERFORMANCE: Early returns for invalid states
    if (!state) return;
    
    // Handle both formats: Region object from UniversalMapView or raw state from MapLibre
    if (state?.properties) {
      // Raw MapLibre state
      const { center, zoom, bounds } = state.properties;
      
      if (center) {
        const coordinates = center.coordinates || center;
        if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
          lng = coordinates[0];
          lat = coordinates[1];
          // Update camera center reference for gesture tracking
          lastCameraCenterRef.current = [lng, lat];
        }
      }
      
      // Update zoom regardless of bounds
      if (typeof zoom === 'number') {
        setCurrentZoom(zoom);
        currentZoomRef.current = zoom;
      }
      
      if (bounds) {
        const { ne, sw } = bounds;
        if (ne && sw && Array.isArray(ne) && Array.isArray(sw)) {
          const newBounds = {
            ne: [ne[0], ne[1]] as [number, number],
            sw: [sw[0], sw[1]] as [number, number]
          };
          setCurrentBounds(newBounds);
        }
      }
    } else if (state?.latitude && state?.longitude) {
      // Region object from UniversalMapView
      lat = state.latitude;
      lng = state.longitude;
      lastCameraCenterRef.current = [lng, lat];
    }
    
    // 🎯 PERFORMANCE: Only show crosshair if we have valid coordinates
    if (lat && lng) {
      showCrosshairWithCoords(lat, lng);
    }
  }, [showCrosshairWithCoords]);

  // Handle layer selection change
  const handleLayerSelectionChange = async (selection: MapLayerSelection) => {
    const base = getLayerById(selection.baseMapId);
    const allow3D = !!(base && (base as any).config && (base as any).config.provider === 'mapbox');
    const coercedSelection: MapLayerSelection = {
      baseMapId: selection.baseMapId,
      overlayIds: selection.overlayIds || [],
      enable3DTerrain: allow3D ? !!selection.enable3DTerrain : false,
      enableEmodnet: !!selection.enableEmodnet,
    };

    // Premium kontrolü - 3D terrain için
    if (coercedSelection.enable3DTerrain && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    
    // Premium layer kontrolü - base map'lerde premium olanlar için
    const premiumBaseLayers = ['mapbox-3d-terrain', 'mapbox-3d-satellite'];
    if (premiumBaseLayers.includes(coercedSelection.baseMapId) && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    
    setLayerSelection(coercedSelection);
    
    // 3D terrain toggle kontrolü - enhanced for provider switching
    const was3D = layerSelection?.baseMapId?.includes('3d') || layerSelection?.enable3DTerrain;
    const is3D = coercedSelection.baseMapId?.includes('3d') || coercedSelection.enable3DTerrain;
    
    if (was3D !== is3D && cameraRef.current && currentProvider === 'mapbox') {
      if (is3D) {
        // 3D açılıyorsa pitch ekle ama zoom'u koru
        smartSetCamera({
          pitch: 60, // Normal 3D pitch
          animationDuration: 300,
          animationMode: 'easeTo',
        });
      } else {
        // 3D kapanıyorsa pitch'i kesinlikle sıfırla
        smartSetCamera({
          pitch: 0,  // Açıyı sıfırla
          animationDuration: 300,
          animationMode: 'easeTo',
        });
      }
    }
    
    // Marina profil seçildiğinde optimal zoom level'a git (1:920.000 = zoom 9)
    if (coercedSelection.overlayIds?.includes('marine-profile') && cameraRef.current) {
      if (currentZoom < 8 || currentZoom > 12) {
        smartSetCamera({
          zoomLevel: 9,
          animationDuration: 1000,
        });
      }
    }
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('mapLayerSelection', JSON.stringify(coercedSelection));
    } catch (err) {
      // Silent fail
    }
  };

  // Get current base layer style URL - STATIC IMPORT FIX
  const getCurrentStyleURL = () => {
    // Layer definitions'dan style URL'i al
    const baseMapId = layerSelection?.baseMapId || 'openfreemap-bright';
    const layer = getLayerById(baseMapId);
    
    if (layer?.styleURL) {
      return layer.styleURL;
    }
    
    // Fallback - OpenFreeMap bright
    return 'https://tiles.openfreemap.org/styles/bright';
  };

  // Navigate to post detail
  const handleCatchPress = useCallback((catchId: number) => {
    navigation.navigate('PostDetail', { postId: catchId });
  }, [navigation]);

  // Zoom into cluster
  const handleClusterPress = useCallback((clusterCoordinate: [number, number]) => {
    smartSetCamera({
      centerCoordinate: clusterCoordinate,
      zoomLevel: currentZoom + 2,
      animationDuration: 1000,
      animationMode: 'flyTo',
    });
  }, [currentZoom, smartSetCamera]);
  
  // Set MapScreen-only edge-to-edge for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
    
    return () => {
      // Reset when leaving MapScreen
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor('#000');
      }
    };
  }, []);
  
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {/* Always show map - LocationStore provides fallback coordinates */}
        {layerPrefsReady ? (
          <UniversalMapView
            ref={cameraRef}
            provider={currentProvider}
            mapStyle={getCurrentStyleURL()}
            layerSelection={layerSelection}
            debugMode={false}
            initialRegion={currentLocation ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            } : undefined}
            showUserLocation={!!currentLocation}
            showCompass={false}
            showScale={false}
            markers={catches.map((catchData) => ({
              id: `catch-${catchData.id}`,
              coordinate: {
                latitude: catchData.coordinates[1],
                longitude: catchData.coordinates[0]
              },
              customView: (
                <MapCatchMarker
                  catch={catchData}
                  onPress={() => handleCatchPress(catchData.id)}
                  zoom={currentZoom}
                />
              )
            }))}
            clusters={clusters.map((cluster) => ({
              id: cluster.id,
              coordinate: {
                latitude: cluster.coordinate[1],
                longitude: cluster.coordinate[0]
              },
              count: cluster.count,
              markers: [],
              customView: (
                <MapClusterMarker
                  coordinate={cluster.coordinate}
                  count={cluster.count}
                  onPress={() => handleClusterPress(cluster.coordinate)}
                />
              )
            }))}
            onRegionChange={handleRegionDidChange}
            onRegionIsChanging={handleRegionIsChanging}
            onMapReady={handleMapReady}
          >
            {/* Focus Spot Marker */}
            {focusSpot && (
              <View style={styles.focusSpotMarker}>
                <View style={styles.focusSpotInner}>
                  <Icon name="map-pin" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.focusSpotLabel}>
                  <Text style={styles.focusSpotLabelText} numberOfLines={1}>
                    {focusSpot.name}
                  </Text>
                </View>
              </View>
            )}
          </UniversalMapView>
        ) : (
          // Preferences loading placeholder (map mount geciktirilir)
          <View style={styles.placeholder} />
        )}

        {/* 🎯 60 FPS OPTIMIZED CROSSHAIR SYSTEM */}
        {showCrosshair && (
          <View style={styles.crosshair}>
            <View style={styles.crosshairHorizontal} />
            <View style={styles.crosshairVertical} />
            <View style={styles.crosshairCenter} />
          </View>
        )}

        {/* Linear Compass - TOP */}
        {showCompass && (
          Platform.OS === 'ios' ? (
            <SafeAreaView edges={['top']} style={styles.compassContainer}>
              <LinearCompass
                visible={showCompass}
                height={48}
                cog={cog}
              />
            </SafeAreaView>
          ) : (
            <View style={styles.compassContainer}>
              <LinearCompass
                visible={showCompass}
                height={48}
                cog={cog}
              />
            </View>
          )
        )}

        {/* COORDINATE DISPLAY - TOP WITH EDIT ICON INSIDE */}
        {crosshairCoords && (
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesText}>
              {crosshairCoords[1].toFixed(6)}°{t('map.north')}, {crosshairCoords[0].toFixed(6)}°{t('map.east')}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowCoordinateModal(true)}
              activeOpacity={0.7}
              style={styles.coordinateEditIcon}
            >
              <Icon name="edit" size={16} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>
        )}

        {/* Map Controls */}
        <View style={styles.mapControls}>

          {/* City search button */}
          <IconButton
            icon="search"
            size="md"
            iconColor={theme.colors.primary}
            onPress={() => setShowCitySearchModal(true)}
          />

          {/* Layers button */}
          <IconButton
            icon="layers"
            size="md"
            iconColor={theme.colors.primary}
            onPress={() => setLayersModalVisible(true)}
            style={styles.mapControlButton}
          />

          {/* Compass toggle button */}
          <IconButton
            icon="compass"
            size="md"
            iconColor={showCompass ? theme.colors.primary : theme.colors.textSecondary}
            onPress={() => setShowCompass(!showCompass)}
            style={styles.mapControlButton}
          />

        </View>

        {/* Location Button - Separate container at bottom */}
        <View style={styles.locationButton}>
          <IconButton
            icon="navigation"
            size="md"
            iconColor={currentLocation ? theme.colors.primary : theme.colors.textSecondary}
            onPress={async () => {
              if (currentLocation) {
                isFollowingUserRef.current = true;
                smartSetCamera({
                  centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
                  zoomLevel: 14,
                  animationDuration: 1000,
                  animationMode: 'flyTo',
                });
                startRefineWatch();
              } else {
                setIsLocationLoading(true);
                try {
                  const loc = await getSmartLocation();
                  const target = loc ?? null;
                  if (target) {
                    isFollowingUserRef.current = true;
                    startRefineWatch();
                    smartSetCamera({
                      centerCoordinate: [target.longitude, target.latitude],
                      zoomLevel: 14,
                      animationDuration: 1000,
                      animationMode: 'flyTo',
                    });
                  }
                } finally {
                  setIsLocationLoading(false);
                }
              }
            }}
            style={StyleSheet.flatten([styles.mapControlButton, !currentLocation ? styles.disabledButton : null])}
          />
        </View>

        {/* Layer Selector Modal */}
        <MapLayerModal
          visible={layersModalVisible}
          onClose={() => setLayersModalVisible(false)}
          selection={layerSelection}
          onSelectionChange={handleLayerSelectionChange}
        />

        {/* City Search Modal */}
        <CitySearchModal
          visible={showCitySearchModal}
          onClose={() => setShowCitySearchModal(false)}
          onSelectLocation={(location) => {
            // Navigate to selected city
            smartSetCamera({
              centerCoordinate: [location.longitude, location.latitude],
              zoomLevel: 12,
              animationDuration: 1500,
              animationMode: 'flyTo',
            });
            
            // Stop following user when selecting a city
            isFollowingUserRef.current = false;
            
            // Close modal
            setShowCitySearchModal(false);
          }}
        />

        {/* Coordinate Input Modal */}
        <CoordinateInputModal
          visible={showCoordinateModal}
          onClose={() => setShowCoordinateModal(false)}
          onNavigate={handleCoordinateNavigate}
          currentCoordinates={crosshairCoords || undefined}
        />

        {/* Premium Map Lock Modal */}
        <PremiumMapLockModal
          visible={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => {
            // Navigate to premium upgrade screen
            navigation.navigate('Premium');
          }}
          mapName="3D Harita"
        />

      </View>

    </View>
  );
};

const createStyles = (theme: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: { flex: 1 },
  placeholder: { flex: 1 },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: insets.top + 100,
    gap: 12,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'android' ? insets.bottom + 95 : insets.bottom + 60, // Same level as coordinates
    zIndex: 1000,
  },
  compassContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'android' ? insets.top : 0,
    paddingBottom: 5, // Minimal breathing room at bottom
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
    elevation: 12,
  },
  mapControlButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    pointerEvents: 'auto',
  },
  disabledButton: {
    opacity: 0.6,
  },
  focusSpotMarker: {
    alignItems: 'center',
  },
  focusSpotInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  focusSpotLabel: {
    marginTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    maxWidth: 120,
  },
  focusSpotLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  coordinateEditIcon: {
    marginLeft: 8,
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
    pointerEvents: 'none',
    zIndex: 999, // MapView'in üstünde görünsün
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
  coordinatesContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? insets.bottom + 95 : insets.bottom + 60, // Android needs more spacing
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    height: 36, // Same height as location button
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 10,
    zIndex: 999,
  },
  coordinatesText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
  },
  errorTitle: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
  },
});

// 🎯 60 FPS OPTIMIZED CROSSHAIR COMPONENT - React.memo for performance
interface OptimizedCrosshairProps {
  crosshairState: { show: boolean; coordinates: [number, number] | null; lastUpdate: number };
  theme: any;
  t: (key: string) => string;
  styles: any;
}

// Keeping for future performance optimization
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OptimizedCrosshair = React.memo<OptimizedCrosshairProps>(({ crosshairState, t, styles }) => {
  // 🎯 PERFORMANCE: Memoized coordinate formatting to prevent recalculations
  const formattedCoordinates = useMemo(() => {
    if (!crosshairState.coordinates) return null;
    
    const [lng, lat] = crosshairState.coordinates;
    return {
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      text: `${lat.toFixed(6)}°${t('map.north')}, ${lng.toFixed(6)}°${t('map.east')}`
    };
  }, [crosshairState.coordinates, t]);
  
  if (!crosshairState.show) return null;
  
  return (
    <>
      {/* Crosshair */}
      <View style={styles.crosshair}>
        <View style={styles.crosshairHorizontal} />
        <View style={styles.crosshairVertical} />
        <View style={styles.crosshairCenter} />
      </View>
      
      {/* Coordinates Display */}
      {formattedCoordinates && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            {formattedCoordinates.text}
          </Text>
        </View>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // 🎯 PERFORMANCE: Custom comparison to prevent unnecessary renders
  return (
    prevProps.crosshairState.show === nextProps.crosshairState.show &&
    prevProps.crosshairState.lastUpdate === nextProps.crosshairState.lastUpdate &&
    JSON.stringify(prevProps.crosshairState.coordinates) === JSON.stringify(nextProps.crosshairState.coordinates)
  );
});

export default MapScreen;
