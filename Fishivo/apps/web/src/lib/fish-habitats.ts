// Fish Habitat Types - Balık Yaşam Alanları
interface HabitatType {
  color: string;
  tr: string;
  en: string;
  description_tr: string;
  description_en: string;
  source: string; // Kaynak: FishBase, PMC vb.
}

export const habitatTypeMap: Record<string, HabitatType> = {
  'freshwater': {
    color: 'bg-green-100 text-green-800',
    tr: 'Tatlı Su',
    en: 'Freshwater',
    description_tr: 'Nehir, göl, akarsu içeren tatlı su sistemleri',
    description_en: 'Freshwater systems including rivers, lakes, and streams',
    source: 'FishBase'
  },
  'river': {
    color: 'bg-emerald-100 text-emerald-800',
    tr: 'Nehir',
    en: 'River',
    description_tr: 'Akarsu-odaklı tatlı su yaşam alanı',
    description_en: 'Stream-focused freshwater habitat',
    source: 'FishBase'
  },
  'lake': {
    color: 'bg-teal-100 text-teal-800',
    tr: 'Göl',
    en: 'Lake',
    description_tr: 'Göl-odaklı tatlı su yaşam alanı',
    description_en: 'Lake-focused freshwater habitat',
    source: 'FishBase'
  },
  'brackish': {
    color: 'bg-yellow-100 text-yellow-800',
    tr: 'Acı Su',
    en: 'Brackish',
    description_tr: 'Acısu (nehir-deniz geçişi, haliç vb.)',
    description_en: 'Brackish water (river-sea transition, estuaries etc.)',
    source: 'FishBase'
  },
  'reef-associated': {
    color: 'bg-orange-100 text-orange-800',
    tr: 'Resif İlişkili',
    en: 'Reef-associated',
    description_tr: 'Mercan resifleriyle ilişkili sığ denizler',
    description_en: 'Shallow seas associated with coral reefs',
    source: 'FishBase'
  },
  'pelagic-neritic': {
    color: 'bg-blue-100 text-blue-800',
    tr: 'Pelajik-Neritik',
    en: 'Pelagic-Neritic',
    description_tr: 'Kıta sahanlığı üzerindeki açık su katmanı',
    description_en: 'Open water layer above the continental shelf',
    source: 'FishBase'
  },
  'pelagic-oceanic': {
    color: 'bg-indigo-100 text-indigo-800',
    tr: 'Pelajik-Okyanus',
    en: 'Pelagic-Oceanic',
    description_tr: 'Açık okyanustaki üst su sütunu',
    description_en: 'Upper water column in the open ocean',
    source: 'FishBase'
  },
  'epipelagic': {
    color: 'bg-sky-100 text-sky-800',
    tr: 'Epipelajik',
    en: 'Epipelagic',
    description_tr: '0 – 200 m arası iyi aydınlanan üst okyanus bölgesi',
    description_en: 'Well-lit upper ocean zone between 0-200m',
    source: 'FishBase'
  },
  'benthopelagic': {
    color: 'bg-purple-100 text-purple-800',
    tr: 'Bentopelajik',
    en: 'Benthopelagic',
    description_tr: 'Hem dip hem açık su arasında beslenen türler',
    description_en: 'Species feeding between bottom and open water',
    source: 'FishBase'
  },
  'demersal': {
    color: 'bg-amber-100 text-amber-800',
    tr: 'Demersal',
    en: 'Demersal',
    description_tr: '< 200 m\'de deniz tabanı yakınında yaşayan türler',
    description_en: 'Species living near the seabed at depths < 200m',
    source: 'FishBase'
  },
  'bathydemersal': {
    color: 'bg-gray-600 text-gray-100',
    tr: 'Batidemersal',
    en: 'Bathydemersal',
    description_tr: '> 200 m derinlikte taban yakınında yaşayan türler',
    description_en: 'Species living near the bottom at depths > 200m',
    source: 'FishBase'
  },
  'bathypelagic': {
    color: 'bg-gray-700 text-gray-100',
    tr: 'Batipelajik',
    en: 'Bathypelagic',
    description_tr: '1000-4000 m arası derin okyanus bölgesi',
    description_en: 'Deep ocean zone between 1000-4000m',
    source: 'FishBase'
  }
};

export function getHabitatType(code: string | null | undefined, locale: 'tr' | 'en' = 'en') {
  if (!code) return null;
  
  const habitat = habitatTypeMap[code];
  if (!habitat) return { 
    label: code, 
    description: code,
    color: 'bg-gray-100 text-gray-800' 
  };
  
  return {
    label: locale === 'tr' ? habitat.tr : habitat.en,
    description: locale === 'tr' ? habitat.description_tr : habitat.description_en,
    code: code,
    color: habitat.color,
    source: habitat.source
  };
}

// Habitat grupları - benzer habitatları gruplamak için
export const habitatGroups = {
  freshwater: ['freshwater', 'river', 'lake'],
  marine: ['reef-associated', 'pelagic-neritic', 'pelagic-oceanic', 'epipelagic'],
  deepwater: ['benthopelagic', 'demersal', 'bathydemersal', 'bathypelagic'],
  transition: ['brackish']
};

// Eski sistem uyumluluğu için mapping
export const legacyHabitatMapping: Record<string, string> = {
  'Tatlı Su': 'freshwater',
  'Tuzlu Su': 'pelagic-neritic', // Varsayılan deniz habitatı
  'Acı Su': 'brackish',
  'Freshwater': 'freshwater',
  'Saltwater': 'pelagic-neritic',
  'Brackish': 'brackish'
};