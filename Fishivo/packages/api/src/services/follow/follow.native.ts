import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native'

const supabase = getNativeSupabaseClient()

// Event deduplication
interface ProcessedEvent {
  id: string
  timestamp: number
}

const processedEvents = new Map<string, ProcessedEvent>()
const EVENT_DEDUP_WINDOW = 2000 // 2 seconds
export interface FollowUser {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  followers_count: number
  following_count: number
  is_following_back?: boolean
  follows_back?: boolean
  followed_at?: string
  following_since?: string
}

export interface FollowStatus {
  user_id: string
  is_following: boolean
  is_followed_by: boolean
}

class FollowService {
  // Follow user
  async followUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('follow_user', {
        p_follower_id: followerId,
        p_following_id: followingId
      })

      if (error) throw error
      
      return data
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Unfollow user
  async unfollowUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('unfollow_user', {
        p_follower_id: followerId,
        p_following_id: followingId
      })

      if (error) throw error
      
      return data
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Check if following (store-based)
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    // This method is now just a thin wrapper for direct DB check
    // Store handles caching separately
    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single()

      return !!data
    } catch {
      return false
    }
  }

  // Get follow status batch
  async getFollowStatusBatch(followerId: string, userIds: string[]): Promise<FollowStatus[]> {
    try {
      const { data, error } = await supabase.rpc('get_follow_status_batch', {
        p_follower_id: followerId,
        p_user_ids: userIds
      })

      if (error) throw error
      
      return data?.data || []
    } catch {
      return userIds.map(id => ({ user_id: id, is_following: false, is_followed_by: false }))
    }
  }

  // Get followers with pagination (with block filter)
  async getFollowers(userId: string, limit = 20, offset = 0, requestingUserId?: string): Promise<{ data: FollowUser[], total: number }> {
    try {
      const { data, error } = await supabase.rpc('get_followers', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
        p_requesting_user_id: requestingUserId || null
      })

      if (error) throw error
      
      // RPC returns a single object with success, data, and total fields
      if (data && data.success) {
        return {
          data: data.data || [],
          total: data.total || 0
        }
      }
      
      return { data: [], total: 0 }
    } catch (error) {
      return { data: [], total: 0 }
    }
  }

  // Get following with pagination (with block filter)
  async getFollowing(userId: string, limit = 20, offset = 0, requestingUserId?: string): Promise<{ data: FollowUser[], total: number }> {
    try {
      const { data, error } = await supabase.rpc('get_following', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
        p_requesting_user_id: requestingUserId || null
      })

      if (error) throw error
      
      // RPC returns a single object with success, data, and total fields
      if (data && data.success) {
        return {
          data: data.data || [],
          total: data.total || 0
        }
      }
      
      return { data: [], total: 0 }
    } catch (error) {
      return { data: [], total: 0 }
    }
  }
  
  // Event deduplication helper
  isDuplicateEvent(eventId: string): boolean {
    const now = Date.now()
    
    // Clean old events
    for (const [id, event] of processedEvents.entries()) {
      if (now - event.timestamp > EVENT_DEDUP_WINDOW) {
        processedEvents.delete(id)
      }
    }
    
    // Check if this event was already processed
    if (processedEvents.has(eventId)) {
      return true
    }
    
    // Mark as processed
    processedEvents.set(eventId, { id: eventId, timestamp: now })
    return false
  }

  // Subscribe to follow events (real-time)
  subscribeToFollowEvents(userId: string, callback: (event: any) => void) {
    const channel = supabase
      .channel(`follow_events:${userId}`)
      // Kullanıcının takip ettiği kişiler değiştiğinde
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'follows',
          filter: `follower_id=eq.${userId}`
        }, 
        (payload) => {
          // Create unique event ID
          const eventId = `${payload.eventType}_${(payload.new as any)?.id || (payload.old as any)?.id}_${Date.now()}`
          
          // Check for duplicates
          if (!this.isDuplicateEvent(eventId)) {
            callback({ ...payload, type: 'following', eventId })
          }
        }
      )
      // Kullanıcıyı takip edenler değiştiğinde
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${userId}`
        },
        (payload) => {
          // Create unique event ID
          const eventId = `${payload.eventType}_${(payload.new as any)?.id || (payload.old as any)?.id}_${Date.now()}`
          
          // Check for duplicates
          if (!this.isDuplicateEvent(eventId)) {
            callback({ ...payload, type: 'followers', eventId })
          }
        }
      )
      .subscribe()
      
    return channel
  }
  
  // Unsubscribe from follow events
  unsubscribeFromFollowEvents(channel: any) {
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
}

export const followService = new FollowService()