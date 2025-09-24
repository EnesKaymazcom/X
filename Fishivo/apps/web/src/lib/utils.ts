import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR');
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('tr-TR');
};

export const formatDateWithTimezone = (
  timestamp: number, 
  timezone: number, 
  format: 'short' | 'long' = 'short'
): string => {
  const date = new Date((timestamp + timezone) * 1000);
  if (format === 'long') {
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  return date.toLocaleDateString('tr-TR');
};

// Username validation
export const isUsernameValid = (username: string): boolean => {
  if (!username || username.length < 3 || username.length > 20) {
    return false;
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

// Conservation status utilities
export interface ConservationStatusInfo {
  code: string
  label: {
    tr: string
    en: string
  }
  description: {
    tr: string
    en: string
  }
  color: string
  bgColor: string
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' | 'unknown'
}

const CONSERVATION_STATUS_MAP: Record<string, ConservationStatusInfo> = {
  LC: {
    code: 'LC',
    label: { tr: 'Asgari Endişe Altındaki Tür', en: 'Least Concern' },
    description: { tr: 'Yaygın bulunan türler', en: 'Widespread and abundant taxa' },
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    riskLevel: 'safe'
  },
  NT: {
    code: 'NT',
    label: { tr: 'Neredeyse Tehdit Altındaki Tür', en: 'Near Threatened' },
    description: { tr: 'Yakın gelecekte tehdit altına girmeye aday türler', en: 'Close to qualifying for threatened category' },
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
    riskLevel: 'low'
  },
  VU: {
    code: 'VU',
    label: { tr: 'Hassas Tür', en: 'Vulnerable' },
    description: { tr: 'Soyu tükenme tehlikesi büyük olan türler', en: 'High risk of extinction in the wild' },
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    riskLevel: 'medium'
  },
  EN: {
    code: 'EN',
    label: { tr: 'Tehlikedeki Tür', en: 'Endangered' },
    description: { tr: 'Soyu tükenme tehlikesi çok büyük olan türler', en: 'Very high risk of extinction' },
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    riskLevel: 'high'
  },
  CR: {
    code: 'CR',
    label: { tr: 'Kritik Tehlikedeki Tür', en: 'Critically Endangered' },
    description: { tr: 'Soyu tükenme tehlikesi had safhada olan türler', en: 'Extremely high risk of extinction' },
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    riskLevel: 'critical'
  },
  DD: {
    code: 'DD',
    label: { tr: 'Durumu Belirsiz Tür', en: 'Data Deficient' },
    description: { tr: 'Yeterli bilgi bulunmayan türler', en: 'Inadequate information' },
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    riskLevel: 'unknown'
  }
};

export function getConservationStatusInfo(code: string): ConservationStatusInfo | null {
  const upperCode = code?.toUpperCase();
  return CONSERVATION_STATUS_MAP[upperCode] || null;
}

export function getConservationStatusBadgeProps(code: string, locale: 'tr' | 'en' = 'tr') {
  const info = getConservationStatusInfo(code);
  
  if (!info) {
    return {
      variant: 'outline' as const,
      className: 'text-gray-700 border-gray-400',
      children: code || 'Bilinmiyor'
    };
  }

  return {
    variant: 'outline' as const,
    className: `${info.color} border-current`,
    children: info.label[locale]
  };
}

export function getConservationStatusTooltip(code: string, locale: 'tr' | 'en' = 'tr'): string {
  const info = getConservationStatusInfo(code);
  return info ? info.description[locale] : 'Bilinmiyor';
}

export function getAllConservationStatuses() {
  return Object.values(CONSERVATION_STATUS_MAP);
}

// Environment constants
export const OPENWEATHERMAP_TOKEN = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || '';

// IP-based geolocation (fallback for user location)
export async function getIPLocation(): Promise<{ longitude: number; latitude: number; zoom: number }> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    if (data.latitude && data.longitude) {
      return { 
        latitude: data.latitude, 
        longitude: data.longitude,
        zoom: 10 // City level zoom
      };
    }
  } catch (error) {
    console.warn('IP location failed:', error);
  }
  // Eğer IP lokasyonu alınamazsa, dünya görünümü
  return { 
    latitude: 0, 
    longitude: 0,
    zoom: 2 // Dünya görünümü
  };
}

// SEO utilities
export const createSeoFriendlyFilename = (commonName: string, scientificName?: string, originalFilename?: string): string => {
  // Combine names for SEO
  const parts = [commonName, scientificName].filter(Boolean);
  const baseName = parts.join('-');
  
  // Get extension from original filename if provided
  const extension = originalFilename ? 
    originalFilename.split('.').pop()?.toLowerCase() || 'jpg' : 
    'jpg';
  
  // Create clean filename
  const cleanName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Add timestamp for uniqueness
  const timestamp = Date.now();
  
  return `${cleanName}-${timestamp}.${extension}`;
};

export const createEquipmentFilename = (name: string, originalFilename?: string): string => {
  return createSeoFriendlyFilename(name, undefined, originalFilename);
};

// Array sanitizers
export const sanitizeStringArray = (arr: string[] | null | undefined): string[] => {
  // Eğer array değilse boş array döndür
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.filter(item => typeof item === 'string' && item.trim().length > 0);
};

interface FishSpeciesArrayData {
  habitats?: string[] | null;
  feedingTypes?: string[] | null;
  feeding_types?: string[] | null;
  common_names_tr?: string[] | null;
  common_names_en?: string[] | null;
  [key: string]: string[] | null | undefined;
}

export const sanitizeFishSpeciesArrays = (data: FishSpeciesArrayData) => {
  return {
    ...data,
    habitats: sanitizeStringArray(data.habitats || []),
    feedingTypes: sanitizeStringArray(data.feedingTypes || data.feeding_types || [])
  };
};