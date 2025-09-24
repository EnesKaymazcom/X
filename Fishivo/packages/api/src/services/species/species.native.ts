import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native'
import { FishSpecies, FishSpeciesFilters, FishSpeciesListResponse, SpeciesFollow, SpeciesReview, SpeciesStatistics } from '@fishivo/types'
import { SpeciesService, CommunityData, CommunityStats, SpeciesFollowWithSpecies } from './types'

const nativeSupabase = getNativeSupabaseClient()

class SpeciesServiceNative implements SpeciesService {
  async getSpecies(filters?: FishSpeciesFilters): Promise<FishSpeciesListResponse> {
    const supabase = nativeSupabase
    
    let query = supabase
      .from('fish_species')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      query = query.or(
        `common_name.ilike.%${searchLower}%,scientific_name.ilike.%${searchLower}%,family.ilike.%${searchLower}%`
      )
    }

    if (filters?.family) {
      query = query.eq('family', filters.family)
    }

    if (filters?.habitat) {
      query = query.contains('habitats', [filters.habitat])
    }

    if (filters?.conservation_status) {
      query = query.eq('conservation_status', filters.conservation_status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return {
      data: data || [],
      count: count || 0
    }
  }

  async getSpeciesById(id: string): Promise<FishSpecies | null> {
    const supabase = nativeSupabase
    
    const { data, error } = await supabase
      .from('fish_species')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }

    return data
  }

  async getSpeciesBySlug(slug: string): Promise<FishSpecies | null> {
    const supabase = nativeSupabase
    
    const { data, error } = await supabase
      .from('fish_species')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }

