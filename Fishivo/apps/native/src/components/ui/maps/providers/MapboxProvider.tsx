import React, { useRef, useCallback, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { MapProviderProps, CameraConfig } from '@/components/ui/maps/types';
import { getLayerById } from '@/components/ui/maps/layers/layerDefinitions';
import Config from 'react-native-config';

// Mapbox initialization with access token
const MAPBOX_ACCESS_TOKEN = Config.MAPBOX_ACCESS_TOKEN;
if (MAPBOX_ACCESS_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
}

// Set telemetry for privacy
MapboxGL.setTelemetryEnabled(false);

interface MapboxProviderConfig {
  styleURL?: string;
  enable3DTerrain?: boolean;
}

interface MapboxRef {
  setCamera: (config: Partial<CameraConfig>) => void;
}

// Mapbox MapView ref-like methods we use at runtime (type-safe, no any)
type MapboxMapRefLike = {
  getCenter?: () => Promise<[number, number]> | [number, number];
  getZoom?: () => Promise<number> | number;
};

// Style functions for dynamic styles
const getTerrainStyle = (baseMapId?: string) => ({
  exaggeration: baseMapId === 'mapbox-3d-satellite' ? 2.0 : 3.0
});

const getBuildingStyle = (baseMapId?: string) => ({
  fillExtrusionColor: baseMapId === 'mapbox-3d-satellite' 
    ? ['interpolate', ['linear'], ['get', 'height'], 0, '#ddd', 200, '#ccc']
    : '#aaa',
  fillExtrusionHeight: [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['get', 'height']
  ],
  fillExtrusionBase: [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['get', 'min_height']
  ],
  fillExtrusionOpacity: 0.8,
});

const MapboxProvider = forwardRef<MapboxRef, MapProviderProps & MapboxProviderConfig>((props, ref) => {
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
    onRegionIsChanging,
    onRegionChangeComplete,
    onMarkerPress,
    onMapPress,
    onMapLongPress,
    children,
    enable3DTerrain = false, // Default to false - sadece 3D katmanlarda aktif olacak
  } = props;

  const mapRef = useRef<MapboxGL.MapView | null>(null);
  const cameraRef = useRef<MapboxGL.Camera | null>(null);
  
  // Expose camera control methods
  useImperativeHandle(ref, () => ({
    setCamera: (config: Partial<CameraConfig>) => {
      if (!cameraRef.current) return;

      const cameraConfig: any = {
        animationDuration: 600,
        animationMode: 'easeTo',
        ...config,
      };

      // 2D/3D pitch-override KALDIRILDI: sadece verilen değerleri uygula
      cameraRef.current.setCamera(cameraConfig);
    },
  }));
  
  const [isMapReady, setIsMapReady] = useState(false);


  // Camera hareket ederken anlık bölge bildirimi (Mapbox onCameraChanged)
  const handleCameraMoving = useCallback((state: unknown) => {
    if (!onRegionIsChanging) return;

    const s = state as { properties?: { center?: [number, number] } };
    const center = s?.properties?.center;
    if (!center || !Array.isArray(center) || center.length < 2) {
      return;
    }

    onRegionIsChanging({
      latitude: center[1],
      longitude: center[0],
    });
  }, [onRegionIsChanging]);

  // Kamera durduğunda final bölge bildirimi (Mapbox onMapIdle)
  const handleMapIdle = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      const ref = mapRef.current as unknown as MapboxMapRefLike;
      const center = await ref.getCenter?.();
      const zoom = await ref.getZoom?.();

      if (!center || !Array.isArray(center) || center.length < 2) return;

      const region = {
        latitude: center[1],
        longitude: center[0],
        properties: {
          zoom: typeof zoom === 'number' ? zoom : undefined,
          center: { coordinates: center as [number, number] },
        },
      };

      if (onRegionChange) {
        onRegionChange(region);
      }
      if (onRegionChangeComplete) {
        onRegionChangeComplete(region);
      }
    } catch {
      // ignore
    }
  }, [onRegionChange, onRegionChangeComplete]);

  // Handle map ready and add 3D terrain
  const handleMapReady = useCallback(async () => {
    setIsMapReady(true);
    
    if (onMapReady) {
      onMapReady();
    }
  }, [onMapReady]);

  // Get map style URL - style toggle sırasında reload olmaması için sadece baseMapId/mapStyle’a bağlı
  const getMapStyle = () => {
    if (mapStyle) return mapStyle;
  
    const baseMapId = layerSelection?.baseMapId || 'mapbox-3d-terrain';
    const layer = getLayerById(baseMapId);
  
    if (layer?.styleURL) {
      return layer.styleURL;
    }
  
    // Fallback: baseMapId uydu ise uydu stili, aksi halde outdoors (DEM destekli)
    if (baseMapId === 'mapbox-3d-satellite') {
      return 'mapbox://styles/mapbox/satellite-streets-v12';
    }
    return 'mapbox://styles/mapbox/outdoors-v12';
  };

  // Setup 3D terrain source and layer
  useEffect(() => {
    if (!isMapReady || !enable3DTerrain || !mapRef.current) return;
    
    // The terrain is configured through the style
    // Mapbox v12 styles have built-in terrain support
  }, [isMapReady, enable3DTerrain]);

  const mapStyleUrl = getMapStyle();
  const isMapboxStyle = typeof mapStyleUrl === 'string' && (mapStyleUrl as string).startsWith('mapbox://styles/');
  const shouldRender3D = isMapboxStyle && (enable3DTerrain || layerSelection?.baseMapId === 'mapbox-3d-satellite');
  const shouldRender3DBuildings = shouldRender3D && layerSelection?.baseMapId === 'mapbox-3d-terrain';

  return (
    <View style={[styles.container, style]}>
      <MapboxGL.MapView
        ref={mapRef}
        style={[styles.map, !isMapReady && styles.mapHidden]}
        styleURL={mapStyleUrl as string}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={showCompass}
        scaleBarEnabled={false}
        pitchEnabled={shouldRender3D}
        rotateEnabled={shouldRender3D}
        projection={shouldRender3D ? "globe" : "mercator"}
        onDidFinishLoadingMap={handleMapReady}
        onMapIdle={handleMapIdle}
        onCameraChanged={handleCameraMoving}
        onPress={(event) => {
          if (onMapPress && event.geometry && 'coordinates' in event.geometry) {
            const coords = event.geometry.coordinates as [number, number];
            onMapPress({
              latitude: coords[1],
              longitude: coords[0]
            });
          }
        }}
        onLongPress={(event) => {
          if (onMapLongPress && event.geometry && 'coordinates' in event.geometry) {
            const coords = event.geometry.coordinates as [number, number];
            onMapLongPress({
              latitude: coords[1],
              longitude: coords[0]
            });
          }
        }}
        // 3D terrain handled by Terrain component below
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={initialRegion ? {
            centerCoordinate: [initialRegion.longitude, initialRegion.latitude],
            zoomLevel: 14,
            // İlk karede 3D bekleniyorsa 3D pitch ile başla
            pitch: shouldRender3D ? 60 : 0,
            heading: 0,
          } : {
            // 3D moddaysak ilk karede 3D pitch kullan
            zoomLevel: 14,
            pitch: shouldRender3D ? 60 : 0,
            heading: 0,
          }}
          minZoomLevel={0}
          maxZoomLevel={18}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User Location - Same style as MapLibre */}
        {showUserLocation && (
          <MapboxGL.UserLocation 
            visible={true}
            animated={true}
            showsUserHeadingIndicator={true}
            androidRenderMode={Platform.OS === 'android' ? 'compass' : undefined}
          />
        )}

        {/* Add terrain source and terrain component for real 3D */}
        {/* DEM kaynağını her zaman mount ediyoruz; 3D kapalıyken exaggeration=0 */}
        <MapboxGL.RasterDemSource
          id="mapbox-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={514}
          maxZoomLevel={14}
        >
          <MapboxGL.Terrain
            sourceID="mapbox-dem"
            style={shouldRender3D ? getTerrainStyle(layerSelection?.baseMapId) : ZERO_TERRAIN_STYLE}
          />
        </MapboxGL.RasterDemSource>

        {/* Atmosphere and Sky for better 3D visuals */}
        {shouldRender3D && isMapReady && (
          <>
            <MapboxGL.Atmosphere style={atmosphereStyle} />
            <MapboxGL.SkyLayer id="sky" style={skyLayerStyle} />

            {/* Optional 3D buildings only for vector 3D terrain, not for 3D satellite */}
            {shouldRender3DBuildings && (
              <MapboxGL.FillExtrusionLayer
                id="3d-buildings"
                sourceID="composite"
                sourceLayerID="building"
                minZoomLevel={15}
                maxZoomLevel={22}
                filter={['==', 'extrude', 'true']}
                style={getBuildingStyle(layerSelection?.baseMapId)}
              />
            )}
          </>
        )}

        {/* Overlay Tile Layers - OpenSeaMap gibi tile overlay'ler ve WMS için */}
        {layerSelection?.overlayIds?.map((overlayId) => {
          const overlayLayer = getLayerById(overlayId);
          
          // DEBUG: NOAA kontrol
          if (overlayId === 'noaa-enc') {
            console.log('NOAA OVERLAY DEBUG:', {
              overlayId,
              overlayLayer: !!overlayLayer,
              type: overlayLayer?.type,
              tileURL: overlayLayer?.tileURL?.substring(0, 50) + '...',
              isOverlay: overlayLayer?.isOverlay
            });
          }
          
          if (!overlayLayer || !overlayLayer.tileURL) return null;

          // WMS servisler için özel işlem
          if (overlayLayer.type === 'wms') {
            // WMS tiles için custom tile URL template oluştur
            const wmsURL = overlayLayer.tileURL
              .replace('{bbox}', '{bbox-epsg-3857}')
              .replace('&sr=3857', ''); // Mapbox kendi koordinat sistemini kullanır
              
            return (
              <MapboxGL.RasterSource
                key={overlayId}
                id={overlayId}
                tileUrlTemplates={[wmsURL]}
                tileSize={256}
                minZoomLevel={overlayLayer.config?.minZoom || 0}
                maxZoomLevel={overlayLayer.config?.maxZoom || 18}
                attribution={overlayLayer.config?.attribution}
              >
                <MapboxGL.RasterLayer
                  id={`${overlayId}-layer`}
                  sourceID={overlayId}
                  style={{
                    rasterOpacity: overlayLayer.opacity || 0.8,
                  }}
                  minZoomLevel={overlayLayer.config?.minZoom || 0}
                  maxZoomLevel={overlayLayer.config?.maxZoom || 18}
                />
              </MapboxGL.RasterSource>
            );
          }

          // Tile layer işlemi
          if (overlayLayer.type !== 'tile') return null;

          // NOAA için özel URL formatı (zoom offset ve koordinat sırası)
          let tileURL = overlayLayer.tileURL;
          if (overlayId === 'noaa-enc' && overlayLayer.config?.zoomOffset) {
            // NOAA tiles için zoom level offset uygula
            tileURL = overlayLayer.tileURL.replace('{z}', `{z${overlayLayer.config.zoomOffset}}`);
          }

          return (
            <MapboxGL.RasterSource
              key={overlayId}
              id={overlayId}
              tileUrlTemplates={[tileURL]}
              tileSize={256}
              minZoomLevel={(overlayLayer.config?.minZoom || 0) + Math.abs(overlayLayer.config?.zoomOffset || 0)}
              maxZoomLevel={(overlayLayer.config?.maxZoom || 18) + Math.abs(overlayLayer.config?.zoomOffset || 0)}
              attribution={overlayLayer.config?.attribution}
            >
              <MapboxGL.RasterLayer
                id={`${overlayId}-layer`}
                sourceID={overlayId}
                style={{
                  rasterOpacity: overlayLayer.opacity || 0.8,
                }}
                minZoomLevel={(overlayLayer.config?.minZoom || 0) + Math.abs(overlayLayer.config?.zoomOffset || 0)}
                maxZoomLevel={(overlayLayer.config?.maxZoom || 18) + Math.abs(overlayLayer.config?.zoomOffset || 0)}
              />
            </MapboxGL.RasterSource>
          );
        })}

        {/* Markers */}
        {markers.map((marker) => (
          <MapboxGL.PointAnnotation
            key={marker.id}
            id={marker.id}
            coordinate={[marker.coordinate.longitude, marker.coordinate.latitude]}
            onSelected={() => {
              if (onMarkerPress) {
                onMarkerPress(marker);
              }
            }}
          >
            <View style={styles.markerView}>
              {React.isValidElement(marker.customView) ? marker.customView : (
                <Text>📍</Text>
              )}
            </View>
          </MapboxGL.PointAnnotation>
        ))}

        {/* Clusters */}
        {clusters.length > 0 && (
          <MapboxGL.ShapeSource
            id="clusters"
            cluster
            clusterRadius={50}
            clusterMaxZoomLevel={14}
            shape={{
              type: 'FeatureCollection',
              features: clusters.map((cluster) => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [cluster.coordinate.longitude, cluster.coordinate.latitude],
                },
                properties: {
                  id: cluster.id,
                  count: cluster.count,
                },
              })),
            }}
          >
            <MapboxGL.CircleLayer
              id="cluster-circles"
              filter={['has', 'point_count']}
              style={clusterCircleStyle}
            />
            
            <MapboxGL.SymbolLayer
              id="cluster-count"
              filter={['has', 'point_count']}
              style={clusterTextStyle}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Children */}
        {children}
      </MapboxGL.MapView>
    </View>
  );
});

const atmosphereStyle = {
  color: 'rgb(186, 210, 235)',
  highColor: 'rgb(36, 92, 223)',
  horizonBlend: 0.02,
  spaceColor: 'rgb(11, 11, 25)',
  starIntensity: 0.6,
};

const skyLayerStyle = {
  skyType: 'atmosphere',
  skyAtmosphereSun: [0.0, 0.0],
  skyAtmosphereSunIntensity: 15.0,
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
};

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
});

const ZERO_TERRAIN_STYLE = { exaggeration: 0 } as const;
export default MapboxProvider;