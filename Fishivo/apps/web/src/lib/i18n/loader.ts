/**
 * Translation Loader
 * Simple static imports for all translation files
 */

import { Locale } from '@/lib/i18n/config'

// Turkish translations
import trPagesHome from '@/lib/i18n/translations/namespaces/tr/pages/home.json'
import trPagesLogin from '@/lib/i18n/translations/namespaces/tr/pages/login.json'
import trPagesProfile from '@/lib/i18n/translations/namespaces/tr/pages/profile.json'
import trPagesProfileEdit from '@/lib/i18n/translations/namespaces/tr/pages/profileEdit.json'
import trPagesResetPassword from '@/lib/i18n/translations/namespaces/tr/pages/resetPassword.json'
import trPagesFishSpecies from '@/lib/i18n/translations/namespaces/tr/pages/fishSpecies.json'
import trPagesSupport from '@/lib/i18n/translations/namespaces/tr/pages/support.json'
import trPagesWeather from '@/lib/i18n/translations/namespaces/tr/pages/weather.json'
import trPagesMap from '@/lib/i18n/translations/namespaces/tr/pages/map.json'
import trPagesErrors from '@/lib/i18n/translations/namespaces/tr/pages/errors.json'
import trPagesAnalytics from '@/lib/i18n/translations/namespaces/tr/pages/analytics.json'
import trPagesEquipment from '@/lib/i18n/translations/namespaces/tr/pages/equipment.json'
import trPagesSpots from '@/lib/i18n/translations/namespaces/tr/pages/spots.json'
import trPagesNotifications from '@/lib/i18n/translations/namespaces/tr/pages/notifications.json'
import trPagesMessages from '@/lib/i18n/translations/namespaces/tr/pages/messages.json'
import trPagesSearch from '@/lib/i18n/translations/namespaces/tr/pages/search.json'
import trPagesWaitlist from '@/lib/i18n/translations/namespaces/tr/pages/waitlist.json'
import trPagesCatches from '@/lib/i18n/translations/namespaces/tr/pages/catches.json'

import trAdminDashboard from '@/lib/i18n/translations/namespaces/tr/admin/dashboard.json'
import trAdminUsers from '@/lib/i18n/translations/namespaces/tr/admin/users.json'
import trAdminPosts from '@/lib/i18n/translations/namespaces/tr/admin/posts.json'
import trAdminSpecies from '@/lib/i18n/translations/namespaces/tr/admin/species.json'
import trAdminReports from '@/lib/i18n/translations/namespaces/tr/admin/reports.json'
import trAdminAnalytics from '@/lib/i18n/translations/namespaces/tr/admin/analytics.json'
import trAdminEquipment from '@/lib/i18n/translations/namespaces/tr/admin/equipment.json'
import trAdminSpots from '@/lib/i18n/translations/namespaces/tr/admin/spots.json'
import trAdminSettings from '@/lib/i18n/translations/namespaces/tr/admin/settings.json'
import trAdminLogs from '@/lib/i18n/translations/namespaces/tr/admin/logs.json'
import trAdminNotifications from '@/lib/i18n/translations/namespaces/tr/admin/notifications.json'
import trAdminFishingTechniques from '@/lib/i18n/translations/namespaces/tr/admin/fishingTechniques.json'

import trComponentsNavigation from '@/lib/i18n/translations/namespaces/tr/components/navigation.json'
import trComponentsForms from '@/lib/i18n/translations/namespaces/tr/components/forms.json'
import trComponentsButtons from '@/lib/i18n/translations/namespaces/tr/components/buttons.json'
import trComponentsModals from '@/lib/i18n/translations/namespaces/tr/components/modals.json'
import trComponentsTables from '@/lib/i18n/translations/namespaces/tr/components/tables.json'
import trComponentsNotifications from '@/lib/i18n/translations/namespaces/tr/components/notifications.json'
import trComponentsDatetime from '@/lib/i18n/translations/namespaces/tr/components/datetime.json'
import trComponentsFileUpload from '@/lib/i18n/translations/namespaces/tr/components/fileUpload.json'
import trComponentsFooter from '@/lib/i18n/translations/namespaces/tr/components/footer.json'

import trSharedCommon from '@/lib/i18n/translations/namespaces/tr/shared/common.json'
import trSharedUnits from '@/lib/i18n/translations/namespaces/tr/shared/units.json'
import trSharedStatus from '@/lib/i18n/translations/namespaces/tr/shared/status.json'
import trSharedErrors from '@/lib/i18n/translations/namespaces/tr/shared/errors.json'
import trAuth from '@/lib/i18n/translations/namespaces/tr/auth.json'
import trConsent from '@/lib/i18n/translations/namespaces/tr/consent.json'

