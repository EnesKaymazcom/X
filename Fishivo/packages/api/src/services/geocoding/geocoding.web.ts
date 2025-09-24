/**
 * Web Geocoding Service
 * 
 * Web uygulamalar için reverse geocoding servisi.
 * Nominatim OpenStreetMap API kullanarak koordinatları şehir/ülke bilgisine çevirir.
 */

import type { 
  GeocodingService, 
  GeocodingResult, 
  GeocodingError, 
  GeocodingOptions,
  NominatimResponse,
  GeocodingCacheEntry 
} from './types';

const CACHE_KEY_PREFIX = 'fishivo_geocoding_cache_';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const DEFAULT_RETRY_COUNT = 2;

export class WebGeocodingService implements GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  private readonly userAgent = 'Fishivo/1.0';

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
    const url = `${this.baseUrl}/reverse?` + 
      `lat=${latitude}&` +
      `lon=${longitude}&` +
      `format=json&` +
      `addressdetails=1&` +
      `accept-language=${language}&` +
      `zoom=10`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
        signal: controller.signal,
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

      // Extract city name with priority order
      const city = address.city || 
                  address.town || 
                  address.village || 
                  address.municipality ||
                  address.city_district ||
                  address.suburb;

      // Extract state/province
      const state = address.state || address.state_district;

      // Extract country info
      const country = address.country || '';
      const countryCode = address.country_code?.toUpperCase() || '';

      if (!country || !countryCode) {
        throw new Error('Country information missing');
      }

      // Build formatted address
      const addressParts: string[] = [];
      if (city) addressParts.push(city);
      if (country) addressParts.push(country);
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
   * Cache operations - localStorage based
   */
  private async getCachedResult(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    try {
      if (typeof localStorage === 'undefined') {
        return null;
      }

      const cacheKey = this.getCacheKey(latitude, longitude);
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const entry: GeocodingCacheEntry = JSON.parse(cachedData);
      
      // Check if cache is expired
      if (Date.now() > entry.expiresAt) {
        localStorage.removeItem(cacheKey);
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
      if (typeof localStorage === 'undefined') {
        return;
      }

      const cacheKey = this.getCacheKey(latitude, longitude);
      const entry: GeocodingCacheEntry = {
        key: cacheKey,
        result,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration
      };

      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch {
      // Cache failure is not critical
    }
  }

  private getCacheKey(latitude: number, longitude: number): string {
    // Round coordinates to 4 decimal places for cache key
    // This groups nearby coordinates (~11 meters precision)
    const lat = Math.round(latitude * 10000) / 10000;
    const lon = Math.round(longitude * 10000) / 10000;
    return `${CACHE_KEY_PREFIX}${lat}_${lon}`;
  }

  /**
   * Cache management
   */
  async clearCache(): Promise<void> {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
      // Ignore cache errors
    }
  }

  async getCacheStats(): Promise<{ size: number; hitRate: number; entries: number }> {
    try {
      if (typeof localStorage === 'undefined') {
        return { size: 0, hitRate: 0, entries: 0 };
      }

      let entries = 0;
      let totalSize = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          entries++;
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }

      return {
        size: totalSize,
        hitRate: 0, // Would need additional tracking
        entries
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
export function createWebGeocodingService(): GeocodingService {
  return new WebGeocodingService();
}

/**
 * Singleton instance for app-wide usage
 */
let sharedInstance: GeocodingService | null = null;

export function getWebGeocodingService(): GeocodingService {
  if (!sharedInstance) {
    sharedInstance = createWebGeocodingService();
  }
  return sharedInstance;
}