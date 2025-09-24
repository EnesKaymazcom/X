// IUCN Kırmızı Listesi Koruma Durumu Kategorileri
// Conservation Status Categories with Turkish translations and color schemes

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

// IUCN koruma durumu kategorileri ve renkleri
export const CONSERVATION_STATUS_MAP: Record<string, ConservationStatusInfo> = {
  // Tükenmiş
  EX: {
    code: 'EX',
    label: {
      tr: 'Soyu Tükenmiş',
      en: 'Extinct'
    },
    description: {
      tr: 'Kuşkuya yer bırakmayacak delillerle soyu tükenmiş olduğu ispatlanan türler',
      en: 'No reasonable doubt that the last individual has died'
    },
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    riskLevel: 'critical'
  },

  // Doğal ortamında tükenmiş
  EW: {
    code: 'EW',
    label: {
      tr: 'Doğal Ortamında Tükenen Tür',
      en: 'Extinct in the Wild'
    },
    description: {
      tr: 'Vahşi yaşamda soyu tükenmiş, fakat diğer alanlarda varlığını sürdüren türler',
      en: 'Known only to survive in cultivation, in captivity or as a naturalized population'
    },
    color: 'text-purple-800',
    bgColor: 'bg-purple-50',
    riskLevel: 'critical'
  },

  // Kritik tehlikede
  CR: {
    code: 'CR',
    label: {
      tr: 'Kritik Tehlikedeki Tür',
      en: 'Critically Endangered'
    },
    description: {
      tr: 'Vahşi yaşamda soyu tükenme tehlikesi had safhada olan türler',
      en: 'Extremely high risk of extinction in the wild'
    },
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    riskLevel: 'critical'
  },

  // Tehlikede
  EN: {
    code: 'EN',
    label: {
      tr: 'Tehlikedeki Tür',
      en: 'Endangered'
    },
    description: {
      tr: 'Vahşi yaşamda soyu tükenme tehlikesi çok büyük olan türler',
      en: 'Very high risk of extinction in the wild'
    },
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    riskLevel: 'high'
  },

  // Hassas/Savunmasız
  VU: {
    code: 'VU',
    label: {
      tr: 'Hassas Tür',
      en: 'Vulnerable'
    },
    description: {
      tr: 'Vahşi yaşamda soyu tükenme tehlikesi büyük olan türler',
      en: 'High risk of extinction in the wild'
    },
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    riskLevel: 'medium'
  },

  // Neredeyse tehdit altında
  NT: {
    code: 'NT',
    label: {
      tr: 'Neredeyse Tehdit Altındaki Tür',
      en: 'Near Threatened'
    },
    description: {
      tr: 'Şu anda tehlikede olmayan fakat yakın gelecekte tehdit altına girmeye aday olan türler',
      en: 'Close to qualifying for or is likely to qualify for a threatened category in the near future'
    },
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
    riskLevel: 'low'
  },

  // Asgari endişe
  LC: {
    code: 'LC',
    label: {
      tr: 'Asgari Endişe Altındaki Tür',
      en: 'Least Concern'
    },
    description: {
      tr: 'Yaygın bulunan türler, mevcut durumda tükenmeme riski taşıyan türler',
      en: 'Widespread and abundant taxa that do not qualify for any other category'
    },
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    riskLevel: 'safe'
  },

  // Eksik verili
  DD: {
    code: 'DD',
    label: {
      tr: 'Durumu Belirsiz Tür',
      en: 'Data Deficient'
    },
    description: {
      tr: 'Üzerinde yeterli bilgi bulunmayan türler',
      en: 'Inadequate information to make a direct or indirect assessment of extinction risk'
    },
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    riskLevel: 'unknown'
  },

  // Değerlendirilmemiş
  NE: {
    code: 'NE',
    label: {
      tr: 'Değerlendirilmemiş',
      en: 'Not Evaluated'
    },
    description: {
      tr: 'Henüz IUCN kriterleri ile değerlendirilmemiş türler',
      en: 'Not yet been evaluated against the IUCN criteria'
    },
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    riskLevel: 'unknown'
  }
}

/**
 * Koruma durumu kodu için bilgi getirir
 * @param code IUCN kodu (LC, NT, VU, EN, CR, EX, EW, DD, NE)
 * @returns ConservationStatusInfo objesi veya null
 */