// English translations
import enPagesHome from '@/lib/i18n/translations/namespaces/en/pages/home.json'
import enPagesLogin from '@/lib/i18n/translations/namespaces/en/pages/login.json'
import enPagesProfile from '@/lib/i18n/translations/namespaces/en/pages/profile.json'
import enPagesProfileEdit from '@/lib/i18n/translations/namespaces/en/pages/profileEdit.json'
import enPagesResetPassword from '@/lib/i18n/translations/namespaces/en/pages/resetPassword.json'
import enPagesFishSpecies from '@/lib/i18n/translations/namespaces/en/pages/fishSpecies.json'
import enPagesSupport from '@/lib/i18n/translations/namespaces/en/pages/support.json'
import enPagesWeather from '@/lib/i18n/translations/namespaces/en/pages/weather.json'
import enPagesMap from '@/lib/i18n/translations/namespaces/en/pages/map.json'
import enPagesErrors from '@/lib/i18n/translations/namespaces/en/pages/errors.json'
import enPagesAnalytics from '@/lib/i18n/translations/namespaces/en/pages/analytics.json'
import enPagesEquipment from '@/lib/i18n/translations/namespaces/en/pages/equipment.json'
import enPagesSpots from '@/lib/i18n/translations/namespaces/en/pages/spots.json'
import enPagesNotifications from '@/lib/i18n/translations/namespaces/en/pages/notifications.json'
import enPagesMessages from '@/lib/i18n/translations/namespaces/en/pages/messages.json'
import enPagesSearch from '@/lib/i18n/translations/namespaces/en/pages/search.json'
import enPagesWaitlist from '@/lib/i18n/translations/namespaces/en/pages/waitlist.json'
import enPagesCatches from '@/lib/i18n/translations/namespaces/en/pages/catches.json'

import enAdminDashboard from '@/lib/i18n/translations/namespaces/en/admin/dashboard.json'
import enAdminUsers from '@/lib/i18n/translations/namespaces/en/admin/users.json'
import enAdminPosts from '@/lib/i18n/translations/namespaces/en/admin/posts.json'
import enAdminSpecies from '@/lib/i18n/translations/namespaces/en/admin/species.json'
import enAdminReports from '@/lib/i18n/translations/namespaces/en/admin/reports.json'
import enAdminAnalytics from '@/lib/i18n/translations/namespaces/en/admin/analytics.json'
import enAdminEquipment from '@/lib/i18n/translations/namespaces/en/admin/equipment.json'
import enAdminSpots from '@/lib/i18n/translations/namespaces/en/admin/spots.json'
import enAdminSettings from '@/lib/i18n/translations/namespaces/en/admin/settings.json'
import enAdminLogs from '@/lib/i18n/translations/namespaces/en/admin/logs.json'
import enAdminNotifications from '@/lib/i18n/translations/namespaces/en/admin/notifications.json'
import enAdminFishingTechniques from '@/lib/i18n/translations/namespaces/en/admin/fishingTechniques.json'

import enComponentsNavigation from '@/lib/i18n/translations/namespaces/en/components/navigation.json'
import enComponentsForms from '@/lib/i18n/translations/namespaces/en/components/forms.json'
import enComponentsButtons from '@/lib/i18n/translations/namespaces/en/components/buttons.json'
import enComponentsModals from '@/lib/i18n/translations/namespaces/en/components/modals.json'
import enComponentsTables from '@/lib/i18n/translations/namespaces/en/components/tables.json'
import enComponentsNotifications from '@/lib/i18n/translations/namespaces/en/components/notifications.json'
import enComponentsDatetime from '@/lib/i18n/translations/namespaces/en/components/datetime.json'
import enComponentsFileUpload from '@/lib/i18n/translations/namespaces/en/components/fileUpload.json'
import enComponentsFooter from '@/lib/i18n/translations/namespaces/en/components/footer.json'

import enSharedCommon from '@/lib/i18n/translations/namespaces/en/shared/common.json'
import enSharedUnits from '@/lib/i18n/translations/namespaces/en/shared/units.json'
import enSharedStatus from '@/lib/i18n/translations/namespaces/en/shared/status.json'
import enSharedErrors from '@/lib/i18n/translations/namespaces/en/shared/errors.json'
import enAuth from '@/lib/i18n/translations/namespaces/en/auth.json'
import enConsent from '@/lib/i18n/translations/namespaces/en/consent.json'

