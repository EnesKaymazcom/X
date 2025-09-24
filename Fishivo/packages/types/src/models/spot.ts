export interface Spot {
  id: number;
  name: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  spot_type: 'shore' | 'boat' | 'pier' | 'rock' | 'river' | 'lake';
  access_type?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  depth_min?: number;
  depth_max?: number;
  area_size?: number;
  bottom_type?: string[];
  facilities?: string[];
  fish_species?: string[];
  regulations?: any;
  image_url?: string;
  images?: string[];
  rating?: number;
  rating_count?: number;
  catches_count?: number;
  status?: 'pending' | 'approved' | 'rejected';
  user_id: string;
  user?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdminSpotFilters {
  status?: string;
  spot_type?: string;
  search?: string;
  user_id?: string;
}

export interface PaginatedSpots {
  items: Spot[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}