// LEGACY: Original User interface (BACKWARD COMPATIBILITY)
// Keep this interface for existing code compatibility
export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// NEW: Extended User interface matching Supabase database schema
export interface FullUser {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  cover_image_url: string | null
  bio: string | null
  location: string | null
  country_code: string | null
  phone: string | null
  phone_code: string | null
  website: string | null
  privacy_settings: UserPrivacySettings | null
  notification_settings: UserNotificationSettings | null
  is_pro: boolean | null
  pro_until: string | null
  pro_features: ProFeatures | null
  role: string | null
  permissions: UserPermissions | null
  banned_until: string | null
  ban_reason: string | null
  equipments: UserEquipment[] | null
  created_at: string
  updated_at: string | null
  last_active_at: string | null
  provider: string | null
  google_id: string | null
  facebook_id: string | null
  apple_id: string | null
  instagram_url: string | null
  facebook_url: string | null
  youtube_url: string | null
  twitter_url: string | null
  tiktok_url: string | null
  is_active: boolean | null
  deleted_at: string | null
  language: string | null
  terms_accepted: boolean | null
  qr_code_id: string | null
  qr_code_image_url: string | null
  qr_code_generated_at: string | null
  qr_code_regenerated_count: number | null
  referral_code: string | null
  referred_by_id: string | null
  referral_count: number | null
  total_referral_rewards: number | null
  premium_until: string | null
  referral_created_at: string | null
}

// Form-compatible User Profile types
export interface UserProfileForm {
  firstName: string        // Form field (camelCase)
  lastName: string         // Form field (camelCase)
  email: string
  username: string
  bio?: string
  location?: string
  phone?: string
  website?: string
  instagram_url?: string
  facebook_url?: string
  youtube_url?: string
  twitter_url?: string
  tiktok_url?: string
  language?: string
}

export interface UserProfileUpdate {
  full_name?: string       // Database field (snake_case)
  bio?: string
  location?: string
  phone?: string
  phone_code?: string
  website?: string
  instagram_url?: string
  facebook_url?: string
  youtube_url?: string
  twitter_url?: string
  tiktok_url?: string
  avatar_url?: string
  language?: string
  updated_at?: string
}

// User Statistics
export interface UserStats {
  followers_count: number
  following_count: number
  catches_count: number
  spots_count: number
  posts_count?: number
  likes_received?: number
}

// User Settings
export interface UserPrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private'
  show_email: boolean
  show_phone: boolean
  show_location: boolean
  show_catches: boolean
  show_spots: boolean
  allow_messages: boolean
  allow_friend_requests: boolean
}

export interface UserNotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  friend_requests: boolean
  new_followers: boolean
  catch_likes: boolean
  catch_comments: boolean
  spot_updates: boolean
  weekly_digest: boolean
  marketing_emails: boolean
}

// Pro User Features
export interface ProFeatures {
  unlimited_spots: boolean
  advanced_weather: boolean
  priority_support: boolean
  custom_themes: boolean
  export_data: boolean
  analytics_dashboard: boolean
  ad_free: boolean
}

export interface ProSubscription {
  is_pro: boolean
  pro_until: string | null
  features: ProFeatures | null
  subscription_type: 'monthly' | 'yearly' | 'lifetime' | null
  payment_provider: string | null
  next_billing_date: string | null
}

// User Preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  units: 'metric' | 'imperial'
  timezone: string
  weather_location: string | null
  default_spot_visibility: 'public' | 'friends' | 'private'
  auto_save_drafts: boolean
}

// User Permissions
export interface UserPermissions {
  can_create_posts: boolean
  can_create_spots: boolean
  can_create_comments: boolean
  can_moderate: boolean
  can_access_admin: boolean
  can_manage_users: boolean
  can_manage_content: boolean
  can_view_analytics: boolean
}

// User Equipment
export interface UserEquipment {
  id: string
  user_id: string
  name: string
  type: 'rod' | 'reel' | 'line' | 'lure' | 'hook' | 'other'
  brand?: string
  model?: string
  description?: string
  image_url?: string
  is_favorite: boolean
  created_at: string
}

// Combined User Profile (for API responses)
export interface UserProfile extends FullUser {
  stats: UserStats
  privacy_settings: UserPrivacySettings
  notification_settings: UserNotificationSettings
  preferences: UserPreferences
  pro_subscription: ProSubscription
  equipment: UserEquipment[]
}

// Utility types for form handling
export type UserFormFields = keyof UserProfileForm
export type UserDbFields = keyof FullUser

// Helper function types
export interface UserHelpers {
  getDisplayName: (user: FullUser | User) => string
  getAvatarUrl: (user: FullUser | User) => string
  isProUser: (user: FullUser) => boolean
  getProExpiryDate: (user: FullUser) => Date | null
  formatUserLocation: (user: FullUser | User) => string
  getUserAge: (user: FullUser) => number | null
  isBanned: (user: FullUser) => boolean
  isActive: (user: FullUser) => boolean
}

// Type conversion helpers
export interface UserTransformers {
  // Convert form data (camelCase) to database format (snake_case)
  formToDb: (formData: UserProfileForm) => UserProfileUpdate
  // Convert database format to form format
  dbToForm: (userData: FullUser) => UserProfileForm
  // Convert legacy User to FullUser
  legacyToFull: (user: User) => Partial<FullUser>
  // Convert FullUser to legacy User (for backward compatibility)
  fullToLegacy: (user: FullUser) => User
}