    return data
  }

  async searchSpecies(query: string, limit: number = 10): Promise<FishSpecies[]> {
    const supabase = nativeSupabase
    const searchLower = query.toLowerCase()
    
    const { data, error } = await supabase
      .from('fish_species')
      .select('*')
      .or(
        `common_name.ilike.%${searchLower}%,scientific_name.ilike.%${searchLower}%,family.ilike.%${searchLower}%`
      )
      .limit(limit)
      .order('common_name')

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  // Follow Methods
  async followSpecies(speciesId: string): Promise<SpeciesFollow> {
    const supabase = nativeSupabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('species_follows')
      .insert({
        user_id: user.id,
        species_id: speciesId
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { id: '', user_id: user.id, species_id: speciesId, created_at: new Date().toISOString() }
      }
      throw new Error(error.message)
    }
    
    return data
  }

  async unfollowSpecies(speciesId: string): Promise<void> {
    const supabase = nativeSupabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('species_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('species_id', speciesId)

    if (error) throw new Error(error.message)
  }

  async isFollowingSpecies(speciesId: string): Promise<boolean> {
    const supabase = nativeSupabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('species_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('species_id', speciesId)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return !!data
  }

  async getFollowedSpecies(userId?: string): Promise<FishSpecies[]> {
    const supabase = nativeSupabase
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id
    if (!targetUserId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('species_follows')
      .select('fish_species(*)')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .returns<SpeciesFollowWithSpecies[]>()

    if (error) throw new Error(error.message)
    return data?.map(item => item.fish_species).filter(Boolean) || []
  }

  // Review Methods
  async createReview(speciesId: string, review: Omit<SpeciesReview, 'id' | 'user_id' | 'species_id' | 'created_at' | 'updated_at'>): Promise<SpeciesReview> {
    const supabase = nativeSupabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('species_reviews')
      .insert({
        user_id: user.id,
        species_id: speciesId,
        ...review
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async updateReview(reviewId: string, review: Partial<Omit<SpeciesReview, 'id' | 'user_id' | 'species_id' | 'created_at' | 'updated_at'>>): Promise<SpeciesReview> {
    const supabase = nativeSupabase
    const { data, error } = await supabase
      .from('species_reviews')
      .update(review)
      .eq('id', reviewId)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async deleteReview(reviewId: string): Promise<void> {
    const supabase = nativeSupabase
    const { error } = await supabase
      .from('species_reviews')
      .delete()
      .eq('id', reviewId)

    if (error) throw new Error(error.message)
  }

  async getSpeciesReviews(speciesId: string): Promise<SpeciesReview[]> {
    const supabase = nativeSupabase
    
    // Önce review'ları çek
    const { data: reviews, error } = await supabase
      .from('species_reviews')
      .select('*')
      .eq('species_id', speciesId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    if (!reviews || reviews.length === 0) return []
    
    // User ID'leri topla
    const userIds = [...new Set(reviews.map(r => r.user_id))]
    
    // Users tablosundan kullanıcı bilgilerini çek
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds)
    
    if (usersError) throw new Error(usersError.message)
    
    // Review ID'lerini topla vote count'ları için
    const reviewIds = reviews.map(r => r.id)
    
    // Vote count'ları getir
    const { data: votes, error: votesError } = await supabase
      .from('species_review_votes')
      .select('review_id, is_helpful')
      .in('review_id', reviewIds)
    
    if (votesError) throw new Error(votesError.message)
    
    // Vote count'ları hesapla
    const voteCounts = new Map<string, { helpful: number; unhelpful: number }>()
    reviews.forEach(review => {
      voteCounts.set(review.id, { helpful: 0, unhelpful: 0 })
    })
    
    votes?.forEach(vote => {
      const counts = voteCounts.get(vote.review_id)
      if (counts) {
        if (vote.is_helpful) {
          counts.helpful++
        } else {
          counts.unhelpful++
        }
      }
    })
    
    // Review'ları user bilgileri ve vote count'larıyla birleştir
    const usersMap = new Map(users?.map(u => [u.id, u]) || [])
    const reviewsWithUser = reviews.map(review => {
      const counts = voteCounts.get(review.id) || { helpful: 0, unhelpful: 0 }
      return {
        ...review,
        user: usersMap.get(review.user_id) || undefined,
        helpful_count: counts.helpful,
        unhelpful_count: counts.unhelpful
      }
    })
    
    return reviewsWithUser
  }

  async getUserReviewForSpecies(speciesId: string): Promise<SpeciesReview | null> {
    const supabase = nativeSupabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: review, error } = await supabase
      .from('species_reviews')
      .select('*')
      .eq('species_id', speciesId)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    if (!review) return null
    
    // User bilgisini çek
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url')
      .eq('id', user.id)
      .single()
    
    if (userError && userError.code !== 'PGRST116') throw new Error(userError.message)
    
    return {
      ...review,
      user: userData || undefined
    }
  }

  async getSpeciesStatistics(speciesId: string): Promise<SpeciesStatistics | null> {
    const supabase = nativeSupabase
    const { data, error } = await supabase
      .from('species_statistics')
      .select('*')
      .eq('species_id', speciesId)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return data || null
  }

  // Community Data Methods
  async submitCommunityData(speciesId: string, data: CommunityData): Promise<void> {
    const supabase = nativeSupabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('species_community_data')
      .upsert({
        user_id: user.id,
        species_id: speciesId,
        ...data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,species_id'
      })

    if (error) throw new Error(error.message)
  }

  async getUserCommunityData(speciesId: string): Promise<CommunityData | null> {
    const supabase = nativeSupabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('species_community_data')
      .select('is_good_eating, puts_up_good_fight, is_hard_to_catch')
      .eq('species_id', speciesId)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return data || null
  }

  async getCommunityStats(speciesId: string): Promise<CommunityStats | null> {
    const supabase = nativeSupabase
    const { data, error } = await supabase
      .from('species_community_stats')
      .select('*')
      .eq('species_id', speciesId)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return data || null
  }

  // Review Vote Methods
  async voteReviewHelpful(reviewId: string, isHelpful: boolean): Promise<void> {
    const supabase = nativeSupabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // First check if vote exists
    const { data: existingVote } = await supabase
      .from('species_review_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      // Update existing vote
      const { error } = await supabase
        .from('species_review_votes')
        .update({ is_helpful: isHelpful })
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
      
      if (error) throw new Error(error.message)
    } else {
      // Insert new vote
      const { error } = await supabase
        .from('species_review_votes')
        .insert({
          review_id: reviewId,
          user_id: user.id,
          is_helpful: isHelpful
        })
      
      if (error) throw new Error(error.message)
    }
  }

  async getUserReviewVotes(reviewIds: string[]): Promise<{ [reviewId: string]: boolean }> {
    const supabase = nativeSupabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {}

    const { data, error } = await supabase
      .from('species_review_votes')
      .select('review_id, is_helpful')
      .eq('user_id', user.id)
      .in('review_id', reviewIds)

    if (error) throw new Error(error.message)

    const votes: { [reviewId: string]: boolean } = {}
    data?.forEach(vote => {
      votes[vote.review_id] = vote.is_helpful
    })
    return votes
  }

  async getReviewVoteCounts(reviewId: string): Promise<{ helpful: number; unhelpful: number }> {
    const supabase = nativeSupabase
    
    const { data, error } = await supabase
      .from('species_review_votes')
      .select('is_helpful')
      .eq('review_id', reviewId)

    if (error) throw new Error(error.message)

    const helpful = data?.filter(v => v.is_helpful).length || 0
    const unhelpful = data?.filter(v => !v.is_helpful).length || 0

    return { helpful, unhelpful }
  }

  async getTopGearForSpecies(speciesId: string): Promise<{ gear: string; count: number; brand?: string; rating?: number; review_count?: number }[]> {
    const supabase = nativeSupabase
    
    try {
      // Bu türe ait tüm avları getir
      const { data: posts, error } = await supabase
        .from('posts')
        .select('catch_details')
        .eq('catch_details->>species_id', speciesId)
        .not('catch_details->gear', 'is', null)

      if (error) throw new Error(error.message)
      if (!posts || posts.length === 0) return []

      // Tüm gear'ları topla ve say
      const gearCount = new Map<string, number>()
      
      posts.forEach(post => {
        const gearArray = post.catch_details?.gear
        if (Array.isArray(gearArray)) {
          gearArray.forEach(gear => {
            if (typeof gear === 'string' && gear.trim()) {
              const count = gearCount.get(gear) || 0
              gearCount.set(gear, count + 1)
            }
          })
        }
      })

      // Map'i array'e çevir
      const gearNames = Array.from(gearCount.keys())
      
      // Equipment tablosundan rating ve brand bilgilerini çek
      // ilike kullanarak fuzzy matching yapalım
      let equipmentQuery = supabase
        .from('equipment')
        .select('name, brand, user_rating, review_count')
      
      // Her gear için ilike sorgusu oluştur
      const orConditions = gearNames.map(name => `name.ilike.%${name}%`).join(',')
      if (orConditions) {
        equipmentQuery = equipmentQuery.or(orConditions)
      }
      
      const { data: equipmentData } = await equipmentQuery

      // Equipment verilerini map'e çevir - fuzzy matching için
      const equipmentMap = new Map()
      gearNames.forEach(gearName => {
        const match = equipmentData?.find(eq => 
          eq.name.toLowerCase().includes(gearName.toLowerCase()) || 
          gearName.toLowerCase().includes(eq.name.toLowerCase())
        )
        if (match) {
          equipmentMap.set(gearName, { 
            brand: match.brand, 
            rating: match.user_rating, 
            review_count: match.review_count 
          })
        }
      })

      // Gear verilerini rating bilgileriyle birleştir
      const gearStats = Array.from(gearCount.entries())
        .map(([gear, count]) => {
          const equipment = equipmentMap.get(gear)
          return { 
            gear, 
            count,
            brand: equipment?.brand || undefined,
            rating: equipment?.rating || undefined,
            review_count: equipment?.review_count || undefined
          }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 20) // En çok kullanılan 20 ekipman

      return gearStats
    } catch (error) {
      return []
    }
  }

  async getTopTechniquesForSpecies(speciesId: string): Promise<{ 
    technique: string; 
    count: number; 
    id?: number;
    name?: string;
    name_tr?: string;
    name_en?: string;
    description?: string;
    description_tr?: string;
    description_en?: string;
    icon?: string;
    image_url?: string;
    season?: string;
    tips?: any;
    equipment?: any;
  }[]> {
    const supabase = nativeSupabase
    
    try {
      // Bu türe ait tüm avları getir (tarih bilgisiyle birlikte)
      const { data: posts, error } = await supabase
        .from('posts')
        .select('catch_details, created_at')
        .eq('catch_details->>species_id', speciesId)
        .not('catch_details->technique', 'is', null)

      if (error) throw new Error(error.message)
      if (!posts || posts.length === 0) return []

      // Tüm technique'leri topla ve say, ayrıca mevsim verilerini de topla
      const techniqueCount = new Map<string, number>()
      const techniqueSeasons = new Map<string, { [season: string]: number }>()
      
      posts.forEach(post => {
        const technique = post.catch_details?.technique
        if (technique && typeof technique === 'string' && technique.trim()) {
          // Kullanım sayısını artır
          const count = techniqueCount.get(technique) || 0
          techniqueCount.set(technique, count + 1)
          
          // Mevsim bilgisini topla
          if (post.created_at) {
            const month = new Date(post.created_at).getMonth() + 1 // 1-12
            let season = ''
            if (month >= 3 && month <= 5) season = 'İlkbahar'
            else if (month >= 6 && month <= 8) season = 'Yaz'
            else if (month >= 9 && month <= 11) season = 'Sonbahar'
            else season = 'Kış'
            
            const seasonData = techniqueSeasons.get(technique) || {}
            seasonData[season] = (seasonData[season] || 0) + 1
            techniqueSeasons.set(technique, seasonData)
          }
        }
      })

      // Technique isimlerini array'e çevir
      const techniqueNames = Array.from(techniqueCount.keys())
      
      // Fishing techniques tablosundan detayları çek
      let techniqueQuery = supabase
        .from('fishing_techniques')
        .select('id, name, name_en, description, description_en, icon, image_url, season, tips, equipment')
      
      // Her technique için ilike sorgusu oluştur
      const orConditions = techniqueNames.map(name => `name.ilike.%${name}%,name_en.ilike.%${name}%`).join(',')
      if (orConditions) {
        techniqueQuery = techniqueQuery.or(orConditions)
      }
      
      const { data: techniqueData } = await techniqueQuery

      // Technique verilerini map'e çevir - fuzzy matching için
      const techniqueMap = new Map()
      techniqueNames.forEach(techniqueName => {
        const match = techniqueData?.find(tech => 
          tech.name?.toLowerCase().includes(techniqueName.toLowerCase()) || 
          techniqueName.toLowerCase().includes(tech.name?.toLowerCase()) ||
          tech.name_en?.toLowerCase().includes(techniqueName.toLowerCase()) || 
          techniqueName.toLowerCase().includes(tech.name_en?.toLowerCase())
        )
        if (match) {
          techniqueMap.set(techniqueName, { 
            id: match.id,
            name: match.name,
            name_tr: match.name, // name_tr yok, name kullan
            name_en: match.name_en,
            description: match.description,
            description_tr: match.description, // description_tr yok, description kullan
            description_en: match.description_en,
            icon: match.icon,
            image_url: match.image_url,
            season: match.season,
            tips: match.tips,
            equipment: match.equipment
          })
        }
      })

      // Technique verilerini birleştir
      const techniqueStats = Array.from(techniqueCount.entries())
        .map(([technique, count]) => {
          const details = techniqueMap.get(technique)
          
          // En çok kullanılan mevsimi bul
          const seasonData = techniqueSeasons.get(technique) || {}
          let bestSeason = ''
          let maxSeasonCount = 0
          
          Object.entries(seasonData).forEach(([season, seasonCount]) => {
            if (seasonCount > maxSeasonCount) {
              maxSeasonCount = seasonCount
              bestSeason = season
            }
          })
          
          // Eğer tüm mevsimler eşit veya yakınsa "Tüm mevsimler" yaz
          const seasonCounts = Object.values(seasonData)
          const totalSeasonUsage = seasonCounts.reduce((sum, c) => sum + c, 0)
          const isAllSeasons = seasonCounts.length >= 3 && 
            seasonCounts.every(c => c >= totalSeasonUsage * 0.15) // Her mevsim en az %15 kullanım
          
          // 4 mevsimin hepsinde veri yoksa mevsim gösterme
          const hasAllSeasons = Object.keys(seasonData).length === 4
          
          return { 
            technique, 
            count,
            id: details?.id,
            name: details?.name,
            name_tr: details?.name_tr || details?.name,
            name_en: details?.name_en,
            description: details?.description,
            description_tr: details?.description_tr || details?.description,
            description_en: details?.description_en,
            icon: details?.icon,
            image_url: details?.image_url,
            season: hasAllSeasons ? (isAllSeasons ? 'Tüm mevsimler' : bestSeason) : undefined,
            tips: details?.tips,
            equipment: details?.equipment
          }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 20) // En çok kullanılan 20 technique

      return techniqueStats
    } catch (error) {
      return []
    }
  }
}

// Export singleton instance
export const speciesServiceNative = new SpeciesServiceNative()