// Web-specific posts implementation - uses API routes for client-side calls

export interface Post {
  id: number;
  title: string;
  content: string;
  images?: string[];
  image_url?: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  status: 'active' | 'hidden' | 'deleted' | 'pending_review';
  report_count: number;
  likes_count: number;
  comments_count: number;
  location?: string;
  fish_species?: string;
  fish_weight?: number;
  fish_length?: number;
}

export interface PaginatedPosts {
  items: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AdminPostFilters {
  status?: string;
  reported?: boolean;
  search?: string;
}

export const postsServiceWeb = {
  async getAdminPosts(
    page: number = 1,
    limit: number = 20,
    filters: AdminPostFilters = {}
  ): Promise<PaginatedPosts> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.status && filters.status !== 'all' && { status: filters.status }),
      ...(filters.reported && { reported: 'true' }),
      ...(filters.search && { search: filters.search }),
    });

    const response = await fetch(`/api/admin/posts?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch admin posts');
    }

    return response.json();
  },

  async deleteAdminPost(postId: number, reason?: string): Promise<void> {
    const response = await fetch(`/api/admin/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete post');
    }
  },

  async updateAdminPost(postId: number, updates: Partial<Post>): Promise<void> {
    const response = await fetch(`/api/admin/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update post');
    }
  },

  async hidePost(postId: number): Promise<void> {
    return this.updateAdminPost(postId, { status: 'hidden' });
  },

  async approvePost(postId: number): Promise<void> {
    return this.updateAdminPost(postId, { status: 'active' });
  },
};