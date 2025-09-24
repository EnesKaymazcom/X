export interface MapLayer {
  id: string;
  name: string;
  description?: string;
  category: 'base' | 'navigation' | 'marine' | 'overlay' | 'special' | 'bathymetry';
  type: 'maplibre' | 'custom' | 'tile' | 'wms' | 'none';
  styleURL?: string;
  tileURL?: string;
  wmsParams?: {
    service: string;
    version: string;
    request: string;
    layers: string;
    styles: string;
    format: string;
    crs: string;
    width: number;
    height: number;
  };
  icon: string;
  thumbnail?: string;
  previewImage?: number; // require() image asset for visual preview
  isPro?: boolean;
  isPremium?: boolean;
  isNew?: boolean;
  isOverlay?: boolean;
  opacity?: number;
  config?: {
    minZoom?: number;
    maxZoom?: number;
    attribution?: string;
    provider?: 'maplibre' | 'mapbox'; // Harita provider tercihi
    requires3D?: boolean; // 3D terrain gereksinimi
    zoomOffset?: number; // NOAA gibi özel tile servisleri için zoom offset
    coordinateOrder?: 'xyz' | 'zyx'; // Koordinat sırası (default: xyz, NOAA: zyx)
    [key: string]: string | number | boolean | undefined;
  };
}

export interface LayerCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  layers: readonly MapLayer[];
}

export interface MapLayerSelection {
  baseMapId: string;
  overlayIds: string[];
  enable3DTerrain?: boolean;
  enableEmodnet?: boolean;
}

// Exclusive Layer Group - Professional marine navigation pattern
export interface ExclusiveLayerGroup {
  id: string;
  name: string;
  description: string;
  type: 'exclusive'; // Only one layer active at a time
  icon: string;
  defaultLayer: string; // Default selection
  layers: MapLayer[];
}

