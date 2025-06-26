// Storage interface to avoid React Native dependency in shared package
interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Storage implementation will be injected from the mobile app
let storage: StorageInterface | null = null;

export const setStorageAdapter = (storageAdapter: StorageInterface) => {
  storage = storageAdapter;
};

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface Post {
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

class ApiService {
  private autoDetectedIP: string | null = null;
  private baseURL: string;

  constructor(baseURL?: string) {
    // Use provided baseURL or default from environment
    this.baseURL = baseURL || process.env.API_BASE_URL || 'http://localhost:3000';
    this.initializeIPDetection();
  }

  private async initializeIPDetection() {
    // Simplified for minimal implementation
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      if (!storage) {
        console.warn('Storage adapter not set. Call setStorageAdapter() first.');
        return null;
      }
      return await storage.getItem('userToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Token management methods for AuthContext
  async getToken(): Promise<string | null> {
    return this.getAuthToken();
  }

  async setToken(token: string): Promise<void> {
    try {
      if (!storage) {
        throw new Error('Storage adapter not set. Call setStorageAdapter() first.');
      }
      await storage.setItem('userToken', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
      throw error;
    }
  }

  async removeToken(): Promise<void> {
    try {
      if (!storage) {
        console.warn('Storage adapter not set. Call setStorageAdapter() first.');
        return;
      }
      await storage.removeItem('userToken');
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest<any>('/api/users/me');
      return response;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
        ...((options.headers as { [key: string]: string }) || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log(`🔐 API: Using token for ${endpoint}:`, token.substring(0, 20) + '...');
      } else {
        console.log(`⚠️ API: No token available for ${endpoint}`);
      }

      // Ensure endpoint starts with a slash
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      // Build the full URL
      const url = `${this.baseURL}${normalizedEndpoint}`;
      console.log(`🌐 API Request: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📡 API Response Status: ${response.status} for ${endpoint}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log(`❌ API Error Data:`, errorData);
        throw new Error(errorData?.error || `HTTP ${response.status}`);
      }

      const responseText = await response.text();
      try {
        console.log(`📄 RAW API Response for ${endpoint}:`, responseText);
        const result = JSON.parse(responseText);
        console.log(`✅ API Response: ${endpoint}`, {
          success: result.success,
          dataType: typeof result.data,
          hasData: !!result.data
        });
        return result;
      } catch (e) {
        console.error(`❌ API JSON Parse Error [${endpoint}]:`, e);
        console.error(`📄 Faulty JSON string:`, responseText);
        throw new Error('Failed to parse JSON response from server.');
      }
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Generic POST helper
  public async post<T>(endpoint: string, body: any, extraOptions: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...extraOptions,
    });
  }

  // 🎣 Catches API - Ana balık avları endpoint'i
  async getCatches(page = 1, limit = 10, filters?: {
    userId?: string;
    spotId?: number;
    tripId?: number;
  }): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.userId) params.append('user_id', filters.userId);
    if (filters?.spotId) params.append('spot_id', filters.spotId.toString());
    if (filters?.tripId) params.append('trip_id', filters.tripId.toString());

    const response = await this.makeRequest<PaginatedResponse<Post>>(
      `/api/posts?${params.toString()}`
    );
    
    return response.data;
  }

  // 🔄 Geriye uyumluluk için
  async getPosts(page = 1, limit = 10, filters?: {
    userId?: string;
    spotId?: number;
    tripId?: number;
  }): Promise<PaginatedResponse<Post>> {
    return this.getCatches(page, limit, filters);
  }

  async getPostById(postId: number): Promise<Post> {
    const response = await this.makeRequest<Post>(`/api/posts/${postId}`);
    return response.data;
  }

  async createPost(postData: {
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
  }): Promise<Post> {
    const response = await this.makeRequest<Post>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
    return response.data;
  }

  // Helper function for retry logic
  private async withRetry<T>(
    operation: () => Promise<T>,
    retries = 3,
    delay = 500
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries <= 0) throw error;
      
      console.log(`Retrying API operation. Attempts remaining: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.withRetry(operation, retries - 1, delay * 1.5);
    }
  }

  /**
   * Enhanced like operations with optimistic updates and retry logic
   */
  private likeOperations = {
    /**
     * Check if the current user has liked a post
     */
    isPostLiked: async (postId: number): Promise<boolean> => {
      try {
        const response = await this.withRetry(() => 
          this.makeRequest<{ liked: boolean; postId: number; userId: string }>(`/api/posts/${postId}/like`)
        );
        return response.data?.liked || false;
      } catch (error) {
        console.error('Error checking like status:', error);
        return false;
      }
    },

    /**
     * Toggle like status for a post
     */
    toggleLike: async (postId: number): Promise<{ liked: boolean; likesCount: number }> => {
      try {
        const response = await this.withRetry(() => 
          this.makeRequest<{ liked: boolean; likesCount: number }>(`/api/posts/${postId}/like`, {
            method: 'POST'
          })
        );
        return response.data;
      } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
      }
    },

    /**
     * Get list of users who liked a post
     */
    getLikers: async (postId: number): Promise<any[]> => {
      try {
        const response = await this.withRetry(() => 
          this.makeRequest<any[]>(`/api/posts/${postId}/likers`)
        );
        return response.data || [];
      } catch (error) {
        console.error('Error fetching likers:', error);
        return [];
      }
    }
  };

  // Expose like operations
  async isPostLiked(postId: number): Promise<boolean> {
    return this.likeOperations.isPostLiked(postId);
  }

  async toggleLike(postId: number): Promise<{ liked: boolean; likesCount: number }> {
    return this.likeOperations.toggleLike(postId);
  }

  async getLikers(postId: number): Promise<any[]> {
    return this.likeOperations.getLikers(postId);
  }

  // Comments API
  async getComments(postId: number): Promise<any[]> {
    const response = await this.makeRequest<any[]>(`/api/posts/${postId}/comments`);
    return response.data;
  }

  async addComment(postId: number, content: string): Promise<any> {
    const response = await this.makeRequest<any>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response.data;
  }

  // User API
  async getUserProfile(userId: string): Promise<any> {
    const response = await this.makeRequest<any>(`/api/users/${userId}`);
    return response.data;
  }

  async updateProfile(profileData: any): Promise<any> {
    const response = await this.makeRequest<any>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data;
  }

  // Follow/Unfollow API
  async followUser(userId: string): Promise<void> {
    await this.makeRequest(`/api/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string): Promise<void> {
    await this.makeRequest(`/api/users/${userId}/unfollow`, {
      method: 'POST',
    });
  }

  async getFollowers(userId: string): Promise<any[]> {
    const response = await this.makeRequest<any[]>(`/api/users/${userId}/followers`);
    return response.data;
  }

  async getFollowing(userId: string): Promise<any[]> {
    const response = await this.makeRequest<any[]>(`/api/users/${userId}/following`);
    return response.data;
  }

  // Fish Species API
  async getFishSpecies(): Promise<any[]> {
    const response = await this.makeRequest<any[]>('/api/fish-species');
    return response.data;
  }

  async searchFishSpecies(query: string): Promise<any[]> {
    const response = await this.makeRequest<any[]>(`/api/fish-species/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Weather API
  async getWeather(lat: number, lon: number): Promise<any> {
    const response = await this.makeRequest<any>(`/api/weather?lat=${lat}&lon=${lon}`);
    return response.data;
  }

  async getLocationName(lat: number, lon: number): Promise<any> {
    const response = await this.makeRequest<any>(`/api/weather/reverse-geocode?lat=${lat}&lon=${lon}`);
    return response.data;
  }

  // Equipment/Gear API
  async getGearDatabase(page = 1, limit = 50, category?: string): Promise<any> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (category) params.append('category', category);

    const response = await this.makeRequest<any>(`/api/equipment?${params.toString()}`);
    return response.data;
  }

  async getEquipmentCategories(): Promise<any> {
    const response = await this.makeRequest<any>('/api/equipment/categories');
    return response.data;
  }

  async getEquipment(): Promise<any[]> {
    try {
      const response = await this.makeRequest<any[]>('/api/equipment');
      return response.data || [];
    } catch (error) {
      console.error('Error getting equipment:', error);
      return [];
    }
  }

  async getNotifications(): Promise<any[]> {
    try {
      const response = await this.makeRequest<any[]>('/api/notifications');
      return response.data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // User catches API
  async getUserCatches(userId: string): Promise<ApiResponse<any>> {
    const response = await this.makeRequest<any>(`/api/users/${userId}/catches`);
    return response;
  }

  // Fishing Techniques API
  async getFishingTechniques(): Promise<any[]> {
    const response = await this.makeRequest<any[]>('/api/techniques');
    return response.data;
  }

  async searchFishingTechniques(query: string): Promise<any[]> {
    const response = await this.makeRequest<any[]>(`/api/techniques/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getFishingTechniqueById(id: number): Promise<any> {
    const response = await this.makeRequest<any>(`/api/techniques/${id}`);
    return response.data;
  }

  // User Locations API
  async getUserLocations(): Promise<any[]> {
    try {
      console.log('🗺️ API: Fetching user locations...');
      const response = await this.makeRequest<any[]>('/api/users/me/locations');
      console.log(`✅ API: Fetched ${response.data?.length || 0} user locations`);
      return response.data || [];
    } catch (error) {
      console.error('❌ API Error [getUserLocations]:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }

  /* 🚫 Hesap yönetimi */
  async deactivateAccount(): Promise<void> {
    await this.makeRequest('/api/users/me/deactivate', {
      method: 'PUT'
    });
  }

  // Fish species methods
  async getSpecies(): Promise<Array<{ id: number; name: string; }>> {
    const response = await this.makeRequest<Array<{ id: number; name: string; }>>('/api/species');
    return response.data;
  }

  // Spots methods
  async getSpots(): Promise<Array<{ id: number; name: string; latitude: number; longitude: number; }>> {
    const response = await this.makeRequest<Array<{ id: number; name: string; latitude: number; longitude: number; }>>('/api/spots');
    return response.data;
  }

  // Follow methods
  async isFollowing(userId: string): Promise<boolean> {
    const response = await this.makeRequest<{ isFollowing: boolean }>(`/api/users/${userId}/follow-status`);
    return response.data.isFollowing;
  }
}

// Export a singleton instance
export const apiService = new ApiService();
export type { Post, ApiResponse, PaginatedResponse };
export { ApiService };