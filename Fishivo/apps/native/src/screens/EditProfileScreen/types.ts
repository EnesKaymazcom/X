import type { User } from '@supabase/supabase-js';

// Loading state for better state management
export type LoadingState = 'idle' | 'loading' | 'saving' | 'error' | 'success';

// Upload state for images
export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

// Profile form data
export interface ProfileFormData {
  name: string;
  username: string;
  bio: string;
  location: string;
  country: string;
  countryCode: string;
  city: string;
  avatar_url: string | null;
  cover_image_url: string | null;
  phone: string;
  phoneCode: string;
  website: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  twitter_url: string;
  tiktok_url: string;
}

// Edit profile state
export interface EditProfileState {
  loadingState: LoadingState;
  avatarUploadState: UploadState;
  coverUploadState: UploadState;
  user: User | null;
  profile: ProfileFormData;
  error: string | null;
  validationErrors: Record<string, string>;
  imagesLoaded: boolean;
}

// Action types for reducer
export type EditProfileAction =
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'SET_AVATAR_UPLOAD'; payload: UploadState }
  | { type: 'SET_COVER_UPLOAD'; payload: UploadState }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROFILE'; payload: Partial<ProfileFormData> }
  | { type: 'UPDATE_PROFILE_FIELD'; field: keyof ProfileFormData; value: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VALIDATION_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_VALIDATION_ERROR'; field: string }
  | { type: 'SET_IMAGES_LOADED'; payload: boolean }
  | { type: 'RESET_STATE' };

// Hook return type
export interface UseEditProfileReturn {
  state: EditProfileState;
  updateField: (field: keyof ProfileFormData, value: string) => void;
  handleSave: () => Promise<boolean>;
  handleAvatarUpload: () => Promise<void>;
  handleCoverUpload: () => Promise<void>;
  handleAvatarDelete: () => Promise<void>;
  handleCoverDelete: () => Promise<void>;
  openSocialMediaLink: (platform: string, username: string) => Promise<void>;
}


// Social media platforms
export type SocialMediaPlatform = 
  | 'website' 
  | 'instagram' 
  | 'facebook' 
  | 'youtube' 
  | 'twitter' 
  | 'tiktok';