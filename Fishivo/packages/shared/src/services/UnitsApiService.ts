// UnitsApiService.ts - Unit conversion and management service
// Adapted for TurboRepo structure

export interface UnitCategory {
  id: string;
  name: string;
  name_en: string;
  description: string;
  icon: string;
  base_unit: string;
  sort_order: number;
  is_active: boolean;
}

export interface UnitDefinition {
  id: string;
  category_id: string;
  name: string;
  name_en: string;
  symbol: string;
  is_base_unit: boolean;
  conversion_factor?: number;
  conversion_formula?: string;
  reverse_formula?: string;
  precision_digits: number;
  min_value?: number;
  max_value?: number;
  regions: string[];
  popularity: number;
  default_for_regions: string[];
  use_case?: string;
  sort_order: number;
  is_active: boolean;
}

export interface ConversionResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  category: string;
  cached: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

interface ConversionResponse {
  success: boolean;
  data: {
    value: number;
    unit: string;
    originalValue: number;
    originalUnit: string;
  };
  error?: string;
}

// TODO: Import from config when available
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export class UnitsApiService {
  private static cache: Map<string, any> = new Map();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private baseURL = API_BASE_URL;

  /**
   * Get all unit categories from backend
   */
  static async getCategories(): Promise<UnitCategory[]> {
    try {
      const cacheKey = 'categories';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${API_BASE_URL}/api/units/categories`);
      const result: ApiResponse<UnitCategory[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch categories');
      }

      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('UnitsApiService.getCategories error:', error);
      // Fallback to empty array, UI should handle gracefully
      return [];
    }
  }

  /**
   * Get units for a specific category
   */
  static async getUnitsForCategory(categoryId: string): Promise<UnitDefinition[]> {
    try {
      const cacheKey = `category_${categoryId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${API_BASE_URL}/api/units/category/${categoryId}`);
      const result: ApiResponse<UnitDefinition[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || `Failed to fetch units for ${categoryId}`);
      }

      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error(`UnitsApiService.getUnitsForCategory(${categoryId}) error:`, error);
      return [];
    }
  }

  /**
   * Convert between units using backend
   */
  static async convertUnit(value: number, fromUnit: string, toUnit: string): Promise<number> {
    try {
      // Skip conversion if same unit
      if (fromUnit === toUnit) return value;

      const cacheKey = `convert_${value}_${fromUnit}_${toUnit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached.value;

      const response = await fetch(`${API_BASE_URL}/api/units/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value, fromUnit, toUnit })
      });

      const result: ApiResponse<ConversionResult> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Conversion failed');
      }

      // Cache for 1 hour (conversions don't change)
      this.setCache(cacheKey, result.data, 60 * 60 * 1000);
      return result.data.value;
    } catch (error) {
      console.error(`UnitsApiService.convertUnit(${value}, ${fromUnit}, ${toUnit}) error:`, error);
      // Return original value as fallback
      return value;
    }
  }

  /**
   * Get all units organized by category
   */
  static async getAllUnits(): Promise<Record<string, UnitDefinition[]>> {
    try {
      const categories = await this.getCategories();
      const allUnits: Record<string, UnitDefinition[]> = {};

      // Fetch units for each category in parallel
      const promises = categories.map(async (category) => {
        const units = await this.getUnitsForCategory(category.id);
        allUnits[category.id] = units;
      });

      await Promise.all(promises);
      return allUnits;
    } catch (error) {
      console.error('UnitsApiService.getAllUnits error:', error);
      return {};
    }
  }

  /**
   * Get base unit for a category
   */
  static async getBaseUnit(categoryId: string): Promise<string | null> {
    try {
      const categories = await this.getCategories();
      const category = categories.find(c => c.id === categoryId);
      return category?.base_unit || null;
    } catch (error) {
      console.error(`UnitsApiService.getBaseUnit(${categoryId}) error:`, error);
      return null;
    }
  }

  /**
   * Get unit definition by ID
   */
  static async getUnitDefinition(unitId: string): Promise<UnitDefinition | null> {
    try {
      const allUnits = await this.getAllUnits();
      
      for (const categoryUnits of Object.values(allUnits)) {
        const unit = categoryUnits.find(u => u.id === unitId);
        if (unit) return unit;
      }
      
      return null;
    } catch (error) {
      console.error(`UnitsApiService.getUnitDefinition(${unitId}) error:`, error);
      return null;
    }
  }

  /**
   * Convert to base unit (for storage)
   */
  static async convertToBaseUnit(value: number, fromUnit: string, category: string): Promise<number> {
    try {
      const baseUnit = await this.getBaseUnit(category);
      if (!baseUnit) throw new Error(`No base unit found for category: ${category}`);
      
      return await this.convertUnit(value, fromUnit, baseUnit);
    } catch (error) {
      console.error(`UnitsApiService.convertToBaseUnit error:`, error);
      return value;
    }
  }

  /**
   * Convert from base unit (for display)
   */
  static async convertFromBaseUnit(value: number, category: string, toUnit: string): Promise<number> {
    try {
      const baseUnit = await this.getBaseUnit(category);
      if (!baseUnit) throw new Error(`No base unit found for category: ${category}`);
      
      return await this.convertUnit(value, baseUnit, toUnit);
    } catch (error) {
      console.error(`UnitsApiService.convertFromBaseUnit error:`, error);
      return value;
    }
  }

  /**
   * Clear all cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Cache helper methods
   */
  private static getFromCache(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  private static setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Convert weight units
   */
  async convertWeight(value: number, fromUnit: string, toUnit: string): Promise<ConversionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/units/convert/weight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value,
          fromUnit,
          toUnit,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Weight conversion error:', error);
      return {
        success: false,
        data: {
          value,
          unit: fromUnit,
          originalValue: value,
          originalUnit: fromUnit,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Convert length units
   */
  async convertLength(value: number, fromUnit: string, toUnit: string): Promise<ConversionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/units/convert/length`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value,
          fromUnit,
          toUnit,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Length conversion error:', error);
      return {
        success: false,
        data: {
          value,
          unit: fromUnit,
          originalValue: value,
          originalUnit: fromUnit,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const unitsApiService = new UnitsApiService();
export default unitsApiService;