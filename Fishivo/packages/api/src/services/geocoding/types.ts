/**
 * Geocoding Service Type Definitions
 * 
 * Reverse geocoding (koordinat → şehir/ülke) ve forward geocoding (şehir → koordinat) için
 * kullanılan type tanımları.
 */

export interface GeocodingResult {
  /** Şehir adı (İstanbul, Ankara, New York) */
  city?: string;
  
  /** Eyalet/İl adı (İstanbul, Ankara İli, California) */
  state?: string;
  
  /** Ülke adı (Türkiye, United States) */
  country: string;
  
  /** ISO 3166-1 alpha-2 ülke kodu (TR, US, DE) */
  countryCode: string;
  
  /** Formatlanmış adres string'i (İstanbul, Türkiye) */
  formattedAddress: string;
  
  /** Deprecated: Use formattedAddress instead */
  address?: string;
  
  /** Sonucun güvenilirlik skoru (0.0 - 1.0) */
  confidence?: number;
  
  /** Ham provider response data (debug için) */
  rawData?: any;
}

export interface GeocodingError {
  /** Hata tipi */
  type: 'network' | 'timeout' | 'parsing' | 'not_found' | 'rate_limit' | 'unknown';
  
  /** Hata mesajı */
  message: string;
  
  /** HTTP status code (varsa) */
  statusCode?: number;
  
  /** Orijinal hata objesi */
  originalError?: any;
}

export interface GeocodingOptions {
  /** Request timeout süresi (ms) - default 10000 */
  timeout?: number;
  
  /** Tercih edilen dil (tr, en) - default 'tr' */
  language?: string;
  
  /** Cache kullanılsın mı - default true */
  useCache?: boolean;
  
  /** Cache süresi (ms) - default 1 saat */
  cacheDuration?: number;
  
  /** Retry sayısı - default 2 */
  retryCount?: number;
}

export interface ForwardGeocodingResult extends GeocodingResult {
  /** Koordinatlar [longitude, latitude] */
  coordinates: [number, number];
  
  /** Bounding box koordinatları (varsa) */
  boundingBox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

/**
 * Nominatim OpenStreetMap API response interface
 * https://nominatim.openstreetmap.org/reverse
 */
export interface NominatimResponse {
  place_id?: number;
  licence?: string;
  osm_type?: string;
  osm_id?: number;
  lat?: string;
  lon?: string;
  class?: string;
  type?: string;
  place_rank?: number;
  importance?: number;
  addresstype?: string;
  name?: string;
  display_name?: string;
  address?: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state_district?: string;
    state?: string;
    province?: string; // İl bilgisi (Kocaeli, İstanbul gibi)
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox?: [string, string, string, string];
  error?: string;
}

/**
 * Cache entry interface
 */
export interface GeocodingCacheEntry {
  /** Cache key */
  key: string;
  
  /** Cached result */
  result: GeocodingResult;
  
  /** Cache timestamp */
  timestamp: number;
  
  /** Cache expiry time */
  expiresAt: number;
}

/**
 * Geocoding service interface
 */
export interface GeocodingService {
  /**
   * Reverse geocoding: koordinat → şehir/ülke bilgisi
   */
  reverseGeocode(
    latitude: number,
    longitude: number,
    options?: GeocodingOptions
  ): Promise<GeocodingResult>;
  
  /**
   * Forward geocoding: şehir/adres → koordinat (gelecekte implementasyon)
   */
  forwardGeocode?(
    query: string,
    options?: GeocodingOptions
  ): Promise<ForwardGeocodingResult[]>;
  
  /**
   * Cache'i temizle
   */
  clearCache?(): Promise<void>;
  
  /**
   * Cache istatistikleri
   */
  getCacheStats?(): Promise<{
    size: number;
    hitRate: number;
    entries: number;
  }>;
}

/**
 * Provider-specific configurations
 */
export interface GeocodingProviderConfig {
  /** Provider adı */
  name: string;
  
  /** API endpoint URL */
  baseUrl: string;
  
  /** API key (varsa) */
  apiKey?: string;
  
  /** Rate limit (requests/second) */
  rateLimit?: number;
  
  /** Default timeout */
  timeout?: number;
  
  /** Desteklenen diller */
  supportedLanguages?: string[];
}