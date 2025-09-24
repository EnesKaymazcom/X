import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, locales, localeNames, localeFlags } from '@/lib/i18n/config'
import { changeLanguage } from '@/lib/i18n/i18n'
import i18n from 'i18next'

interface LanguageContextType {
  currentLanguage: Locale
  setLanguage: (language: Locale) => Promise<void>
  isChangingLanguage: boolean
  t: (key: string, options?: Record<string, unknown>) => string
  localeNames: typeof localeNames
  localeFlags: typeof localeFlags
  locales: typeof locales
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

// Export useTranslation hook for convenience
export function useTranslation() {
  const { t, currentLanguage } = useLanguage()
  return { t, locale: currentLanguage }
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Locale>(i18n.language as Locale || 'tr')
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)

  // Update current language when i18n language changes
  useEffect(() => {
    if (i18n.language) {
      setCurrentLanguage(i18n.language as Locale)
    }
  }, [])

  const setLanguage = async (language: Locale) => {
    if (!locales.includes(language)) {
      // Invalid language - using default
      return
    }

    setIsChangingLanguage(true)
    try {
      await changeLanguage(language)
      setCurrentLanguage(language)
    } catch (error) {
      // Language change failed - keeping current
    } finally {
      setIsChangingLanguage(false)
    }
  }

  // Custom t function that handles namespaces
  const t = (key: string, options?: Record<string, unknown>): string => {
    // Known namespaces list
    const knownNamespaces = [
      'common', 'settings', 'profile', 'auth', 'home', 'weather', 
      'locations', 'addCatch', 'notifications', 'addSpot', 'addGear', 
      'map', 'fishSpecies', 'fishingDisciplines', 'postDetail', 
      'equipment', 'premium', 'explore', 'errors', 'time', 'weatherNs', 'crop'
    ];
    
    // If key contains a dot, check if it's a namespaced key
    if (key.includes('.')) {
      const parts = key.split('.')
      if (parts.length >= 2) {
        const possibleNamespace = parts[0]
        // Only treat as namespace if it's in our known namespaces list
        if (knownNamespaces.includes(possibleNamespace)) {
          const restKey = parts.slice(1).join('.')
          return String(i18n.t(`${possibleNamespace}:${restKey}`, options))
        }
      }
    }
    // Default to common namespace (this handles keys like 'spot.types.shore')
    return String(i18n.t(key, options))
  }

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    isChangingLanguage,
    t,
    localeNames,
    localeFlags,
    locales,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}