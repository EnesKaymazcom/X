/**
 * i18n Configuration for React Native
 */

export const locales = ['tr', 'en'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English'
}

export const localeFlags: Record<Locale, string> = {
  tr: '🇹🇷',
  en: '🇬🇧'
}


export const LANGUAGE_STORAGE_KEY = '@fishivo_language'