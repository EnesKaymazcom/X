import { z } from 'zod';

export const createSpotSchema = z.object({
  name: z.string()
    .min(3, 'Spot adı en az 3 karakter olmalıdır')
    .max(100, 'Spot adı en fazla 100 karakter olabilir')
    .trim(),
  
  description: z.string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional(),
  
  location: z.string()
    .min(1, 'Konum seçimi zorunludur'),
  
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]),
  
  depth: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 1000;
    }, 'Derinlik 0-1000 arasında bir sayı olmalıdır'),
  
  waterType: z.enum(['freshwater', 'saltwater']),
  
  isPrivate: z.boolean(),
  
  imageUri: z.string().url().optional().or(z.string().startsWith('file://').optional()),
});

export type CreateSpotFormData = z.infer<typeof createSpotSchema>;

// Spot update schema
export const updateSpotSchema = createSpotSchema.partial();

export type UpdateSpotFormData = z.infer<typeof updateSpotSchema>;

// Spot filters schema
export const spotFiltersSchema = z.object({
  waterType: z.enum(['freshwater', 'saltwater']).optional(),
  spotType: z.enum(['shore', 'boat', 'pier', 'rock', 'river', 'lake']).optional(),
  radius: z.number().min(1).max(500).optional(), // km
  userLocation: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]).optional(),
  onlyPopular: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  search: z.string().optional(),
});

export type SpotFilters = z.infer<typeof spotFiltersSchema>;