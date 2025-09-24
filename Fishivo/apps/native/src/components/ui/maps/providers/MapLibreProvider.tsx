import React, { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { MapProviderProps, CameraConfig } from '@/components/ui/maps/types';
import { getLayerById, marineLayers } from '@/components/ui/maps/layers/layerDefinitions';
import { MAPTILER_API_KEY } from '@/config';


// OpenFreeMap styles - local constant definition
const OPENFREEMAP_STYLES = {
  bright: 'https://tiles.openfreemap.org/styles/bright',
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark'
};

// MapLibre initialization - No token needed for OpenFreeMap
// setAccessToken'a geçerli bir string ver, null crash yapıyor
MapLibreGL.setAccessToken('no-token-required');

// Logger configuration - Font ve glyph hatalarını tamamen sustur
MapLibreGL.Logger.setLogLevel('error'); // warning'leri kapat
MapLibreGL.Logger.setLogCallback((log) => {
  // Tüm font, glyph, texture, layer hatalarını sustur
  if (log.message && (
    log.message.includes('Font') || 
    log.message.includes('font') ||
    log.message.includes('glyph') ||
    log.message.includes('pbf') ||
    log.message.includes('texture') ||
    log.message.includes('TextureView') ||
    log.message.includes('Failed to load') ||
    log.message.includes('404') ||
    log.message.includes('3d-buildings') ||
    log.message.includes('find/makeLayer') ||
    log.message.includes('returned nil') ||
    log.message.includes('Source composite') ||
    log.message.includes('StyleError') ||
    log.message.includes('not in style') ||
    log.message.includes('failed for layer')
  )) {
    return true; // Logging'i tamamen iptal et
  }
  return false; // Sadece kritik hatalar gösterilsin
});


interface MapLibreProviderConfig {
  styleURL?: string;
}

interface MapLibreRef {
  setCamera: (config: Partial<CameraConfig>) => void;
}

// Map/Camera için minimal ref tipleri (any kullanmadan)
type MapRefLike = {
  getZoom?: () => Promise<number> | number;
  getLayer?: (id: string) => unknown;
  removeLayer?: (id: string) => Promise<void> | void;
  getSource?: (id: string) => unknown;
  removeSource?: (id: string) => Promise<void> | void;
  addSource?: (id: string, source: unknown) => Promise<void> | void;
  addLayer?: (layer: unknown) => Promise<void> | void;
};

type CameraRefLike = {
  setCamera: (config: Partial<CameraConfig>) => void;
};

// Raster layer style factory
const getRasterLayerStyle = (opacity?: number) => ({
  rasterOpacity: opacity || 0.8,
  rasterFadeDuration: 200,
});

const MapLibreProvider = forwardRef<MapLibreRef, MapProviderProps & MapLibreProviderConfig>((props, ref) => {
  const {
    style,
    initialRegion,
    showUserLocation = true,
    showCompass = false,
    markers = [],
    clusters = [],
    mapStyle,
    layerSelection,
    onMapReady,
    onRegionChange,
    onRegionChangeComplete,
    onRegionIsChanging,
    onMarkerPress,
    onMapPress,
    onMapLongPress,
    children,
  } = props;

  const mapRef = useRef<MapRefLike | null>(null);
  const cameraRef = useRef<CameraRefLike | null>(null);
  
  // TEMİZ REF SİSTEMİ: Sadece setCamera metodu expose et
  useImperativeHandle(ref, () => ({
    setCamera: (config: Partial<CameraConfig>) => {
      if (cameraRef.current) {
        // 2D mod garanti: MapLibre tarafında her zaman pitch=0 uygula
        config.pitch = 0;
        cameraRef.current.setCamera(config);
      }
    }
  }), []);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [styleError, setStyleError] = useState<string | null>(null);


  // Handle camera changing (while moving) - for immediate crosshair display
  const handleCameraChanging = useCallback((feature: unknown) => {
    if (!onRegionIsChanging || !feature || typeof feature !== 'object') return;
    
    const featureObj = feature as { geometry?: { coordinates?: [number, number] } };
    if (!featureObj.geometry?.coordinates) return;
    
    onRegionIsChanging({
      latitude: featureObj.geometry.coordinates[1],
      longitude: featureObj.geometry.coordinates[0]
    });
  }, [onRegionIsChanging]);

  // Handle camera change with zoom
  const handleCameraChanged = useCallback(async (feature: unknown) => {
    if (!feature || typeof feature !== 'object') return;
    
    const featureObj = feature as { geometry?: { coordinates?: [number, number] } };
    if (!featureObj.geometry?.coordinates) return;
    
    // Get zoom level directly from MapView
    let zoom = 12;
    try {
      if (mapRef.current && mapRef.current.getZoom) {
        const zoomResult = await mapRef.current.getZoom();
        if (typeof zoomResult === 'number') {
          zoom = zoomResult;
        }
      }
    } catch (error) {
      // Use default zoom if getZoom fails
    }
    
    const region = {
      latitude: featureObj.geometry.coordinates[1],
      longitude: featureObj.geometry.coordinates[0],
      properties: {
        zoom,
        center: {
          coordinates: featureObj.geometry.coordinates
        }
      }
    };

    if (onRegionChange) {
      onRegionChange(region);
    }
    if (onRegionChangeComplete) {
      onRegionChangeComplete(region);
    }
  }, [onRegionChange, onRegionChangeComplete]);


  // Handle map ready and add overlays
  const handleMapReady = useCallback(async () => {
    try {
      setIsMapReady(true);
      setStyleError(null); // Clear any previous style errors
      
    
    if (onMapReady) {
      onMapReady();
    }
    } catch (error) {
      setStyleError('Harita style yüklenirken hata oluştu');
      // Don't force reload, just log error
    }
  }, [onMapReady]);

  // Convert clusters to GeoJSON
  const clustersGeoJSON = {
    type: 'FeatureCollection' as const,
    features: clusters.map((cluster) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [cluster.coordinate.longitude, cluster.coordinate.latitude],
      },
      properties: {
        id: cluster.id,
        count: cluster.count,
        cluster: true,
      },
    })),
  };

  const getMapStyle = () => {
    const baseMapId = layerSelection?.baseMapId || 'openfreemap-bright';
    
    // EMODnet base map - use as tile layer directly
    if (baseMapId === 'emodnet-bathymetry') {
      // EMODnet is a raster tile layer, not a style - return null to use tile source
      return null;
    }
    
    // MapTiler hybrid için özel kontrol
    if (baseMapId === 'maptiler-hybrid') {
      const key = MAPTILER_API_KEY;
      return key
        ? `https://api.maptiler.com/maps/hybrid/style.json?key=${key}`
        : (OPENFREEMAP_STYLES?.bright || 'https://tiles.openfreemap.org/styles/bright');
    }
    
    // OPENFREEMAP_STYLES undefined kontrolü
    if (!OPENFREEMAP_STYLES || !OPENFREEMAP_STYLES.bright) {
      // Fallback URL
      return 'https://tiles.openfreemap.org/styles/bright';
    }
    
    // Güvenlik kontrolü - sadece bilinen style'ları kullan
    const validStyles = ['openfreemap-bright', 'maptiler-hybrid', 'emodnet-bathymetry'];
    
    if (!validStyles.includes(baseMapId)) {
      return OPENFREEMAP_STYLES.bright || 'https://tiles.openfreemap.org/styles/bright';
    }
    
    switch (baseMapId) {
      case 'openfreemap-bright':
        return OPENFREEMAP_STYLES.bright || 'https://tiles.openfreemap.org/styles/bright';
      case 'maptiler-hybrid':
        return MAPTILER_API_KEY
          ? `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_API_KEY}`
          : (OPENFREEMAP_STYLES?.bright || 'https://tiles.openfreemap.org/styles/bright');
      default:
        return OPENFREEMAP_STYLES.bright || 'https://tiles.openfreemap.org/styles/bright';
    }
  };

  // Final map style with validation - Use prop if provided, otherwise use default
  const mapStyleToUse = typeof mapStyle === 'string' ? mapStyle : getMapStyle();
  const isEmodnetBase = layerSelection?.baseMapId === 'emodnet-bathymetry';
  
  // For EMODnet, use a basic OSM style as background
  const finalMapStyle = isEmodnetBase 
    ? (OPENFREEMAP_STYLES?.bright || 'https://tiles.openfreemap.org/styles/bright')
    : mapStyleToUse;
  
  // Null/undefined kontrolü - conditional rendering ile çöz
  if (!finalMapStyle) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>Harita stili yüklenemedi</Text>
        </View>
      </View>
    );
  }

  // Style constants for MapLibre layers
  const markerStyle = {
    iconImage: 'marker',
    iconSize: 0.8, // Orijinal boyut
    iconAllowOverlap: true,
    iconIgnorePlacement: true,
  };

  const clusterCircleStyle = {
    circleRadius: 20,
    circleColor: '#3498db',
    circleOpacity: 0.8,
    circleStrokeWidth: 2,
    circleStrokeColor: '#fff',
  };

  const clusterTextStyle = {
    textField: '{point_count}',
    textSize: 12,
    textColor: '#fff',
    textAllowOverlap: true,
  };

  const customClusterCircleStyle = {
    circleRadius: 25,
    circleColor: '#e74c3c',
    circleOpacity: 0.8,
    circleStrokeWidth: 2,
    circleStrokeColor: '#fff',
  };

  const customClusterTextStyle = {
    textField: '{count}',
    textSize: 14,
    textColor: '#fff',
    textAllowOverlap: true,
  };

  // Marker iconları yüklenemediği durumda görünürlük için fallback circle stil
  const markerFallbackCircleStyle = {
    circleRadius: 6,
    circleColor: '#e74c3c',
    circleOpacity: 0.9,
    circleStrokeWidth: 1.5,
    circleStrokeColor: '#fff',
  };
  
  // EMODNET raster için profesyonel ayarlar: fade kapalı, hafif kontrast artışı, nötr saturasyon + nearest resampling
  type EmodnetRasterStyle = {
    rasterOpacity: number;
    rasterFadeDuration: number;
    rasterContrast: number;
    rasterSaturation: number;
    rasterResampling?: 'nearest' | 'linear';
  };

  const emodnetRasterStyle: EmodnetRasterStyle = {
    rasterOpacity: 1.0,
    rasterFadeDuration: 0,
    rasterContrast: 0.08,
    rasterSaturation: 0,
    rasterResampling: 'nearest',
  };
  
  return (
    <View style={[styles.container, style]}>
      <MapLibreGL.MapView
        ref={(ref) => { mapRef.current = ref as unknown as MapRefLike; }}
        style={[styles.map, !isMapReady && styles.mapHidden]}
        mapStyle={finalMapStyle}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={showCompass}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={false}
        rotateEnabled={true}
        // MapLibre configuration
        onDidFinishLoadingMap={handleMapReady}
        regionWillChangeDebounceTime={0}
        regionDidChangeDebounceTime={0}
        onRegionIsChanging={handleCameraChanging}
        onRegionDidChange={handleCameraChanged}
        onPress={(event) => {
          // React Native Maps tarzı event format
          if (!event.geometry || !('coordinates' in event.geometry)) return;
          
          const coordinate = event.geometry.coordinates as [number, number];
          if (!coordinate || coordinate.length < 2) return;
          
          const mapPressEvent = {
            latitude: coordinate[1],
            longitude: coordinate[0]
          };
          
          // Normal map press
          if (onMapPress) {
            onMapPress(mapPressEvent);
          }
        }}
        onLongPress={(event) => {
          if (onMapLongPress && event.geometry && 'coordinates' in event.geometry) {
            const coordinate = event.geometry.coordinates as [number, number];
            onMapLongPress({ latitude: coordinate[1], longitude: coordinate[0] });
          }
        }}
      >
        <MapLibreGL.Camera
          ref={(ref) => { cameraRef.current = ref as unknown as CameraRefLike; }}
          defaultSettings={initialRegion ? {
            centerCoordinate: [initialRegion.longitude, initialRegion.latitude],
            zoomLevel: isEmodnetBase ? 10 : 14,
            pitch: 0,
          } : {
            zoomLevel: isEmodnetBase ? 10 : 14,
            pitch: 0,
          }}
          minZoomLevel={0}
          maxZoomLevel={isEmodnetBase ? 16 : 18}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User Location */}
        {showUserLocation && (
          <MapLibreGL.UserLocation 
            visible={true}
            animated={true}
            showsUserHeadingIndicator={true}
            androidRenderMode={Platform.OS === 'android' ? 'compass' : undefined}
          />
        )}

        {/* EMODnet Base Layer - Render as raster tiles when selected */}
        {isEmodnetBase && isMapReady && (
          <MapLibreGL.RasterSource
            id="emodnet-base"
            tileUrlTemplates={['https://tiles.emodnet-bathymetry.eu/2020/baselayer/web_mercator/{z}/{x}/{y}.png']}
            tileSize={256}
            // minZoomLevel removed to avoid global zoom-out restriction
            // maxZoomLevel will rely on default unless style/source enforces
          >
            <MapLibreGL.RasterLayer
              id="emodnet-base-layer"
              style={emodnetRasterStyle}
              sourceLayerID="emodnet-base"
            />
          </MapLibreGL.RasterSource>
        )}

        {/* Markers and overlays */}

        {/* Platform-specific markers: PointAnnotation (Android) vs MarkerView (iOS) */}
        {isMapReady && markers.filter(m => m.customView).map((marker) => {
          // Ensure customView is a valid ReactElement
          if (!marker.customView || !React.isValidElement(marker.customView)) {
            return null;
          }
          
          if (Platform.OS === 'android') {
            // Android: PointAnnotation - bitmap rendering
            return (
              <MapLibreGL.PointAnnotation
                key={marker.id}
                id={marker.id}
                coordinate={[marker.coordinate.longitude, marker.coordinate.latitude]}
                anchor={{ x: 0.5, y: 1 }}
                onSelected={() => {
                  if (onMarkerPress) {
                    onMarkerPress(marker);
                  }
                }}
              >
                <View style={styles.markerView}>
                  {marker.customView}
                </View>
              </MapLibreGL.PointAnnotation>
            );
          } else {
            // iOS: MarkerView - smooth interaction
            return (
              <MapLibreGL.MarkerView
                key={marker.id}
                coordinate={[marker.coordinate.longitude, marker.coordinate.latitude]}
                allowOverlap={true}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View pointerEvents="auto" style={styles.markerView}>
                  {marker.customView}
                </View>
              </MapLibreGL.MarkerView>
            );
          }
        })}

        {/* Standard markers with clustering - Using ShapeSource for better performance */}
        {markers.filter(m => !m.customView).length > 0 && isMapReady && (
          <MapLibreGL.ShapeSource
            id="markers"
            cluster={true}
            clusterRadius={50}
            clusterMaxZoomLevel={14}
            shape={{
              type: 'FeatureCollection' as const,
              features: markers
                .filter(m => !m.customView)
                .map((marker) => ({
                  type: 'Feature' as const,
                  geometry: {
                    type: 'Point' as const,
                    coordinates: [marker.coordinate.longitude, marker.coordinate.latitude],
                  },
                  properties: {
                    id: marker.id,
                    title: marker.title,
                    description: marker.description,
                  },
                })),
            }}
            onPress={(event) => {
              if (event.features && event.features.length > 0) {
                const feature = event.features[0];
                const featureId = feature.properties?.id as string | undefined;
                if (onMarkerPress && featureId) {
                  const markerObj = markers.find(m => m.id === featureId);
                  if (markerObj) {
                    onMarkerPress(markerObj);
                  }
                }
              }
            }}
          >
            {/* Individual markers */}
            {/* Fallback: Icon sprite mevcut değilse dairesel nokta render et */}
            <MapLibreGL.CircleLayer
              id="marker-fallback-circles"
              filter={['!', ['has', 'point_count']]}
              style={markerFallbackCircleStyle}
            />

            <MapLibreGL.SymbolLayer
              id="marker-icons"
              filter={['!', ['has', 'point_count']]}
              style={markerStyle}
            />

            {/* Cluster circles */}
            <MapLibreGL.CircleLayer
              id="cluster-circles"
              filter={["has", "point_count"]}
              style={clusterCircleStyle}
            />

            {/* Cluster text */}
            <MapLibreGL.SymbolLayer
              id="cluster-count"
              filter={["has", "point_count"]}
              style={clusterTextStyle}
            />
          </MapLibreGL.ShapeSource>
        )}

        {/* Custom cluster markers if provided separately */}
        {clusters.length > 0 && isMapReady && (
          <MapLibreGL.ShapeSource
            id="custom-clusters"
            shape={clustersGeoJSON}
          >
            <MapLibreGL.CircleLayer
              id="custom-cluster-circles"
              style={customClusterCircleStyle}
            />
            
            <MapLibreGL.SymbolLayer
              id="custom-cluster-count"
              style={customClusterTextStyle}
            />
          </MapLibreGL.ShapeSource>
        )}

        {/* EMODnet is now a base map - removed separate toggle */}

        {/* Marine Overlay Layers - Clean Regular System */}
        {isMapReady && layerSelection?.overlayIds?.map((overlayId: string) => {
          
          // Get layer from marine layers or general layers
          const layer = marineLayers.find(l => l.id === overlayId) || 
                       getLayerById(overlayId);
          
          // DEBUG: NOAA kontrol
          if (overlayId === 'noaa-enc') {
            console.log('MAPLIBRE NOAA OVERLAY DEBUG:', {
              overlayId,
              layer: !!layer,
              type: layer?.type,
              tileURL: layer?.tileURL?.substring(0, 50) + '...',
              isOverlay: layer?.isOverlay,
              isMapReady
            });
          }
          
          if (!layer || !layer.isOverlay || !layer.tileURL) return null;
          
          // WMS servisler için özel işlem
          if (layer.type === 'wms') {
            // WMS tiles için custom tile URL template oluştur
            const wmsURL = layer.tileURL
              .replace('{bbox}', '{bbox-epsg-3857}')
              .replace('&sr=3857', ''); // MapLibre kendi koordinat sistemini kullanır
              
            return (
              <MapLibreGL.RasterSource
                key={overlayId}
                id={`${overlayId}-source`}
                tileUrlTemplates={[wmsURL]}
                tileSize={256}
                minZoomLevel={layer.config?.minZoom || 0}
                maxZoomLevel={layer.config?.maxZoom || 18}
              >
                <MapLibreGL.RasterLayer
                  id={`${overlayId}-layer`}
                  style={getRasterLayerStyle(layer.opacity)}
                />
              </MapLibreGL.RasterSource>
            );
          }
          
          // Tile layer işlemi
          if (layer.type !== 'tile') return null;
          
          // NOAA için özel URL formatı (zoom offset uygula)
          let tileURL = layer.tileURL;
          let adjustedMinZoom = layer.config?.minZoom || 0;
          let adjustedMaxZoom = layer.config?.maxZoom || 18;
          
          if (overlayId === 'noaa-enc' && layer.config?.zoomOffset) {
            // NOAA tiles için zoom level düzeltmesi gerekiyor ama MapLibre için URL'yi değiştirmiyoruz
            // Çünkü MapLibre zoom seviyelerini otomatik olarak dönüştürür
            adjustedMinZoom = Math.max(0, adjustedMinZoom + Math.abs(layer.config.zoomOffset));
            adjustedMaxZoom = adjustedMaxZoom + Math.abs(layer.config.zoomOffset);
          }
          
          return (
            <MapLibreGL.RasterSource
              key={overlayId}
              id={`${overlayId}-source`}
              tileUrlTemplates={[tileURL]}
              tileSize={256}
              minZoomLevel={adjustedMinZoom}
              maxZoomLevel={adjustedMaxZoom}
            >
              <MapLibreGL.RasterLayer
                id={`${overlayId}-layer`}
                style={getRasterLayerStyle(layer.opacity)}
              />
            </MapLibreGL.RasterSource>
          );
        })}

        {/* Children (custom markers, overlays, etc.) */}
        {children}
      </MapLibreGL.MapView>
      
      {/* Style Error Notification */}
      {styleError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{styleError}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapHidden: {
    opacity: 0,
  },
  markerView: {
    width: 30,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  errorOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
});



export default MapLibreProvider;