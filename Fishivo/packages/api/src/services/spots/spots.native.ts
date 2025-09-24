import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native'
import { Spot } from '@fishivo/types'

const nativeSupabase = getNativeSupabaseClient()

export interface CreateSpotData {
  name: string
  description?: string
  latitude: number
  longitude: number
  waterType: 'freshwater' | 'saltwater'
  isPublic?: boolean
  images?: string[]
  depth?: number
  address?: string
  city?: string
  country?: string
}

export interface SpotWithUser extends Spot {
  user: {
    id: string
    username: string
    full_name: string
    profile_image?: string
    is_pro?: boolean
  }
  posts_count?: number
  likes_count?: number
}

export const spotsServiceNative = {
  // Get spots
  async getSpots(limit: number = 20, offset: number = 0, filters?: {
    waterType?: 'freshwater' | 'saltwater'
    userId?: string
    isPublic?: boolean
  }): Promise<SpotWithUser[]> {
    // Use simpler query to avoid foreign key issues
    let query = nativeSupabase
      .from('spots')
      .select(`
        *,
        users!user_id(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters?.waterType) {
      query = query.eq('water_type', filters.waterType)
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic)
    }

    const { data, error } = await query

    if (error) {
      // Error fetching spots
      return []
    }

    return data.map(spot => ({
      ...spot,
      posts_count: 0, // Posts count removed due to missing relationship
      likes_count: spot.likes?.[0]?.count || 0
    }))
  },

  // Get single spot
  async getSpot(spotId: number): Promise<SpotWithUser | null> {
    const { data, error } = await nativeSupabase
      .from('spots')
      .select(`
        *,
        user:users!user_id(*),
        likes:spot_likes(count)
      `)
      .eq('id', spotId)
      .single()

    if (error) {
      // Error fetching spot
      return null
    }

    return {
      ...data,
      posts_count: 0, // Posts count removed due to missing relationship
      likes_count: data.likes?.[0]?.count || 0
    }
  },

  // Get user spots
  async getUserSpots(userId: string, limit: number = 20, offset: number = 0): Promise<SpotWithUser[]> {
    const { data, error } = await nativeSupabase
      .from('spots')
      .select(`
        *,
        user:users!user_id(*),
        likes:spot_likes(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      // Error fetching user spots
      return []
    }

    return data.map(spot => ({
      ...spot,
      posts_count: 0, // Posts count removed due to missing relationship
      likes_count: spot.likes?.[0]?.count || 0
    }))
  },

  // Get nearby spots
  async getNearbySpots(latitude: number, longitude: number, radiusKm: number = 50): Promise<SpotWithUser[]> {
    // Supabase doesn't have built-in geospatial queries without PostGIS
    // For now, fetch all public spots and filter client-side
    const { data, error } = await nativeSupabase
      .from('spots')
      .select(`
        *,
        user:users!user_id(*)
      `)
      .eq('is_public', true)

    if (error) {
      // Error fetching nearby spots
      return []
    }

    // Simple distance calculation (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371 // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }

    return data
      .filter(spot => {
        const distance = calculateDistance(latitude, longitude, spot.latitude, spot.longitude)
        return distance <= radiusKm
      })
      .sort((a, b) => {
        const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude)
        const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude)
        return distA - distB
      })
  },

  // Create spot
  async createSpot(userId: string, spotData: CreateSpotData): Promise<Spot | null> {
    // Use standard location format
    const standardLocation = {
      latitude: spotData.latitude,
      longitude: spotData.longitude,
      name: spotData.name || '',
      address: spotData.address,
      city: spotData.city,
      country: spotData.country
    };

    const newSpot = {
      user_id: userId,
      name: spotData.name,
      description: spotData.description,
      location: standardLocation,
      water_type: spotData.waterType,
      is_public: spotData.isPublic ?? true,
      images: spotData.images || [],
      depth_min: spotData.depth ? Math.floor(spotData.depth) : null,
      depth_max: spotData.depth ? Math.ceil(spotData.depth) : null,
      spot_type: 'shore', // Default, can be enhanced later
      status: !spotData.isPublic ? 'approved' : 'pending', // Gizli spot direkt onaylanır, public spot admin onayına gider
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await nativeSupabase
      .from('spots')
      .insert(newSpot)
      .select()
      .single()

    if (error) {
      // Error creating spot
      return null
    }

    return data
  },

  // Update spot
  async updateSpot(spotId: number, updates: Partial<CreateSpotData> & { images?: string[] }): Promise<Spot | null> {
    // Önce mevcut spot'u al (private→public kontrolü için)
    const { data: currentSpot } = await nativeSupabase
      .from('spots')
      .select('is_public, status')
      .eq('id', spotId)
      .single();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.waterType) updateData.water_type = updates.waterType;
    if (updates.isPublic !== undefined) {
      updateData.is_public = updates.isPublic;
      
      // Private'tan public'e geçiş kontrolü
      if (currentSpot && !currentSpot.is_public && updates.isPublic) {
        // Gizli spot'tan public spot'a geçiş → tekrar onaya gönder
        updateData.status = 'pending';
      } else if (!updates.isPublic) {
        // Public'tan private'a geçiş → direkt onayla
        updateData.status = 'approved';
      }
    }
    if (updates.images) updateData.images = updates.images;
    if (updates.depth !== undefined) {
      updateData.depth_min = updates.depth ? Math.floor(updates.depth) : null;
      updateData.depth_max = updates.depth ? Math.ceil(updates.depth) : null;
    }
    if (updates.latitude && updates.longitude) {
      updateData.location = {
        lat: updates.latitude,
        lng: updates.longitude,
        name: ''
      };
    }

    const { data, error } = await nativeSupabase
      .from('spots')
      .update(updateData)
      .eq('id', spotId)
      .select()
      .single()

    if (error) {
      // Error updating spot
      return null
    }

    return data
  },

  // Get species caught at this spot
  async getSpotSpecies(spotId: number): Promise<any[]> {
    try {
      const { data, error } = await nativeSupabase
        .rpc('get_spot_species', { spot_uuid: spotId })
      
      if (error) {
        console.error('Error fetching spot species:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getSpotSpecies:', error)
      return []
    }
  },

  // Delete spot
  async deleteSpot(spotId: number): Promise<boolean> {
    const { error } = await nativeSupabase
      .from('spots')
      .delete()
      .eq('id', spotId)

    if (error) {
      // Error deleting spot
      return false
    }

    return true
  },

  // Like spot
  async likeSpot(spotId: number, userId: string): Promise<boolean> {
    const { error } = await nativeSupabase
      .from('spot_likes')
      .insert({
        spot_id: spotId,
        user_id: userId,
        created_at: new Date().toISOString()
      })

    if (error) {
      // Error liking spot
      return false
    }

    return true
  },

  // Unlike spot
  async unlikeSpot(spotId: number, userId: string): Promise<boolean> {
    const { error } = await nativeSupabase
      .from('spot_likes')
      .delete()
      .eq('spot_id', spotId)
      .eq('user_id', userId)

    if (error) {
      // Error unliking spot
      return false
    }

    return true
  },

  // Search spots with advanced filters
  async searchSpots(params: {
    query?: string
    region?: string
    userLocation?: [number, number] // [lng, lat]
    radius?: number
    spotTypes?: string[]
    onlyPopular?: boolean
    limit?: number
    offset?: number
  }): Promise<SpotWithUser[]> {
    const { 
      query, 
      region, 
      userLocation, 
      radius = 50, 
      spotTypes = [], 
      onlyPopular = false,
      limit = 20,
      offset = 0 
    } = params

    // Build base query
    let supabaseQuery = nativeSupabase
      .from('spots')
      .select(`
        *,
        user:users!user_id(*),
        likes:spot_likes(count)
      `)
      .eq('status', 'approved') // Only approved spots

    // Text search on name and description
    if (query && query.trim()) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Region filter (simple text matching on location.name)
    if (region) {
      supabaseQuery = supabaseQuery.ilike('location->>name', `%${region}%`)
    }

    // Spot types filter
    if (spotTypes.length > 0) {
      supabaseQuery = supabaseQuery.in('spot_type', spotTypes)
    }

    // Only popular spots (high rating)
    if (onlyPopular) {
      supabaseQuery = supabaseQuery.gte('rating', 4.0)
    }

    // Order by rating desc for better results
    supabaseQuery = supabaseQuery.order('rating', { ascending: false })
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

    const { data, error } = await supabaseQuery

    if (error) {
      console.error('Search spots error:', error)
      return []
    }

    if (!data) return []

    // Apply location filtering if user location provided
    let filteredData = data
    if (userLocation) {
      const [userLng, userLat] = userLocation
      
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371 // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return R * c
      }

      filteredData = data
        .map(spot => ({
          ...spot,
          distance: calculateDistance(userLat, userLng, spot.location.lat, spot.location.lng)
        }))
        .filter(spot => spot.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
    }

    return filteredData.map(spot => ({
      ...spot,
      likes_count: spot.likes?.[0]?.count || 0,
      posts_count: 0 // TODO: Implement when posts relationship is fixed
    }))
  },

  // Get popular fishing areas with statistics
  async getPopularFishingAreas(params: {
    userLocation?: [number, number]
    radius?: number
    minCatches?: number
    limit?: number
  } = {}): Promise<{
    id: number
    name: string
    location: { lat: number; lng: number; name: string }
    spot_type: string
    catches_count: number
    average_rating: number
    distance?: number
  }[]> {
    const { 
      userLocation, 
      radius = 100, 
      minCatches = 5, 
      limit = 10 
    } = params

    // Get spots with high activity
    const { data, error } = await nativeSupabase
      .from('spots')
      .select(`
        id,
        name,
        location,
        spot_type,
        rating,
        catches_count,
        status
      `)
      .eq('status', 'approved')
      .gte('catches_count', minCatches)
      .order('catches_count', { ascending: false })
      .limit(limit * 2) // Get more to filter by distance

    if (error) {
      console.error('Get popular areas error:', error)
      return []
    }

    if (!data) return []

    let filteredData = data
    if (userLocation) {
      const [userLng, userLat] = userLocation
      
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return R * c
      }

      filteredData = data
        .map(spot => ({
          ...spot,
          distance: calculateDistance(userLat, userLng, spot.location.lat, spot.location.lng)
        }))
        .filter(spot => spot.distance <= radius)
        .sort((a, b) => b.catches_count - a.catches_count)
        .slice(0, limit)
    }

    return filteredData.map(spot => ({
      id: spot.id,
      name: spot.name,
      location: spot.location,
      spot_type: spot.spot_type,
      catches_count: spot.catches_count || 0,
      average_rating: spot.rating || 0,
      distance: 'distance' in spot && typeof spot.distance === 'number' ? spot.distance : undefined
    }))
  }
}