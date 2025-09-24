// Map types for clustering
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapCatchData {
  id: number;
  latitude: number;
  longitude: number;
  species_name?: string;
  user_avatar?: string;
  image_url?: string;
  created_at: string;
  weight?: number;
  length?: number;
  username?: string;
}

export interface Post {
  id: number;
  user_id: string;
  title?: string;
  slug?: string;
  content: string;
  image_url?: string;
  images?: string[];
  location?: {
    name?: string;
    latitude?: number;
    longitude?: number;
    country_code?: string;
  };
  catch_details?: {
    species?: string;
    species_name?: string;
    species_id?: string;
    species_image?: string;
    weight?: number;
    length?: number;
    technique?: string;
    fishing_technique_id?: number | null;
    fishing_technique?: {
      id: number;
      name: string;
      name_en: string | null;
      icon: string | null;
      difficulty: string | null;
    } | null;
    gear?: string[];
    weather?: {
      temperature?: number;
      description?: string;
      humidity?: number;
      pressure?: number;
      wind_speed?: number;
      wind_direction?: string;
    };
    released?: boolean;
    catch_time?: string;
  };
  /** @deprecated Use catch_details instead */
  metadata?: {
    gear?: string[];
    weight?: number;
    length?: number;
    species?: string;
    species_id?: string;
    species_image?: string;
    [key: string]: unknown;
  };
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  status?: string;
  moderation_notes?: string;
  is_secret?: boolean;
  created_at: string;
  updated_at?: string;
}