/**
 * Standardized Cache Keys - Enterprise Pattern
 * Instagram/Meta style cache key management
 */

export const CACHE_KEYS = {
  // Posts
  POST: (id: string | number) => `post:${id}`,
  POST_LIKES: (id: string | number) => `post:${id}:likes`,
  POST_LIKERS: (id: string | number, page: number = 1) => `post:${id}:likers:${page}`,
  POST_COMMENTS: (id: string | number) => `post:${id}:comments`,
  POST_STATS: (id: string | number) => `post:${id}:stats`,
  
  // Users & Likes
  USER_LIKED_POSTS: (userId: string) => `user:${userId}:liked_posts`,
  USER_LIKED_COMMENTS: (userId: string) => `user:${userId}:liked_comments`,
  USER_STATS: (userId: string) => `user:${userId}:stats`,
  USER_FOLLOWS: (userId: string) => `user:${userId}:follows`,
  
  // Comments
  COMMENT: (id: string | number) => `comment:${id}`,
  COMMENT_LIKES: (id: string | number) => `comment:${id}:likes`,
  COMMENT_LIKERS: (id: string | number, page: number = 1) => `comment:${id}:likers:${page}`,
  
  // Map & Location
  MAP_CATCHES: (bounds: string, zoom: number) => `map:${bounds}:${zoom}`,
  MAP_TILE: (zoom: number, x: number, y: number) => `map_tile:${zoom}:${x}:${y}`,
  
  // Weather
  WEATHER: (lat: number, lng: number) => `weather:${lat.toFixed(4)}:${lng.toFixed(4)}`,
  
  // Species
  SPECIES: (id: string | number) => `species:${id}`,
  SPECIES_FOLLOWS: (userId: string) => `user:${userId}:species_follows`,
  
  // Global patterns for batch operations
  PATTERNS: {
    POST_ALL: (id: string | number) => `post:${id}*`,
    USER_ALL: (userId: string) => `user:${userId}*`,
    COMMENT_ALL: (id: string | number) => `comment:${id}*`,
    MAP_ALL: () => 'map*',
    WEATHER_ALL: () => 'weather*'
  }
} as const;

export type CacheKeyType = typeof CACHE_KEYS;