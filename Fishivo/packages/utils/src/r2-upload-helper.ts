/**
 * R2 Upload Helper - Cloudflare R2 için tutarlı klasör yapısı yönetimi
 */

export type UploadType = 'avatar' | 'cover' | 'post' | 'catch' | 'spot' | 'equipment';

export interface R2PathOptions {
  userId: string;
  type: UploadType;
  entityId?: string; // posts, catches, spots, equipment için
  filename?: string;
  includeTimestamp?: boolean;
}

/**
 * R2'de tutarlı klasör yapısı için path oluşturur
 * 
 * Klasör yapısı:
 * users/[user-id]/
 *   ├── profile/
 *   │   ├── avatar/
 *   │   └── cover/
 *   ├── posts/[post-id]/
 *   ├── catches/[catch-id]/
 *   ├── spots/[spot-id]/
 *   └── equipment/[equipment-id]/
 */
export function getR2Path(options: R2PathOptions): string {
  const { userId, type, entityId, filename, includeTimestamp = true } = options;
  
  if (!userId) {
    throw new Error('User ID is required for R2 path generation');
  }
  
  const basePath = `users/${userId}`;
  const timestamp = includeTimestamp ? Date.now() : '';
  
  switch (type) {
    case 'avatar': {
      const fileName = filename || `avatar${timestamp ? `_${timestamp}` : ''}.webp`;
      return `${basePath}/profile/avatar/${fileName}`;
    }
    
    case 'cover': {
      const fileName = filename || `cover${timestamp ? `_${timestamp}` : ''}.webp`;
      return `${basePath}/profile/cover/${fileName}`;
    }
    
    case 'post': {
      if (!entityId) {
        throw new Error('Post ID is required for post uploads');
      }
      const fileName = filename || `image${timestamp ? `_${timestamp}` : ''}.webp`;
      return `${basePath}/posts/${entityId}/${fileName}`;
    }
    
    case 'catch': {
      if (!entityId) {
        throw new Error('Catch ID is required for catch uploads');
      }
      const fileName = filename || `catch${timestamp ? `_${timestamp}` : ''}.webp`;
      return `${basePath}/catches/${entityId}/${fileName}`;
    }
    
    case 'spot': {
      if (!entityId) {
        throw new Error('Spot ID is required for spot uploads');
      }
      const fileName = filename || `spot${timestamp ? `_${timestamp}` : ''}.webp`;
      return `${basePath}/spots/${entityId}/${fileName}`;
    }
    
    case 'equipment': {
      if (!entityId) {
        throw new Error('Equipment ID is required for equipment uploads');
      }
      const fileName = filename || `equipment${timestamp ? `_${timestamp}` : ''}.webp`;
      return `${basePath}/equipment/${entityId}/${fileName}`;
    }
    
    default:
      throw new Error(`Unknown upload type: ${type}`);
  }
}

/**
 * R2 path'ten bilgileri parse eder
 */
export function parseR2Path(path: string): {
  userId?: string;
  type?: UploadType;
  entityId?: string;
  filename?: string;
} {
  const parts = path.split('/');
  
  if (parts[0] !== 'users' || parts.length < 4) {
    return {};
  }
  
  const userId = parts[1];
  const category = parts[2];
  
  if (category === 'profile') {
    const subCategory = parts[3]; // avatar veya cover
    return {
      userId,
      type: subCategory as UploadType,
      filename: parts[4]
    };
  }
  
  // posts, catches, spots, equipment
  const typeMap: Record<string, UploadType> = {
    'posts': 'post',
    'catches': 'catch',
    'spots': 'spot',
    'equipment': 'equipment'
  };
  
  return {
    userId,
    type: typeMap[category],
    entityId: parts[3],
    filename: parts[4]
  };
}

/**
 * Farklı boyutlar için dosya adı oluşturur
 */
export function generateSizeVariants(basePath: string, sizes: string[]): Record<string, string> {
  const pathParts = basePath.split('/');
  const filename = pathParts.pop();
  
  if (!filename) {
    throw new Error('Invalid base path');
  }
  
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const extension = filename.split('.').pop() || 'webp';
  const directory = pathParts.join('/');
  
  const variants: Record<string, string> = {};
  
  sizes.forEach(size => {
    variants[size] = `${directory}/${nameWithoutExt}_${size}.${extension}`;
  });
  
  return variants;
}

/**
 * Public URL oluşturur
 */
export function generatePublicUrl(path: string, cdnUrl: string = 'https://images.fishivo.com'): string {
  // CDN URL'inin sonundaki slash'i temizle
  const cleanCdnUrl = cdnUrl.replace(/\/$/, '');
  // Path'in başındaki slash'i temizle
  const cleanPath = path.replace(/^\//, '');
  
  return `${cleanCdnUrl}/${cleanPath}`;
}

/**
 * Eski görselleri temizlemek için path listesi oluşturur
 */
export function getOldImagePaths(userId: string, type: UploadType, entityId?: string): string[] {
  const basePath = `users/${userId}`;
  
  switch (type) {
    case 'avatar':
      return [
        `${basePath}/profile/avatar/large.webp`,
        `${basePath}/profile/avatar/medium.webp`,
        `${basePath}/profile/avatar/small.webp`,
        `${basePath}/profile/avatar/thumbnail.webp`
      ];
    
    case 'cover':
      return [
        `${basePath}/profile/cover/original.webp`,
        `${basePath}/profile/cover/large.webp`,
        `${basePath}/profile/cover/medium.webp`
      ];
    
    case 'post':
    case 'catch':
    case 'spot':
    case 'equipment':
      if (!entityId) {
        return [];
      }
      // Entity bazlı temizleme için tüm klasörü hedefle
      return [`${basePath}/${type}s/${entityId}/`];
    
    default:
      return [];
  }
}

/**
 * Dosya boyutu validasyonu
 */
export function validateFileSize(sizeInBytes: number, type: UploadType): { valid: boolean; maxSize: number; error?: string } {
  const maxSizes: Record<UploadType, number> = {
    avatar: 5 * 1024 * 1024,     // 5MB
    cover: 10 * 1024 * 1024,     // 10MB
    post: 10 * 1024 * 1024,      // 10MB
    catch: 10 * 1024 * 1024,     // 10MB
    spot: 10 * 1024 * 1024,      // 10MB
    equipment: 5 * 1024 * 1024   // 5MB
  };
  
  const maxSize = maxSizes[type];
  const valid = sizeInBytes <= maxSize;
  
  return {
    valid,
    maxSize,
    error: valid ? undefined : `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
  };
}

/**
 * Dosya tipi validasyonu
 */
export function validateFileType(mimeType: string): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  ];
  
  const valid = allowedTypes.includes(mimeType.toLowerCase());
  
  return {
    valid,
    error: valid ? undefined : `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
  };
}