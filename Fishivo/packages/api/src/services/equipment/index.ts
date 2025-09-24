export interface Equipment {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  sku?: string;
  price_range?: {
    min: number;
    max: number;
    currency: string;
  };
  specifications?: any;
  suitable_for?: any;
  fishing_type?: string[];
  difficulty_level?: string;
  image_url?: string;
  images?: string[];
  description?: string;
  features?: string[];
  drawbacks?: string[];
  user_rating?: number;
  rating_count?: number;
  review_count?: number;
  status?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  purchase_date?: string;
  price?: number;
  notes?: string;
  imageUrl?: string;
}

export interface CreateEquipmentDto {
  name: string;
  category: Equipment['category'];
  brand?: string;
  model?: string;
  condition: Equipment['condition'];
  purchase_date?: string;
  price?: number;
  notes?: string;
  imageUrl?: string;
}

export interface UpdateEquipmentDto extends Partial<CreateEquipmentDto> {}

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

export interface EquipmentService {
  getUserEquipment(userId: string): Promise<Equipment[]>;
  getEquipment?(filters?: EquipmentFilters): Promise<EquipmentListResponse>;
  getEquipmentById(id: string): Promise<Equipment | null>;
  getEquipmentBySlug?(slug: string): Promise<Equipment | null>;
  searchEquipment?(query: string, limit?: number): Promise<Equipment[]>;
  createEquipment(userId: string, data: CreateEquipmentDto): Promise<Equipment>;
  updateEquipment(id: string, data: UpdateEquipmentDto): Promise<Equipment>;
  deleteEquipment(id: string): Promise<boolean>;
  createSlug?(name: string): string;
}

export { createNativeEquipmentService } from './equipment.native';
export { createWebEquipmentService } from './equipment.web';