import { WeatherData } from './schemas';
import { CacheService } from './types';
import { CacheError } from './errors';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  stale?: boolean;
}

export interface MultiLayerCacheConfig {
  memoryTTL: number;
  persistentTTL: number;
  staleWhileRevalidate: boolean;
  maxMemoryEntries: number;
}

export const DEFAULT_CACHE_CONFIG: MultiLayerCacheConfig = {
  memoryTTL: 300,
  persistentTTL: 600, // 10 dakika
  staleWhileRevalidate: true,
  maxMemoryEntries: 100
};

export class MultiLayerCache {
  private memoryCache = new Map<string, CacheEntry<WeatherData>>();
  private revalidating = new Map<string, Promise<WeatherData | null>>();

  constructor(
    private persistentCache: CacheService,
    private config: MultiLayerCacheConfig = DEFAULT_CACHE_CONFIG
  ) {
    this.startMemoryCleaner();
  }

  async get(key: string): Promise<WeatherData | null> {
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data;
    }

    try {
      const persistentData = await this.persistentCache.get(key);
      if (persistentData) {
        const entry = persistentData as CacheEntry<WeatherData>;
        
        if (!this.isExpired(entry)) {
          this.setMemoryCache(key, entry.data, this.config.memoryTTL);
          return entry.data;
        }

        if (this.config.staleWhileRevalidate && entry.data) {
          return { ...entry.data, metadata: { ...entry.data.metadata, stale: true } };
        }
      }
    } catch (error) {
      throw new CacheError('get', error);
    }

    return null;
  }

  async set(key: string, data: WeatherData, ttl?: number): Promise<void> {
    const effectiveTTL = ttl || this.config.persistentTTL;
    
    this.setMemoryCache(key, data, Math.min(effectiveTTL, this.config.memoryTTL));

    const entry: CacheEntry<WeatherData> = {
      data,
      timestamp: Date.now(),
      ttl: effectiveTTL
    };

    try {
      await this.persistentCache.set(key, entry, effectiveTTL);
    } catch (error) {
      throw new CacheError('set', error);
    }
  }

  async getOrRevalidate(
    key: string,
    fetcher: () => Promise<WeatherData>
  ): Promise<WeatherData | null> {
    const existing = await this.get(key);
    
    if (existing && !existing.metadata.stale) {
      return existing;
    }

    if (existing?.metadata.stale && this.config.staleWhileRevalidate) {
      if (!this.revalidating.has(key)) {
        this.revalidating.set(key, this.revalidateInBackground(key, fetcher));
      }
      return existing;
    }

    const revalidationPromise = this.revalidating.get(key);
    if (revalidationPromise) {
      return revalidationPromise;
    }

    try {
      const fresh = await fetcher();
      await this.set(key, fresh);
      return fresh;
    } catch (error) {
      if (existing) {
        return existing;
      }
      throw error;
    }
  }

  private async revalidateInBackground(
    key: string,
    fetcher: () => Promise<WeatherData>
  ): Promise<WeatherData | null> {
    try {
      const fresh = await fetcher();
      await this.set(key, fresh);
      return fresh;
    } catch (error) {
      return null;
    } finally {
      this.revalidating.delete(key);
    }
  }

  private setMemoryCache(key: string, data: WeatherData, ttl: number): void {
    if (this.memoryCache.size >= this.config.maxMemoryEntries) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl
    });
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000;
  }

  private startMemoryCleaner(): void {
    setInterval(() => {
      for (const [key, entry] of this.memoryCache.entries()) {
        if (this.isExpired(entry)) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000);
  }

  async invalidate(pattern?: string): Promise<void> {
    if (!pattern) {
      this.memoryCache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  getCacheStats(): {
    memorySize: number;
    hitRate: number;
    revalidating: number;
  } {
    return {
      memorySize: this.memoryCache.size,
      hitRate: 0,
      revalidating: this.revalidating.size
    };
  }
}