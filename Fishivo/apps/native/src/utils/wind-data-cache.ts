import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'wind_data_';
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

interface WindDataPoint {
  u: number;
  v: number;
  timestamp: number;
  simulated?: boolean;
}

export class WindDataCache {
  private memoryCache: Map<string, WindDataPoint>;
  private lastCleanup: number;

  constructor() {
    this.memoryCache = new Map();
    this.lastCleanup = Date.now();
  }

  // Generate cache key for a coordinate
  private getCacheKey(lat: number, lon: number): string {
    return `${lat.toFixed(2)},${lon.toFixed(2)}`;
  }

  // Get data from cache (memory first, then AsyncStorage)
  async get(lat: number, lon: number): Promise<WindDataPoint | null> {
    const key = this.getCacheKey(lat, lon);
    
    // Check memory cache first
    const memData = this.memoryCache.get(key);
    if (memData && Date.now() - memData.timestamp < CACHE_EXPIRY) {
      return memData;
    }

    // Check AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEY_PREFIX + key);
      if (stored) {
        const data = JSON.parse(stored) as WindDataPoint;
        if (Date.now() - data.timestamp < CACHE_EXPIRY) {
          // Update memory cache
          this.memoryCache.set(key, data);
          return data;
        }
      }
    } catch (error) {
      // Silent fail, just return null
    }

    return null;
  }

  // Set data in both caches
  async set(lat: number, lon: number, data: WindDataPoint): Promise<void> {
    const key = this.getCacheKey(lat, lon);
    
    // Update memory cache
    this.memoryCache.set(key, data);

    // Update AsyncStorage
    try {
      await AsyncStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(data));
    } catch (error) {
      // Silent fail for storage errors
    }

    // Cleanup old data periodically
    if (Date.now() - this.lastCleanup > 60000) { // Every minute
      this.cleanup();
    }
  }

  // Batch get for multiple coordinates
  async getBatch(coordinates: Array<{latitude: number, longitude: number}>): Promise<Map<string, WindDataPoint | null>> {
    const results = new Map<string, WindDataPoint | null>();
    
    for (const coord of coordinates) {
      const key = this.getCacheKey(coord.latitude, coord.longitude);
      const data = await this.get(coord.latitude, coord.longitude);
      results.set(key, data);
    }
    
    return results;
  }

  // Batch set for multiple data points
  async setBatch(dataPoints: Array<{latitude: number, longitude: number, data: WindDataPoint}>): Promise<void> {
    const promises = dataPoints.map(point => this.set(point.latitude, point.longitude, point.data));
    await Promise.all(promises);
  }

  // Clean up expired data
  private async cleanup(): Promise<void> {
    this.lastCleanup = Date.now();
    const now = Date.now();

    // Clean memory cache
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp > CACHE_EXPIRY) {
        this.memoryCache.delete(key);
      }
    }

    // Clean AsyncStorage
    try {
      const keys = await AsyncStorage.getAllKeys();
      const windKeys = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX));
      
      for (const key of windKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const data = JSON.parse(stored) as WindDataPoint;
          if (now - data.timestamp > CACHE_EXPIRY) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      // Silent fail for cleanup errors
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const windKeys = keys.filter(k => k.startsWith(CACHE_KEY_PREFIX));
      await AsyncStorage.multiRemove(windKeys);
    } catch (error) {
      // Silent fail
    }
  }
}

// Export singleton instance
export const windDataCache = new WindDataCache();