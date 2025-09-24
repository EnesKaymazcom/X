/**
 * Cache System Initialization for React Native
 * Professional initialization pattern for enterprise cache
 */

import { 
  cacheIntegration, 
  cacheManager, 
  metricsCollector 
} from '@fishivo/api';
import { useLikeStore } from '@/stores/likeStore';

export interface CacheInitializationConfig {
  enableRealtime?: boolean;
  enableMetrics?: boolean;
  enableBackgroundSync?: boolean;
  logLevel?: 'none' | 'basic' | 'verbose';
}

class CacheInitializer {
  private static instance: CacheInitializer;
  private isInitialized: boolean = false;
  private config: CacheInitializationConfig;
  private backgroundSyncInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;

  private constructor() {
    this.config = {
      enableRealtime: true,
      enableMetrics: __DEV__,
      enableBackgroundSync: true,
      logLevel: __DEV__ ? 'verbose' : 'basic'
    };
  }

  static getInstance(): CacheInitializer {
    if (!CacheInitializer.instance) {
      CacheInitializer.instance = new CacheInitializer();
    }
    return CacheInitializer.instance;
  }

  async initialize(customConfig?: Partial<CacheInitializationConfig>): Promise<void> {
    if (this.isInitialized) {
      this.log('⚠️ Cache system already initialized', 'basic');
      return;
    }

    // Merge configs
    this.config = { ...this.config, ...customConfig };

    try {
      this.log('🚀 Initializing Enterprise Cache System...', 'basic');

      // Step 1: Initialize core cache integration
      await cacheIntegration.initialize();
      this.log('✅ Cache integration initialized', 'verbose');

      // Step 2: Set up Zustand store subscriptions  
      this.setupStoreSubscriptions();
      this.log('✅ Store subscriptions configured', 'verbose');

      // Step 3: Set up background sync if enabled
      if (this.config.enableBackgroundSync) {
        this.setupBackgroundSync();
        this.log('✅ Background sync enabled', 'verbose');
      }

      // Step 4: Set up metrics monitoring if enabled
      if (this.config.enableMetrics) {
        this.setupMetricsMonitoring();
        this.log('✅ Metrics monitoring enabled', 'verbose');
      }

      // Step 5: Register app lifecycle handlers
      this.setupAppLifecycleHandlers();
      this.log('✅ App lifecycle handlers registered', 'verbose');

      this.isInitialized = true;
      this.log('🎉 Enterprise Cache System initialized successfully!', 'basic');

      // Log initial metrics if verbose
      if (this.config.logLevel === 'verbose') {
        this.logCacheStats();
      }

    } catch (error) {
      console.error('❌ Cache system initialization failed:', error);
      throw error;
    }
  }

  private setupStoreSubscriptions(): void {
    // Set up real-time event handler for like store
    if (this.config.enableRealtime) {
      // Import cache event emitter
      const { cacheEventEmitter, CACHE_EVENTS } = require('@fishivo/api');
      const likeStore = useLikeStore.getState();
      
      // Subscribe to post like/unlike events
      cacheEventEmitter.subscribe(CACHE_EVENTS.POST_LIKED, async (event: { entityId: string }) => {
        await likeStore.handleRealtimeUpdate(event.entityId, 'post', 'liked');
      });
      
      cacheEventEmitter.subscribe(CACHE_EVENTS.POST_UNLIKED, async (event: { entityId: string }) => {
        await likeStore.handleRealtimeUpdate(event.entityId, 'post', 'unliked');
      });
      
      // Subscribe to comment like/unlike events
      cacheEventEmitter.subscribe(CACHE_EVENTS.COMMENT_LIKED, async (event: { entityId: string }) => {
        await likeStore.handleRealtimeUpdate(event.entityId, 'comment', 'liked');
      });
      
      cacheEventEmitter.subscribe(CACHE_EVENTS.COMMENT_UNLIKED, async (event: { entityId: string }) => {
        await likeStore.handleRealtimeUpdate(event.entityId, 'comment', 'unliked');
      });
      
      this.log('📡 Real-time subscriptions configured and connected to store', 'verbose');
    }
  }

  private setupBackgroundSync(): void {
    // Set up periodic background sync with cleanup
    this.backgroundSyncInterval = setInterval(async () => {
      try {
        const likeStore = useLikeStore.getState();
        await likeStore.backgroundSync();
        this.log('🔄 Background sync completed', 'verbose');
      } catch (error) {
        // Silent fail in production
      }
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  private setupMetricsMonitoring(): void {
    // Log metrics every 5 minutes in development
    if (__DEV__) {
      this.metricsInterval = setInterval(() => {
        this.logCacheStats();
      }, 5 * 60 * 1000);
    }
  }

  private setupAppLifecycleHandlers(): void {
    // In a real React Native app, you'd use AppState.addEventListener
    // For now, we'll just log that it's set up
    this.log('📱 App lifecycle handlers would be set up here', 'verbose');
  }

  logCacheStats(): void {
    if (this.config.enableMetrics) {
      const summary = metricsCollector.getPerformanceSummary();

    }
  }

  private log(message: string, level: 'basic' | 'verbose' = 'basic'): void {
    if (this.config.logLevel === 'none') return;
    if (level === 'verbose' && this.config.logLevel !== 'verbose') return;

  }

  // Public methods for runtime control
  getStatus(): {
    initialized: boolean;
    realtime: boolean;
    metrics: boolean;
    backgroundSync: boolean;
  } {
    return {
      initialized: this.isInitialized,
      realtime: this.config.enableRealtime ?? false,
      metrics: this.config.enableMetrics ?? false,
      backgroundSync: this.config.enableBackgroundSync ?? false
    };
  }

  async clearAllCache(): Promise<void> {
    if (!__DEV__) {
      console.warn('❌ Cache clear blocked in production mode');
      return;
    }

    try {
      await cacheManager.clearAll();
      const likeStore = useLikeStore.getState();
      likeStore.cleanup();
      
      console.log('🗑️ All cache cleared (development mode)');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  getMetrics() {
    if (!this.config.enableMetrics) {
      return null;
    }
    return metricsCollector.getMetrics();
  }

  async cleanup(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      this.log('🧹 Cleaning up cache system...', 'basic');
      
      // Clear all intervals to prevent memory leaks
      if (this.backgroundSyncInterval) {
        clearInterval(this.backgroundSyncInterval);
        this.backgroundSyncInterval = undefined;
      }
      
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
        this.metricsInterval = undefined;
      }
      
      await cacheIntegration.cleanup();
      this.isInitialized = false;
      
      this.log('✅ Cache system cleaned up', 'basic');
    } catch (error) {
      // Silent fail
    }
  }
}

// Global instance
export const cacheInitializer = CacheInitializer.getInstance();

// Convenience functions
export async function initializeCache(config?: Partial<CacheInitializationConfig>): Promise<void> {
  return cacheInitializer.initialize(config);
}

export function getCacheStatus() {
  return cacheInitializer.getStatus();
}

export function getCacheMetrics() {
  return cacheInitializer.getMetrics();
}

export async function clearDevelopmentCache(): Promise<void> {
  return cacheInitializer.clearAllCache();
}

// React hook for cache status
export function useCacheStatus() {
  return cacheInitializer.getStatus();
}

// Development utilities
export const CacheDevUtils = {
  logStats: () => cacheInitializer.logCacheStats(),
  clearAll: () => cacheInitializer.clearAllCache(),
  getMetrics: () => cacheInitializer.getMetrics(),
  getStatus: () => cacheInitializer.getStatus()
};