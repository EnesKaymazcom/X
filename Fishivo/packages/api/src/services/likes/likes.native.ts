import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';

const supabase = getNativeSupabaseClient();

export interface Liker {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  is_pro?: boolean;
  is_following?: boolean;
}

export interface GetLikersResponse {
  items: Liker[];
  total: number;
  hasMore: boolean;
}

export interface LikeState {
  isLiked: boolean;
  likesCount: number;
  lastUpdated: number;
}

class LikesServiceNative {
  async getPostLikers(
    postId: number,
    page: number = 1,
    limit: number = 24,
    forceRefresh: boolean = true // ALWAYS FRESH
  ): Promise<GetLikersResponse> {
    // DIRECT DATABASE CALL - NO CACHE
    try {
      const offset = (page - 1) * limit;
      
      // Use RPC function instead of direct query
      const { data, error } = await supabase.rpc('get_post_likers', {
        p_post_id: postId,
        p_offset: offset,
        p_limit: limit
      });

      if (error) throw error;

      // RPC returns data directly as JSON object
      const result: GetLikersResponse = data || { items: [], total: 0, hasMore: false };
      
      return result;
    } catch (error) {
      console.error('Failed to get post likers:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  async togglePostLike(postId: number): Promise<{success: boolean, isLiked: boolean, likesCount?: number}> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser?.user?.id) return { success: false, isLiked: false };

      // Use RPC function for atomic operation
      const { data, error } = await supabase.rpc('toggle_post_like', {
        p_post_id: postId,
        p_user_id: currentUser.user.id
      });

      if (error) throw error;

      const isLiked: boolean = data?.is_liked === true;
      const likesCount: number = data?.likes_count || 0; // Get count from RPC response
      const success = data?.success === true || data !== null; // RPC success if data is not null

      // NO CACHE OPERATIONS - DIRECT DATABASE ONLY

      return { success, isLiked, likesCount };
    } catch (error) {
      console.error('Failed to toggle post like:', error);
      return { success: false, isLiked: false };
    }
  }

  // Backward compatibility methods
  async likePost(postId: number): Promise<boolean> {
    const result = await this.togglePostLike(postId);
    return result.success && result.isLiked;
  }

  async unlikePost(postId: number): Promise<boolean> {
    const result = await this.togglePostLike(postId);
    return result.success && !result.isLiked;
  }

  async togglePostLikeWithCount(postId: number): Promise<{success: boolean, isLiked: boolean, likesCount: number}> {
    const result = await this.togglePostLike(postId);
    return {
      success: result.success,
      isLiked: result.isLiked,
      likesCount: result.likesCount || 0
    };
  }

  async checkUserLiked(postId: number, forceRefresh: boolean = true): Promise<boolean> {
    // DIRECT DATABASE CALL - NO CACHE
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser?.user?.id) return false;

      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUser.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Failed to check user liked:', error);
      return false;
    }
  }


  async getCommentLikers(
    commentId: number,
    page: number = 1,
    limit: number = 24,
    forceRefresh: boolean = true // ALWAYS FRESH
  ): Promise<GetLikersResponse> {
    // DIRECT DATABASE CALL - NO CACHE
    try {
      const offset = (page - 1) * limit;
      
      // Use RPC function instead of direct query (same pattern as post likers)
      const { data, error } = await supabase.rpc('get_comment_likers', {
        p_comment_id: commentId,
        p_offset: offset,
        p_limit: limit
      });

      if (error) throw error;

      // RPC returns data directly as JSON object
      const result: GetLikersResponse = data || { items: [], total: 0, hasMore: false };
      
      return result;
    } catch (error) {
      console.error('Failed to get comment likers:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  async toggleCommentLike(commentId: number): Promise<{success: boolean, isLiked: boolean, likesCount?: number}> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser?.user?.id) {
        return { success: false, isLiked: false };
      }

      // Use RPC function for atomic operation
      const { data, error } = await supabase.rpc('toggle_comment_like', {
        p_comment_id: commentId,
        p_user_id: currentUser.user.id
      });

      if (error) throw error;

      const isLiked: boolean = data?.is_liked === true;
      const likesCount: number = data?.likes_count || 0; // Get count from RPC response
      const success = data?.success === true || data !== null; // RPC success if data is not null

      // NO CACHE OPERATIONS - DIRECT DATABASE ONLY

      return { success, isLiked, likesCount };
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
      return { success: false, isLiked: false };
    }
  }

  // Backward compatibility methods
  async likeComment(commentId: number): Promise<boolean> {
    const result = await this.toggleCommentLike(commentId);
    return result.success && result.isLiked;
  }

  async unlikeComment(commentId: number): Promise<boolean> {
    const result = await this.toggleCommentLike(commentId);
    return result.success && !result.isLiked;
  }

  async checkCommentLiked(commentId: number): Promise<boolean> {
    // DIRECT DATABASE CALL - NO CACHE
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser?.user?.id) return false;

      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', currentUser.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Failed to check comment liked:', error);
      return false;
    }
  }

}

export const likesServiceNative = new LikesServiceNative();