/**
 * Unified Cache System - Main Exports
 * Enterprise-level cache architecture for Fishivo
 */

export { UnifiedCacheManager, cacheManager } from './unified-cache-manager';
export { CacheMetricsCollector, metricsCollector, formatMetricsForDisplay } from './cache-metrics';
export { cacheEventEmitter, CACHE_EVENTS, SimpleCacheEventEmitter } from './cache-events';
export { CACHE_KEYS } from './cache-keys';
export { CACHE_CONFIG, CACHE_LIMITS, CACHE_LAYERS } from './cache-config';
export { 
  WriteThroughStrategy, 
  ReadThroughStrategy, 
  WriteBehindStrategy,
  CacheStorage,
  CacheEntry,
  DataSource 
} from './cache-strategies';

// Types
export type { CacheStrategy } from './cache-config';
export type { CacheEvent, CacheInvalidationRule, CacheEventEmitter } from './cache-events';
export type { CacheMetrics, CacheAlert } from './cache-metrics';
export type { CacheKeyType } from './cache-keys';

// Utility functions
export function createCacheKey(type: string, id: string | number, ...params: (string | number)[]): string {
  const parts = [type, id, ...params].filter(p => p !== undefined && p !== null);
  return parts.join(':');
}

export function parseCacheKey(key: string): { type: string; id: string; params: string[] } {
  const parts = key.split(':');
  return {
    type: parts[0] || '',
    id: parts[1] || '',
    params: parts.slice(2)
  };
}

export function isCacheKeyPattern(key: string): boolean {
  return key.includes('*');
}

// Cache initialization helper
export async function initializeCache(): Promise<void> {
  try {
    const { metricsCollector } = await import('./cache-metrics');
    
    // Clear any stale cache entries on startup
    // In production, you might want to be more selective about this
    console.log('🚀 Initializing Unified Cache System...');
    
    // Set up metrics collection interval
    setInterval(() => {
      metricsCollector.clearOldAlerts(24 * 60 * 60 * 1000); // Clear alerts older than 24h
    }, 60 * 60 * 1000); // Check every hour
    
    console.log('✅ Cache system initialized successfully');
  } catch (error) {
    console.error('❌ Cache initialization failed:', error);
    throw error;
  }
}

// Development/debugging utilities
export const CacheDebug = {
  // Log cache metrics
  async logMetrics(): Promise<void> {
    const { metricsCollector, formatMetricsForDisplay } = await import('./cache-metrics');
    const metrics = metricsCollector.getMetrics();
    console.log(formatMetricsForDisplay(metrics));
  },
  
  // Log cache alerts
  async logAlerts(): Promise<void> {
    const { metricsCollector } = await import('./cache-metrics');
    const alerts = metricsCollector.getAlerts();
    if (alerts.length === 0) {
      console.log('✅ No cache alerts');
      return;
    }
    
    console.log('⚠️ Cache Alerts:');
    alerts.slice(-5).forEach((alert: any) => {
      const icon = alert.type === 'error' ? '❌' : alert.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} ${alert.message}`);
    });
  },
  
  // Clear all cache (development only)
  async clearAll(): Promise<void> {
    const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';
    if (isDev) {
      const { cacheManager } = await import('./unified-cache-manager');
      const { metricsCollector } = await import('./cache-metrics');
      await cacheManager.clearAll();
      metricsCollector.resetMetrics();
      console.log('🗑️ All cache cleared (dev mode)');
    } else {
      console.warn('❌ Cache clear blocked in production');
    }
  },
  
  // Export metrics to JSON
  async exportMetrics(): Promise<string> {
    const { metricsCollector } = await import('./cache-metrics');
    return metricsCollector.exportMetrics();
  }
};