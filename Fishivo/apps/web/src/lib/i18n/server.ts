/**
 * Server-side i18n utilities
 * For use in React Server Components
 */

import { Locale, defaultLocale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/loader'

/**
 * Get locale from pathname
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0] as Locale
  
  if (['tr', 'en'].includes(firstSegment)) {
    return firstSegment
  }
  
  return defaultLocale
}

/**
 * Server-side translation function
 */
export function getServerTranslation(locale: Locale) {
  const translations = getTranslations(locale)
  
  return function t(key: string, params?: Record<string, string>): string {
    // Handle nested keys
    const keys = key.split('.')
    let current: any = translations
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        console.warn(`[i18n] Translation missing: "${key}" for locale: "${locale}"`)
        return key.split('.').pop() || key
      }
    }
    
    if (typeof current === 'string') {
      if (params) {
        return Object.entries(params).reduce((result, [paramKey, value]) => {
          return result.replace(new RegExp(`{${paramKey}}`, 'g'), value)
        }, current)
      }
      return current
    }
    
    return key.split('.').pop() || key
  }
}