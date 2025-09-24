import { createSupabaseBrowserClient } from '@fishivo/api/client/supabase.web';
import type { Equipment, CreateEquipmentDto, UpdateEquipmentDto, EquipmentService } from './index';

export interface EquipmentFilters {
  search?: string;
  category?: string;
  brand?: string;
  is_featured?: boolean;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export interface EquipmentListResponse {
  data: Equipment[];
  count: number;
}

export const createWebEquipmentService = () => {
  const supabase = createSupabaseBrowserClient();

  const service = {
    async getUserEquipment(userId: string): Promise<Equipment[]> {
      // Bu method artık kullanıcının kendi ekipmanlarını değil,
      // tüm equipment tablosundaki ürünleri döndürecek
      const { data } = await service.getEquipment();
      return data;
    },

    async getEquipment(filters?: EquipmentFilters): Promise<EquipmentListResponse> {
      try {
        let query = supabase
          .from('equipment')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        // Apply filters
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          query = query.or(
            `name.ilike.%${searchLower}%,brand.ilike.%${searchLower}%,model.ilike.%${searchLower}%,category.ilike.%${searchLower}%`
          );
        }

        if (filters?.category) {
          query = query.eq('category', filters.category);
        }

        if (filters?.brand) {
          query = query.eq('brand', filters.brand);
        }

        if (filters?.is_featured !== undefined) {
          query = query.eq('is_featured', filters.is_featured);
        }

        if (filters?.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }

        if (filters?.limit) {
          query = query.limit(filters.limit);
        }

        if (filters?.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }

        const { data, error, count } = await query;

        if (error) {
          throw new Error(error.message);
        }

        return {
          data: data || [],
          count: count || 0
        };
      } catch (error) {
        throw error;
      }
    },

    async getEquipmentById(id: string): Promise<Equipment | null> {
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Not found
          }
          throw new Error(error.message);
        }

        return data;
      } catch (error) {
        throw error;
      }
    },

    async getEquipmentBySlug(slug: string): Promise<Equipment | null> {
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Not found
          }
          throw new Error(error.message);
        }

        return data;
      } catch (error) {
        throw error;
      }
    },

    async searchEquipment(query: string, limit: number = 10): Promise<Equipment[]> {
      try {
        const searchLower = query.toLowerCase();
        
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .or(
            `name.ilike.%${searchLower}%,brand.ilike.%${searchLower}%,model.ilike.%${searchLower}%,category.ilike.%${searchLower}%`
          )
          .limit(limit)
          .order('name');

        if (error) {
          throw new Error(error.message);
        }

        return data || [];
      } catch (error) {
        throw error;
      }
    },

    async createEquipment(userId: string, data: CreateEquipmentDto): Promise<Equipment> {
      try {
        const { data: equipment, error } = await supabase
          .from('equipment')
          .insert({
            ...data,
            created_by: userId,
            slug: service.createSlug(data.name),
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;

        return equipment;
      } catch (error) {
        throw error;
      }
    },

    async updateEquipment(id: string, data: UpdateEquipmentDto): Promise<Equipment> {
      try {
        // Eğer isim değişiyorsa slug'ı da güncelle
        let updateData: any = { ...data };
        if (data.name) {
          updateData.slug = service.createSlug(data.name);
        }

        const { data: equipment, error } = await supabase
          .from('equipment')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return equipment;
      } catch (error) {
        throw error;
      }
    },

    async deleteEquipment(id: string): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('equipment')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return true;
      } catch (error) {
        return false;
      }
    },

    // Helper method to create URL-friendly slug
    createSlug(name: string): string {
      return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
    }
  };
  
  return service;
};

// Export singleton instance
export const equipmentServiceWeb = new (class EquipmentServiceWeb implements EquipmentService {
  async getUserEquipment(userId: string): Promise<Equipment[]> {
    const service = createWebEquipmentService();
    return service.getUserEquipment(userId);
  }

  async getEquipment(filters?: EquipmentFilters): Promise<EquipmentListResponse> {
    const service = createWebEquipmentService();
    return service.getEquipment(filters);
  }

  async getEquipmentById(id: string): Promise<Equipment | null> {
    const service = createWebEquipmentService();
    return service.getEquipmentById(id);
  }

  async getEquipmentBySlug(slug: string): Promise<Equipment | null> {
    const service = createWebEquipmentService();
    return service.getEquipmentBySlug(slug);
  }

  async searchEquipment(query: string, limit?: number): Promise<Equipment[]> {
    const service = createWebEquipmentService();
    return service.searchEquipment(query, limit);
  }

  async createEquipment(userId: string, data: CreateEquipmentDto): Promise<Equipment> {
    const service = createWebEquipmentService();
    return service.createEquipment(userId, data);
  }

  async updateEquipment(id: string, data: UpdateEquipmentDto): Promise<Equipment> {
    const service = createWebEquipmentService();
    return service.updateEquipment(id, data);
  }

  async deleteEquipment(id: string): Promise<boolean> {
    const service = createWebEquipmentService();
    return service.deleteEquipment(id);
  }
})();