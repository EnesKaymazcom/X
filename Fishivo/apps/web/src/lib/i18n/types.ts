/**
 * i18n Types
 * Type definitions for internationalization
 */

// Re-export types from config for backward compatibility
export { type Locale, locales, defaultLocale } from '@/lib/i18n/config'

// Legacy type aliases
export type SupportedLocale = import('./config').Locale

// Translation types
export type TranslationValue = string | { [key: string]: TranslationValue }
export type Translation = { [key: string]: TranslationValue }