// All translations organized by locale
const translations = {
  tr: {
    // Shared translations with proper common namespace
    common: trSharedCommon,
    status: trSharedStatus,
    
    // Pages translations with proper namespace
    pages: {
      home: trPagesHome,
      login: trPagesLogin,
      profile: trPagesProfile,
      profileEdit: trPagesProfileEdit,
      resetPassword: trPagesResetPassword,
      fishSpecies: trPagesFishSpecies,
      support: trPagesSupport,
      weather: trPagesWeather,
      map: trPagesMap,
      analytics: trPagesAnalytics,
      equipment: trPagesEquipment,
      spots: trPagesSpots,
      notifications: trPagesNotifications,
      messages: trPagesMessages,
      search: trPagesSearch,
      waitlist: trPagesWaitlist,
      catches: trPagesCatches,
    },
    
    // Keeping old structure for backward compatibility
    home: trPagesHome,
    login: trPagesLogin,
    profile: trPagesProfile,
    profileEdit: trPagesProfileEdit,
    resetPassword: trPagesResetPassword,
    fishSpecies: trPagesFishSpecies,
    support: trPagesSupport,
    weather: trPagesWeather,
    map: trPagesMap,
    analytics: trPagesAnalytics,
    equipment: trPagesEquipment,
    spots: trPagesSpots,
    notifications: trPagesNotifications,
    messages: trPagesMessages,
    search: trPagesSearch,
    waitlist: trPagesWaitlist,
    catches: trPagesCatches,
    
    // Errors namespace
    errors: {
      ...trSharedErrors,
      ...trPagesErrors,
    },
    
    // Admin namespace with proper nesting
    admin: {
      dashboard: trAdminDashboard,
      users: trAdminUsers,
      posts: trAdminPosts,
      species: trAdminSpecies,
      reports: trAdminReports,
      analytics: trAdminAnalytics,
      equipment: trAdminEquipment,
      spots: trAdminSpots,
      settings: trAdminSettings,
      logs: trAdminLogs,
      notifications: trAdminNotifications,
      fishingTechniques: trAdminFishingTechniques,
    },
    
    // Components namespace
    components: {
      ...trComponentsNavigation,
      ...trComponentsForms,
      ...trComponentsButtons,
      ...trComponentsModals,
      ...trComponentsTables,
      ...trComponentsNotifications,
      ...trComponentsDatetime,
      ...trComponentsFileUpload,
      footer: trComponentsFooter,
    },
    
    // Navigation namespace (alias for components.navigation)
    nav: trComponentsNavigation,
    
    // Units namespace
    units: trSharedUnits,
    
    // Auth namespace
    auth: trAuth,
    
    // Consent namespace
    consent: trConsent,
  },
  
  en: {
    // Shared translations with proper common namespace
    common: enSharedCommon,
    status: enSharedStatus,
    
    // Pages translations with proper namespace
    pages: {
      home: enPagesHome,
      login: enPagesLogin,
      profile: enPagesProfile,
      profileEdit: enPagesProfileEdit,
      resetPassword: enPagesResetPassword,
      fishSpecies: enPagesFishSpecies,
      support: enPagesSupport,
      weather: enPagesWeather,
      map: enPagesMap,
      analytics: enPagesAnalytics,
      equipment: enPagesEquipment,
      spots: enPagesSpots,
      notifications: enPagesNotifications,
      messages: enPagesMessages,
      search: enPagesSearch,
      waitlist: enPagesWaitlist,
      catches: enPagesCatches,
    },
    
    // Keeping old structure for backward compatibility
    home: enPagesHome,
    login: enPagesLogin,
    profile: enPagesProfile,
    profileEdit: enPagesProfileEdit,
    resetPassword: enPagesResetPassword,
    fishSpecies: enPagesFishSpecies,
    support: enPagesSupport,
    weather: enPagesWeather,
    map: enPagesMap,
    analytics: enPagesAnalytics,
    equipment: enPagesEquipment,
    spots: enPagesSpots,
    notifications: enPagesNotifications,
    messages: enPagesMessages,
    search: enPagesSearch,
    waitlist: enPagesWaitlist,
    catches: enPagesCatches,
    
    // Errors namespace
    errors: {
      ...enSharedErrors,
      ...enPagesErrors,
    },
    
    // Admin namespace with proper nesting
    admin: {
      dashboard: enAdminDashboard,
      users: enAdminUsers,
      posts: enAdminPosts,
      species: enAdminSpecies,
      reports: enAdminReports,
      analytics: enAdminAnalytics,
      equipment: enAdminEquipment,
      spots: enAdminSpots,
      settings: enAdminSettings,
      logs: enAdminLogs,
      notifications: enAdminNotifications,
      fishingTechniques: enAdminFishingTechniques,
    },
    
    // Components namespace
    components: {
      ...enComponentsNavigation,
      ...enComponentsForms,
      ...enComponentsButtons,
      ...enComponentsModals,
      ...enComponentsTables,
      ...enComponentsNotifications,
      ...enComponentsDatetime,
      ...enComponentsFileUpload,
      footer: enComponentsFooter,
    },
    
    // Navigation namespace (alias for components.navigation)
    nav: enComponentsNavigation,
    
    // Units namespace
    units: enSharedUnits,
    
    // Auth namespace
    auth: enAuth,
    
    // Consent namespace
    consent: enConsent,
  }
} as const

export type Translations = typeof translations

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.tr
}

export default translations