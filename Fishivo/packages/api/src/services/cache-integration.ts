/**
 * Cache Integration Layer
 * Professional integration between API services and cache system
 */

import { cacheManager } from '../cache/unified-cache-manager';
import { CACHE_KEYS } from '../cache/cache-keys';
import { realtimeSyncEngine, DEFAULT_REALTIME_CONFIG } from '../realtime/realtime-sync-engine';
import { metricsCollector } from '../cache/cache-metrics';

export interface CacheIntegrationConfig {
  enableRealtime?: boolean;
  enableMetrics?: boolean;
  backgroundSyncInterval?: number;
  cacheTTL?: Record<string, number>;
}

export class CacheIntegration {
  private static instance: CacheIntegration;
  private config: CacheIntegrationConfig;
  private backgroundSyncTimer?: NodeJS.Timeout;
  private isInitialized: boolean = false;

  private constructor(config: CacheIntegrationConfig = {}) {
    this.config = {
      enableRealtime: true,
      enableMetrics: true,
      backgroundSyncInterval: 30 * 60 * 1000, // 30 minutes
      cacheTTL: {},
      ...config
    };
  }

  static getInstance(config?: CacheIntegrationConfig): CacheIntegration {
    if (!CacheIntegration.instance) {
      CacheIntegration.instance = new CacheIntegration(config);
    }
    return CacheIntegration.instance;
  }

  // Initialize the entire cache system
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Cache integration already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Cache Integration System...');

      // Initialize real-time sync if enabled
      if (this.config.enableRealtime) {
        await realtimeSyncEngine.initialize(DEFAULT_REALTIME_CONFIG);
      }

      // Start background sync timer
      if (this.config.backgroundSyncInterval && this.config.backgroundSyncInterval > 0) {
        this.startBackgroundSync();
      }

      // Set up metrics collection
      if (this.config.enableMetrics) {
        this.setupMetricsCollection();
      }

      this.isInitialized = true;
      console.log('✅ Cache Integration System initialized successfully');

    } catch (error) {
      console.error('❌ Cache integration initialization failed:', error);
      throw error;
    }
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Cache Integration System...');

    if (this.backgroundSyncTimer) {
      clearInterval(this.backgroundSyncTimer);
      this.backgroundSyncTimer = undefined;
    }

    if (this.config.enableRealtime) {
      await realtimeSyncEngine.cleanup();
    }

    this.isInitialized = false;
    console.log('✅ Cache Integration System cleaned up');
  }

  // Get cache with automatic loading
  async getCached<T>(
    key: string,
    loader: () => Promise<T>,
    options?: { ttl?: number; forceRefresh?: boolean }
  ): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      // Force refresh bypasses cache
      if (!options?.forceRefresh) {
        const cached = await cacheManager.get<T>(key);
        if (cached !== null) {
          if (this.config.enableMetrics) {
            metricsCollector.recordGet(Date.now() - startTime, true);
          }
          return cached;
        }
      }

      // Cache miss - load from source
      if (this.config.enableMetrics) {
        metricsCollector.recordGet(Date.now() - startTime, false);
      }

      const data = await loader();
      
      if (data !== null) {
        await cacheManager.set(key, data, { ttl: options?.ttl });
        
        if (this.config.enableMetrics) {
          metricsCollector.recordSet(Date.now() - startTime);
        }
      }

      return data;
    } catch (error) {
      console.error(`Cache get error for ${key}:`, error);
      
      if (this.config.enableMetrics) {
        metricsCollector.recordError(`Get failed for ${key}: ${error}`);
      }
      
      return null;
    }
  }

  // Set with automatic cache update
  async setCached<T>(
    key: string,
    data: T,
    options?: { ttl?: number; strategy?: string }
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      await cacheManager.set(key, data, options);
      
      if (this.config.enableMetrics) {
        metricsCollector.recordSet(Date.now() - startTime);
      }
    } catch (error) {
      console.error(`Cache set error for ${key}:`, error);
      
      if (this.config.enableMetrics) {
        metricsCollector.recordError(`Set failed for ${key}: ${error}`);
      }
    }
  }

  // Invalidate with metrics
  async invalidateCached(keys: string | string[]): Promise<void> {
    try {
      await cacheManager.invalidate(keys);
      
      if (this.config.enableMetrics) {
        const keyCount = Array.isArray(keys) ? keys.length : 1;
        metricsCollector.recordInvalidation(keyCount);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
      
      if (this.config.enableMetrics) {
        metricsCollector.recordError(`Invalidation failed: ${error}`);
      }
    }
  }

  // Background sync for stale data
  private startBackgroundSync(): void {
    this.backgroundSyncTimer = setInterval(async () => {
      try {
        console.log('🔄 Starting background cache sync...');
        
        // This would typically sync critical data
        // For now, we'll just log cache metrics
        if (this.config.enableMetrics) {
          const metrics = metricsCollector.getMetrics();
          console.log(`📊 Cache Stats: ${metrics.hits} hits, ${metrics.misses} misses, ${(metrics.hitRate * 100).toFixed(1)}% hit rate`);
        }

      } catch (error) {
        console.error('Background sync error:', error);
      }
    }, this.config.backgroundSyncInterval!);
  }

  // Set up metrics collection
  private setupMetricsCollection(): void {
    // Update cache sizes periodically
    setInterval(async () => {
      try {
        // This would get actual cache sizes from the cache manager
        // For now, we'll use placeholder values
        metricsCollector.updateCacheSizes(0, 0);
      } catch (error) {
        console.warn('Metrics collection error:', error);
      }
    }, 60000); // Every minute
  }

  // Get current status
  getStatus(): {
    initialized: boolean;
    realtime: boolean;
    metrics: boolean;
    backgroundSync: boolean;
  } {
    return {
      initialized: this.isInitialized,
      realtime: this.config.enableRealtime || false,
      metrics: this.config.enableMetrics || false,
      backgroundSync: !!this.backgroundSyncTimer
    };
  }

  // Get metrics (if enabled)
  getMetrics() {
    if (!this.config.enableMetrics) {
      return null;
    }
    return metricsCollector.getMetrics();
  }

  // Get performance summary
  getPerformanceSummary() {
    if (!this.config.enableMetrics) {
      return null;
    }
    return metricsCollector.getPerformanceSummary();
  }

  // Enable/disable features at runtime
  setRealtimeEnabled(enabled: boolean): void {
    this.config.enableRealtime = enabled;
    realtimeSyncEngine.setEnabled(enabled);
    console.log(`🔄 Realtime sync ${enabled ? 'enabled' : 'disabled'}`);
  }

  setMetricsEnabled(enabled: boolean): void {
    this.config.enableMetrics = enabled;
    console.log(`📊 Metrics collection ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Global instance
export const cacheIntegration = CacheIntegration.getInstance({
  enableRealtime: true,
  enableMetrics: __DEV__, // Only in development
  backgroundSyncInterval: 30 * 60 * 1000 // 30 minutes
});

// Utility functions for services
export async function withCache<T>(
  key: string,
  loader: () => Promise<T>,
  options?: { ttl?: number; forceRefresh?: boolean }
): Promise<T | null> {
  return cacheIntegration.getCached(key, loader, options);
}

export async function invalidateCache(keys: string | string[]): Promise<void> {
  return cacheIntegration.invalidateCached(keys);
}

export async function setCache<T>(
  key: string,
  data: T,
  options?: { ttl?: number; strategy?: string }
): Promise<void> {
  return cacheIntegration.setCached(key, data, options);
}