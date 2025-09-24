/**
 * Like System Store - Instagram/Meta Pattern
 * Optimistic Updates + Real-time Sync
 * NO PERSISTENCE - ALWAYS FRESH DATA
 */

import { create } from 'zustand';
import { likesServiceNative } from '@fishivo/api';

export interface LikeState {
  isLiked: boolean;
  likesCount: number;
  lastUpdated: number;
}

export interface PostLikeData extends LikeState {
  postId: string;
}

export interface CommentLikeData extends LikeState {
  commentId: string;
}

export interface LikeStore {
  // State
  postLikes: Map<string, LikeState>;        // Post ID -> Like state
  commentLikes: Map<string, LikeState>;     // Comment ID -> Like state  
  userLikedPosts: Set<string>;              // Posts liked by current user
  userLikedComments: Set<string>;           // Comments liked by current user
  pendingOperations: Set<string>;           // Operations in progress
  lastSyncTime: number;
  
  // Post Like Actions (Instagram pattern - Optimistic Updates)
  togglePostLike: (postId: string, currentLikesCount?: number) => Promise<boolean>;
  getPostLikeState: (postId: string) => LikeState | undefined;
  setPostLikeState: (postId: string, state: LikeState) => void;
  
  // Comment Like Actions
  toggleCommentLike: (commentId: string, currentLikesCount?: number) => Promise<boolean>;
  getCommentLikeState: (commentId: string) => LikeState | undefined;
  setCommentLikeState: (commentId: string, state: LikeState) => void;
  
  // Batch operations for performance
  batchSetPostLikes: (likes: Array<{ postId: string; state: LikeState }>) => void;
  batchSetCommentLikes: (likes: Array<{ commentId: string; state: LikeState }>) => void;

  // Real-time sync
  handleRealtimeUpdate: (entityId: string, entityType: 'post' | 'comment', action: 'liked' | 'unliked') => void;
  
  // Background sync
  backgroundSync: () => Promise<void>;
  
  // Utility
  isPending: (entityId: string, entityType: 'post' | 'comment') => boolean;
  clearPendingOperation: (entityId: string, entityType: 'post' | 'comment') => void;
  
  // Stats
  getTotalLikedPosts: () => number;
  getTotalLikedComments: () => number;
  
  // Cleanup
  cleanup: () => void;
}

