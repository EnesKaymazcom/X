import type { PostWithUser } from '@fishivo/api';
import type { FishingGearUI } from '@fishivo/types';
import type { User } from '@supabase/supabase-js';

// Re-export FishingGearUI for internal use
export type { FishingGearUI };

// Loading state for better state management
export type LoadingState = 'idle' | 'initial' | 'loading' | 'refreshing' | 'error' | 'success';

// User stats interface
export interface UserStats {
  totalCatches: number;
  totalSpots: number;
  totalFollowers: number;
  totalFollowing: number;
  totalLikes: number;
}


// User profile state
export interface UserProfileState {
  name: string;
  username: string;
  location: string;
  countryCode: string;
  bio: string;
  avatar: string;
  coverImage: string;
  isPro: boolean;
  proSince: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  twitter_url: string;
  tiktok_url: string;
  website: string;
}

// Profile reducer state
export interface ProfileState {
  loadingState: LoadingState;
  user: User | null;
  profile: UserProfileState;
  stats: UserStats;
  catches: PostWithUser[];
  gearItems: FishingGearUI[];
  error: string | null;
  imagesLoaded: boolean;
  gearLoaded: boolean;
}

// Profile reducer action types
export type ProfileAction =
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROFILE'; payload: Partial<UserProfileState> }
  | { type: 'SET_STATS'; payload: UserStats }
  | { type: 'SET_CATCHES'; payload: PostWithUser[] }
  | { type: 'SET_GEAR'; payload: FishingGearUI[] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_IMAGES_LOADED'; payload: boolean }
  | { type: 'SET_GEAR_LOADED'; payload: boolean }
  | { type: 'RESET_STATE' };

// Hook return type
export interface UseProfileDataReturn {
  loadingState: LoadingState;
  user: User | null;
  profile: UserProfileState;
  stats: UserStats;
  catches: PostWithUser[];
  gearItems: FishingGearUI[];
  error: string | null;
  imagesLoaded: boolean;
  gearLoaded: boolean;
  refreshProfile: () => Promise<void>;
  updateCoverImage: (url: string) => void;
  loadEquipment: () => Promise<void>;
  updateDynamicCounts: (followersCount: number, followingCount: number) => void;
}

// Tab types
export type ProfileTab = 'catches' | 'gear';