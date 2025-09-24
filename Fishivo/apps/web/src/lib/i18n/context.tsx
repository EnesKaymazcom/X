'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Locale, defaultLocale } from './config'
import { getTranslations, Translations } from './loader'

interface I18nContextValue {
  locale: Locale
  translations: Translations[Locale]
  t: (key: string, params?: Record<string, string>) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

interface I18nProviderProps {
  children: React.ReactNode
  initialLocale?: Locale
}

export function I18nProvider({ children, initialLocale = defaultLocale }: I18nProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Get locale from URL path
  const urlLocale = pathname.split('/')[1] as Locale
  const locale = ['tr', 'en'].includes(urlLocale) ? urlLocale : initialLocale
  
  // Get translations for current locale
  const translations = useMemo(() => getTranslations(locale), [locale])
  
  // Translation function with nested key support - memoized for performance
  const t = useMemo(() => {
    return (key: string, params?: Record<string, string>): string => {
      // Handle nested keys like "support.contact.form.name"
      const keys = key.split('.')
      let current: any = translations
      
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k]
        } else {
          // Key not found, return the key itself as fallback
          console.warn(`[i18n] Translation missing: "${key}" for locale: "${locale}"`)
          return key.split('.').pop() || key
        }
      }
      
      // If we found a string, use it
      if (typeof current === 'string') {
        // Replace parameters if provided
        if (params) {
          return Object.entries(params).reduce((result, [paramKey, value]) => {
            return result.replace(new RegExp(`{${paramKey}}`, 'g'), value)
          }, current)
        }
        return current
      }
      
      // If not a string, return the last part of the key
      return key.split('.').pop() || key
    }
  }, [translations, locale])
  
  // Change locale
  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return
    
    // Get current path without locale
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/?|$)/, '/')
    
    // Navigate to new locale path
    router.push(`/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`)
  }
  
  const value: I18nContextValue = useMemo(() => ({
    locale,
    translations,
    t,
    setLocale
  }), [locale, translations, t, setLocale])
  
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

// Convenience hooks
export function useTranslation() {
  const { t } = useI18n()
  return { t }
}

export function useLocale() {
  const { locale, setLocale } = useI18n()
  return { locale, setLocale }
}