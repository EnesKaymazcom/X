/**
 * i18n Configuration
 * Simple and reliable internationalization system
 */

export const locales = ['tr', 'en'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English'
}