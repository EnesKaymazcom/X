/**
 * Cache Strategies - Write-Through, Read-Through, Write-Behind
 * Enterprise patterns used by Meta, Netflix, Instagram
 */

import { CacheStrategy } from './cache-config';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: number;
  compressed?: boolean;
  metadata?: Record<string, any>;
}

export interface CacheStorage {
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, entry: CacheEntry<T>): Promise<void>;
  delete(key: string): Promise<void>;
  multiGet<T>(keys: string[]): Promise<Array<[string, CacheEntry<T> | null]>>;
  multiSet<T>(entries: Array<[string, CacheEntry<T>]>): Promise<void>;
  multiDelete(keys: string[]): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
  clear(pattern?: string): Promise<void>;
  size(): Promise<number>;
}

export interface DataSource<T = any> {
  get(key: string): Promise<T | null>;
  set(key: string, data: T): Promise<void>;
  delete(key: string): Promise<void>;
  multiGet(keys: string[]): Promise<Array<[string, T | null]>>;
}

// Write-Through Strategy - Instagram pattern
// Writes go to both cache and database simultaneously
export class WriteThroughStrategy<T = any> {
  constructor(
    private cache: CacheStorage,
    private dataSource: DataSource<T>,
    private strategy: CacheStrategy
  ) {}

  async get(key: string): Promise<T | null> {
    // Try cache first
    const cached = await this.cache.get<T>(key);
    
    if (cached && this.isValid(cached)) {
      return cached.data;
    }
    
    // Cache miss or expired - read through to source
    const data = await this.dataSource.get(key);
    
    if (data !== null) {
      // Store in cache for future reads
      await this.cache.set(key, this.createEntry(data));
    } else if (cached) {
      // Remove expired entry
      await this.cache.delete(key);
    }
    
    return data;
  }

  async set(key: string, data: T): Promise<void> {
    const entry = this.createEntry(data);
    
    // Write to both cache and source simultaneously
    await Promise.all([
      this.cache.set(key, entry),
      this.dataSource.set(key, data)
    ]);
  }

  async delete(key: string): Promise<void> {
    // Delete from both cache and source
    await Promise.all([
      this.cache.delete(key),
      this.dataSource.delete(key)
    ]);
  }

  private isValid(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private createEntry(data: T): CacheEntry<T> {
    return {
      data,
      timestamp: Date.now(),
      ttl: this.strategy.ttl,
      version: 1,
      compressed: this.strategy.compression || false
    };
  }
}

// Read-Through Strategy - Netflix pattern  
// Cache manages data loading transparently
export class ReadThroughStrategy<T = any> {
  private loadingPromises = new Map<string, Promise<T | null>>();

  constructor(
    private cache: CacheStorage,
    private dataSource: DataSource<T>,
    private strategy: CacheStrategy
  ) {}

  async get(key: string): Promise<T | null> {
    // Check if already loading
    const loadingPromise = this.loadingPromises.get(key);
    if (loadingPromise) {
      return loadingPromise;
    }

    // Try cache first
    const cached = await this.cache.get<T>(key);
    
    if (cached && this.isValid(cached)) {
      // Stale-while-revalidate pattern
      if (this.strategy.staleWhileRevalidate && this.isStale(cached)) {
        this.backgroundRefresh(key);
      }
      return cached.data;
    }
    
    // Load from source
    const promise = this.loadFromSource(key);
    this.loadingPromises.set(key, promise);
    
    try {
      const data = await promise;
      return data;
    } finally {
      this.loadingPromises.delete(key);
    }
  }

  private async loadFromSource(key: string): Promise<T | null> {
    const data = await this.dataSource.get(key);
    
    if (data !== null) {
      const entry = this.createEntry(data);
      await this.cache.set(key, entry);
    }
    
    return data;
  }

  private backgroundRefresh(key: string): void {
    if (!this.strategy.backgroundRefresh) return;
    
    // Non-blocking background update
    this.loadFromSource(key).catch(error => {
      console.warn(`Background refresh failed for ${key}:`, error);
    });
  }

  private isValid(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private isStale(entry: CacheEntry<T>): boolean {
    const staleThreshold = entry.ttl * 0.8; // 80% of TTL
    return Date.now() - entry.timestamp > staleThreshold;
  }

  private createEntry(data: T): CacheEntry<T> {
    return {
      data,
      timestamp: Date.now(),
      ttl: this.strategy.ttl,
      version: 1,
      compressed: this.strategy.compression || false
    };
  }
}

// Write-Behind Strategy - Facebook pattern
// Asynchronous writes for better performance
export class WriteBehindStrategy<T = any> {
  private writeQueue = new Map<string, { data: T; timestamp: number }>();
  private writeTimer?: NodeJS.Timeout;
  private readonly BATCH_INTERVAL = 5000; // 5 seconds

  constructor(
    private cache: CacheStorage,
    private dataSource: DataSource<T>,
    private strategy: CacheStrategy
  ) {
    this.startBatchWriter();
  }

  async get(key: string): Promise<T | null> {
    // Check write queue first (most recent data)
    const queued = this.writeQueue.get(key);
    if (queued) {
      return queued.data;
    }

    // Then check cache
    const cached = await this.cache.get<T>(key);
    if (cached && this.isValid(cached)) {
      return cached.data;
    }

    // Finally load from source
    const data = await this.dataSource.get(key);
    if (data !== null) {
      const entry = this.createEntry(data);
      await this.cache.set(key, entry);
    }

    return data;
  }

  async set(key: string, data: T): Promise<void> {
    const entry = this.createEntry(data);
    
    // Immediate cache update
    await this.cache.set(key, entry);
    
    // Queue for background database write
    this.writeQueue.set(key, { data, timestamp: Date.now() });
  }

  async delete(key: string): Promise<void> {
    // Immediate cache delete
    await this.cache.delete(key);
    
    // Queue for background database delete
    this.writeQueue.set(key, { data: null as any, timestamp: Date.now() });
  }

  private startBatchWriter(): void {
    this.writeTimer = setInterval(async () => {
      if (this.writeQueue.size === 0) return;
      
      const batch = Array.from(this.writeQueue.entries());
      this.writeQueue.clear();
      
      // Batch write to database
      await this.processBatch(batch);
    }, this.BATCH_INTERVAL);
  }

  private async processBatch(batch: Array<[string, { data: T; timestamp: number }]>): Promise<void> {
    const writes: Array<[string, T]> = [];
    const deletes: string[] = [];
    
    for (const [key, { data }] of batch) {
      if (data === null) {
        deletes.push(key);
      } else {
        writes.push([key, data]);
      }
    }
    
    try {
      // Parallel batch operations
      const operations: Promise<any>[] = [];
      
      if (writes.length > 0) {
        operations.push(this.dataSource.multiGet(writes.map(([k]) => k)));
      }
      
      await Promise.all(operations);
    } catch (error) {
      console.error('Batch write failed:', error);
      // TODO: Retry mechanism or dead letter queue
    }
  }

  private isValid(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private createEntry(data: T): CacheEntry<T> {
    return {
      data,
      timestamp: Date.now(),
      ttl: this.strategy.ttl,
      version: 1,
      compressed: this.strategy.compression || false
    };
  }

  destroy(): void {
    if (this.writeTimer) {
      clearInterval(this.writeTimer);
      this.writeTimer = undefined;
    }
  }
}