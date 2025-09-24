export interface FishSpecies {
  id: string
  common_name: string
  scientific_name: string
  family: string
  order?: string
  conservation_status?: string
  habitats?: string[]
  max_length?: number
  max_weight?: number
  min_depth?: number
  max_depth?: number
  image_url?: string
  common_names_tr?: string[]
  common_names_en?: string[]
  description_tr?: string
  description_en?: string
  feeding_types?: string[]
  slug?: string
  created_at: string
  updated_at?: string
}

export interface FishSpeciesListResponse {
  data: FishSpecies[]
  count: number
}

export interface FishSpeciesFilters {
  search?: string
  family?: string
  habitat?: string
  conservation_status?: string
  limit?: number
  offset?: number
}

// Helper type for display
export interface FishSpeciesDisplay {
  id: string
  name: string
  scientificName: string
  description: string
  postCount: number
  season: string
  image: string
  minWeight?: number
  maxWeight?: number
  averageLength?: number
  habitat?: string
  baitTypes?: string[]
  bestTimeOfDay?: string[]
  waterDepth?: string
  family?: string
  conservationStatus?: string
  difficulty?: 'Kolay' | 'Orta' | 'Zor'
  matchedAlternativeName?: string // Alternatif isim ile bulunduysa
}

// Species Follow Types
export interface SpeciesFollow {
  id: string
  user_id: string
  species_id: string
  created_at: string
}

// Species Review Types
export interface SpeciesReview {
  id: string
  user_id: string
  species_id: string
  rating: number // 1-5
  difficulty_level?: 'easy' | 'medium' | 'hard'
  caught_count?: number
  review_text?: string
  best_season?: string
  best_bait?: string
  best_technique?: string
  fishing_tips?: string
  location?: string
  images?: string[]
  is_verified?: boolean
  helpful_count?: number
  unhelpful_count?: number
  // Community questions
  is_good_eating?: boolean
  puts_up_good_fight?: boolean
  is_hard_to_catch?: boolean
  created_at: string
  updated_at: string
  // Joined fields
  user?: {
    id: string
    username?: string
    full_name?: string
    avatar_url?: string
  }
}

// Species Statistics
export interface SpeciesStatistics {
  species_id: string
  review_count: number
  average_rating: number
  follower_count: number
  total_catches: number
  most_common_difficulty?: 'easy' | 'medium' | 'hard'
}

