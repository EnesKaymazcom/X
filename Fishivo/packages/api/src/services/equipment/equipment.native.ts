import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import type { Equipment, CreateEquipmentDto, UpdateEquipmentDto, EquipmentService } from './index';

export const createNativeEquipmentService = (): EquipmentService => {
  const supabase = getNativeSupabaseClient();

  return {
    async getUserEquipment(userId: string): Promise<Equipment[]> {
      try {
        // First try to get from users table equipments column
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('equipments')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          console.error('Error fetching user equipment:', userError);
          return [];
        }

        // If equipments is stored in JSONB column
        if (userData.equipments && Array.isArray(userData.equipments)) {
          return userData.equipments.map((item: any, index: number) => ({
            id: item.id || `equipment-${index}`,
            user_id: userId,
            name: item.name || 'Unknown Equipment',
            category: item.category || 'other',
            brand: item.brand,
            model: item.model,
            condition: item.condition || 'good',
            purchase_date: item.purchase_date,
            price: item.price,
            notes: item.notes,
            imageUrl: item.imageUrl || item.image_url,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at
          }));
        }

        return [];
      } catch (error) {
        console.error('Error in getUserEquipment:', error);
        return [];
      }
    },

    async getEquipmentById(id: string): Promise<Equipment | null> {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const equipment = await this.getUserEquipment(user.id);
        return equipment.find(item => item.id === id) || null;
      } catch (error) {
        console.error('Error in getEquipmentById:', error);
        return null;
      }
    },

    async createEquipment(userId: string, data: CreateEquipmentDto): Promise<Equipment> {
      try {
        // Get current equipment
        const currentEquipment = await this.getUserEquipment(userId);
        
        // Create new equipment item
        const newEquipment: Equipment = {
          id: `equipment-${Date.now()}`,
          user_id: userId,
          ...data,
          created_at: new Date().toISOString()
        };

        // Update user's equipments array
        const updatedEquipments = [...currentEquipment, newEquipment];
        
        const { error } = await supabase
          .from('users')
          .update({ equipments: updatedEquipments })
          .eq('id', userId);

        if (error) throw error;

        return newEquipment;
      } catch (error) {
        console.error('Error in createEquipment:', error);
        throw error;
      }
    },

    async updateEquipment(id: string, data: UpdateEquipmentDto): Promise<Equipment> {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const currentEquipment = await this.getUserEquipment(user.id);
        const equipmentIndex = currentEquipment.findIndex(item => item.id === id);
        
        if (equipmentIndex === -1) {
          throw new Error('Equipment not found');
        }

        // Update equipment
        const updatedItem = {
          ...currentEquipment[equipmentIndex],
          ...data,
          updated_at: new Date().toISOString()
        };

        const updatedEquipments = [...currentEquipment];
        updatedEquipments[equipmentIndex] = updatedItem;

        const { error } = await supabase
          .from('users')
          .update({ equipments: updatedEquipments })
          .eq('id', user.id);

        if (error) throw error;

        return updatedItem;
      } catch (error) {
        console.error('Error in updateEquipment:', error);
        throw error;
      }
    },

    async deleteEquipment(id: string): Promise<boolean> {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const currentEquipment = await this.getUserEquipment(user.id);
        const updatedEquipments = currentEquipment.filter(item => item.id !== id);

        const { error } = await supabase
          .from('users')
          .update({ equipments: updatedEquipments })
          .eq('id', user.id);

        if (error) throw error;

        return true;
      } catch (error) {
        console.error('Error in deleteEquipment:', error);
        return false;
      }
    }
  };
};