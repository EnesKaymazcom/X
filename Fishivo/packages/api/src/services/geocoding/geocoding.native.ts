/**
 * Native Geocoding Service
 * 
 * React Native uygulamalar için reverse geocoding servisi.
 * Nominatim OpenStreetMap API kullanarak koordinatları şehir/ülke bilgisine çevirir.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { 
  GeocodingService, 
  GeocodingResult, 
  GeocodingError, 
  GeocodingOptions,
  NominatimResponse,
  GeocodingCacheEntry,
  ForwardGeocodingResult 
} from './types';

const CACHE_KEY_PREFIX = '@fishivo_geocoding_cache_';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const DEFAULT_RETRY_COUNT = 2;

export class NativeGeocodingService implements GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private lastRequestTime = 0;
  private readonly minRequestInterval = 1100; // 1.1 seconds to be safe

  /**
   * Forward geocoding: şehir/adres → koordinat
   */
  async forwardGeocode(
    query: string,
    options: GeocodingOptions = {}
  ): Promise<ForwardGeocodingResult[]> {
    const {
      timeout = DEFAULT_TIMEOUT,
      language = 'tr',
      useCache = true,
      cacheDuration = DEFAULT_CACHE_DURATION,
      retryCount = DEFAULT_RETRY_COUNT
    } = options;

    // Input validation
    if (!query || query.trim().length < 2) {
      throw this.createError('parsing', 'Arama metni çok kısa (min 2 karakter)');
    }

    // Cache key for forward geocoding
    const cacheKey = `${CACHE_KEY_PREFIX}forward_${query.toLowerCase().replace(/\s+/g, '_')}_${language}`;

    // Cache kontrolü
    if (useCache) {
      try {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          const entry = JSON.parse(cachedData);
          if (Date.now() < entry.expiresAt) {
            return entry.results;
          }
        }
      } catch {
        // Ignore cache errors
      }
    }

    // API call with retry logic
    let lastError: any;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const results = await this.performForwardGeocode(query, language, timeout);
        
        // Cache the successful results
        if (useCache && results.length > 0) {
          try {
            await AsyncStorage.setItem(cacheKey, JSON.stringify({
              results,
              timestamp: Date.now(),
              expiresAt: Date.now() + cacheDuration
            }));
          } catch {
            // Ignore cache errors
          }
        }
        
        return results;
      } catch (error) {
        lastError = error;
        
        // Don't retry for certain error types
        if (error instanceof Error && 
           (error.message.includes('not_found') || error.message.includes('parsing'))) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retryCount) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed
    throw lastError || this.createError('unknown', 'Geocoding başarısız oldu');
  }

  /**
   * Perform forward geocoding API call
   */
  private async performForwardGeocode(
    query: string,
    language: string,
    timeout: number
  ): Promise<ForwardGeocodingResult[]> {
    // Rate limiting - Nominatim requires max 1 request per second
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.delay(this.minRequestInterval - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();

    // Nominatim dokümantasyonuna göre EXACT URL format
    // https://nominatim.openstreetmap.org/search?q=<query>&format=json&addressdetails=1&limit=5
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&accept-language=${language}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Fishivo/1.0 (contact@fishivo.com)',
          'Accept': 'application/json',
          'Accept-Language': language,
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 429) {
          throw this.createError('rate_limit', 'Çok fazla istek gönderildi', response.status);
        }
        throw this.createError('network', `HTTP ${response.status}: ${errorText}`, response.status);
      }

      const data = await response.json();
      
      // Nominatim returns array of results
      if (!Array.isArray(data)) {
        throw this.createError('parsing', 'Geçersiz API yanıtı - Array bekleniyor');
      }

      if (data.length === 0) {
        throw this.createError('not_found', 'Sonuç bulunamadı');
      }
      
      // Parse each result according to Nominatim response format
      return data.map(item => this.parseForwardGeocodingResult(item));
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw this.createError('timeout', 'İstek zaman aşımına uğradı');
      }
      
      if (error.message?.includes('rate_limit') || 
          error.message?.includes('not_found') || 
          error.message?.includes('parsing')) {
        throw error;
      }
      
      throw this.createError('network', `Ağ hatası: ${error.message}`, undefined, error);
    }
  }

  /**
   * Parse forward geocoding result
   */
  private parseForwardGeocodingResult(item: any): ForwardGeocodingResult {
    try {
      // Nominatim response format according to documentation
      // lat and lon are strings in the response
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Invalid coordinates');
      }

      // address object contains detailed address breakdown
      const address = item.address || {};
      
      // Extract city name - Nominatim response priority
      const city = address.city || 
                  address.town ||
                  address.village || 
                  address.municipality ||
                  address.province ||
                  address.state ||
                  address.state_district ||
                  address.county ||
                  '';

      const state = address.state || address.province || address.state_district || '';
      const country = address.country || '';
      const countryCode = address.country_code?.toUpperCase() || '';

      // display_name is always provided by Nominatim
      const formattedAddress = item.display_name || '';

      // boundingbox format: [south, north, west, east] as strings
      let boundingBox;
      if (item.boundingbox && Array.isArray(item.boundingbox) && item.boundingbox.length === 4) {
        boundingBox = {
          south: parseFloat(item.boundingbox[0]),
          north: parseFloat(item.boundingbox[1]),
          west: parseFloat(item.boundingbox[2]),
          east: parseFloat(item.boundingbox[3])
        };
      }

      return {
        coordinates: [lon, lat] as [number, number],
        city,
        state,
        country,
        countryCode,
        formattedAddress,
        confidence: parseFloat(item.importance) || 0.5,
        boundingBox,
        rawData: item
      };
    } catch (error) {
      throw this.createError('parsing', 'Yanıt ayrıştırılamadı', undefined, error);
    }
  }

  /**
   * Reverse geocoding: koordinat → şehir/ülke bilgisi
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
    options: GeocodingOptions = {}
  ): Promise<GeocodingResult> {
    const {
      timeout = DEFAULT_TIMEOUT,
      language = 'tr',
      useCache = true,
      cacheDuration = DEFAULT_CACHE_DURATION,
      retryCount = DEFAULT_RETRY_COUNT
    } = options;

    // Input validation
    if (!this.isValidCoordinate(latitude, longitude)) {
      throw this.createError('parsing', 'Geçersiz koordinat değerleri');
    }

    // Cache kontrolü
    if (useCache) {
      const cachedResult = await this.getCachedResult(latitude, longitude);
      if (cachedResult) {
        return cachedResult;
      }
    }

    // API call with retry logic
    let lastError: any;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const result = await this.performReverseGeocode(latitude, longitude, language, timeout);
        
        // Cache the successful result
        if (useCache) {
          await this.cacheResult(latitude, longitude, result, cacheDuration);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Don't retry for certain error types
        if (error instanceof Error && 
           (error.message.includes('not_found') || error.message.includes('parsing'))) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retryCount) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed
    throw lastError || this.createError('unknown', 'Geocoding başarısız oldu');
  }

  /**
   * Actual Nominatim API call
   */
  private async performReverseGeocode(
    latitude: number,
    longitude: number,
    language: string,
    timeout: number
  ): Promise<GeocodingResult> {
    // Rate limiting - Nominatim requires max 1 request per second
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.delay(this.minRequestInterval - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();

    // Nominatim API exact format from documentation
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18&accept-language=${language}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Fishivo/1.0 (contact@fishivo.com)',
          'Accept': 'application/json',
          'Accept-Language': language,
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw this.createError('rate_limit', 'Çok fazla istek gönderildi', response.status);
        }
        throw this.createError('network', `HTTP ${response.status}`, response.status);
      }

      const data: NominatimResponse = await response.json();
      
      if (data.error) {
        throw this.createError('not_found', data.error);
      }

      return this.parseNominatimResponse(data);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw this.createError('timeout', 'İstek zaman aşımına uğradı');
      }
      
      if (error.message?.includes('rate_limit') || 
          error.message?.includes('not_found') || 
          error.message?.includes('parsing')) {
        throw error;
      }
      
      throw this.createError('network', 'Ağ hatası oluştu', undefined, error);
    }
  }

  /**
   * Parse Nominatim response to our format
   */
  private parseNominatimResponse(data: NominatimResponse): GeocodingResult {
    try {
      const address = data.address;
      if (!address) {
        throw new Error('Address data missing');
      }

      // Extract city name with priority order (Şehir)
      // Türkiye'de province genelde şehir adıdır (Kocaeli, İstanbul vb.)
      const city = address.city || 
                  address.province ||
                  address.state ||
                  address.village || 
                  address.state_district;

      // Extract state/province
      const state = address.state || address.state_district;

      // Extract country info
      const country = address.country || '';
      const countryCode = address.country_code?.toUpperCase() || '';

      if (!country || !countryCode) {
        throw new Error('Country information missing');
      }

      // Extract more detailed location info - Standard format: Mahalle, İlçe, Şehir, Ülke
      const neighbourhood = address.neighbourhood || address.suburb;
      const district = address.town || address.city_district || address.municipality;
      
      // Build formatted address - Standard format: Mahalle, İlçe, Şehir, Ülke
      const addressParts: string[] = [];
      
      // Mahalle
      if (neighbourhood) {
        addressParts.push(neighbourhood);
      }
      
      // İlçe - şehirle aynı değilse ekle
      if (district && district !== city) {
        addressParts.push(district);
      }
      
      // Şehir - ilçe ve mahalle ile aynı değilse ekle
      if (city && city !== district && city !== neighbourhood) {
        addressParts.push(city);
      }
      
      // Ülke
      if (country) {
        addressParts.push(country);
      }
      
      const formattedAddress = addressParts.join(', ');

      // Calculate confidence based on data completeness
      let confidence = 0.5;
      if (city) confidence += 0.3;
      if (state) confidence += 0.1;
      if (address.postcode) confidence += 0.1;
      confidence = Math.min(confidence, 1.0);

      return {
        city,
        state,
        country,
        countryCode,
        formattedAddress,
        confidence,
        rawData: data
      };
    } catch (error) {
      throw this.createError('parsing', 'Yanıt ayrıştırılamadı', undefined, error);
    }
  }

  /**
   * Cache operations
   */
  private async getCachedResult(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    try {
      const cacheKey = this.getCacheKey(latitude, longitude);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const entry: GeocodingCacheEntry = JSON.parse(cachedData);
      
      // Check if cache is expired
      if (Date.now() > entry.expiresAt) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return entry.result;
    } catch {
      return null;
    }
  }

  private async cacheResult(
    latitude: number,
    longitude: number,
    result: GeocodingResult,
    duration: number
  ): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(latitude, longitude);
      const entry: GeocodingCacheEntry = {
        key: cacheKey,
        result,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch {
      // Cache failure is not critical
    }
  }

  private getCacheKey(latitude: number, longitude: number): string {
    // Use 6 decimal places for cache key
    // This provides ~11 cm precision
    const lat = Math.round(latitude * 1000000) / 1000000;
    const lon = Math.round(longitude * 1000000) / 1000000;
    return `${CACHE_KEY_PREFIX}${lat}_${lon}`;
  }

  /**
   * Cache management
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch {
      // Ignore cache errors
    }
  }

  async getCacheStats(): Promise<{ size: number; hitRate: number; entries: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      
      return {
        size: 0, // AsyncStorage doesn't provide size info
        hitRate: 0, // Would need additional tracking
        entries: cacheKeys.length
      };
    } catch {
      return { size: 0, hitRate: 0, entries: 0 };
    }
  }

  /**
   * Utility methods
   */
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  private createError(
    type: GeocodingError['type'],
    message: string,
    statusCode?: number,
    originalError?: any
  ): Error {
    const error = new Error(message);
    (error as any).type = type;
    (error as any).statusCode = statusCode;
    (error as any).originalError = originalError;
    return error;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create geocoding service instance
 */
export function createNativeGeocodingService(): GeocodingService {
  return new NativeGeocodingService();
}

/**
 * Singleton instance for app-wide usage
 */
let sharedInstance: GeocodingService | null = null;

export function getNativeGeocodingService(): GeocodingService {
  if (!sharedInstance) {
    sharedInstance = createNativeGeocodingService();
  }
  return sharedInstance;
}