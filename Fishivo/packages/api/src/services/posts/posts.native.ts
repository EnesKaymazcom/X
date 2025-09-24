import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native'
import { Post } from '@fishivo/types'
const nativeSupabase = getNativeSupabaseClient()

// Database response types - exact match with Supabase schema
interface DatabaseUser {
  id: string
  username: string
  full_name?: string | null
  avatar_url?: string | null
  is_pro?: boolean
  country_code?: string | null
  location?: string | null
}

interface DatabasePostStats {
  post_id: number
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  created_at: string
  updated_at: string
}

interface DatabaseFishingTechnique {
  id: number
  name: string
  name_en: string | null
  icon: string | null
  difficulty: string | null
}

export interface DatabasePost {
  id: number
  user_id: string
  title: string
  slug: string
  content: string
  images?: string[] | null
  location?: {
    name?: string
    latitude?: number
    longitude?: number
    country_code?: string | null
    coordinates?: [number, number] | { lng: number; lat: number }
  } | null
  catch_details?: {
    species?: string
    species_id?: string
    species_image?: string | null
    weight?: number
    length?: number
    technique?: string
    weather?: string | {
      temperature?: number
      description?: string
      humidity?: number
      pressure?: number
      wind_speed?: number
      wind_direction?: string
    }
    released?: boolean
    fishing_technique_id?: number | null
  } | null
  status?: string | null
  is_secret?: boolean | null
  private_note?: string | null
  fishing_technique_id?: number | null
  created_at: string
  updated_at?: string | null
  user?: DatabaseUser
  post_stats?: DatabasePostStats | DatabasePostStats[]
  fishing_technique?: DatabaseFishingTechnique
}

interface RPCPostResult {
  id: number
  user_id: string
  title?: string | null
  content: string
  image_url?: string | null
  images?: string[] | null
  location?: {
    name?: string
    latitude?: number
    longitude?: number
    country_code?: string | null
    coordinates?: [number, number]
  } | null
  catch_details?: {
    species?: string
    species_id?: string
    weight?: number
    length?: number
    technique?: string
  } | null
  created_at: string
  updated_at?: string | null
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  is_liked?: boolean
  has_user_commented?: boolean
  username: string
  full_name: string
  user_full_name?: string
  avatar_url?: string | null
  user_avatar_url?: string | null
  is_pro?: boolean
  country_code?: string | null
  location_name?: string | null
  // Additional fields from RPC
  species?: string
  species_id?: string
  species_name?: string
  species_image?: string | null
  weight?: number
  length?: number
  technique?: string
  fishing_technique_id?: number | null
  fishing_technique?: DatabaseFishingTechnique | null
  released?: boolean
  weather?: string
}

interface FishSpeciesData {
  id: string
  image_url?: string | null
}

interface LikeData {
  post_id: number
  id?: number
  user_id?: string
}

interface CommentData {
  post_id: number
  id?: number
  user_id?: string
}
export interface CreatePostData {
  type: 'catch' | 'spot'
  content?: string
  images?: string[]
  location?: {
    latitude: number
    longitude: number
    name?: string
    country_code?: string | null
  }
  // Privacy
  is_secret?: boolean
  private_note?: string
  // Catch specific
  species?: string
  weight?: number
  length?: number
  technique?: string
  gear?: string[]
  weather?: string
  // Spot specific
  spotName?: string
  waterType?: 'freshwater' | 'saltwater'
  description?: string
  // Nested catch details (from AddCatchScreen)
  catch_details?: {
    fishing_technique_id?: number | null
    species?: string
    species_id?: string
    weight?: number
    length?: number
    technique?: string
    weather_conditions?: string
    time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night'
    equipment_used?: string[]
    gear?: string[]
    bait_used?: string
    released?: boolean
  }
}

export interface PostWithUser extends Post {
  user: {
    username: string
    full_name: string
    avatar_url?: string | null
    is_pro?: boolean
    country_code?: string | null
    location?: string | null
  }
  type?: 'catch' | 'spot' | 'post'
  is_liked?: boolean
  has_user_commented?: boolean
  views_count?: number
  private_note?: string
  fishing_technique_id?: number | null
}

export interface MapBounds {
  ne: [number, number] // [longitude, latitude] - northeast
  sw: [number, number] // [longitude, latitude] - southwest
}

export interface MapCatchData {
  id: number
  coordinates: [number, number] // [lng, lat]
  user: {
    id: string
    full_name: string
    avatar_url?: string
    is_pro?: boolean
  }
  species: string
  species_id?: string
  species_image?: string
  weight?: number
  length?: number
  created_at: string
  image_url?: string
  images?: string[]
  // Delta sync fields
  sync_action?: 'new' | 'updated' | 'deleted' | 'existing'
  updated_at?: string
}

