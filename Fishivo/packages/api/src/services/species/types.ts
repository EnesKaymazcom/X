import { FishSpecies, FishSpeciesFilters, FishSpeciesListResponse, SpeciesFollow, SpeciesReview, SpeciesStatistics } from '@fishivo/types'

// Types for Supabase queries with joins
export interface SpeciesFollowWithSpecies {
  fish_species: FishSpecies
}

export interface CommunityData {
  is_good_eating?: boolean | null
  puts_up_good_fight?: boolean | null
  is_hard_to_catch?: boolean | null
}

export interface CommunityStats {
  good_eating_yes: number
  good_eating_no: number
  good_eating_total: number
  good_fight_yes: number
  good_fight_no: number
  good_fight_total: number
  hard_to_catch_yes: number
  hard_to_catch_no: number
  hard_to_catch_total: number
  total_contributors: number
}

export interface SpeciesService {
  getSpecies(filters?: FishSpeciesFilters): Promise<FishSpeciesListResponse>
  getSpeciesById(id: string): Promise<FishSpecies | null>
  getSpeciesBySlug(slug: string): Promise<FishSpecies | null>
  searchSpecies(query: string, limit?: number): Promise<FishSpecies[]>
  
  // Follow methods
  followSpecies(speciesId: string): Promise<SpeciesFollow>
  unfollowSpecies(speciesId: string): Promise<void>
  isFollowingSpecies(speciesId: string): Promise<boolean>
  getFollowedSpecies(userId?: string): Promise<FishSpecies[]>
  
  // Review methods
  createReview(speciesId: string, review: Omit<SpeciesReview, 'id' | 'user_id' | 'species_id' | 'created_at' | 'updated_at'>): Promise<SpeciesReview>
  updateReview(reviewId: string, review: Partial<Omit<SpeciesReview, 'id' | 'user_id' | 'species_id' | 'created_at' | 'updated_at'>>): Promise<SpeciesReview>
  deleteReview(reviewId: string): Promise<void>
  getSpeciesReviews(speciesId: string): Promise<SpeciesReview[]>
  getUserReviewForSpecies(speciesId: string): Promise<SpeciesReview | null>
  getSpeciesStatistics(speciesId: string): Promise<SpeciesStatistics | null>
  
  // Community data methods
  submitCommunityData(speciesId: string, data: CommunityData): Promise<void>
  getUserCommunityData(speciesId: string): Promise<CommunityData | null>
  getCommunityStats(speciesId: string): Promise<CommunityStats | null>
  
  // Review vote methods
  voteReviewHelpful(reviewId: string, isHelpful: boolean): Promise<void>
  getUserReviewVotes(reviewIds: string[]): Promise<{ [reviewId: string]: boolean }>
  getReviewVoteCounts(reviewId: string): Promise<{ helpful: number; unhelpful: number }>
  
  // Gear statistics
  getTopGearForSpecies(speciesId: string): Promise<{ gear: string; count: number; brand?: string; rating?: number; review_count?: number }[]>
  
  // Fishing technique statistics  
  getTopTechniquesForSpecies(speciesId: string): Promise<{ 
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
    season?: string;
    tips?: any;
    equipment?: any;
  }[]>
}