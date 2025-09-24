/**
 * Unified Cache Manager - Enterprise Level Architecture
 * Meta/Instagram/Netflix patterns combined
 * 
 * Features:
 * - Multi-layer caching (L1 Memory + L2 AsyncStorage)
 * - Event-driven invalidation
 * - Write-through/Read-through strategies
 * - Background refresh
 * - Compression & size management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheStorage, CacheEntry, WriteThroughStrategy, ReadThroughStrategy } from './cache-strategies';
import { CACHE_CONFIG, CacheStrategy, CACHE_LIMITS, CACHE_LAYERS } from './cache-config';
import { CacheEvent, cacheEventEmitter, INVALIDATION_RULES } from './cache-events';
import { CACHE_KEYS } from './cache-keys';

// L1 Memory Cache (Lightning fast access)
class MemoryCache implements CacheStorage {
  private cache = new Map<string, CacheEntry>();
  private sizeTracker = new Map<string, number>();
  private accessTime = new Map<string, number>();
  private currentSize = 0;
  private maxSize: number;

  constructor(maxSizeMB: number = CACHE_LAYERS.MAX_MEMORY_SIZE) {
    this.maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const entry = this.cache.get(key);
    if (entry) {
      this.accessTime.set(key, Date.now());
      return entry as CacheEntry<T>;
    }
    return null;
  }

  async set<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    const serialized = JSON.stringify(entry);
    const size = new Blob([serialized]).size;

    // Check if we need to evict entries (LRU)
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    // Remove old entry if exists
    const oldSize = this.sizeTracker.get(key) || 0;
    this.currentSize -= oldSize;

    // Add new entry
    this.cache.set(key, entry);
    this.sizeTracker.set(key, size);
    this.accessTime.set(key, Date.now());
    this.currentSize += size;
  }

  async delete(key: string): Promise<void> {
    const size = this.sizeTracker.get(key) || 0;
    this.currentSize -= size;
    
    this.cache.delete(key);
    this.sizeTracker.delete(key);
    this.accessTime.delete(key);
  }

  async multiGet<T>(keys: string[]): Promise<Array<[string, CacheEntry<T> | null]>> {
    const now = Date.now();
    return keys.map(key => {
      const entry = this.cache.get(key);
      if (entry) {
        this.accessTime.set(key, now);
        return [key, entry as CacheEntry<T>];
      }
      return [key, null];
    });
  }

  async multiSet<T>(entries: Array<[string, CacheEntry<T>]>): Promise<void> {
    for (const [key, entry] of entries) {
      await this.set(key, entry);
    }
  }

  async multiDelete(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.delete(key);
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys());
    if (!pattern) return allKeys;
    
    const regex = new RegExp(pattern.replace('*', '.*'));
    return allKeys.filter(key => regex.test(key));
  }

  async clear(pattern?: string): Promise<void> {
    if (!pattern) {
      this.cache.clear();
      this.sizeTracker.clear();
      this.accessTime.clear();
      this.currentSize = 0;
    } else {
      const keysToDelete = await this.keys(pattern);
      await this.multiDelete(keysToDelete);
    }
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, time] of this.accessTime) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
}

// L2 AsyncStorage Cache (Persistent across app sessions)
class AsyncStorageCache implements CacheStorage {
  private prefix: string = '@fishivo_cache:';

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const data = await AsyncStorage.getItem(this.prefix + key);
      if (!data) return null;
      
      return JSON.parse(data) as CacheEntry<T>;
    } catch (error) {
      console.warn('AsyncStorage cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    try {
      await AsyncStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('AsyncStorage cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('AsyncStorage cache delete error:', error);
    }
  }

  async multiGet<T>(keys: string[]): Promise<Array<[string, CacheEntry<T> | null]>> {
    try {
      const prefixedKeys = keys.map(key => this.prefix + key);
      const results = await AsyncStorage.multiGet(prefixedKeys);
      
      return results.map(([prefixedKey, value], index) => {
        const originalKey = keys[index];
        if (value) {
          try {
            return [originalKey, JSON.parse(value) as CacheEntry<T>];
          } catch {
            return [originalKey, null];
          }
        }
        return [originalKey, null];
      });
    } catch (error) {
      console.warn('AsyncStorage multiGet error:', error);
      return keys.map(key => [key, null]);
    }
  }

  async multiSet<T>(entries: Array<[string, CacheEntry<T>]>): Promise<void> {
    try {
      const prefixedEntries: Array<[string, string]> = entries.map(([key, entry]) => [
        this.prefix + key,
        JSON.stringify(entry)
      ]);
      
      await AsyncStorage.multiSet(prefixedEntries);
    } catch (error) {
      console.warn('AsyncStorage multiSet error:', error);
    }
  }

  async multiDelete(keys: string[]): Promise<void> {
    try {
      const prefixedKeys = keys.map(key => this.prefix + key);
      await AsyncStorage.multiRemove(prefixedKeys);
    } catch (error) {
      console.warn('AsyncStorage multiDelete error:', error);
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
      
      if (!pattern) return cacheKeys;
      
      const regex = new RegExp(pattern.replace('*', '.*'));
      return cacheKeys.filter(key => regex.test(key));
    } catch (error) {
      console.warn('AsyncStorage keys error:', error);
      return [];
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (!pattern) {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(key => key.startsWith(this.prefix));
        if (cacheKeys.length > 0) {
          await AsyncStorage.multiRemove(cacheKeys);
        }
      } else {
        const keysToDelete = await this.keys(pattern);
        if (keysToDelete.length > 0) {
          await this.multiDelete(keysToDelete);
        }
      }
    } catch (error) {
      console.warn('AsyncStorage clear error:', error);
    }
  }

  async size(): Promise<number> {
    try {
      const keys = await this.keys();
      return keys.length;
    } catch {
      return 0;
    }
  }
}

// Main Unified Cache Manager
export class UnifiedCacheManager {
  private static instance: UnifiedCacheManager;
  
  private memoryCache: MemoryCache;
  private storageCache: AsyncStorageCache;
  private strategies = new Map<string, WriteThroughStrategy | ReadThroughStrategy>();
  private metricsEnabled: boolean = true;
  private metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    invalidations: 0
  };

  private constructor() {
    this.memoryCache = new MemoryCache();
    this.storageCache = new AsyncStorageCache();
    this.setupEventHandlers();
  }

  static getInstance(): UnifiedCacheManager {
    if (!UnifiedCacheManager.instance) {
      UnifiedCacheManager.instance = new UnifiedCacheManager();
    }
    return UnifiedCacheManager.instance;
  }

  // High-level cache operations
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      // Try L1 (Memory) first
      let entry = await this.memoryCache.get<T>(key);
      
      if (entry && this.isValid(entry)) {
        this.recordHit('L1', Date.now() - startTime);
        return entry.data;
      }

      // Try L2 (AsyncStorage)
      entry = await this.storageCache.get<T>(key);
      
      if (entry && this.isValid(entry)) {
        // Promote to L1 for faster future access
        await this.memoryCache.set(key, entry);
        this.recordHit('L2', Date.now() - startTime);
        return entry.data;
      }

      this.recordMiss(Date.now() - startTime);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, data: T, options?: { strategy?: string; ttl?: number }): Promise<void> {
    const startTime = Date.now();
    
    try {
      const strategy = this.getStrategy(options?.strategy || 'default');
      const entry = this.createEntry(data, options?.ttl || strategy.ttl);
      
      // Write to both L1 and L2 (write-through)
      await Promise.all([
        this.memoryCache.set(key, entry),
        strategy.persistence ? this.storageCache.set(key, entry) : Promise.resolve()
      ]);
      
      this.recordSet(Date.now() - startTime);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      await Promise.all([
        this.memoryCache.delete(key),
        this.storageCache.delete(key)
      ]);
      
      this.recordDelete(Date.now() - startTime);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Batch operations for better performance
  async multiGet<T>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();
    
    // Try L1 first
    const l1Results = await this.memoryCache.multiGet<T>(keys);
    const l2Keys: string[] = [];
    
    for (const [key, entry] of l1Results) {
      if (entry && this.isValid(entry)) {
        result.set(key, entry.data);
      } else {
        l2Keys.push(key);
      }
    }
    
    // Try L2 for remaining keys
    if (l2Keys.length > 0) {
      const l2Results = await this.storageCache.multiGet<T>(l2Keys);
      const promoteToL1: Array<[string, CacheEntry<T>]> = [];
      
      for (const [key, entry] of l2Results) {
        if (entry && this.isValid(entry)) {
          result.set(key, entry.data);
          promoteToL1.push([key, entry]);
        } else {
          result.set(key, null);
        }
      }
      
      // Promote L2 hits to L1
      if (promoteToL1.length > 0) {
        await this.memoryCache.multiSet(promoteToL1);
      }
    }
    
    return result;
  }

  // Event-driven invalidation (Instagram/Meta pattern)
  async invalidate(keys: string | string[]): Promise<void> {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    const expandedKeys: string[] = [];
    
    // Expand pattern keys (e.g., "post:123*" → ["post:123", "post:123:likes", etc.])
    for (const key of keysArray) {
      if (key.includes('*')) {
        const pattern = key.replace('*', '.*');
        const l1Keys = await this.memoryCache.keys(pattern);
        const l2Keys = await this.storageCache.keys(pattern);
        expandedKeys.push(...l1Keys, ...l2Keys);
      } else {
        expandedKeys.push(key);
      }
    }
    
    // Remove duplicates
    const uniqueKeys = Array.from(new Set(expandedKeys));
    
    if (uniqueKeys.length > 0) {
      await Promise.all([
        this.memoryCache.multiDelete(uniqueKeys),
        this.storageCache.multiDelete(uniqueKeys)
      ]);
      
      this.metrics.invalidations += uniqueKeys.length;
    }
  }

  // Background refresh (Netflix pattern)
  async backgroundRefresh<T>(key: string, loader: () => Promise<T>): Promise<void> {
    try {
      const data = await loader();
      await this.set(key, data);
    } catch (error) {
      console.warn(`Background refresh failed for ${key}:`, error);
    }
  }

  // Cache warming (preload important data)
  async warmCache<T>(entries: Array<[string, () => Promise<T>]>): Promise<void> {
    const promises = entries.map(async ([key, loader]) => {
      try {
        const data = await loader();
        await this.set(key, data);
      } catch (error) {
        console.warn(`Cache warming failed for ${key}:`, error);
      }
    });
    
    await Promise.all(promises);
  }

  // Clear all cache (development/debug)
  async clearAll(): Promise<void> {
    await Promise.all([
      this.memoryCache.clear(),
      this.storageCache.clear()
    ]);
    
    this.resetMetrics();
  }

  // Performance metrics
  getMetrics() {
    const hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0;
    
    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100) / 100,
      totalOperations: this.metrics.hits + this.metrics.misses + this.metrics.sets + this.metrics.deletes
    };
  }

  private setupEventHandlers(): void {
    // Subscribe to cache invalidation events
    cacheEventEmitter.subscribe('*', (event: CacheEvent) => {
      this.handleCacheEvent(event);
    });
  }

  private async handleCacheEvent(event: CacheEvent): Promise<void> {
    const rules = INVALIDATION_RULES.filter(rule => rule.event === event.type);
    
    for (const rule of rules) {
      try {
        const keys = rule.keysToInvalidate(event);
        
        if (rule.action === 'invalidate') {
          await this.invalidate(keys);
        } else if (rule.action === 'refresh') {
          // Background refresh logic would go here
          console.log(`Background refresh triggered for keys:`, keys);
        }
      } catch (error) {
        console.error(`Error handling cache event ${event.type}:`, error);
      }
    }
  }

  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private createEntry<T>(data: T, ttl: number): CacheEntry<T> {
    return {
      data,
      timestamp: Date.now(),
      ttl,
      version: 1,
      compressed: false
    };
  }

  private getStrategy(type: string): CacheStrategy {
    return CACHE_CONFIG[type] || CACHE_CONFIG.posts;
  }

  private recordHit(layer: string, duration: number): void {
    if (this.metricsEnabled) {
      this.metrics.hits++;
    }
  }

  private recordMiss(duration: number): void {
    if (this.metricsEnabled) {
      this.metrics.misses++;
    }
  }

  private recordSet(duration: number): void {
    if (this.metricsEnabled) {
      this.metrics.sets++;
    }
  }

  private recordDelete(duration: number): void {
    if (this.metricsEnabled) {
      this.metrics.deletes++;
    }
  }

  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      invalidations: 0
    };
  }
}

// Global instance
export const cacheManager = UnifiedCacheManager.getInstance();