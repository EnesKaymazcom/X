export interface Follow {
  id: number
  follower_id: string
  following_id: string
  created_at: string
}

export interface FollowResponse {
  success: boolean
  message?: string
  data?: Follow
}

export interface FollowStats {
  followers_count: number
  following_count: number
  is_following?: boolean
}