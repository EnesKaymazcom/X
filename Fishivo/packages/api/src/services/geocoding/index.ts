/**
 * Geocoding Service Exports
 * 
 * Platform-specific geocoding servisleri ve type definitions
 */

// Types
export type {
  GeocodingService,
  GeocodingResult,
  GeocodingError,
  GeocodingOptions,
  ForwardGeocodingResult,
  NominatimResponse,
  GeocodingCacheEntry,
  GeocodingProviderConfig
} from './types';

// Native implementation
export {
  NativeGeocodingService,
  createNativeGeocodingService,
  getNativeGeocodingService
} from './geocoding.native';

// Web implementation  
export {
  WebGeocodingService,
  createWebGeocodingService,
  getWebGeocodingService
} from './geocoding.web';