import { Platform } from 'react-native';

interface ConfigType {
  FISHIVO_WEATHER_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  GOOGLE_WEB_CLIENT_ID?: string;
  API_URL_ANDROID?: string;
  API_URL_IOS?: string;
  API_URL_DEFAULT?: string;
  WEB_URL_ANDROID?: string;
  WEB_URL_IOS?: string;
  WEB_URL_DEFAULT?: string;
  MAPTILER_API_KEY?: string;
  NEXT_PUBLIC_MAPTILER_API_KEY?: string;
  ENABLE_ASTRONOMY?: string;
  ENABLE_FISHING_CONDITIONS?: string;
  ENABLE_WEATHER_CACHE?: string;
}

let Config: ConfigType = {};
try {
  Config = require('react-native-config').default || {};
} catch (e) {
  Config = {};
}

// React Native platformu için platform-specific API URL'leri
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return Config.API_URL_ANDROID || 'http://10.0.2.2:3001';
  } else if (Platform.OS === 'ios') {
    return Config.API_URL_IOS || 'http://localhost:3001';
  }
  return Config.API_URL_DEFAULT || 'http://localhost:3001';
};

// Supabase Configuration
export const SUPABASE_URL = Config.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY || '';

// Google Configuration - Only Web Client ID needed per Supabase docs
export const GOOGLE_WEB_CLIENT_ID = Config.GOOGLE_WEB_CLIENT_ID || '';

// API Configuration
export const API_BASE_URL = getApiUrl();

// Web App URL'leri (upload endpoint'leri için)
const getWebUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return Config.WEB_URL_ANDROID || 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      return Config.WEB_URL_IOS || 'http://localhost:3000';
    }
    return Config.WEB_URL_DEFAULT || 'http://localhost:3000';
  }
  return 'https://fishivo.com';
};

export const WEB_BASE_URL = getWebUrl();

// Weather API Configuration
export const FISHIVO_WEATHER_API_KEY = Config.FISHIVO_WEATHER_API_KEY || 'sk_fishivo_wx_7k9m2n8q4x6v1z3c5b8a9d2f7h1j4l6p';


// MapTiler API Configuration
export const MAPTILER_API_KEY = Config.MAPTILER_API_KEY || Config.NEXT_PUBLIC_MAPTILER_API_KEY || '';

// MapLibre Configuration (no token needed for OpenFreeMap)

// Initialize MapLibre (no token needed for OpenFreeMap)
try {
  const MapLibreGL = require('@maplibre/maplibre-react-native').default;
  MapLibreGL.setAccessToken(null); // No token needed for OpenFreeMap
  MapLibreGL.setTelemetryEnabled(false);
  // MapLibre initialized successfully
} catch (error) {
  // MapLibre not installed yet or failed to initialize
}

// Environment configuration loaded 