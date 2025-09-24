import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommentWithUser } from '@fishivo/types';

const CACHE_PREFIX = 'comments_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedComments {
  data: CommentWithUser[];
  timestamp: number;
}

export const commentsCache = {
  // Get cached comments
  async get(postId: number): Promise<CommentWithUser[] | null> {
    try {
      const cacheKey = `${CACHE_PREFIX}${postId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const parsedCache: CachedComments = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - parsedCache.timestamp > CACHE_TTL) {
        // Cache expired, remove it
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      
      return parsedCache.data;
    } catch (error) {
      return null;
    }
  },

  // Set cached comments
  async set(postId: number, comments: CommentWithUser[]): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${postId}`;
      const cacheData: CachedComments = {
        data: comments,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      // Silently fail
    }
  },

  // Invalidate cache for a post
  async invalidate(postId: number): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${postId}`;
      await AsyncStorage.removeItem(cacheKey);
      // Also clear any related post stats cache
      await AsyncStorage.removeItem(`@post_stats_${postId}`);
    } catch (error) {
      // Silently fail
    }
  },

  // Clear all comments cache
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const commentKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (commentKeys.length > 0) {
        await AsyncStorage.multiRemove(commentKeys);
      }
    } catch (error) {
      // Silently fail
    }
  },

  // Update a single comment in cache
  async updateComment(postId: number, commentId: number, updater: (comment: CommentWithUser) => CommentWithUser): Promise<void> {
    try {
      const cached = await this.get(postId);
      if (!cached) return;

      const updatedComments = cached.map(comment => {
        // Convert both to number for comparison
        if (Number(comment.id) === Number(commentId)) {
          return updater(comment);
        }
        // Check in replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              Number(reply.id) === Number(commentId) ? updater(reply) : reply
            )
          };
        }
        return comment;
      });

      await this.set(postId, updatedComments);
    } catch (error) {
      // Silently fail
    }
  }
};