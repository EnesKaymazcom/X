/**
 * Cache Event System - Event-Driven Invalidation
 * Instagram/Meta pattern for real-time cache synchronization
 */

export interface CacheEvent {
  type: string;
  entityId: string | number;
  entityType: 'post' | 'comment' | 'user' | 'species' | 'catch';
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface CacheInvalidationRule {
  event: string;
  keysToInvalidate: (event: CacheEvent) => string[];
  action: 'invalidate' | 'refresh' | 'update';
  priority: 'immediate' | 'batch' | 'background';
}

// Event definitions
export const CACHE_EVENTS = {
  // Like events
  POST_LIKED: 'post.liked',
  POST_UNLIKED: 'post.unliked', 
  COMMENT_LIKED: 'comment.liked',
  COMMENT_UNLIKED: 'comment.unliked',
  
  // Follow events
  USER_FOLLOWED: 'user.followed',
  USER_UNFOLLOWED: 'user.unfollowed',
  
  // Post events
  POST_CREATED: 'post.created',
  POST_UPDATED: 'post.updated',
  POST_DELETED: 'post.deleted',
  
  // Comment events
  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',
  
  // User events
  USER_STATS_UPDATED: 'user.stats_updated',
  USER_LOGIN: 'user.login',
  USER_PROFILE_VIEWED: 'user.profile_viewed',
  
  // App events
  FEED_REFRESH: 'feed.refresh',
  APP_FOREGROUND: 'app.foreground',
  APP_BACKGROUND: 'app.background'
} as const;

// Invalidation rules - Meta/Instagram pattern
export const INVALIDATION_RULES: CacheInvalidationRule[] = [
  // Like system invalidation
  {
    event: CACHE_EVENTS.POST_LIKED,
    action: 'invalidate',
    priority: 'immediate',
    keysToInvalidate: (event) => [
      `post:${event.entityId}:likes`,
      `post:${event.entityId}:likers*`,
      `post:${event.entityId}:stats`,
      `user:${event.userId}:liked_posts`
    ]
  },
  
  {
    event: CACHE_EVENTS.POST_UNLIKED,
    action: 'invalidate', 
    priority: 'immediate',
    keysToInvalidate: (event) => [
      `post:${event.entityId}:likes`,
      `post:${event.entityId}:likers*`,
      `post:${event.entityId}:stats`,
      `user:${event.userId}:liked_posts`
    ]
  },
  
  {
    event: CACHE_EVENTS.COMMENT_LIKED,
    action: 'invalidate',
    priority: 'immediate',
    keysToInvalidate: (event) => [
      `comment:${event.entityId}:likes`,
      `comment:${event.entityId}:likers*`,
      `user:${event.userId}:liked_comments`
    ]
  },
  
  // Follow system invalidation
  {
    event: CACHE_EVENTS.USER_FOLLOWED,
    action: 'invalidate',
    priority: 'immediate',
    keysToInvalidate: (event) => [
      `user:${event.userId}:follows`,
      `user:${event.entityId}:stats`,
      `user:${event.userId}:stats`
    ]
  },
  
  // Post content invalidation
  {
    event: CACHE_EVENTS.POST_CREATED,
    action: 'invalidate',
    priority: 'batch',
    keysToInvalidate: (event) => [
      'map*',                    // Invalidate map caches
      `user:${event.userId}:stats`
    ]
  },
  
  // Background refresh triggers
  {
    event: CACHE_EVENTS.USER_LOGIN,
    action: 'refresh',
    priority: 'background',
    keysToInvalidate: (event) => [
      `user:${event.userId}:*`,
      'feed*'
    ]
  },
  
  {
    event: CACHE_EVENTS.APP_FOREGROUND,
    action: 'refresh',
    priority: 'background', 
    keysToInvalidate: () => [
      'weather*',               // Refresh weather data
      'user:*:stats'           // Refresh user stats
    ]
  }
];

// Event emitter interface
export interface CacheEventEmitter {
  emit(event: CacheEvent): void;
  subscribe(eventType: string, handler: (event: CacheEvent) => void): () => void;
  unsubscribe(eventType: string, handler?: (event: CacheEvent) => void): void;
}

export class SimpleCacheEventEmitter implements CacheEventEmitter {
  private listeners: Map<string, Set<(event: CacheEvent) => void>> = new Map();
  
  emit(event: CacheEvent): void {
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Cache event handler error:', error);
        }
      });
    }
  }
  
  subscribe(eventType: string, handler: (event: CacheEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }
  
  unsubscribe(eventType: string, handler?: (event: CacheEvent) => void): void {
    if (handler) {
      const handlers = this.listeners.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    } else {
      this.listeners.delete(eventType);
    }
  }
}

export const cacheEventEmitter = new SimpleCacheEventEmitter();