// Create the store WITHOUT persistence - ALWAYS FRESH DATA
export const useLikeStore = create<LikeStore>((set, get) => ({
      // Initial state
      postLikes: new Map<string, LikeState>(),
      commentLikes: new Map<string, LikeState>(),
      userLikedPosts: new Set<string>(),
      userLikedComments: new Set<string>(),
      pendingOperations: new Set<string>(),
      lastSyncTime: 0,

      // Post like toggle with optimistic updates
      togglePostLike: async (postId: string, currentLikesCount = 0): Promise<boolean> => {
        const operationKey = `post:${postId}`;
        const { postLikes, userLikedPosts, pendingOperations } = get();
        
        // Prevent duplicate operations
        if (pendingOperations.has(operationKey)) {
          return false;
        }

        // Add to pending operations
        set({ pendingOperations: new Set(pendingOperations).add(operationKey) });

        const currentState = postLikes.get(postId) || {
          isLiked: false,
          likesCount: currentLikesCount,
          lastUpdated: 0
        };

        const wasLiked = currentState.isLiked;
        const newIsLiked = !wasLiked;
        const newLikesCount = wasLiked 
          ? Math.max(0, currentState.likesCount - 1)
          : currentState.likesCount + 1;

        // Optimistic update (Instagram pattern)
        const optimisticState: LikeState = {
          isLiked: newIsLiked,
          likesCount: newLikesCount,
          lastUpdated: Date.now()
        };

        // Update local state immediately
        const newPostLikes = new Map(postLikes);
        newPostLikes.set(postId, optimisticState);
        
        const newUserLikedPosts = new Set(userLikedPosts);
        if (newIsLiked) {
          newUserLikedPosts.add(postId);
        } else {
          newUserLikedPosts.delete(postId);
        }

        set({
          postLikes: newPostLikes,
          userLikedPosts: newUserLikedPosts
        });
        
        // Don't update cache here - API service will do it
        // This prevents duplicate cache updates and race conditions

        try {
          // Make API call and get the actual count from database
          const result = await likesServiceNative.togglePostLike(parseInt(postId));
          const success = result.success;

          if (!success) {
            // Rollback on failure
            console.warn('❌ Like operation failed, rolling back');
            
            const rollbackState: LikeState = {
              isLiked: wasLiked,
              likesCount: currentState.likesCount,
              lastUpdated: Date.now()
            };

            const rollbackPostLikes = new Map(get().postLikes);
            rollbackPostLikes.set(postId, rollbackState);
            
            const rollbackUserLikedPosts = new Set(get().userLikedPosts);
            if (wasLiked) {
              rollbackUserLikedPosts.add(postId);
            } else {
              rollbackUserLikedPosts.delete(postId);
            }

            set({
              postLikes: rollbackPostLikes,
              userLikedPosts: rollbackUserLikedPosts
            });
          } else {
            // Update with actual count from database
            if (result.likesCount !== undefined) {
              const updatedState: LikeState = {
                isLiked: result.isLiked,
                likesCount: result.likesCount,
                lastUpdated: Date.now()
              };
              const updatedPostLikes = new Map(get().postLikes);
              updatedPostLikes.set(postId, updatedState);
              set({ postLikes: updatedPostLikes });
            }
          }

          return success;
        } catch (error) {
          console.error('💥 Like operation error:', error);
          
          // Rollback on error
          const rollbackState: LikeState = {
            isLiked: wasLiked,
            likesCount: currentState.likesCount,
            lastUpdated: Date.now()
          };

          const rollbackPostLikes = new Map(get().postLikes);
          rollbackPostLikes.set(postId, rollbackState);
          
          const rollbackUserLikedPosts = new Set(get().userLikedPosts);
          if (wasLiked) {
            rollbackUserLikedPosts.add(postId);
          } else {
            rollbackUserLikedPosts.delete(postId);
          }

          set({
            postLikes: rollbackPostLikes,
            userLikedPosts: rollbackUserLikedPosts
          });
          return false;
        } finally {
          // Remove from pending operations
          const updatedPending = new Set(get().pendingOperations);
          updatedPending.delete(operationKey);
          set({ pendingOperations: updatedPending });
        }
      },

      // Comment like toggle (similar pattern)
      toggleCommentLike: async (commentId: string, currentLikesCount = 0): Promise<boolean> => {
        const operationKey = `comment:${commentId}`;
        const { commentLikes, userLikedComments, pendingOperations } = get();
        
        if (pendingOperations.has(operationKey)) {
          return false;
        }

        set({ pendingOperations: new Set(pendingOperations).add(operationKey) });

        const currentState = commentLikes.get(commentId) || {
          isLiked: false,
          likesCount: currentLikesCount,
          lastUpdated: 0
        };

        const wasLiked = currentState.isLiked;
        const newIsLiked = !wasLiked;
        const newLikesCount = wasLiked 
          ? Math.max(0, currentState.likesCount - 1)
          : currentState.likesCount + 1;

        const optimisticState: LikeState = {
          isLiked: newIsLiked,
          likesCount: newLikesCount,
          lastUpdated: Date.now()
        };

        const newCommentLikes = new Map(commentLikes);
        newCommentLikes.set(commentId, optimisticState);
        
        const newUserLikedComments = new Set(userLikedComments);
        if (newIsLiked) {
          newUserLikedComments.add(commentId);
        } else {
          newUserLikedComments.delete(commentId);
        }

        set({
          commentLikes: newCommentLikes,
          userLikedComments: newUserLikedComments
        });
        
        // Don't update cache here - API service will do it

        try {
          // Make API call and get the actual count from database
          const result = await likesServiceNative.toggleCommentLike(parseInt(commentId));
          const success = result.success;

          if (!success) {
            // Rollback logic (similar to post)
            const rollbackState: LikeState = {
              isLiked: wasLiked,
              likesCount: currentState.likesCount,
              lastUpdated: Date.now()
            };

            const rollbackCommentLikes = new Map(get().commentLikes);
            rollbackCommentLikes.set(commentId, rollbackState);
            
            const rollbackUserLikedComments = new Set(get().userLikedComments);
            if (wasLiked) {
              rollbackUserLikedComments.add(commentId);
            } else {
              rollbackUserLikedComments.delete(commentId);
            }

            set({
              commentLikes: rollbackCommentLikes,
              userLikedComments: rollbackUserLikedComments
            });
          } else {
            // Update with actual count from database
            if (result.likesCount !== undefined) {
              const updatedState: LikeState = {
                isLiked: result.isLiked,
                likesCount: result.likesCount,
                lastUpdated: Date.now()
              };
              const updatedCommentLikes = new Map(get().commentLikes);
              updatedCommentLikes.set(commentId, updatedState);
              set({ commentLikes: updatedCommentLikes });
            }
          }

          return success;
        } catch (error) {
          console.error('💥 Comment like error:', error);
          return false;
        } finally {
          const updatedPending = new Set(get().pendingOperations);
          updatedPending.delete(operationKey);
          set({ pendingOperations: updatedPending });
        }
      },

      // Getters
      getPostLikeState: (postId: string) => {
        return get().postLikes.get(postId);
      },

      getCommentLikeState: (commentId: string) => {
        return get().commentLikes.get(commentId);
      },

      // Setters
      setPostLikeState: (postId: string, state: LikeState) => {
        const { postLikes, userLikedPosts } = get();
        const newPostLikes = new Map(postLikes);
        newPostLikes.set(postId, state);
        
        const newUserLikedPosts = new Set(userLikedPosts);
        if (state.isLiked) {
          newUserLikedPosts.add(postId);
        } else {
          newUserLikedPosts.delete(postId);
        }

        set({
          postLikes: newPostLikes,
          userLikedPosts: newUserLikedPosts
        });
      },

      setCommentLikeState: (commentId: string, state: LikeState) => {
        const { commentLikes, userLikedComments } = get();
        const newCommentLikes = new Map(commentLikes);
        newCommentLikes.set(commentId, state);
        
        const newUserLikedComments = new Set(userLikedComments);
        if (state.isLiked) {
          newUserLikedComments.add(commentId);
        } else {
          newUserLikedComments.delete(commentId);
        }

        set({
          commentLikes: newCommentLikes,
          userLikedComments: newUserLikedComments
        });
      },

      // Batch operations
      batchSetPostLikes: (likes) => {
        const { postLikes, userLikedPosts } = get();
        const newPostLikes = new Map(postLikes);
        const newUserLikedPosts = new Set(userLikedPosts);

        for (const { postId, state } of likes) {
          newPostLikes.set(postId, state);
          if (state.isLiked) {
            newUserLikedPosts.add(postId);
          } else {
            newUserLikedPosts.delete(postId);
          }
        }

        set({
          postLikes: newPostLikes,
          userLikedPosts: newUserLikedPosts
        });
      },

      batchSetCommentLikes: (likes) => {
        const { commentLikes, userLikedComments } = get();
        const newCommentLikes = new Map(commentLikes);
        const newUserLikedComments = new Set(userLikedComments);

        for (const { commentId, state } of likes) {
          newCommentLikes.set(commentId, state);
          if (state.isLiked) {
            newUserLikedComments.add(commentId);
          } else {
            newUserLikedComments.delete(commentId);
          }
        }

        set({
          commentLikes: newCommentLikes,
          userLikedComments: newUserLikedComments
        });
      },

      // Cache is managed entirely by API service layer to prevent duplicates

      // Real-time update handler
      handleRealtimeUpdate: async (entityId: string, entityType: 'post' | 'comment', _action: 'liked' | 'unliked') => {
        
        if (entityType === 'post') {
          try {
            const { getNativeSupabaseClient } = await import('@fishivo/api/client/supabase.native');
            const supabase = getNativeSupabaseClient();
            
            // Get current user ID first
            const { data: currentUser } = await supabase.auth.getUser();
            
            if (currentUser?.user?.id) {
              // Get like count from post_stats
              const { data: postStats } = await supabase
                .from('post_stats')
                .select('likes_count')
                .eq('post_id', parseInt(entityId))
                .single();
              
              // Check if user liked
              const { data: userLike } = await supabase
                .from('likes')
                .select('id')
                .eq('post_id', parseInt(entityId))
                .eq('user_id', currentUser.user.id)
                .single();
              
              if (postStats) {
                const updatedState: LikeState = {
                  isLiked: !!userLike,
                  likesCount: postStats.likes_count || 0,
                  lastUpdated: Date.now()
                };
                get().setPostLikeState(entityId, updatedState);
              }
            } else {
              // No user logged in, just update count
              const { data: postStats } = await supabase
                .from('post_stats')
                .select('likes_count')
                .eq('post_id', parseInt(entityId))
                .single();
              
              if (postStats) {
                const updatedState: LikeState = {
                  isLiked: false,
                  likesCount: postStats.likes_count || 0,
                  lastUpdated: Date.now()
                };
                get().setPostLikeState(entityId, updatedState);
              }
            }
          } catch (error) {
            console.warn('Failed to fetch realtime count:', error);
          }
        } else if (entityType === 'comment') {
          try {
            const { getNativeSupabaseClient } = await import('@fishivo/api/client/supabase.native');
            const supabase = getNativeSupabaseClient();
            
            // Get current user ID first
            const { data: currentUser } = await supabase.auth.getUser();
            
            if (currentUser?.user?.id) {
              // Single optimized RPC call for comments too
              const { data: likeState } = await supabase.rpc('get_comment_like_state', {
                p_comment_id: parseInt(entityId),
                p_user_id: currentUser.user.id
              });
              
              if (likeState) {
                const updatedState: LikeState = {
                  isLiked: likeState.is_liked || false,
                  likesCount: likeState.likes_count || 0,
                  lastUpdated: Date.now()
                };
                get().setCommentLikeState(entityId, updatedState);
              }
            } else {
              // No user logged in, just update count
              const { data: comment } = await supabase
                .from('comments')
                .select('likes_count')
                .eq('id', parseInt(entityId))
                .single();
              
              if (comment) {
                const updatedState: LikeState = {
                  isLiked: false,
                  likesCount: comment.likes_count || 0,
                  lastUpdated: Date.now()
                };
                get().setCommentLikeState(entityId, updatedState);
              }
            }
          } catch (error) {
            console.warn('Failed to fetch realtime comment count:', error);
          }
        }
      },

      // Background sync
      backgroundSync: async () => {
        
        const { postLikes, commentLikes } = get();

        // Sync post likes
        for (const [postId, state] of postLikes) {
          if (Date.now() - state.lastUpdated > 5 * 60 * 1000) { // 5 minutes old
            try {
              const isLiked = await likesServiceNative.checkUserLiked(parseInt(postId));
              if (isLiked !== state.isLiked) {
                get().setPostLikeState(postId, {
                  ...state,
                  isLiked,
                  lastUpdated: Date.now()
                });
                // Sync completed
              }
            } catch (error) {
              console.warn(`Background sync failed for post ${postId}:`, error);
            }
          }
        }

        // Sync comment likes
        for (const [commentId, state] of commentLikes) {
          if (Date.now() - state.lastUpdated > 5 * 60 * 1000) {
            try {
              const isLiked = await likesServiceNative.checkCommentLiked(parseInt(commentId));
              if (isLiked !== state.isLiked) {
                get().setCommentLikeState(commentId, {
                  ...state,
                  isLiked,
                  lastUpdated: Date.now()
                });
                // Sync completed
              }
            } catch (error) {
              console.warn(`Background sync failed for comment ${commentId}:`, error);
            }
          }
        }

        set({ lastSyncTime: Date.now() });
      },

      // Utility methods
      isPending: (entityId: string, entityType: 'post' | 'comment') => {
        return get().pendingOperations.has(`${entityType}:${entityId}`);
      },

      clearPendingOperation: (entityId: string, entityType: 'post' | 'comment') => {
        const { pendingOperations } = get();
        const updatedPending = new Set(pendingOperations);
        updatedPending.delete(`${entityType}:${entityId}`);
        set({ pendingOperations: updatedPending });
      },

      // Stats
      getTotalLikedPosts: () => {
        return get().userLikedPosts.size;
      },

      getTotalLikedComments: () => {
        return get().userLikedComments.size;
      },

      // Cleanup
      cleanup: () => {
        set({
          postLikes: new Map(),
          commentLikes: new Map(),
          userLikedPosts: new Set(),
          userLikedComments: new Set(),
          pendingOperations: new Set(),
          lastSyncTime: 0
        });
      }
    }
));