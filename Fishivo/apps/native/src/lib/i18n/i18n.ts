import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { MobileStorage } from '@/storage/MobileStorage'
import * as RNLocalize from 'react-native-localize'
import { defaultLocale, locales, LANGUAGE_STORAGE_KEY, Locale } from './config'

// Translation imports
import trCommon from './translations/tr/common.json'
import trSettings from './translations/tr/settings.json'
import trProfile from './translations/tr/profile.json'
import trAuth from './translations/tr/auth.json'
import trHome from './translations/tr/home.json'
import trWeather from './translations/tr/weather.json'
import trLocations from './translations/tr/locations.json'
import trAddCatch from './translations/tr/addCatch.json'
import trNotifications from './translations/tr/notifications.json'
import trAddSpot from './translations/tr/addSpot.json'
import trAddGear from './translations/tr/addGear.json'
import trMap from './translations/tr/map.json'
import trFishSpecies from './translations/tr/fishSpecies.json'
import trFishingDisciplines from './translations/tr/fishingDisciplines.json'
import trPostDetail from './translations/tr/postDetail.json'
import trEquipment from './translations/tr/equipment.json'
import trPremium from './translations/tr/premium.json'
import trExplore from './translations/tr/explore.json'
import trErrors from './translations/tr/errors.json'
import trTime from './translations/tr/time.json'
import trWeatherNs from './translations/tr/weather.json'
import trCrop from './translations/tr/crop.json'

import enCommon from './translations/en/common.json'
import enSettings from './translations/en/settings.json'
import enProfile from './translations/en/profile.json'
import enAuth from './translations/en/auth.json'
import enHome from './translations/en/home.json'
import enWeather from './translations/en/weather.json'
import enLocations from './translations/en/locations.json'
import enAddCatch from './translations/en/addCatch.json'
import enNotifications from './translations/en/notifications.json'
import enAddSpot from './translations/en/addSpot.json'
import enAddGear from './translations/en/addGear.json'
import enMap from './translations/en/map.json'
import enFishSpecies from './translations/en/fishSpecies.json'
import enFishingDisciplines from './translations/en/fishingDisciplines.json'
import enPostDetail from './translations/en/postDetail.json'
import enEquipment from './translations/en/equipment.json'
import enPremium from './translations/en/premium.json'
import enExplore from './translations/en/explore.json'
import enErrors from './translations/en/errors.json'
import enTime from './translations/en/time.json'
import enWeatherNs from './translations/en/weather.json'
import enCrop from './translations/en/crop.json'

const resources = {
  tr: {
    common: trCommon,
    settings: trSettings,
    profile: trProfile,
    auth: trAuth,
    home: trHome,
    weather: trWeather,
    locations: trLocations,
    addCatch: trAddCatch,
    notifications: trNotifications,
    addSpot: trAddSpot,
    addGear: trAddGear,
    map: trMap,
    fishSpecies: trFishSpecies,
    fishingDisciplines: trFishingDisciplines,
    postDetail: trPostDetail,
    equipment: trEquipment,
    premium: trPremium,
    explore: trExplore,
    errors: trErrors,
    time: trTime,
    weatherNs: trWeatherNs,
    crop: trCrop,
  },
  en: {
    common: enCommon,
    settings: enSettings,
    profile: enProfile,
    auth: enAuth,
    home: enHome,
    weather: enWeather,
    locations: enLocations,
    addCatch: enAddCatch,
    notifications: enNotifications,
    addSpot: enAddSpot,
    addGear: enAddGear,
    map: enMap,
    fishSpecies: enFishSpecies,
    fishingDisciplines: enFishingDisciplines,
    postDetail: enPostDetail,
    equipment: enEquipment,
    premium: enPremium,
    explore: enExplore,
    errors: enErrors,
    time: enTime,
    weatherNs: enWeatherNs,
    crop: enCrop,
  },
}

const storage = new MobileStorage()

// Get device language
const getDeviceLanguage = (): Locale => {
  const deviceLocales = RNLocalize.getLocales()
  if (deviceLocales.length > 0) {
    const deviceLang = deviceLocales[0].languageCode
    
    // Check if device language starts with 'tr' (Turkish)
    if (deviceLang.toLowerCase().startsWith('tr')) {
      return 'tr'
    }
    
    // For all other languages, use English
    return 'en'
  }
  
  // Fallback to English if no device language detected
  return 'en'
}

// Get saved language from storage
const getSavedLanguage = async (): Promise<Locale | null> => {
  try {
    const savedLang = await storage.getItem(LANGUAGE_STORAGE_KEY)
    if (savedLang && locales.includes(savedLang as Locale)) {
      return savedLang as Locale
    }
  } catch (error) {
    console.error('Error getting saved language:', error)
  }
  return null
}

// Initialize i18n
export const initI18n = async () => {
  const savedLang = await getSavedLanguage()
  const deviceLang = getDeviceLanguage()
  const initialLang = savedLang || deviceLang

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: defaultLocale,
      defaultNS: 'common',
      
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      
      react: {
        useSuspense: false,
      },
    })
    
  return i18n
}

// Change language and save to storage
export const changeLanguage = async (language: Locale) => {
  try {
    await storage.setItem(LANGUAGE_STORAGE_KEY, language)
    await i18n.changeLanguage(language)
  } catch (error) {
    console.error('Error changing language:', error)
    throw error
  }
}

export default i18n