import React from 'react';
import { ViewStyle } from 'react-native';
import { MapLayerSelection } from './layers/types';

// Koordinat tipleri
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CoordinateTuple {
  longitude: number;
  latitude: number;
}

// Harita bölgesi
export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
  // Extended properties for MapLibre
  properties?: {
    zoom?: number;
    center?: {
      coordinates?: [number, number];
    };
    bounds?: {
      ne?: [number, number];
      sw?: [number, number];
    };
  };
}

// Kamera konfigürasyonu
export interface CameraConfig {
  centerCoordinate: [number, number]; // [longitude, latitude]
  zoomLevel?: number;
  pitch?: number;
  heading?: number;
  animationDuration?: number;
  animationMode?: 'flyTo' | 'easeTo' | 'moveTo';
}

// Marker tipleri
export interface MapMarker {
  id: string;
  coordinate: Coordinates;
  title?: string;
  description?: string;
  image?: string;
  color?: string;
  draggable?: boolean;
  onPress?: () => void;
  onDragEnd?: (coordinate: Coordinates) => void;
  customView?: React.ReactNode;
}

// Cluster marker
export interface ClusterMarker extends MapMarker {
  count: number;
  markers: MapMarker[];
}

// Harita stili
export interface MapStyle {
  id: string;
  name: string;
  styleURL?: string;
  icon?: string;
}

// Provider özellikleri
export interface MapProviderProps {
  style?: ViewStyle;
  initialRegion?: Region;
  showUserLocation?: boolean;
  followUserLocation?: boolean;
  showCompass?: boolean;
  showZoomControls?: boolean;
  showScale?: boolean;
  markers?: MapMarker[];
  clusters?: ClusterMarker[];
  mapStyle?: string | MapStyle;
  layerSelection?: MapLayerSelection;
  onMapReady?: () => void;
  onRegionChange?: (region: Region) => void;
  onRegionChangeComplete?: (region: Region) => void;
  onRegionIsChanging?: (region: Region) => void;
  onMarkerPress?: (marker: MapMarker) => void;
  onMapPress?: (coordinate: Coordinates) => void;
  onMapLongPress?: (coordinate: Coordinates) => void;
  cameraRef?: React.RefObject<{ setCamera: (config: Partial<CameraConfig>) => void }>;
  mapRef?: React.RefObject<unknown>;
  children?: React.ReactNode;
}

// Ana Map View Props
export interface UniversalMapViewProps extends Omit<MapProviderProps, 'mapRef' | 'cameraRef'> {
  provider?: MapProviderType;
  fallbackProvider?: MapProviderType;
  onProviderError?: (error: Error, provider: MapProviderType) => void;
  showProviderSelector?: boolean;
  enableCaching?: boolean;
  debugMode?: boolean;
}

// Provider tipleri
export type MapProviderType = 'maplibre' | 'mapbox' | 'leaflet' | 'osm' | 'google';

// Provider interface
export interface IMapProvider {
  name: MapProviderType;
  isAvailable: () => boolean;
  initialize?: () => Promise<void>;
  cleanup?: () => void;
  render: (props: MapProviderProps) => React.ReactElement;
}

// Harita bounds
export interface MapBounds {
  ne: [number, number]; // [longitude, latitude] - northeast
  sw: [number, number]; // [longitude, latitude] - southwest
}


// Harita katmanları
export interface MapLayer {
  id: string;
  type: 'raster' | 'vector' | 'geojson';
  source: string;
  sourceLayer?: string;
  minZoom?: number;
  maxZoom?: number;
  paint?: Record<string, string | number | boolean | string[] | number[]>;
  layout?: Record<string, string | number | boolean | string[] | number[]>;
}

// Export all types
export type {
  MapProviderProps as MapProps,
  UniversalMapViewProps as UniversalMapProps,
};