import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native'
import { FullUser, UserEquipment as UserEquipmentType } from '@fishivo/types'
const nativeSupabase = getNativeSupabaseClient()

// Image URLs type for JSONB fields
export interface ImageUrls {
  thumbnail?: string
  small?: string
  medium?: string
  large?: string
  original?: string
}

// Native-specific user profile with computed fields from user_stats
export interface NativeUserProfile extends Omit<FullUser, 'avatar_url' | 'cover_image_url'> {
  total_catches: number
  total_spots: number
  catches_count?: number // Alternative field name from user_stats
  spots_count?: number // Alternative field name from user_stats
  followers_count: number
  following_count: number
  avatar_url: string | ImageUrls | null
  cover_image_url: string | ImageUrls | null
}

export interface UserStats {
  totalCatches: number
  totalSpots: number
  totalFollowers: number
  totalFollowing: number
  totalLikes: number
  avgCatchWeight?: number
}

export const userServiceNative = {
  // Get user profile with stats from user_stats table
  async getUserProfile(userId: string, currentUserId?: string): Promise<NativeUserProfile | null> {
    
    // Get user data with user_stats joined
    const { data: userData, error: userError } = await nativeSupabase
      .from('users')
      .select(`
        *,
        user_stats!user_id (
          followers_count,
          following_count,
          posts_count,
          catches_count,
          spots_count
        )
      `)
      .eq('id', userId)
      .single()
    
    if (userError || !userData) {
      return null
    }
    
    // Extract stats data (handle both array and object response)
    const stats = Array.isArray(userData.user_stats) 
      ? userData.user_stats[0] 
      : userData.user_stats
    
    return {
      ...userData,
      total_catches: stats?.catches_count || 0,
      total_spots: stats?.spots_count || 0,
      catches_count: stats?.catches_count || 0,
      spots_count: stats?.spots_count || 0,
      followers_count: stats?.followers_count || 0,
      following_count: stats?.following_count || 0,
    } as NativeUserProfile
  },


  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<NativeUserProfile>): Promise<NativeUserProfile | null> {
    const { data, error } = await nativeSupabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      throw new Error(error.message || 'Profil güncellenemedi')
    }
    
    return data
  },

  // Update profile image
  async updateProfileImage(userId: string, imageUrl: string | Record<string, string>): Promise<boolean> {
    // Handle both string URL and JSONB format
    let avatarData: any = imageUrl;
    
    // If it's a string URL, convert to JSONB format with medium size
    if (typeof imageUrl === 'string') {
      avatarData = {
        medium: imageUrl,
        // We only have one size from mobile upload, so use it for all
        large: imageUrl,
        small: imageUrl,
        thumbnail: imageUrl
      };
    }
    
    const { error } = await nativeSupabase
      .from('users')
      .update({
        avatar_url: avatarData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      return false
    }
    
    return true
  },


  // Search users
  async searchUsers(query: string, limit: number = 20, currentUserId?: string): Promise<NativeUserProfile[]> {
    // Input validation and sanitization
    const sanitizedQuery = query
      .replace(/[%_\\]/g, '\\$&') // Escape SQL wildcards
      .trim()
    
    // Minimum query length check
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return []
    }
    
    // Maximum query length check
    if (sanitizedQuery.length > 50) {
      return []
    }
    
    // Enforce maximum limit
    const safeLimit = Math.min(limit, 50)
    
    // Use RPC function with block filter if user is authenticated
    if (currentUserId) {
      const { data: rpcResult, error: rpcError } = await nativeSupabase
        .rpc('search_users_with_block_filter', {
          p_user_id: currentUserId,
          p_query: sanitizedQuery,
          p_limit: safeLimit
        })
      
      if (!rpcError && rpcResult) {
        return rpcResult.map((user: any) => ({
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          bio: user.bio,
          location: user.location,
          country_code: user.country_code,
          is_pro: user.is_pro || false,
          is_verified: user.is_verified || false,
          created_at: user.created_at,
          updated_at: user.updated_at,
          followers_count: user.followers_count || 0,
          following_count: user.following_count || 0,
          catches_count: user.catches_count || 0,
          spots_count: user.spots_count || 0
        }))
      }
    }
    
    // Fallback to regular query without block filtering
    const { data, error } = await nativeSupabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${sanitizedQuery}%,full_name.ilike.%${sanitizedQuery}%`)
      .limit(safeLimit)
    
    if (error) {
      return []
    }
    
    return data || []
  },


  // Get user equipment
  async getUserEquipment(userId: string): Promise<UserEquipmentNative[]> {
    try {
      const { data, error } = await nativeSupabase
        .from('user_equipment')
        .select(`
          *,
          equipment:equipment_id(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error || !data) {
        return []
      }

      return data.map(item => {
        const equipment = item.equipment as any
        return {
          id: item.id.toString(),
          user_id: item.user_id,
          name: equipment?.name || 'Unknown Equipment',
          type: equipment?.category || 'other',
          brand: equipment?.brand || '',
          model: equipment?.model || '',
          description: equipment?.description || '',
          image_url: equipment?.image_url,
          is_favorite: item.is_favorite || false,
          created_at: item.created_at,
          category: equipment?.category || 'other',
          icon: getCategoryIcon(equipment?.category || 'other'),
          condition: item.condition || 'good'
        }
      })
    } catch (error) {
      return []
    }
  }
}

// Helper function to get icon based on category
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'rod': 'fishing-rod',
    'reel': 'circle',
    'lure': 'fish',
    'bait': 'worm',
    'hook': 'hook',
    'line': 'wind',
    'tackle': 'tool',
    'clothing': 'shirt',
    'accessories': 'package',
    'other': 'box'
  }
  return iconMap[category.toLowerCase()] || 'box'
}

// User equipment interface for native app
export interface UserEquipmentNative extends UserEquipmentType {
  category: string
  icon: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
}