/**
 * Cache Configuration - Professional Strategy Definitions
 * Based on Meta/Instagram/Netflix patterns
 */

export interface CacheStrategy {
  ttl: number;                    // Time to live in ms
  priority: 'critical' | 'high' | 'medium' | 'low';
  invalidateOn: string[];         // Events that trigger invalidation
  refreshOn?: string[];          // Events that trigger background refresh
  maxSize?: number;              // Maximum entries for this cache type
  persistence: boolean;          // Should persist to AsyncStorage
  compression?: boolean;         // Compress large data
  backgroundRefresh?: boolean;   // Enable background refresh
  staleWhileRevalidate?: boolean; // Serve stale while fetching fresh
}

export const CACHE_CONFIG: Record<string, CacheStrategy> = {
  // Critical for user experience - Instagram pattern
  likes: {
    ttl: 10 * 60 * 1000,          // 10 minutes
    priority: 'critical',
    invalidateOn: ['post.liked', 'post.unliked', 'comment.liked', 'comment.unliked'],
    refreshOn: ['user.login'],
    maxSize: 1000,
    persistence: true,
    backgroundRefresh: true,
    staleWhileRevalidate: true
  },

  // High priority - Social features
  follows: {
    ttl: 15 * 60 * 1000,          // 15 minutes
    priority: 'critical',
    invalidateOn: ['user.followed', 'user.unfollowed'],
    refreshOn: ['user.login', 'user.profile_viewed'],
    maxSize: 500,
    persistence: true,
    backgroundRefresh: true
  },

  // Posts and comments
  posts: {
    ttl: 5 * 60 * 1000,           // 5 minutes
    priority: 'high',
    invalidateOn: ['post.created', 'post.updated', 'post.deleted'],
    refreshOn: ['user.login', 'feed.refresh'],
    maxSize: 200,
    persistence: true,
    compression: true,
    staleWhileRevalidate: true
  },

  comments: {
    ttl: 5 * 60 * 1000,           // 5 minutes  
    priority: 'high',
    invalidateOn: ['comment.created', 'comment.updated', 'comment.deleted'],
    maxSize: 300,
    persistence: true
  },

  // User stats and profiles
  user_stats: {
    ttl: 30 * 60 * 1000,          // 30 minutes
    priority: 'medium',
    invalidateOn: ['user.stats_updated', 'user.followed', 'user.unfollowed'],
    maxSize: 100,
    persistence: true
  },

  // Map and location data - Netflix-style tile caching
  map_catches: {
    ttl: 24 * 60 * 60 * 1000,     // 24 hours
    priority: 'medium',
    invalidateOn: ['catch.created', 'catch.updated', 'catch.deleted'],
    maxSize: 500,
    persistence: true,
    compression: true,
    backgroundRefresh: true
  },

  // Weather data with shorter TTL
  weather: {
    ttl: 30 * 60 * 1000,          // 30 minutes
    priority: 'low',
    invalidateOn: [],              // Weather data auto-expires
    maxSize: 50,
    persistence: true,
    backgroundRefresh: true,
    staleWhileRevalidate: true
  },

  // Species and reference data
  species: {
    ttl: 24 * 60 * 60 * 1000,     // 24 hours
    priority: 'low',
    invalidateOn: ['species.updated'],
    maxSize: 1000,
    persistence: true,
    compression: true
  }
};

// Cache size limits per priority
export const CACHE_LIMITS = {
  critical: 2000,    // Total entries for critical caches
  high: 1500,        // Total entries for high priority  
  medium: 1000,      // Total entries for medium priority
  low: 500           // Total entries for low priority
} as const;

// Memory vs Storage distribution
export const CACHE_LAYERS = {
  L1_MEMORY_RATIO: 0.3,      // 30% in memory (fast access)
  L2_STORAGE_RATIO: 0.7,     // 70% in AsyncStorage (persistent)
  MAX_MEMORY_SIZE: 50        // Max MB for L1 memory cache
} as const;

export type CacheConfigType = typeof CACHE_CONFIG;