import { createSupabaseBrowserClient } from '@fishivo/api/client/supabase.web';
import type { FishingTechnique } from '@fishivo/types';

export interface FishingTechniquesService {
  getAllFishingTechniques(): Promise<FishingTechnique[]>;
  getFishingTechniqueById(id: number): Promise<FishingTechnique | null>;
}

export const createWebFishingTechniquesService = (): FishingTechniquesService => {
  const supabase = createSupabaseBrowserClient();

  return {
    async getAllFishingTechniques(): Promise<FishingTechnique[]> {
      const { data, error } = await supabase
        .from('fishing_techniques')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching fishing techniques:', error);
        throw error;
      }

      return data || [];
    },

    async getFishingTechniqueById(id: number): Promise<FishingTechnique | null> {
      const { data, error } = await supabase
        .from('fishing_techniques')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching fishing technique:', error);
        return null;
      }

      return data;
    }
  };
};