/**
 * Fishing related type definitions
 */

export interface FishingTechnique {
  id: number;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  detailed_description?: string;
  detailed_description_en?: string;
  difficulty: string;
  difficulty_en: string;
  icon: string;
  image_url: string;
  status: string;
  water_types: string[];
  season: string;
  seasons: string[];
  best_for: string[];
  equipment: string[];
  tips: string[];
  tips_detailed?: Array<{
    title: string;
    content: string;
    title_en?: string;
    content_en?: string;
  }>;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface BasicFishSpecies {
  id: string;
  name: string;
  nameEn: string;
  scientificName: string;
  waterType: 'freshwater' | 'saltwater' | 'both';
  description?: string;
  imageUrl?: string;
}

export interface FishingSpot {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  waterType: 'freshwater' | 'saltwater';
  fishSpecies?: string[];
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FishingGear {
  id: string;
  name: string;
  category: 'rod' | 'reel' | 'line' | 'lure' | 'hook' | 'other';
  brand?: string;
  model?: string;
  description?: string;
  icon?: string;
}

// UI specific fishing gear type - used in ProfileScreen, EquipmentSection, etc.
export interface FishingGearUI {
  id: string;
  name: string;
  category: string;
  brand?: string;
  icon: string;
  imageUrl?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  rating?: number;
  reviewCount?: number;
}

export interface Catch {
  id: string;
  userId: string;
  spotId?: string;
  species: string;
  weight?: number;
  length?: number;
  technique?: string;
  gear?: string[];
  weather?: string;
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}