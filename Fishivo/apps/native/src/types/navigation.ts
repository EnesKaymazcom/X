import { NavigatorScreenParams } from '@react-navigation/native';
import { FishSpecies } from '@fishivo/types';

// Equipment interface based on database structure
export interface Equipment {
  id: number; // bigint from DB
  name: string;
  category: string;
  brand?: string;
  model?: string;
  image_url?: string;
  description_tr?: string;
  description_en?: string;
  user_rating?: number;
  rating_count?: number;
  review_count?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// FishingTechnique interface based on database structure
export interface FishingTechnique {
  id: number; // bigint from DB
  name: string;
  icon?: string;
  description?: string;
  difficulty?: string;
  best_for?: any; // jsonb from DB
  equipment?: any; // jsonb from DB
  water_types?: any; // jsonb from DB
  season?: string;
  seasons?: string[]; // Required by @fishivo/types
  tips?: any; // jsonb from DB
  tips_detailed?: Array<{
    title: string;
    content: string;
    title_en?: string;
    content_en?: string;
  }>;
  image_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  name_en: string;
  description_en?: string;
  difficulty_en?: string;
  detailed_description?: string;
  detailed_description_en?: string;
}

// PostData interface for PostDetail screen
export interface PostData {
  id: number; // Database BIGINT
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    location: string;
    country?: string;
    isPro?: boolean;
  };
  fish: {
    species: string;
    speciesId?: string;
    speciesImage?: string;
    weight: string;
    length: string;
    weightUnit?: string;
    lengthUnit?: string;
  };
  imageUrl?: string;
  images?: string[];
  photo?: string;
  likes: number;
  comments: number;
  likes_count?: number; // Database field compatibility
  comments_count?: number; // Database field compatibility
  timeAgo: string;
  description?: string | null;
  privateNote?: string | null;
  isSecret?: boolean;
  equipment?: string[];
  equipmentDetails?: Array<{
    id: string;
    name: string;
    category: string;
    brand?: string;
    icon: string;
    condition: 'excellent' | 'good' | 'fair';
  }>;
  liveBait?: string;
  useLiveBait?: boolean;
  catchLocation?: string;
  catchCountryCode?: string;
  coordinates?: [number, number];
  method?: string;
  fishingTechniqueId?: number | null;
  fishingTechnique?: {
    id: number;
    name: string;
    name_en?: string;
  };
  released?: boolean;
  weather?: {
    temperature?: number;
    windSpeed?: number;
    windDirection?: string;
    pressure?: number;
    sun_direction?: string;
    moon_phase?: string;
  };
  isLiked?: boolean;
  hasUserCommented?: boolean;
  has_user_commented?: boolean; // Database field compatibility
}

// MainTabParamList type definition (moved here to avoid circular dependency)
export type MainTabParamList = {
  Home: {
    updatedPost?: {
      id: number;
      content?: string;
      images?: string[];
      species?: string;
      speciesId?: string;
      weight?: number;
      length?: number;
      technique?: string;
      equipment?: string[];
      weather?: string;
      latitude?: number;
      longitude?: number;
    }
  } | undefined;
  Map: { 
    selectedLocation?: {
      id: string;
      name: string;
      location: string;
      coordinates: [number, number];
      type: string;
      catches?: number;
      isFavorite?: boolean;
    };
    updatedSpot?: {
      id: string;
      name: string;
      description?: string;
      images?: string[];
      waterType?: string;
      latitude?: number;
      longitude?: number;
    }
  } | undefined;
  Weather: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  ResetPassword: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  UserProfile: { userId: string };
  Settings: undefined;
  EditProfile: undefined;
  NotificationSettings: undefined;
  UnitsSettings: undefined;
  BlockedUsers: undefined;
  AddGear: { gearId?: string } | undefined;
  AddCatch: { 
    editMode?: boolean; 
    postId?: number; // Database BIGINT
    postData?: PostData;
  } | undefined;
  AddSpot: { 
    editMode?: boolean; 
    spotId?: number;
    spotData?: any; // Spot data for editing
  } | undefined;
  SpotDetail: { spotId: number; spotData?: any } | undefined;
  PostDetail: { 
    postData?: PostData; 
    postId?: number; 
    updatedCommentData?: {
      hasUserCommented: boolean;
      commentsCount: number;
    };
  };
  Comments: { 
    postId: number; 
    postTitle?: string;
    initialCommentCount?: number;
    onCommentAdded?: (newCount?: number) => void;
  };
  Likers: { postId: number };
  LocationManagement: undefined;
  AddLocation: undefined;
  ExploreSearch: undefined;
  FishSpecies: undefined;
  FishDetail: { species: FishSpecies; openReviewModal?: boolean };
  GearDetail: { equipment: Equipment; openReviewModal?: boolean };
  FishingDisciplines: undefined;
  FishingDisciplineDetail: { technique: FishingTechnique };
  Notifications: undefined;
  YourMap: undefined;
  Premium: undefined;
  FindFriends: undefined;
  Search: undefined;
  Followers: { userId: string; userName?: string };
  Following: { userId: string; userName?: string };
};
