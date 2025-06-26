// User types
export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isPro?: boolean;
  totalCatches: number;
  totalWeight: number;
  level: number;
  badges: string[];
  createdAt: string;
  updatedAt: string;
  bio?: string;
  location?: string;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  units: import('./units').UserUnits;
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showLocation: boolean;
    showStats: boolean;
  };
  notifications: {
    push: boolean;
    email: boolean;
    likes: boolean;
    comments: boolean;
    follows: boolean;
    catches: boolean;
  };
}

export interface UserStats {
  totalCatches: number;
  totalWeight: number;
  biggestCatch: {
    species: string;
    weight: number;
    date: string;
  };
  favoriteLocation: string;
  mostCaughtSpecies: string;
  averageCatchWeight: number;
  catchesThisMonth: number;
  catchesThisYear: number;
  level: number;
  experience: number;
  nextLevelExperience: number;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPro?: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface GoogleAuthCredentials {
  idToken: string;
  accessToken?: string;
}

// Profile types
export interface UserProfile extends User {
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isBlocked?: boolean;
  recentCatches: import('./fishing').CatchRecord[];
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    website?: string;
  };
}