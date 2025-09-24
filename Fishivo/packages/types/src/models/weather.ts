// Weather related type definitions

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface WeatherData {
  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
  humidity?: number;
  pressure?: number;
}

export interface WindData {
  u: number;  // Wind u-component (m/s)
  v: number;  // Wind v-component (m/s)
}

export interface WindGridPoint {
  lat: number;
  lon: number;
  u: number;
  v: number;
}

export interface WeatherMapProps {
  initialCoordinates?: [number, number];
  onLocationSelect?: (coordinates: [number, number]) => void;
  style?: object;
  weatherData?: WeatherData;
}

// Location system types
export interface LocationState {
  currentLocation: [number, number] | null;
  isLocationLoading: boolean;
  locationError: string | null;
  hasLocationPermission: boolean | null;
}

export interface LocationPermissionResult {
  granted: boolean;
  error?: string;
}

export interface UseNativeLocationReturn extends LocationState {
  requestLocationPermission: () => Promise<boolean>;
  getCurrentNativeLocation: () => Promise<[number, number] | null>;
  setCurrentLocation: (location: [number, number]) => void;
  clearLocationError: () => void;
}

// WebView communication types
export interface WebViewMessage {
  type: string;
  [key: string]: any;
}

export interface LocationMessage {
  lat: number;
  lng: number;
}

// Wind data service types
export interface WindDataBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface WindDataServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  maxCoordinatesPerRequest?: number;
  cacheDuration?: number;
  gridResolution?: number;
}

// Weather service configuration
export interface WeatherServiceOptions {
  enableAstronomy?: boolean;
  enableFishing?: boolean;
  cacheEnabled?: boolean;
  providers?: {
    openMeteo?: boolean;
    nws?: boolean;
    ipGeolocation?: boolean;
  };
  ipGeolocationApiKey?: string;
}

// Fishing weather conditions
export interface FishingConditions {
  score: number; // 0-100
  barometricPressure: number;
  pressureTrend: 'rising' | 'falling' | 'stable';
  moonPhase: number; // 0-1
  windConditions: 'excellent' | 'good' | 'fair' | 'poor';
  temperature: number;
  recommendations: string[];
}

// Astronomy data
export interface AstronomyData {
  sunrise: string;
  sunset: string;
  moonrise?: string;
  moonset?: string;
  moonPhase: number;
  moonIllumination: number;
  solunarMajor: string[];
  solunarMinor: string[];
}

// Wind data hook types
export interface WindDataState {
  isWindDataLoading: boolean;
  windDataError: string | null;
  lastFetchTime: number | null;
}

export interface UseWindDataReturn extends WindDataState {
  requestWindDataRefresh: () => void;
  setWindDataLoading: (loading: boolean) => void;
  setWindDataError: (error: string | null) => void;
  clearWindDataError: () => void;
}