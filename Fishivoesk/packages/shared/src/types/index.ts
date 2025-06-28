// Common types for Fishivo application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Fish {
  id: string;
  name: string;
  species: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  weight?: number;
  length?: number;
  image?: string;
  caughtBy: string; // User ID
  caughtAt: Date;
  description?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type FishingSpot = {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description?: string;
  rating: number;
  fishTypes: string[];
  createdBy: string; // User ID
  createdAt: Date;
};