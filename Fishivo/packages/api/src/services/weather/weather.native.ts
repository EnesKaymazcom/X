import { Platform } from 'react-native';
import { WeatherServiceV2 } from './weather-service-v2';
import { NativeCacheService } from './cache.native';
import { WeatherData } from './schemas';

// React Native Config import edilecek
let ipGeolocationApiKey = '';
let weatherApiKey = '';

try {
  // Config dinamik olarak import edilecek
  const Config = require('react-native-config').default;
  ipGeolocationApiKey = Config.IPGEOLOCATION_API_KEY || '';
  weatherApiKey = Config.WEATHERAPI_KEY || '';
} catch (error) {
  // Config yoksa default değerler kullanılacak
  console.warn('react-native-config not available, using defaults');
}

const cache = new NativeCacheService();
const weatherService = new WeatherServiceV2(cache, {
  enableAstronomy: true,
  enableFishing: true,
  cacheEnabled: true,
  providers: {
    openMeteo: true,
    nws: true,
    ipGeolocation: !!ipGeolocationApiKey
  },
  ipGeolocationApiKey,
  weatherApiKey,
  retryConfig: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    timeout: 30000,
    jitter: true
  },
  cacheConfig: {
    memoryTTL: 300,
    persistentTTL: 600, // 10 dakika
    staleWhileRevalidate: true,
    maxMemoryEntries: 100
  }
});

// Native API uyumlu metodlar
export const weatherServiceNative = {
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const data = await weatherService.getWeatherData(latitude, longitude);
    return data;
  },

  async getWeatherForecast(latitude: number, longitude: number, days: number = 7): Promise<WeatherData> {
    // WeatherService zaten forecast veriyor
    const data = await weatherService.getWeatherData(latitude, longitude);
    
    // Gün sayısına göre veriyi kırp
    if (days < 7) {
      data.daily = data.daily.slice(0, days);
      data.hourly = data.hourly.slice(0, days * 24);
    }
    
    return data;
  },

  async getLocationName(latitude: number, longitude: number): Promise<{ name: string } | null> {
    return weatherService.getLocationName(latitude, longitude);
  },

  // Eski API uyumluluğu için basitleştirilmiş versiyon
  async getCurrentWeatherSimple(latitude: number, longitude: number) {
    const data = await weatherService.getWeatherData(latitude, longitude);
    
    return {
      current: {
        temperature: data.current.temperature,
        apparent_temperature: data.current.apparent_temperature,
        humidity: data.current.humidity,
        pressure: data.current.pressure,
        windSpeed: data.current.windSpeed,
        windDirection: data.current.windDirection,
        uvIndex: data.current.uvIndex,
        weatherCode: data.current.weatherCode
      },
      location: {
        latitude,
        longitude,
        name: data.metadata.location
      }
    };
  },

  // Balıkçılık özellikleri için özel metod
  async getFishingConditions(latitude: number, longitude: number) {
    const data = await weatherService.getWeatherData(latitude, longitude);
    return data.fishing || null;
  },

  // Astronomi verileri için özel metod
  async getAstronomyData(latitude: number, longitude: number) {
    const data = await weatherService.getWeatherData(latitude, longitude);
    return data.astronomy || null;
  }
};