export function getConservationStatusInfo(code: string): ConservationStatusInfo | null {
  const upperCode = code?.toUpperCase()
  return CONSERVATION_STATUS_MAP[upperCode] || null
}

/**
 * Koruma durumu için badge props getirir (Shadcn/ui Badge component için)
 * @param code IUCN kodu
 * @param locale Dil (tr/en)
 * @returns Badge için gerekli props
 */
export function getConservationStatusBadgeProps(code: string, locale: 'tr' | 'en' = 'tr') {
  const info = getConservationStatusInfo(code)
  
  if (!info) {
    return {
      variant: 'outline' as const,
      className: 'text-gray-700 border-gray-400',
      children: code || 'Bilinmiyor'
    }
  }

  // Outline variant kullan (sadece border, arka plan yok)
  const variant = 'outline' as const

  // IUCN standart renkleriyle uyumlu badge renkleri (outline style)
  let className = ''
  switch (info.code) {
    case 'EX':
      className = 'border-gray-700 text-gray-700 hover:bg-gray-100 dark:border-gray-500 dark:text-gray-400 dark:hover:bg-gray-800'
      break
    case 'EW':
      className = 'border-purple-700 text-purple-700 hover:bg-purple-50 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-purple-900/20'
      break
    case 'CR':
      className = 'border-red-700 text-red-700 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20'
      break
    case 'EN':
      className = 'border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-900/20'
      break
    case 'VU':
      className = 'border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-900/20'
      break
    case 'NT':
      className = 'border-lime-600 text-lime-700 hover:bg-lime-50 dark:border-lime-500 dark:text-lime-400 dark:hover:bg-lime-900/20'
      break
    case 'LC':
      className = 'border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/20'
      break
    case 'DD':
      className = 'border-gray-500 text-gray-600 hover:bg-gray-50 dark:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-800'
      break
    case 'NE':
      className = 'border-slate-500 text-slate-600 hover:bg-slate-50 dark:border-slate-400 dark:text-slate-400 dark:hover:bg-slate-800'
      break
    default:
      className = 'border-gray-500 text-gray-600 hover:bg-gray-50'
  }

  return {
    variant,
    className,
    children: info.code // Sadece kısaltmayı göster
  }
}

/**
 * Koruma durumu için tooltip içeriği getirir
 * @param code IUCN kodu
 * @param locale Dil (tr/en)
 * @returns Tooltip için açıklama metni
 */
export function getConservationStatusTooltip(code: string, locale: 'tr' | 'en' = 'tr'): string {
  const info = getConservationStatusInfo(code)
  
  if (!info) {
    return locale === 'tr' 
      ? 'Koruma durumu bilgisi bulunmuyor' 
      : 'Conservation status information not available'
  }

  return `${info.label[locale]}: ${info.description[locale]}`
}

/**
 * Tüm koruma durumu kategorilerini listeler
 * @param sorted Risk seviyesine göre sıralanmış mı? (default: false)
 * @returns Tüm kategorilerin dizisi
 */
export function getAllConservationStatuses(sorted: boolean = false): ConservationStatusInfo[] {
  const statuses = Object.values(CONSERVATION_STATUS_MAP)
  
  if (!sorted) {
    return statuses
  }

  // Risk seviyesine göre sıralama: güvenli → bilinmeyen → düşük → orta → yüksek → kritik
  const riskOrder = {
    'safe': 1,      // LC
    'unknown': 2,   // DD, NE  
    'low': 3,       // NT
    'medium': 4,    // VU
    'high': 5,      // EN
    'critical': 6   // CR, EW, EX
  }

  return statuses.sort((a, b) => {
    const orderA = riskOrder[a.riskLevel]
    const orderB = riskOrder[b.riskLevel]
    
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // Aynı risk seviyesindeyse alfabetik sırala
    return a.code.localeCompare(b.code)
  })
}

/**
 * Risk seviyesine göre koruma durumlarını filtreler
 * @param riskLevel Risk seviyesi
 * @returns Filtrelenmiş koruma durumları
 */
export function getConservationStatusesByRisk(riskLevel: ConservationStatusInfo['riskLevel']): ConservationStatusInfo[] {
  return Object.values(CONSERVATION_STATUS_MAP).filter(status => status.riskLevel === riskLevel)
}