// Fish Species types
export interface FishSpecies {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  postCount: number;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  season: string;
  image: string;
  minWeight?: number;
  maxWeight?: number;
  averageLength?: number;
  habitat?: string;
  baitTypes?: string[];
  bestTimeOfDay?: string[];
  waterDepth?: string;
}

// Fishing Location types
export interface FishingLocation {
  id: string;
  name: string;
  region: string;
  depth: string;
  coordinates: [number, number];
  image: string;
  waterType: 'saltwater' | 'freshwater';
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  rating: number;
  fishSpecies: string[];
  bestSeasons: string[];
  facilities: string[];
  description: string;
  tips: string[];
  catchesCount: number;
  averageCatchWeight: number;
  bestTechniques: string[];
}

// Catch Record types
export interface CatchRecord {
  id: string;
  userId: string;
  species: string;
  weight: string;
  length?: string;
  date: string;
  location: string;
  photo: string;
  images: string[];
  equipmentDetails: Equipment[];
  notes?: string;
}

// Equipment types
export interface Equipment {
  id: string;
  name: string;
  category: string;
  brand: string;
  icon: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

// Fishing Technique types
export interface FishingTechnique {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  bestFor: string[];
  equipment: string[];
  waterTypes: string[];
  season: string;
  tips: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}