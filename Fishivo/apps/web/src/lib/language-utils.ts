/**
 * Browser dil algılama utilities
 * Desteklenen diller: Türkçe (tr) ve İngilizce (en)
 */

export type SupportedLanguage = 'tr' | 'en'

/**
 * Browser'dan kullanıcının dil tercihini algılar
 * @returns 'tr' | 'en' - varsayılan 'en'
 */
export function detectBrowserLanguage(): SupportedLanguage {
  try {
    // Modern tarayıcılarda navigator.language desteklenir
    const browserLang = navigator.language || 
                       (navigator as any).userLanguage || 
                       'en'
    
    // Türkçe varyantlarını kontrol et (tr, tr-TR, tr-CY vb.)
    if (browserLang.toLowerCase().startsWith('tr')) {
      return 'tr'
    }
    
    // Varsayılan İngilizce
    return 'en'
  } catch (error) {
    // Server-side rendering veya hata durumunda varsayılan
    console.warn('Language detection failed, using default:', error)
    return 'en'
  }
}

/**
 * Kullanıcının tercih ettiği dilleri sıralı array olarak döner
 * @returns SupportedLanguage[] - öncelik sırası ile
 */
export function getBrowserLanguages(): SupportedLanguage[] {
  try {
    const languages = navigator.languages || [navigator.language || 'en']
    const supportedLangs: SupportedLanguage[] = []
    
    for (const lang of languages) {
      if (lang.toLowerCase().startsWith('tr') && !supportedLangs.includes('tr')) {
        supportedLangs.push('tr')
      } else if (lang.toLowerCase().startsWith('en') && !supportedLangs.includes('en')) {
        supportedLangs.push('en')
      }
    }
    
    // Eğer desteklenen dil yoksa İngilizce ekle
    if (supportedLangs.length === 0) {
      supportedLangs.push('en')
    }
    
    return supportedLangs
  } catch (error) {
    console.warn('Languages detection failed, using default:', error)
    return ['en']
  }
}

/**
 * Client-side kontrolü - browser environment'da mı?
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined'
}

/**
 * Safe dil algılama - server-side rendering destekli
 */
export function safeDetectLanguage(): SupportedLanguage {
  if (!isBrowser()) {
    return 'en' // SSR'da varsayılan
  }
  
  return detectBrowserLanguage()
}