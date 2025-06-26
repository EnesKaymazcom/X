// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Post/Catch types
export interface Post {
  id: number;
  user_id: string;
  content: string;
  image_url?: string;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
  };
  spot_id?: number;
  trip_id?: number;
  catch_details?: {
    species_id?: number;
    species_name?: string;
    weight?: number;
    length?: number;
    bait_used?: string;
    technique?: string;
    weather_conditions?: string;
    water_temperature?: number;
    time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night';
    equipment_used?: string[];
  };
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    location?: string;
  };
  spot?: {
    id: number;
    name: string;
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
}

// User types
export interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  title?: string;
  is_verified?: boolean;
  is_pro?: boolean;
}

// Like types
export interface LikeUser {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  liked_at?: string;
  is_verified?: boolean;
  is_pro?: boolean;
}

// Spot types
export interface Spot {
  id: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
  };
  description?: string;
  water_type?: 'saltwater' | 'freshwater';
  difficulty?: 'easy' | 'medium' | 'hard';
  rating?: number;
  catches_count?: number;
}

// Species types
export interface Species {
  id: number;
  name: string;
  scientific_name?: string;
  description?: string;
  image_url?: string;
  habitat?: string;
  min_weight?: number;
  max_weight?: number;
  average_length?: number;
}

// Equipment types
export interface Equipment {
  id: number;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  description?: string;
  image_url?: string;
  price?: number;
}

// Weather types
export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  visibility: number;
  uv_index: number;
  condition: string;
  icon: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

// Social counts
export interface SocialCounts {
  followers: number;
  following: number;
}

// Fishing technique types
export interface FishingTechnique {
  id: number;
  name: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  best_conditions?: string;
  equipment_needed?: string[];
}

// Location types
export interface UserLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  is_favorite: boolean;
  created_at: string;
}

// Upload types
export interface UploadResponse {
  url: string;
  filename?: string;
  size?: number;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Request filters
export interface PostFilters {
  userId?: string;
  spotId?: number;
  tripId?: number;
}

export interface SearchFilters {
  query: string;
  page?: number;
  limit?: number;
}

// Batch operations
export interface BatchLikeStatus {
  [postId: number]: boolean;
}

export interface BatchLikeCounts {
  [postId: number]: number;
}