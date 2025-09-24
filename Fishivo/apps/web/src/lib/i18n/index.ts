/**
 * i18n Main Export
 * Simple and reliable internationalization system
 */

// Client-side exports
export { I18nProvider, useI18n, useTranslation, useLocale } from '@/lib/i18n/context'

// Server-side exports
export { getServerTranslation, getLocaleFromPathname } from '@/lib/i18n/server'

// Configuration exports
export { locales, defaultLocale, localeNames, type Locale } from '@/lib/i18n/config'

// Type exports
export type { Translations } from '@/lib/i18n/loader'
export type { SupportedLocale, Translation } from '@/lib/i18n/types'

// Middleware exports
export { createI18nMiddleware, getLocale, hasValidLocale } from '@/lib/i18n/middleware'