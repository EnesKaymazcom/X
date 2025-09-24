export interface AirQualityData {
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  aqi: number;
}

export interface CurrentWeather {
  temperature: number;
  apparent_temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGust?: number;
  uvIndex: number;
  visibility: number;
  cloudCover: number;
  precipitation: number;
  weatherCode: number;
  airQuality?: AirQualityData;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  cloudCover: number;
  pressure?: number;
  visibility?: number;
}

export interface DailyWeather {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  weatherCode: number;
}

export interface AstronomyData {
  moonPhase: string;
  moonIllumination: number;
  moonrise: string;
  moonset: string;
  sunrise: string;
  sunset: string;
  majorPeriods: Array<{ start: string; end: string }>;
  minorPeriods: Array<{ start: string; end: string }>;
}

export interface MarineData {
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  seaTemperature: number;
  tides: Array<{
    time: string;
    height: number;
    type: 'high' | 'low';
  }>;
}

export interface FishingConditions {
  score: number;
  rating: 'poor' | 'fair' | 'good' | 'excellent';
  bestTimes: Array<{ start: string; end: string; quality: string }>;
  factors: {
    pressure: { value: number; trend: string; impact: string };
    moon: { phase: string; illumination: number; impact: string };
    temperature: { value: number; impact: string };
    wind: { speed: number; impact: string };
  };
  recommendations: string[];
}

export interface WeatherAlert {
  title: string;
  description: string;
  severity: string;
  start: string;
  end: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  astronomy?: AstronomyData;
  marine?: MarineData;
  fishing?: FishingConditions;
  alerts?: WeatherAlert[];
  metadata: {
    provider: string;
    location: string;
    lastUpdated: string;
    cached: boolean;
  };
}

export interface WeatherProvider {
  name: string;
  supports(lat: number, lon: number): boolean;
  fetchWeather(lat: number, lon: number): Promise<WeatherData>;
}

export interface CacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface WeatherServiceConfig {
  enableAstronomy?: boolean;
  enableMarine?: boolean;
  enableFishing?: boolean;
  enableAirQuality?: boolean;
  cacheEnabled?: boolean;
  providers?: {
    openMeteo?: boolean;
    nws?: boolean;
    weatherApi?: boolean;
    ipGeolocation?: boolean;
  };
  ipGeolocationApiKey?: string;
  weatherApiKey?: string;
}

