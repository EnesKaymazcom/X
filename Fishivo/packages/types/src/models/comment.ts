export interface Comment {
  id: number;
  content: string;
  user_id: string;
  post_id: number;
  parent_id?: number;
  status: 'active' | 'deleted' | 'hidden';
  likes_count: number;
  edited: boolean;
  edited_at?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    is_pro?: boolean;
  };
  is_liked?: boolean;
  replies?: CommentWithUser[];
  replies_count?: number;
}

export interface CreateCommentData {
  content: string;
  post_id: number;
  parent_id?: number;
}

export interface UpdateCommentData {
  content?: string;
  is_pinned?: boolean;
  edited?: boolean;
}