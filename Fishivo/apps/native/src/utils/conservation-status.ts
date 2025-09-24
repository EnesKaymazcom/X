// IUCN Kırmızı Listesi Koruma Durumu Kategorileri
// Conservation Status Categories for React Native

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
    color: '#374151', // gray-700
    bgColor: '#F3F4F6', // gray-100
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
    color: '#6B21A8', // purple-800
    bgColor: '#FAF5FF', // purple-50
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
    color: '#B91C1C', // red-700
    bgColor: '#FEF2F2', // red-50
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
    color: '#EA580C', // orange-600
    bgColor: '#FFF7ED', // orange-50
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
    color: '#EAB308', // yellow-500
    bgColor: '#FEFCE8', // yellow-50
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
    color: '#65A30D', // lime-600
    bgColor: '#F7FEE7', // lime-50
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
    color: '#16A34A', // green-600
    bgColor: '#F0FDF4', // green-50
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
    color: '#374151', // gray-700
    bgColor: '#F3F4F6', // gray-100
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
    color: '#475569', // slate-600
    bgColor: '#F8FAFC', // slate-50
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
 * Koruma durumu için renk bilgisi getirir
 * @param code IUCN kodu
 * @returns Renk bilgileri
 */
export function getConservationStatusColors(code: string) {
  const info = getConservationStatusInfo(code)
  
  if (!info) {
    return {
      color: '#6B7280', // gray-500
      bgColor: '#F3F4F6', // gray-100
      borderColor: '#D1D5DB' // gray-300
    }
  }

  // Border color'ı color'dan biraz daha açık yap
  let borderColor = info.color
  
  return {
    color: info.color,
    bgColor: info.bgColor,
    borderColor
  }
}

/**
 * Risk seviyesine göre koruma durumlarını filtreler
 * @param riskLevel Risk seviyesi
 * @returns Filtrelenmiş koruma durumları
 */
export function getConservationStatusesByRisk(riskLevel: ConservationStatusInfo['riskLevel']): ConservationStatusInfo[] {
  return Object.values(CONSERVATION_STATUS_MAP).filter(status => status.riskLevel === riskLevel)
}