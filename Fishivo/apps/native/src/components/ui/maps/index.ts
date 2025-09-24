// Main exports
export { default as UniversalMapView } from './UniversalMapView';
export * from './types';
export { default as LinearCompass } from './LinearCompass';

// Marker exports
export { default as MapClusterMarker } from './markers/MapClusterMarker';
export { FishivoMarker } from './markers/FishivoMarker';

// Re-export layer types with explicit names to avoid conflicts
export type { MapLayer as LayerType, LayerCategory, MapLayerSelection } from './layers/types';
export * from './layers/layerDefinitions';

// Provider exports (for advanced usage)
// MapLibreProvider is used internally by UniversalMapView