/**
 * Professional User Counter System
 * Facebook/Instagram style denormalized user counters
 * High-performance async counter updates for followers/following
 */

import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native'

const nativeSupabase = getNativeSupabaseClient()

export interface UserCounters {
  user_id: string
  followers_count: number
  following_count: number
  posts_count: number
  catches_count: number
  spots_count: number
  referral_count: number
}

export const userCountersService = {
  /**
   * Increment follower count for a user
   * Professional approach: Update denormalized counter immediately
   */
  async incrementFollowerCount(userId: string, retries: number = 3): Promise<boolean> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // First get current count
        const { data: currentStats, error: fetchError } = await nativeSupabase
          .from('user_stats')
          .select('followers_count')
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          // If user_stats doesn't exist, create it
          if (fetchError.code === 'PGRST116') {
            const { error: insertError } = await nativeSupabase
              .from('user_stats')
              .insert({
                user_id: userId,
                followers_count: 1,
                following_count: 0,
                posts_count: 0,
                catches_count: 0,
                spots_count: 0,
                referral_count: 0
              })
            
            return !insertError
          }
          return false
        }

        // Then update with incremented value
        const { error: updateError } = await nativeSupabase
          .from('user_stats')
          .update({ 
            followers_count: (currentStats.followers_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (!updateError) {
          return true
        }

        // Retry on temporary errors
        if (updateError.code === '429' || updateError.code === 'PGRST301') {
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
            continue
          }
        }

        return false
      } catch (err) {
        if (attempt === retries - 1) {
          return false
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    return false
  },

  /**
   * Decrement follower count for a user
   */
  async decrementFollowerCount(userId: string, retries: number = 3): Promise<boolean> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // First get current count
        const { data: currentStats, error: fetchError } = await nativeSupabase
          .from('user_stats')
          .select('followers_count')
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return false
        }

        // Then update with decremented value (minimum 0)
        const { error: updateError } = await nativeSupabase
          .from('user_stats')
          .update({ 
            followers_count: Math.max((currentStats.followers_count || 0) - 1, 0),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (!updateError) {
          return true
        }

        // Retry logic
        if (updateError.code === '429' || updateError.code === 'PGRST301') {
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
            continue
          }
        }

        return false
      } catch (err) {
        if (attempt === retries - 1) {
          return false
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    return false
  },

  /**
   * Increment following count for a user
   */
  async incrementFollowingCount(userId: string, retries: number = 3): Promise<boolean> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // First get current count
        const { data: currentStats, error: fetchError } = await nativeSupabase
          .from('user_stats')
          .select('following_count')
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          // If user_stats doesn't exist, create it
          if (fetchError.code === 'PGRST116') {
            const { error: insertError } = await nativeSupabase
              .from('user_stats')
              .insert({
                user_id: userId,
                followers_count: 0,
                following_count: 1,
                posts_count: 0,
                catches_count: 0,
                spots_count: 0,
                referral_count: 0
              })
            
            return !insertError
          }
          return false
        }

        // Then update with incremented value
        const { error: updateError } = await nativeSupabase
          .from('user_stats')
          .update({ 
            following_count: (currentStats.following_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        return !updateError
      } catch (err) {
        if (attempt === retries - 1) {
          return false
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    return false
  },

  /**
   * Decrement following count for a user
   */
  async decrementFollowingCount(userId: string, retries: number = 3): Promise<boolean> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // First get current count
        const { data: currentStats, error: fetchError } = await nativeSupabase
          .from('user_stats')
          .select('following_count')
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          return false
        }

        // Then update with decremented value (minimum 0)
        const { error: updateError } = await nativeSupabase
          .from('user_stats')
          .update({ 
            following_count: Math.max((currentStats.following_count || 0) - 1, 0),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        return !updateError
      } catch (err) {
        if (attempt === retries - 1) {
          return false
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    return false
  },

  /**
   * Get user counters efficiently
   */
  async getUserCounters(userIds: string[]): Promise<Record<string, UserCounters>> {
    try {
      const { data, error } = await nativeSupabase
        .from('user_stats')
        .select('*')
        .in('user_id', userIds)

      if (error) {
        return {}
      }

      // Convert array to object for O(1) lookups
      return data.reduce((acc, counter) => {
        acc[counter.user_id] = counter
        return acc
      }, {} as Record<string, UserCounters>)
    } catch (error) {
      return {}
    }
  },

  /**
   * Batch update user counters - for data migration/fixes
   */
  async batchUpdateCounters(updates: Array<{userId: string, followers?: number, following?: number}>): Promise<boolean> {
    try {
      for (const update of updates) {
        const updateData: any = {
          updated_at: new Date().toISOString()
        }

        if (update.followers !== undefined) {
          updateData.followers_count = update.followers
        }

        if (update.following !== undefined) {
          updateData.following_count = update.following
        }

        await nativeSupabase
          .from('user_stats')
          .update(updateData)
          .eq('user_id', update.userId)
      }
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * Sync user stats from actual data - data integrity check
   */
  async syncUserStats(userId: string): Promise<boolean> {
    try {
      // Count actual follows
      const [followersResult, followingResult, postsResult] = await Promise.allSettled([
        nativeSupabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        nativeSupabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
        nativeSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      ])

      const actualFollowers = followersResult.status === 'fulfilled' ? (followersResult.value.count || 0) : 0
      const actualFollowing = followingResult.status === 'fulfilled' ? (followingResult.value.count || 0) : 0
      const actualPosts = postsResult.status === 'fulfilled' ? (postsResult.value.count || 0) : 0

      // Update user_stats with actual counts
      const { error } = await nativeSupabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          followers_count: actualFollowers,
          following_count: actualFollowing,
          posts_count: actualPosts,
          catches_count: 0, // TODO: Calculate actual catches
          spots_count: 0,   // TODO: Calculate actual spots
          referral_count: 0, // TODO: Calculate actual referrals
          updated_at: new Date().toISOString()
        })

      return !error
    } catch (error) {
      return false
    }
  }
}