// Fish Feeding Types - Balık Beslenme Tipleri (Web ile Senkronize)
interface FeedingType {
  color: string;
  tr: string;
  en: string;
  description_tr: string;
  description_en: string;
}

export const feedingTypeMap: Record<string, FeedingType> = {
  'herbivore': {
    color: 'bg-green-100 text-green-800',
    tr: 'Otçul',
    en: 'Herbivore',
    description_tr: 'Bitkiler ile beslenir',
    description_en: 'Feeds on plants'
  },
  'carnivore': {
    color: 'bg-red-100 text-red-800',
    tr: 'Etçil',
    en: 'Carnivore',
    description_tr: 'Et ile beslenir',
    description_en: 'Feeds on meat'
  },
  'omnivore': {
    color: 'bg-orange-100 text-orange-800',
    tr: 'Hepçil',
    en: 'Omnivore',
    description_tr: 'Hem et hem bitki ile beslenir',
    description_en: 'Feeds on both plants and meat'
  },
  'piscivore': {
    color: 'bg-blue-100 text-blue-800',
    tr: 'Balıkçıl',
    en: 'Piscivore',
    description_tr: 'Balıklar ile beslenir',
    description_en: 'Feeds on fish'
  },
  'planktivore': {
    color: 'bg-cyan-100 text-cyan-800',
    tr: 'Planktonçul',
    en: 'Planktivore',
    description_tr: 'Plankton ile beslenir',
    description_en: 'Feeds on plankton'
  },
  'detritivore': {
    color: 'bg-amber-100 text-amber-800',
    tr: 'Çürükçül',
    en: 'Detritivore',
    description_tr: 'Organik atık ile beslenir',
    description_en: 'Feeds on organic debris'
  },
  'benthivore': {
    color: 'bg-purple-100 text-purple-800',
    tr: 'Dipçil',
    en: 'Benthivore',
    description_tr: 'Dip canlıları ile beslenir',
    description_en: 'Feeds on bottom-dwelling organisms'
  }
};

export function getFeedingType(code: string | null | undefined, locale: 'tr' | 'en' = 'en') {
  if (!code) return null;
  
  const feedingType = feedingTypeMap[code];
  if (!feedingType) return { 
    label: code, 
    description: code,
    color: 'bg-gray-100 text-gray-800' 
  };
  
  return {
    label: locale === 'tr' ? feedingType.tr : feedingType.en,
    description: locale === 'tr' ? feedingType.description_tr : feedingType.description_en,
    code: code,
    color: feedingType.color
  };
}

// Icon mapping for feeding types (React Native icon names)
export const feedingTypeIcons: Record<string, string> = {
  'herbivore': 'leaf',
  'carnivore': 'beef', // or 'meat' if available
  'omnivore': 'utensils',
  'piscivore': 'fish',
  'planktivore': 'droplet',
  'detritivore': 'recycle',
  'benthivore': 'anchor'
};