export interface MapClusterData {
  id: string
  coordinate: [number, number] // [lng, lat]
  count: number
  catches: MapCatchData[]
}

export const postsServiceNative = {
  // Professional Social Media Feed (Facebook/Instagram style)
  async getPosts(limit: number = 20, offset: number = 0, userId?: string, _forceRefresh: boolean = true): Promise<PostWithUser[]> {
    try {
      // Use RPC function with block filter
      const { data: rpcResult, error: rpcError } = await nativeSupabase
        .rpc('get_posts_with_block_filter', {
          p_user_id: userId || null,
          p_limit: limit,
          p_offset: offset
        })

      // Process RPC result if successful
      if (!rpcError && rpcResult) {
        // RPC returns formatted data, transform to PostWithUser format
        return rpcResult.map((post: RPCPostResult) => ({
          id: post.id,
          user_id: post.user_id,
          title: post.title || '',
          description: post.content,
          image_url: post.image_url,
          type: post.catch_details ? 'catch' : 'post',
          content: post.content,
          images: post.images || [],
          location: post.location,
          metadata: post.catch_details,
          created_at: post.created_at,
          updated_at: post.updated_at,
          catch_details: {
            species: post.species,
            species_id: post.species_id,
            species_name: post.species_name,
            species_image: post.species_image,
            weight: post.weight,
            length: post.length,
            technique: post.technique,
            fishing_technique_id: post.fishing_technique_id,
            fishing_technique: post.fishing_technique,
            released: post.released,
            weather: post.weather
          },
          spot_details: null,
          user: {
            id: post.user_id,
            username: post.username,
            full_name: post.full_name,
            avatar_url: post.avatar_url,
            is_pro: post.is_pro,
            country_code: post.country_code,
            location: post.location_name
          },
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          views_count: post.views_count || 0,
          is_liked: post.is_liked || false,
          has_user_commented: post.has_user_commented || false
        }))
      }

      // Fallback to regular query if RPC fails
      let query = nativeSupabase
        .from('posts')
        .select(`
          *,
          user:users!user_id(
            id,
            username,
            full_name,
            avatar_url,
            is_pro,
            country_code,
            location
          ),
          post_stats!post_id(
            likes_count,
            comments_count,
            shares_count,
            views_count
          ),
          fishing_technique:fishing_techniques!fishing_technique_id(
            id,
            name,
            name_en,
            icon,
            difficulty
          )
        `)
        .or('status.neq.deleted,status.is.null')
        .or(`is_secret.eq.false${userId ? `,and(is_secret.eq.true,user_id.eq.${userId})` : ''}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Add block filter if userId is provided
      if (userId && userId.trim() !== '') {
        // Get blocked user IDs for bidirectional blocking
        const { data: blockedRelations } = await nativeSupabase
          .from('blocked_users')
          .select('blocker_id, blocked_id')
          .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`)

        if (blockedRelations && blockedRelations.length > 0) {
          // Create list of users to exclude (bidirectional)
          const excludedUserIds = new Set<string>()
          blockedRelations.forEach(relation => {
            if (relation.blocker_id === userId) {
              excludedUserIds.add(relation.blocked_id)
            }
            if (relation.blocked_id === userId) {
              excludedUserIds.add(relation.blocker_id)
            }
          })

          if (excludedUserIds.size > 0) {
            query = query.not('user_id', 'in', `(${Array.from(excludedUserIds).join(',')})`)
          }
        }
      }

      const { data, error } = await query

      if (error || !data) {
        return []
      }

      // Get post IDs for batch operations
      const postIds = data.map((p: DatabasePost) => p.id)
      
      // Get species images in batch for performance
      const speciesIds = data
        .filter((p: DatabasePost) => p.catch_details?.species_id)
        .map((p: DatabasePost) => p.catch_details!.species_id!)
      
      let speciesImages: Record<string, string> = {}
      if (speciesIds.length > 0) {
        const { data: speciesData } = await nativeSupabase
          .from('fish_species')
          .select('id, image_url')
          .in('id', speciesIds)
        
        if (speciesData) {
          speciesImages = speciesData.reduce((acc: Record<string, string>, species: FishSpeciesData) => {
            if (species.image_url) {
              acc[species.id] = species.image_url
            }
            return acc
          }, {})
        }
      }

      // If userId is provided, fetch user-specific data (liked posts and commented posts)
      let likedPostIds: number[] = []
      let commentedPostIds: number[] = []
      if (userId && userId.trim() !== '') {
        const { data: likes } = await nativeSupabase
          .from('likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds)
        
        likedPostIds = likes?.map((l: LikeData) => l.post_id) || []

        // Get posts that user has commented on (distinct to avoid duplicates)
        const { data: userComments } = await nativeSupabase
          .from('comments')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds)
        
        // Get unique post IDs that user has commented on
        const uniqueCommentedPostIds = [...new Set(userComments?.map((c: CommentData) => c.post_id) || [])]
        commentedPostIds = uniqueCommentedPostIds
      }

      return data.map((post) => {
        const rawPost = post as DatabasePost
        // Professional denormalized counter access - O(1) performance
        // Handle both array and object responses from Supabase LEFT JOIN
        const postStats: DatabasePostStats = Array.isArray(rawPost.post_stats)
          ? rawPost.post_stats[0] || { post_id: rawPost.id, likes_count: 0, comments_count: 0, shares_count: 0, views_count: 0, created_at: '', updated_at: '' }
          : rawPost.post_stats || { post_id: rawPost.id, likes_count: 0, comments_count: 0, shares_count: 0, views_count: 0, created_at: '', updated_at: '' }
        
        return {
          id: rawPost.id,
          user_id: rawPost.user_id,
          title: rawPost.title || '',
          description: rawPost.content,
          image_url: getFirstImageUrl(rawPost.images) || undefined,
          type: rawPost.catch_details ? 'catch' : 'post',
          content: rawPost.content,
          images: rawPost.images || [],
          location: rawPost.location ? {
            name: rawPost.location.name,
            latitude: rawPost.location.latitude,
            longitude: rawPost.location.longitude,
            country_code: rawPost.location.country_code || undefined
          } : undefined,
          metadata: rawPost.catch_details ? {
            ...rawPost.catch_details,
            species_image: rawPost.catch_details.species_image || undefined
          } : undefined,  // For backward compatibility
          created_at: rawPost.created_at,
          updated_at: rawPost.updated_at || undefined,
          catch_details: rawPost.catch_details ? {
            ...rawPost.catch_details,
            weather: typeof rawPost.catch_details.weather === 'string' 
              ? { description: rawPost.catch_details.weather } 
              : rawPost.catch_details.weather,
            fishing_technique: rawPost.fishing_technique || undefined,
            fishing_technique_id: rawPost.fishing_technique_id || undefined,
            species_image: rawPost.catch_details.species_id ? speciesImages[rawPost.catch_details.species_id] || undefined : undefined
          } : undefined,
          spot_details: null,
          user: rawPost.user ? {
            username: rawPost.user.username,
            full_name: rawPost.user.full_name || 'Unknown User',
            avatar_url: rawPost.user.avatar_url,
            is_pro: rawPost.user.is_pro || false,
            country_code: rawPost.user.country_code,
            location: rawPost.user.location
          } : {
            username: 'Unknown',
            full_name: 'Unknown User',
            avatar_url: null,
            is_pro: false,
            country_code: null,
            location: null
          },
          // Professional counter system - accurate and fast
          likes_count: postStats.likes_count || 0,
          comments_count: postStats.comments_count || 0,
          shares_count: postStats.shares_count || 0,
          views_count: postStats.views_count || 0,
          is_liked: likedPostIds.includes(rawPost.id),
          has_user_commented: commentedPostIds.includes(rawPost.id)
        }
      })
    } catch (error) {
      return []
    }
  },

  // Get single post
  async getPost(postId: number, userId?: string): Promise<PostWithUser | null> {
    try {
      const { data, error } = await nativeSupabase
        .from('posts')
        .select(`
          *,
          user:users!user_id(
            id,
            username,
            full_name,
            avatar_url,
            is_pro,
            country_code,
            location
          ),
          post_stats!post_id(
            likes_count,
            comments_count,
            shares_count,
            views_count
          )
        `)
        .eq('id', postId)
        .or('status.neq.deleted,status.is.null')
        .single()
      
      // If no error and has species_id, fetch species image separately
      let speciesImage = null
      if (!error && data && data.catch_details?.species_id) {
        const { data: speciesData } = await nativeSupabase
          .from('fish_species')
          .select('image_url')
          .eq('id', data.catch_details.species_id)
          .single()
        
        if (speciesData) {
          speciesImage = speciesData.image_url
        }
      }

      if (error) {
        // Error fetching post
        return null
      }

      if (!data) return null

      // Check if current user liked this post
      let isLiked = false
      if (userId) {
        const { data: likeData } = await nativeSupabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .single()
        
        isLiked = !!likeData
      }

      // Check if current user commented on this post
      let hasUserCommented = false
      if (userId) {
        const { data: commentData } = await nativeSupabase
          .from('comments')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .limit(1)
          .single()
        
        hasUserCommented = !!commentData
      }

      const rawData = data as DatabasePost
      // Professional denormalized counter access
      // Handle both array and object responses from Supabase LEFT JOIN
      const postStats: DatabasePostStats = Array.isArray(rawData.post_stats)
        ? rawData.post_stats[0] || { post_id: rawData.id, likes_count: 0, comments_count: 0, shares_count: 0, views_count: 0, created_at: '', updated_at: '' }
        : rawData.post_stats || { post_id: rawData.id, likes_count: 0, comments_count: 0, shares_count: 0, views_count: 0, created_at: '', updated_at: '' }

      return {
        id: rawData.id,
        user_id: rawData.user_id,
        title: rawData.title || '',
        content: rawData.content,
        image_url: getFirstImageUrl(rawData.images) || undefined,
        type: rawData.catch_details ? 'catch' : 'post',
        images: rawData.images || [],
        location: rawData.location ? {
          name: rawData.location.name,
          latitude: rawData.location.latitude,
          longitude: rawData.location.longitude,
          country_code: rawData.location.country_code || undefined
        } : undefined,
        metadata: rawData.catch_details ? {
          ...rawData.catch_details,
          species_image: rawData.catch_details.species_image || undefined
        } : undefined,
        created_at: rawData.created_at,
        updated_at: rawData.updated_at || undefined,
        catch_details: rawData.catch_details ? {
          ...rawData.catch_details,
          weather: typeof rawData.catch_details.weather === 'string' 
            ? { description: rawData.catch_details.weather } 
            : rawData.catch_details.weather,
          species_image: speciesImage || undefined
        } : undefined,
        user: rawData.user ? {
          username: rawData.user.username,
          full_name: rawData.user.full_name || 'Unknown User',
          avatar_url: rawData.user.avatar_url,
          is_pro: rawData.user.is_pro || false,
          country_code: rawData.user.country_code,
          location: rawData.user.location
        } : {
          username: 'Unknown',
          full_name: 'Unknown User',
          avatar_url: null,
          is_pro: false,
          country_code: null,
          location: null
        },
        likes_count: postStats.likes_count || 0,
        comments_count: postStats.comments_count || 0,
        shares_count: postStats.shares_count || 0,
        views_count: postStats.views_count || 0,
        is_liked: isLiked,
        has_user_commented: hasUserCommented,
        // Private note - sadece post sahibi görebilir
        private_note: userId === rawData.user_id ? rawData.private_note || undefined : undefined
      }
    } catch (error) {
      // Failed to fetch post
      return null
    }
  },

  // Get user posts (currentUserId parametresi eklendi - profilini gören kişinin ID'si)
  async getUserPosts(userId: string, limit: number = 20, offset: number = 0, currentUserId?: string): Promise<PostWithUser[]> {
    try {
      // Use RPC function with block check
      const { data: rpcResult, error: rpcError } = await nativeSupabase
        .rpc('get_user_posts_with_block_check', {
          p_target_user_id: userId,
          p_viewer_user_id: currentUserId || null,
          p_limit: limit,
          p_offset: offset
        })

      // Process RPC result if successful
      if (!rpcError && rpcResult) {
        return rpcResult.map((post: RPCPostResult) => ({
          id: post.id,
          user_id: post.user_id,
          title: post.title || '',
          description: post.content,
          image_url: post.image_url,
          type: post.catch_details ? 'catch' : 'post',
          content: post.content,
          images: post.images || [],
          location: post.location,
          metadata: post.catch_details,
          created_at: post.created_at,
          updated_at: post.updated_at,
          catch_details: {
            species: post.species,
            species_id: post.species_id,
            species_name: post.species_name,
            species_image: post.species_image,
            weight: post.weight,
            length: post.length,
            technique: post.technique,
            fishing_technique_id: post.fishing_technique_id,
            fishing_technique: post.fishing_technique,
            released: post.released,
            weather: post.weather
          },
          spot_details: null,
          user: {
            id: post.user_id,
            username: post.username,
            full_name: post.full_name,
            avatar_url: post.avatar_url,
            is_pro: post.is_pro,
            country_code: post.country_code,
            location: post.location_name
          },
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          views_count: post.views_count || 0,
          is_liked: post.is_liked || false,
          has_user_commented: post.has_user_commented || false
        }))
      }

      // Fallback to regular query if RPC fails
      let query = nativeSupabase
        .from('posts')
        .select(`
          *,
          user:users!user_id(
            id,
            username,
            full_name,
            avatar_url,
            is_pro,
            country_code,
            location
          ),
          post_stats!post_id(
            likes_count,
            comments_count,
            shares_count,
            views_count
          ),
          fishing_technique:fishing_techniques!fishing_technique_id(
            id,
            name,
            name_en,
            icon,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .or('status.neq.deleted,status.is.null')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      // Eğer başkasının profiline bakıyorsa, gizli avları filtrele
      if (currentUserId !== userId) {
        query = query.eq('is_secret', false)
      }
      
      const { data, error } = await query

      if (error) {
        // Error fetching user posts
        return []
      }

      if (!data) return []
      
      // Get species images in batch for performance
      const speciesIds = data
        .filter((p: DatabasePost) => p.catch_details?.species_id)
        .map((p: DatabasePost) => p.catch_details!.species_id!)
      
      let speciesImages: Record<string, string> = {}
      if (speciesIds.length > 0) {
        const { data: speciesData } = await nativeSupabase
          .from('fish_species')
          .select('id, image_url')
          .in('id', speciesIds)
        
        if (speciesData) {
          speciesImages = speciesData.reduce((acc: Record<string, string>, species: FishSpeciesData) => {
            if (species.image_url) {
              acc[species.id] = species.image_url
            }
            return acc
          }, {})
        }
      }

      return data.map((post) => {
        const rawPost = post as DatabasePost
        // Professional denormalized counter access
        // Handle both array and object responses from Supabase LEFT JOIN
        const postStats: DatabasePostStats = Array.isArray(rawPost.post_stats)
          ? rawPost.post_stats[0] || { post_id: rawPost.id, likes_count: 0, comments_count: 0, shares_count: 0, views_count: 0, created_at: '', updated_at: '' }
          : rawPost.post_stats || { post_id: rawPost.id, likes_count: 0, comments_count: 0, shares_count: 0, views_count: 0, created_at: '', updated_at: '' }

        return {
          id: rawPost.id,
          user_id: rawPost.user_id,
          title: rawPost.title || '',
          description: rawPost.content,
          image_url: getFirstImageUrl(rawPost.images) || undefined,
          type: rawPost.catch_details ? 'catch' : 'post',
          content: rawPost.content,
          images: rawPost.images || [],
          location: rawPost.location ? {
            name: rawPost.location.name,
            latitude: rawPost.location.latitude,
            longitude: rawPost.location.longitude,
            country_code: rawPost.location.country_code || undefined
          } : undefined,
          metadata: rawPost.catch_details ? {
            ...rawPost.catch_details,
            species_image: rawPost.catch_details.species_image || undefined
          } : undefined,  // For backward compatibility
          created_at: rawPost.created_at,
          updated_at: rawPost.updated_at || undefined,
          catch_details: rawPost.catch_details ? {
            ...rawPost.catch_details,
            weather: typeof rawPost.catch_details.weather === 'string' 
              ? { description: rawPost.catch_details.weather } 
              : rawPost.catch_details.weather,
            fishing_technique: rawPost.fishing_technique || undefined,
            fishing_technique_id: rawPost.fishing_technique_id || undefined,
            species_image: rawPost.catch_details.species_id ? speciesImages[rawPost.catch_details.species_id] || undefined : undefined
          } : undefined,
          spot_details: null,
          user: rawPost.user ? {
            username: rawPost.user.username,
            full_name: rawPost.user.full_name || 'Unknown User',
            avatar_url: rawPost.user.avatar_url,
            is_pro: rawPost.user.is_pro || false,
            country_code: rawPost.user.country_code,
            location: rawPost.user.location
          } : {
            username: 'Unknown',
            full_name: 'Unknown User',
            avatar_url: null,
            is_pro: false,
            country_code: null,
            location: null
          },
          // Professional denormalized counters
          likes_count: postStats.likes_count || 0,
          comments_count: postStats.comments_count || 0,
          shares_count: postStats.shares_count || 0,
          views_count: postStats.views_count || 0,
          is_liked: false // getUserPosts doesn't check if current user liked
        }
      })
    } catch (error) {
      // Failed to fetch user posts
      return []
    }
  },

  // Get posts for a specific species (for FishCatchesTab) - Professional counter system
  async getSpeciesPosts(speciesId: string, limit: number = 20, offset: number = 0): Promise<PostWithUser[]> {
    try {
      const { data, error } = await nativeSupabase
        .from('posts')
        .select(`
          *,
          user:users!user_id(
            id,
            username,
            full_name,
            avatar_url,
            is_pro,
            country_code
          ),
          post_stats!post_id(
            likes_count,
            comments_count,
            shares_count,
            views_count
          )
        `)
        .not('images', 'is', null)
        .neq('images', '[]')
        .contains('catch_details', { species_id: speciesId })
        .or('status.neq.deleted,status.is.null')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return []
      }

      if (!data) {
        return []
      }

      // Transform data to PostWithUser format with denormalized counters
      return data.map((rawData: DatabasePost) => {
        // Handle both array and object responses from Supabase LEFT JOIN
        const postStats: DatabasePostStats = Array.isArray(rawData.post_stats)
          ? rawData.post_stats[0] || { post_id: rawData.id, likes_count: 0, comments_count: 0, shares_count: 0, views_count: 0, created_at: '', updated_at: '' }
          : rawData.post_stats || { post_id: rawData.id, likes_count: 0, comments_count: 0, shares_count: 0, views_count: 0, created_at: '', updated_at: '' }
        
        return {
          id: rawData.id,
          user_id: rawData.user_id,
          title: rawData.title || '',
          content: rawData.content,
          image_url: getFirstImageUrl(rawData.images) || undefined,
          type: 'catch' as const,
          images: rawData.images || [],
          location: rawData.location ? {
            name: rawData.location.name,
            latitude: rawData.location.latitude,
            longitude: rawData.location.longitude,
            country_code: rawData.location.country_code || undefined
          } : undefined,
          metadata: rawData.catch_details ? {
          ...rawData.catch_details,
          species_image: rawData.catch_details.species_image || undefined
        } : undefined,
          created_at: rawData.created_at,
          updated_at: rawData.updated_at || undefined,
          // Professional denormalized counters
          likes_count: postStats.likes_count || 0,
          comments_count: postStats.comments_count || 0,
          shares_count: postStats.shares_count || 0,
          views_count: postStats.views_count || 0,
          user: rawData.user ? {
            username: rawData.user.username,
            full_name: rawData.user.full_name || 'Unknown User',
            avatar_url: rawData.user.avatar_url,
            is_pro: rawData.user.is_pro || false,
            country_code: rawData.user.country_code,
            location: rawData.user.location
          } : {
            username: 'Unknown',
            full_name: 'Unknown User',
            avatar_url: null,
            is_pro: false,
            country_code: null,
            location: null
          },
          is_liked: false,
          has_user_commented: false
        }
      })
    } catch (error) {
      return []
    }
  },

  // Create post
  async createPost(userId: string, postData: CreatePostData): Promise<Post | null> {
    // Parse location if it's a JSON string
    let locationObject: { latitude: number; longitude: number; name?: string } | undefined = postData.location;
    if (typeof postData.location === 'string') {
      try {
        locationObject = JSON.parse(postData.location);
      } catch {
        // If parsing fails, skip location
        locationObject = undefined;
      }
    }

    // Ensure standard format - coordinates and optional name
    const standardLocation = locationObject ? {
      latitude: locationObject.latitude || 0,
      longitude: locationObject.longitude || 0,
      ...(locationObject.name && { name: locationObject.name })
    } : undefined;

    const newPost = {
      user_id: userId,
      type: postData.type || 'catch',
      content: postData.content,
      images: postData.images || [],
      location: standardLocation,
      is_secret: postData.is_secret || false,
      private_note: postData.private_note || null,
      fishing_technique_id: postData.catch_details?.fishing_technique_id || null,
      catch_details: {
        species: postData.species,
        species_name: postData.species,
        weight: postData.weight,
        length: postData.length,
        technique: postData.technique,
        fishing_technique_id: postData.catch_details?.fishing_technique_id || null,
        gear: postData.gear,
        equipment_used: postData.gear,
        weather: postData.weather,
        weather_conditions: postData.weather,
        spot_name: postData.spotName,
        water_type: postData.waterType,
        description: postData.description,
        released: postData.catch_details?.released || false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data } = await nativeSupabase
      .from('posts')
      .insert(newPost)
      .select()
      .single()

    return data
  },

  // Update post
  async updatePost(postId: number, updates: Partial<Omit<DatabasePost, 'id' | 'user_id' | 'created_at'>>): Promise<Post | null> {
    // Prepare update data with proper field mapping
    const updateData: Partial<DatabasePost> = {
      updated_at: new Date().toISOString()
    };
    
    // Map fields correctly to database columns
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.images !== undefined) updateData.images = updates.images;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.catch_details !== undefined) updateData.catch_details = updates.catch_details;
    if (updates.is_secret !== undefined) updateData.is_secret = updates.is_secret;
    if (updates.private_note !== undefined) updateData.private_note = updates.private_note;
    // Root level fishing_technique_id field
    if (updates.fishing_technique_id !== undefined) updateData.fishing_technique_id = updates.fishing_technique_id;
    
    const { data } = await nativeSupabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single()

    return data
  },

  // Delete post
  async deletePost(postId: number, userId?: string): Promise<boolean> {
    // Soft delete - veri 30 gün saklanır (yasal gereksinimler için)
    const { error } = await nativeSupabase
      .from('posts')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        deleted_by: userId || null,
        deleted_reason: 'user_request'
      })
      .eq('id', postId)

    if (error) {
      // Error soft deleting post
      return false
    }

    return true
  },



  // Get catches with delta sync support
  async getCatchesWithDeltaSync(
    bounds: MapBounds, 
    zoom: number, 
    currentUserId?: string,
    lastSync?: string
  ): Promise<{
    catches: MapCatchData[]
    newCatches: MapCatchData[]
    deletedIds: string[]
    updatedCatches: MapCatchData[]
  }> {
    try {
      // Convert bounds to lat/lng format for RPC
      const minLat = Math.min(bounds.sw[1], bounds.ne[1])
      const maxLat = Math.max(bounds.sw[1], bounds.ne[1])
      const minLng = Math.min(bounds.sw[0], bounds.ne[0])
      const maxLng = Math.max(bounds.sw[0], bounds.ne[0])

      // Call optimized RPC with delta sync
      const { data: rpcResult, error: rpcError } = await nativeSupabase
        .rpc('get_map_catches_optimized', {
          p_min_lat: minLat,
          p_max_lat: maxLat,
          p_min_lng: minLng,
          p_max_lng: maxLng,
          p_zoom: Math.round(zoom),
          p_user_id: currentUserId || null,
          p_last_sync: lastSync || null
        })

      if (rpcError) {
        return {
          catches: [],
          newCatches: [],
          deletedIds: [],
          updatedCatches: []
        }
      }

      if (!rpcResult) {
        return {
          catches: [],
          newCatches: [],
          deletedIds: [],
          updatedCatches: []
        }
      }

      // Process results and categorize by sync action
      const allCatches: MapCatchData[] = []
      const newCatches: MapCatchData[] = []
      const updatedCatches: MapCatchData[] = []
      const deletedIds: string[] = []

      for (const catch_ of rpcResult) {
        // Handle deleted items
        if (catch_.sync_action === 'deleted') {
          deletedIds.push(catch_.id)
          continue
        }

        // Create MapCatchData object
        const catchData: MapCatchData = {
          id: catch_.id,
          coordinates: [
            catch_.location?.longitude || 0,
            catch_.location?.latitude || 0
          ] as [number, number],
          user: {
            id: catch_.user_id,
            full_name: catch_.user_full_name || catch_.full_name || 'Unknown User',
            avatar_url: catch_.user_avatar_url || catch_.avatar_url,
            is_pro: false
          },
          species: catch_.species_name || 'Unknown Fish',
          weight: catch_.weight,
          length: catch_.length,
          created_at: catch_.created_at,
          updated_at: catch_.updated_at,
          image_url: catch_.images?.[0],
          images: catch_.images || [],
          sync_action: catch_.sync_action
        }

        // Categorize by sync action
        if (catch_.sync_action === 'new') {
          newCatches.push(catchData)
        } else if (catch_.sync_action === 'updated') {
          updatedCatches.push(catchData)
        }

        // Add all non-deleted catches to main array
        allCatches.push(catchData)
      }

      return {
        catches: allCatches,
        newCatches,
        deletedIds,
        updatedCatches
      }

    } catch (error) {
      return {
        catches: [],
        newCatches: [],
        deletedIds: [],
        updatedCatches: []
      }
    }
  },

  // Get catches in viewport bounds for map display (currentUserId ile gizli av kontrolü) - Legacy support
  async getCatchesInBounds(bounds: MapBounds, zoom: number = 10, currentUserId?: string): Promise<MapCatchData[]> {
    try {
      // Dynamic limit based on zoom level for better performance
      const limit = zoom >= 14 ? 200 : zoom >= 12 ? 150 : zoom >= 10 ? 100 : 75

      // Use RPC function with block filter for better performance and security
      if (currentUserId) {
        const { data: rpcResult, error: rpcError } = await nativeSupabase
          .rpc('get_catches_in_bounds_with_block_filter', {
            p_user_id: currentUserId,
            p_min_lat: bounds.sw[1],
            p_max_lat: bounds.ne[1],
            p_min_lng: bounds.sw[0],
            p_max_lng: bounds.ne[0],
            p_limit: limit
          })

        if (!rpcError && rpcResult) {
          return rpcResult.map((catch_: RPCPostResult) => ({
            id: catch_.id,
            coordinates: [
              catch_.location?.longitude || catch_.location?.coordinates?.[0] || 0,
              catch_.location?.latitude || catch_.location?.coordinates?.[1] || 0
            ] as [number, number],
            user: {
              id: catch_.user_id,
              full_name: catch_.user_full_name || 'Unknown User',
              avatar_url: catch_.user_avatar_url,
              is_pro: catch_.is_pro || false
            },
            species: catch_.species_name || 'Unknown Fish',
            species_id: catch_.species_id,
            weight: catch_.weight,
            length: catch_.length,
            created_at: catch_.created_at,
            image_url: catch_.images?.[0],
            images: catch_.images || []
          } as MapCatchData))
        }
      }

      // Fallback to regular query for backwards compatibility
      const selectQuery = `
        *,
        user:users!user_id(
          id,
          full_name,
          avatar_url,
          is_pro
        )
      `

      let query = nativeSupabase
        .from('posts')
        .select(selectQuery)
        .not('location', 'is', null)
        .not('catch_details', 'is', null)
        .or('status.neq.deleted,status.is.null')
        .or(`is_secret.eq.false${currentUserId ? `,and(is_secret.eq.true,user_id.eq.${currentUserId})` : ''}`)
        .order('created_at', { ascending: false })
        .limit(limit)

      const { data } = await query

      if (!data) {
        return []
      }

      const catchesInBounds = data
        .map((post: DatabasePost) => {
          let coordinates: [number, number] | null = null
          
          if (post.location) {
            if (post.location.coordinates && Array.isArray(post.location.coordinates)) {
              coordinates = [post.location.coordinates[0], post.location.coordinates[1]]
            }
            else if (post.location.coordinates && post.location.coordinates.lat && post.location.coordinates.lng) {
              coordinates = [post.location.coordinates.lng, post.location.coordinates.lat]
            }
            else if (post.location.latitude && post.location.longitude) {
              coordinates = [post.location.longitude, post.location.latitude]
            }
          }

          if (!coordinates) {
            return null;
          }

          const [lng, lat] = coordinates
          const withinBounds = (
            lat >= bounds.sw[1] && lat <= bounds.ne[1] &&
            lng >= bounds.sw[0] && lng <= bounds.ne[0]
          );

          if (withinBounds) {
            return {
              id: post.id,
              coordinates,
              user: {
                id: post.user?.id || post.user_id,
                full_name: post.user?.full_name || 'Unknown User',
                avatar_url: post.user?.avatar_url,
                is_pro: post.user?.is_pro || false
              },
              species: post.catch_details?.species || 'Unknown Fish',
              species_id: post.catch_details?.species_id,
              species_image: post.catch_details?.species_image,
              weight: post.catch_details?.weight,
              length: post.catch_details?.length,
              created_at: post.created_at,
              image_url: getFirstImageUrl(post.images),
              images: post.images || []
            } as MapCatchData;
          }

          return null
        })
        .filter((catch_: MapCatchData | null): catch_ is MapCatchData => catch_ !== null)

      return catchesInBounds
    } catch (error) {
      return []
    }
  }
}

export function extractCoordinatesFromLocation(location: DatabasePost['location']): [number, number] | null {
  if (!location) return null

  // Format 1: { coordinates: [lng, lat] }
  if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    return [location.coordinates[0], location.coordinates[1]]
  }

  // Format 2: { coordinates: { lng, lat } }
  if (location.coordinates && typeof location.coordinates === 'object' && !Array.isArray(location.coordinates)) {
    const coords = location.coordinates as { lng: number; lat: number }
    if (coords.lng && coords.lat) {
      return [coords.lng, coords.lat]
    }
  }

  // Format 3: { longitude, latitude }
  if (location.longitude && location.latitude) {
    return [location.longitude, location.latitude]
  }

  return null
}

/**
 * Get first available image URL from images array
 */
export function getFirstImageUrl(images?: string[] | null): string | null {
  if (images && Array.isArray(images) && images.length > 0) {
    return images[0]
  }
  return null
}

// Export counter service for external access
