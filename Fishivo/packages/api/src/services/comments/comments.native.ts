import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { commentsCache } from './cache.native';

const nativeSupabase = getNativeSupabaseClient();
import { 
  CommentWithUser, 
  CreateCommentData, 
  UpdateCommentData 
} from '@fishivo/types';
import { validateCommentContent } from '@fishivo/utils';

// Helper function to check if user is admin
const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await nativeSupabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) return false;
    return data.role === 'super_admin';
  } catch (error) {
    // Error checking user role
    return false;
  }
};

export const commentsServiceNative = {
  // Get comments for a post - OPTIMIZED VERSION WITH CACHING
  async getPostCommentsOptimized(
    postId: number,
    limit: number = 20,
    offset: number = 0,
    userId?: string,
    forceRefresh: boolean = false
  ): Promise<CommentWithUser[]> {
    try {
      // Check cache first (only for initial load)
      if (!forceRefresh && offset === 0) {
        const cached = await commentsCache.get(postId);
        if (cached) {
          // If we have more than limit, return only the requested amount
          return cached.slice(0, limit);
        }
      }

      // Use RPC function for optimized single-query fetching
      const { data, error } = await nativeSupabase
        .rpc('get_comments_optimized', {
          p_post_id: postId,
          p_user_id: userId || null,
          p_limit: limit,
          p_offset: offset
        });

      if (error) {
        // Fallback to old method if RPC fails
        return this.getPostComments(postId, limit, offset, userId);
      }

      if (!data || !data.parents) {
        return [];
      }

      // Process the optimized response
      const { parents, replies } = data;
      
      // Create a map of replies grouped by parent_id
      const repliesMap = new Map<number, CommentWithUser[]>();
      replies.forEach((reply: CommentWithUser) => {
        if (reply.parent_id && !repliesMap.has(reply.parent_id)) {
          repliesMap.set(reply.parent_id, []);
        }
        if (reply.parent_id) {
          repliesMap.get(reply.parent_id)!.push(reply);
        }
      });

      // Combine parents with their replies
      const result = parents.map((parent: CommentWithUser) => ({
        ...parent,
        replies: repliesMap.get(parent.id) || [],
        replies_count: repliesMap.get(parent.id)?.length || 0
      }));

      // Cache the results (only for initial load)
      if (offset === 0) {
        await commentsCache.set(postId, result);
      }

      return result;
    } catch (error) {
      // Fallback to old method
      return this.getPostComments(postId, limit, offset, userId);
    }
  },

  // Get comments for a post - LEGACY VERSION (kept for backward compatibility)
  async getPostComments(
    postId: number, 
    limit: number = 20, 
    offset: number = 0,
    userId?: string
  ): Promise<CommentWithUser[]> {
    try {
      // Get parent comments first
      const { data, error } = await nativeSupabase
        .from('comments')
        .select(`
          *,
          user:users!user_id(
            id,
            username,
            full_name,
            avatar_url,
            is_pro
          )
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        // Error fetching comments
        return [];
      }

      if (!data || data.length === 0) return [];

      // Get comment IDs for fetching likes and replies
      const commentIds = data.map(comment => comment.id);

      // Fetch user's likes if userId provided
      let likedCommentIds: string[] = [];
      if (userId) {
        const { data: likes } = await nativeSupabase
          .from('likes')
          .select('comment_id')
          .eq('user_id', userId)
          .in('comment_id', commentIds)
          .is('post_id', null);
        
        likedCommentIds = likes?.map(like => like.comment_id) || [];
      }

      // Fetch replies for all parent comments
      const { data: replies } = await nativeSupabase
        .from('comments')
        .select(`
          *,
          user:users!user_id(
            id,
            username,
            full_name,
            avatar_url,
            is_pro
          )
        `)
        .in('parent_id', commentIds)
        .order('created_at', { ascending: true });

      // Get reply likes if user is authenticated
      let likedReplyIds: string[] = [];
      if (userId && replies && replies.length > 0) {
        const replyIds = replies.map(reply => reply.id);
        const { data: replyLikes } = await nativeSupabase
          .from('likes')
          .select('comment_id')
          .eq('user_id', userId)
          .in('comment_id', replyIds)
          .is('post_id', null);
        
        likedReplyIds = replyLikes?.map(like => like.comment_id) || [];
      }

      // Map replies to parent comments
      const repliesMap = new Map<string, CommentWithUser[]>();
      replies?.forEach(reply => {
        const replyWithUser: CommentWithUser = {
          ...reply,
          is_liked: likedReplyIds.includes(reply.id)
        };
        
        if (!repliesMap.has(reply.parent_id)) {
          repliesMap.set(reply.parent_id, []);
        }
        repliesMap.get(reply.parent_id)!.push(replyWithUser);
      });

      // Build final comment structure
      return data.map(comment => ({
        ...comment,
        is_liked: likedCommentIds.includes(comment.id),
        replies: repliesMap.get(comment.id) || [],
        replies_count: repliesMap.get(comment.id)?.length || 0
      }));
    } catch (error) {
      // Failed to fetch comments
      return [];
    }
  },

  // Get single comment with replies
  async getComment(commentId: number, userId?: string): Promise<CommentWithUser | null> {
    try {
      const { data, error } = await nativeSupabase
        .from('comments')
        .select(`
          *,
          user:users!user_id(
            id,
            username,
            full_name,
            avatar_url,
            is_pro
          )
        `)
        .eq('id', commentId)
        .single();

      if (error || !data) return null;

      // Check if user liked this comment
      let isLiked = false;
      if (userId) {
        const { data: likeData } = await nativeSupabase
          .from('likes')
          .select('id')
          .eq('comment_id', commentId)
          .eq('user_id', userId)
          .is('post_id', null)
          .single();
        
        isLiked = !!likeData;
      }

      // Fetch replies if it's a parent comment
      let replies: CommentWithUser[] = [];
      if (!data.parent_id) {
        const { data: replyData } = await nativeSupabase
          .from('comments')
          .select(`
            *,
            user:users!user_id(
              id,
              username,
              full_name,
              avatar_url,
              is_pro
            )
          `)
          .eq('parent_id', commentId)
            .order('created_at', { ascending: true });

        replies = replyData || [];
      }

      return {
        ...data,
        is_liked: isLiked,
        replies,
        replies_count: replies.length
      };
    } catch (error) {
      // Failed to fetch comment
      return null;
    }
  },

  // Create comment
  async createComment(
    userId: string, 
    commentData: CreateCommentData
  ): Promise<CommentWithUser | null> {
    try {
      // Validate comment content
      const validation = validateCommentContent(commentData.content);
      if (!validation.isValid) {
        throw new Error(validation.message || 'Invalid comment content');
      }

      const { data, error } = await nativeSupabase
        .from('comments')
        .insert({
          user_id: userId,
          content: commentData.content,
          post_id: commentData.post_id,
          parent_id: commentData.parent_id,
          likes_count: 0,
          edited: false,
          is_pinned: false
        })
        .select(`
          *,
          user:users!user_id(
            id,
            username,
            full_name,
            avatar_url,
            is_pro
          )
        `)
        .single();

      if (error) {
        // Error creating comment
        return null;
      }

      // Database trigger automatically updates post_stats.comments_count
      
      // Invalidate cache for this post
      await commentsCache.invalidate(Number(commentData.post_id));

      return {
        ...data,
        is_liked: false,
        replies: [],
        replies_count: 0
      };
    } catch (error) {
      // Failed to create comment
      return null;
    }
  },

  // Update comment
  async updateComment(
    commentId: number,
    userId: string,
    updates: UpdateCommentData
  ): Promise<CommentWithUser | null> {
    try {
      // Validate updated content if provided
      if (updates.content) {
        const validation = validateCommentContent(updates.content);
        if (!validation.isValid) {
          throw new Error(validation.message || 'Invalid comment content');
        }
      }

      // Check if user is admin
      const userIsAdmin = await isUserAdmin(userId);
      
      let query = nativeSupabase
        .from('comments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          edited: updates.content ? true : updates.edited
        })
        .eq('id', commentId);

      // If not admin, add user_id restriction
      if (!userIsAdmin) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query
        .select(`
          *,
          user:users!user_id(
            id,
            username,
            full_name,
            avatar_url,
            is_pro
          )
        `)
        .single();

      if (error) {
        // Error updating comment
        return null;
      }

      return {
        ...data,
        is_liked: false,
        replies: [],
        replies_count: 0
      };
    } catch (error) {
      // Failed to update comment
      return null;
    }
  },

  // Hard delete comment (cascade will delete replies automatically)
  async deleteComment(commentId: number, userId: string): Promise<boolean> {
    try {
      // First get comment to know which post to update counter
      const { data: commentData } = await nativeSupabase
        .from('comments')
        .select('post_id')
        .eq('id', commentId)
        .single();

      // Check if user is admin
      const userIsAdmin = await isUserAdmin(userId);
      
      let query = nativeSupabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      // If not admin, add user_id restriction
      if (!userIsAdmin) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (error) {
        // Error deleting comment
        return false;
      }

      // Database trigger automatically updates post_stats.comments_count
      
      // Invalidate cache for this post
      if (commentData?.post_id) {
        await commentsCache.invalidate(Number(commentData.post_id));
      }

      return true;
    } catch (error) {
      // Failed to delete comment
      return false;
    }
  },


  // Pin/Unpin comment (post owner only)
  async togglePinComment(
    commentId: number, 
    postOwnerId: string,
    isPinned: boolean
  ): Promise<boolean> {
    try {
      // First verify the user owns the post
      const { data: comment } = await nativeSupabase
        .from('comments')
        .select('post_id')
        .eq('id', commentId)
        .single();

      if (!comment) return false;

      const { data: post } = await nativeSupabase
        .from('posts')
        .select('user_id')
        .eq('id', comment.post_id)
        .eq('user_id', postOwnerId)
        .single();

      if (!post) return false;

      // Update pin status
      const { error } = await nativeSupabase
        .from('comments')
        .update({ 
          is_pinned: isPinned,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      return !error;
    } catch (error) {
      // Failed to toggle pin comment
      return false;
    }
  },

  // Check if user is admin (exposed for UI components)
  async checkUserRole(userId: string): Promise<{ isAdmin: boolean; role: string | null }> {
    try {
      const { data, error } = await nativeSupabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        return { isAdmin: false, role: null };
      }

      return { 
        isAdmin: data.role === 'super_admin', 
        role: data.role 
      };
    } catch (error) {
      // Error checking user role
      return { isAdmin: false, role: null };
    }
  }
};