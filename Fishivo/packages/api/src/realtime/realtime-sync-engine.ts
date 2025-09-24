/**
 * Real-time Sync Engine - Supabase Realtime Integration
 * Instagram/Meta pattern for real-time cache synchronization
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getNativeSupabaseClient } from '../client/supabase.native';
import { cacheManager } from '../cache/unified-cache-manager';
import { cacheEventEmitter, CACHE_EVENTS, CacheEvent } from '../cache/cache-events';
import { CACHE_KEYS } from '../cache/cache-keys';

export interface RealtimeConfig {
  channel: string;
  tables: string[];
  events: ('INSERT' | 'UPDATE' | 'DELETE')[];
  enableLogging?: boolean;
}

export interface SyncRule {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  handler: (payload: RealtimePostgresChangesPayload<any>) => Promise<void>;
}

export class RealtimeSyncEngine {
  private static instance: RealtimeSyncEngine;
  private supabase = getNativeSupabaseClient();
  private channels = new Map<string, RealtimeChannel>();
  private syncRules: SyncRule[] = [];
  private isEnabled: boolean = true;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  private constructor() {
    this.setupDefaultSyncRules();
  }

  static getInstance(): RealtimeSyncEngine {
    if (!RealtimeSyncEngine.instance) {
      RealtimeSyncEngine.instance = new RealtimeSyncEngine();
    }
    return RealtimeSyncEngine.instance;
  }

  // Initialize real-time subscriptions
  async initialize(configs: RealtimeConfig[]): Promise<void> {
    if (!this.isEnabled) {
      console.log('🔄 Realtime sync disabled, skipping initialization');
      return;
    }

    try {
      console.log('🚀 Initializing Realtime Sync Engine...');

      for (const config of configs) {
        await this.createSubscription(config);
      }

      // Set up connection monitoring
      this.setupConnectionMonitoring();
      
      console.log('✅ Realtime Sync Engine initialized successfully');
    } catch (error) {
      console.error('❌ Realtime sync initialization failed:', error);
      throw error;
    }
  }

  // Create a subscription for a specific configuration
  private async createSubscription(config: RealtimeConfig): Promise<void> {
    const channel = this.supabase.channel(config.channel, {
      config: {
        broadcast: { self: true },
        presence: { key: 'cache-sync' }
      }
    });

    // Subscribe to all specified tables and events
    for (const table of config.tables) {
      for (const event of config.events) {
        channel.on(
          'postgres_changes' as any,
          {
            event: event,
            schema: 'public',
            table: table
          },
          (payload: any) => this.handleRealtimeChange(table, event, payload)
        );
      }
    }

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (config.enableLogging) {
        console.log(`📡 Realtime subscription status for ${config.channel}:`, status);
      }

      if (status === 'SUBSCRIBED') {
        this.reconnectAttempts = 0;
        console.log(`✅ Subscribed to ${config.channel}`);
      } else if (status === 'CHANNEL_ERROR') {
        // Silently handle channel error
        // console.error(`❌ Channel error for ${config.channel}`);
        this.handleConnectionError(config);
      }
    });

    this.channels.set(config.channel, channel);
  }

  // Handle incoming real-time changes
  private async handleRealtimeChange(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE',
    payload: RealtimePostgresChangesPayload<any>
  ): Promise<void> {
    try {
      const data = payload.new || payload.old || {};
      console.log(`🔄 Realtime change: ${table}.${event}`, {
        id: data.id,
        eventType: payload.eventType
      });

      // Find and execute matching sync rules
      const matchingRules = this.syncRules.filter(
        rule => rule.table === table && rule.event === event
      );

      for (const rule of matchingRules) {
        await rule.handler(payload);
      }

      // Emit cache event for additional handlers
      this.emitCacheEvent(table, event, payload);

    } catch (error) {
      console.error(`❌ Error handling realtime change for ${table}.${event}:`, error);
    }
  }

  // Set up default sync rules for common tables
  private setupDefaultSyncRules(): void {
    // Likes table sync rules
    this.addSyncRule('likes', 'INSERT', async (payload) => {
      await this.handleLikeChange(payload, 'liked');
    });

    this.addSyncRule('likes', 'DELETE', async (payload) => {
      await this.handleLikeChange(payload, 'unliked');
    });

    // Posts table sync rules
    this.addSyncRule('posts', 'INSERT', async (payload) => {
      await this.handlePostChange(payload, 'created');
    });

    this.addSyncRule('posts', 'UPDATE', async (payload) => {
      await this.handlePostChange(payload, 'updated');
    });

    this.addSyncRule('posts', 'DELETE', async (payload) => {
      await this.handlePostChange(payload, 'deleted');
    });

    // Comments table sync rules
    this.addSyncRule('comments', 'INSERT', async (payload) => {
      await this.handleCommentChange(payload, 'created');
    });

    this.addSyncRule('comments', 'UPDATE', async (payload) => {
      await this.handleCommentChange(payload, 'updated');
    });

    this.addSyncRule('comments', 'DELETE', async (payload) => {
      await this.handleCommentChange(payload, 'deleted');
    });

    // Follows table sync rules
    this.addSyncRule('follows', 'INSERT', async (payload) => {
      await this.handleFollowChange(payload, 'followed');
    });

    this.addSyncRule('follows', 'DELETE', async (payload) => {
      await this.handleFollowChange(payload, 'unfollowed');
    });

    // User stats sync rules
    this.addSyncRule('user_stats', 'UPDATE', async (payload) => {
      await this.handleUserStatsChange(payload);
    });

    // Post stats sync rules
    this.addSyncRule('post_stats', 'UPDATE', async (payload) => {
      await this.handlePostStatsChange(payload);
    });
  }

  // Like change handlers
  private async handleLikeChange(
    payload: RealtimePostgresChangesPayload<any>,
    action: 'liked' | 'unliked'
  ): Promise<void> {
    const data = payload.new || payload.old;
    const postId = data?.post_id;
    const commentId = data?.comment_id;
    const userId = data?.user_id;

    if (postId) {
      // Invalidate post-related cache
      await cacheManager.invalidate([
        CACHE_KEYS.POST_LIKES(postId),
        CACHE_KEYS.POST_LIKERS(postId) + '*', // All pages
        CACHE_KEYS.POST_STATS(postId),
        CACHE_KEYS.USER_LIKED_POSTS(userId)
      ]);

      console.log(`🎯 Post ${action}: Invalidated cache for post ${postId}`);
    }

    if (commentId) {
      // Invalidate comment-related cache
      await cacheManager.invalidate([
        CACHE_KEYS.COMMENT_LIKES(commentId),
        CACHE_KEYS.COMMENT_LIKERS(commentId) + '*', // All pages
        CACHE_KEYS.USER_LIKED_COMMENTS(userId)
      ]);

      console.log(`💬 Comment ${action}: Invalidated cache for comment ${commentId}`);
    }
  }

  // Post change handlers
  private async handlePostChange(
    payload: RealtimePostgresChangesPayload<any>,
    action: 'created' | 'updated' | 'deleted'
  ): Promise<void> {
    const data = payload.new || payload.old;
    const postId = data?.id;
    const userId = data?.user_id;

    if (postId) {
      // Invalidate post-specific cache
      await cacheManager.invalidate([
        CACHE_KEYS.POST(postId),
        CACHE_KEYS.POST_LIKES(postId),
        CACHE_KEYS.POST_COMMENTS(postId),
        CACHE_KEYS.POST_STATS(postId)
      ]);

      // Invalidate map cache if location changed
      if (action === 'created' || action === 'updated') {
        await cacheManager.invalidate(['map*']);
      }

      console.log(`📝 Post ${action}: Invalidated cache for post ${postId}`);
    }
  }

  // Comment change handlers
  private async handleCommentChange(
    payload: RealtimePostgresChangesPayload<any>,
    action: 'created' | 'updated' | 'deleted'
  ): Promise<void> {
    const data = payload.new || payload.old;
    const commentId = data?.id;
    const postId = data?.post_id;

    if (commentId && postId) {
      // Invalidate comment and related post cache
      await cacheManager.invalidate([
        CACHE_KEYS.COMMENT(commentId),
        CACHE_KEYS.COMMENT_LIKES(commentId),
        CACHE_KEYS.POST_COMMENTS(postId),
        CACHE_KEYS.POST_STATS(postId) // Comment count might change
      ]);

      console.log(`💬 Comment ${action}: Invalidated cache for comment ${commentId}`);
    }
  }

  // Follow change handlers
  private async handleFollowChange(
    payload: RealtimePostgresChangesPayload<any>,
    action: 'followed' | 'unfollowed'
  ): Promise<void> {
    const data = payload.new || payload.old;
    const followerId = data?.follower_id;
    const followingId = data?.following_id;

    if (followerId && followingId) {
      // Invalidate follow-related cache
      await cacheManager.invalidate([
        CACHE_KEYS.USER_FOLLOWS(followerId),
        CACHE_KEYS.USER_STATS(followerId),
        CACHE_KEYS.USER_STATS(followingId)
      ]);

      console.log(`👥 ${action}: Invalidated cache for users ${followerId} -> ${followingId}`);
    }
  }

  // User stats change handlers
  private async handleUserStatsChange(
    payload: RealtimePostgresChangesPayload<any>
  ): Promise<void> {
    const data = payload.new || payload.old;
    const userId = data?.user_id;

    if (userId) {
      await cacheManager.invalidate([
        CACHE_KEYS.USER_STATS(userId)
      ]);

      console.log(`📊 User stats updated: Invalidated cache for user ${userId}`);
    }
  }

  // Post stats change handlers
  private async handlePostStatsChange(
    payload: RealtimePostgresChangesPayload<any>
  ): Promise<void> {
    const data = payload.new || payload.old;
    const postId = data?.post_id;

    if (postId) {
      await cacheManager.invalidate([
        CACHE_KEYS.POST_STATS(postId)
      ]);

      console.log(`📊 Post stats updated: Invalidated cache for post ${postId}`);
    }
  }

  // Emit cache event for additional handlers
  private emitCacheEvent(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE',
    payload: RealtimePostgresChangesPayload<any>
  ): void {
    const data = payload.new || payload.old;
    const entityId = data?.id;

    if (!entityId) return;

    // Map database events to cache events
    const eventMap: Record<string, string> = {
      'likes.INSERT': data?.post_id ? CACHE_EVENTS.POST_LIKED : CACHE_EVENTS.COMMENT_LIKED,
      'likes.DELETE': data?.post_id ? CACHE_EVENTS.POST_UNLIKED : CACHE_EVENTS.COMMENT_UNLIKED,
      'posts.INSERT': CACHE_EVENTS.POST_CREATED,
      'posts.UPDATE': CACHE_EVENTS.POST_UPDATED,
      'posts.DELETE': CACHE_EVENTS.POST_DELETED,
      'comments.INSERT': CACHE_EVENTS.COMMENT_CREATED,
      'comments.UPDATE': CACHE_EVENTS.COMMENT_UPDATED,
      'comments.DELETE': CACHE_EVENTS.COMMENT_DELETED,
      'follows.INSERT': CACHE_EVENTS.USER_FOLLOWED,
      'follows.DELETE': CACHE_EVENTS.USER_UNFOLLOWED,
    };

    const eventType = eventMap[`${table}.${event}`];
    if (eventType) {
      const cacheEvent: CacheEvent = {
        type: eventType,
        entityId: data?.post_id || data?.comment_id || entityId,
        entityType: table === 'likes' ? (data?.post_id ? 'post' : 'comment') : table.slice(0, -1) as any,
        timestamp: Date.now(),
        userId: data?.user_id || data?.follower_id,
        metadata: { originalEvent: event, table }
      };

      cacheEventEmitter.emit(cacheEvent);
    }
  }

  // Add custom sync rule
  addSyncRule(table: string, event: 'INSERT' | 'UPDATE' | 'DELETE', handler: SyncRule['handler']): void {
    this.syncRules.push({ table, event, handler });
  }

  // Remove sync rule
  removeSyncRule(table: string, event: 'INSERT' | 'UPDATE' | 'DELETE'): void {
    this.syncRules = this.syncRules.filter(
      rule => !(rule.table === table && rule.event === event)
    );
  }

  // Connection monitoring
  private setupConnectionMonitoring(): void {
    // Monitor connection status
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('🔐 User signed in, ensuring realtime subscriptions');
        this.ensureSubscriptions();
      } else if (event === 'SIGNED_OUT') {
        console.log('🔓 User signed out, maintaining anonymous subscriptions');
      }
    });
  }

  // Handle connection errors with exponential backoff
  private async handleConnectionError(config: RealtimeConfig): Promise<void> {
    this.reconnectAttempts++;

    if (this.reconnectAttempts <= this.MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      // Silent reconnection attempts
      // console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);

      setTimeout(async () => {
        try {
          await this.createSubscription(config);
        } catch (error) {
          // Silent reconnection failure
          // console.error('❌ Reconnection failed:', error);
        }
      }, delay);
    } else {
      // Silently disable realtime sync after max attempts
      // console.error('❌ Max reconnection attempts reached, disabling realtime sync');
      this.isEnabled = false;
    }
  }

  // Ensure all subscriptions are active
  private async ensureSubscriptions(): Promise<void> {
    for (const [channelName, channel] of this.channels) {
      if (channel.state !== 'joined') {
        console.log(`🔄 Resubscribing to channel: ${channelName}`);
        // Channel will automatically attempt to reconnect
      }
    }
  }

  // Enable/disable realtime sync
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🔄 Realtime sync ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get connection status
  getStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    
    for (const [channelName, channel] of this.channels) {
      status[channelName] = channel.state;
    }
    
    return status;
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Realtime Sync Engine...');
    
    for (const [channelName, channel] of this.channels) {
      await channel.unsubscribe();
      console.log(`✅ Unsubscribed from ${channelName}`);
    }
    
    this.channels.clear();
    this.syncRules = [];
    console.log('✅ Realtime Sync Engine cleaned up');
  }
}

// Global instance
export const realtimeSyncEngine = RealtimeSyncEngine.getInstance();

// Default configuration for Fishivo
export const DEFAULT_REALTIME_CONFIG: RealtimeConfig[] = [
  {
    channel: 'cache-invalidation',
    tables: ['likes', 'follows', 'user_stats', 'post_stats'],
    events: ['INSERT', 'UPDATE', 'DELETE'],
    enableLogging: __DEV__
  }
  // Content updates channel temporarily disabled - causing connection errors
  // {
  //   channel: 'content-updates', 
  //   tables: ['posts', 'comments'],
  //   events: ['INSERT', 'UPDATE', 'DELETE'],
  //   enableLogging: __DEV__
  // }
];