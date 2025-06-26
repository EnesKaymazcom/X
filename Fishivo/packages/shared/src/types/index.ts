// Export all types
export * from './navigation';

// API types
export * from './api';

// Units types
export * from './units';

// User types (with explicit exports to avoid conflicts)
export type {
  User as UserType,
  UserProfile,
  UpdateProfileData,
  UserPreferences,
  UserStats,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  GoogleAuthCredentials
} from './user';

// Fishing types (with explicit exports to avoid conflicts)
export type {
  FishSpecies,
  FishingLocation,
  CatchRecord as FishingCatchRecord,
  Equipment as FishingEquipment,
  FishingTechnique as FishingTechniqueType
} from './fishing';