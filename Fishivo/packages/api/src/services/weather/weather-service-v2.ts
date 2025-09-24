import { WeatherData, WeatherProvider, CacheService, WeatherServiceConfig } from './types';
import { WeatherDataSchema } from './schemas';
import { 
  WeatherError, 
  InvalidCoordinatesError,
  ProviderError
} from './errors';
import { RetryManager, DEFAULT_RETRY_CONFIG } from './retry';
import { MultiLayerCache } from './cache-layer';
import { ProviderManager } from './provider-manager';
import { OpenMeteoProvider } from './providers/open-meteo';
import { NWSProvider } from './providers/nws';
// IPGeolocationProvider is not a weather provider, it's astronomy only
import { MoonPhaseCalculator } from './providers/moon-phase-calculator';
import {
  calculateFishingScore,
  getRating,
  calculatePressureTrend,
  getPressureImpact,
  getMoonImpact,
  getTemperatureImpact,
  getWindImpact,
  generateRecommendations
} from './utils';

export interface WeatherServiceV2Config extends WeatherServiceConfig {
  retryConfig?: RetryConfig;
  cacheConfig?: MultiLayerCacheConfig;
}

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  timeout: number;
  jitter: boolean;
}

interface MultiLayerCacheConfig {
  memoryTTL: number;
  persistentTTL: number;
  staleWhileRevalidate: boolean;
  maxMemoryEntries: number;
}

export class WeatherServiceV2 {
  private cache: MultiLayerCache;
  private providerManager: ProviderManager;
  private retryManager: RetryManager;
  private moonPhaseCalculator: MoonPhaseCalculator;
  private config: WeatherServiceV2Config;

  constructor(cache?: CacheService, config?: WeatherServiceV2Config) {
    this.config = {
      enableAstronomy: true,
      enableFishing: true,
      cacheEnabled: true,
      providers: {
        openMeteo: true,
        nws: true,
        ipGeolocation: true
      },
      retryConfig: DEFAULT_RETRY_CONFIG,
      cacheConfig: {
        memoryTTL: 300,
        persistentTTL: 600, // 10 dakika
        staleWhileRevalidate: true,
        maxMemoryEntries: 100
      },
      ...config
    };

    this.cache = new MultiLayerCache(
      cache || this.createDefaultCache(),
      this.config.cacheConfig
    );

    this.retryManager = new RetryManager(this.config.retryConfig);
    this.providerManager = new ProviderManager();
    this.moonPhaseCalculator = new MoonPhaseCalculator();

    this.initializeProviders();
  }

  private initializeProviders(): void {
    if (this.config.providers?.openMeteo) {
      this.providerManager.register(new OpenMeteoProvider());
    }

    if (this.config.providers?.nws) {
      this.providerManager.register(new NWSProvider());
    }

    // IPGeolocation is for astronomy data only, not weather data
  }

  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    this.validateCoordinates(lat, lon);

    const cacheKey = this.getCacheKey(lat, lon);

    if (this.config.cacheEnabled) {
      const cached = await this.cache.getOrRevalidate(
        cacheKey,
        () => this.fetchWeatherData(lat, lon)
      );

      if (cached) {
        return cached;
      }
    }

    return this.fetchWeatherData(lat, lon);
  }

  private async fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
    const provider = await this.providerManager.selectProvider(lat, lon);
    
    if (!provider) {
      throw new ProviderError('none', 'No weather provider available for this location');
    }

    const [weatherData, astronomyData] = await Promise.allSettled([
      this.retryManager.execute(
        () => this.providerManager.executeWithProvider(provider, lat, lon)
      ),
      this.config.enableAstronomy 
        ? this.fetchAstronomyData(lat, lon)
        : Promise.resolve(null)
    ]);

    if (weatherData.status === 'rejected') {
      throw weatherData.reason;
    }

    const validatedData = WeatherDataSchema.parse(weatherData.value);

    if (astronomyData.status === 'fulfilled' && astronomyData.value) {
      validatedData.astronomy = astronomyData.value;
    }

    if (this.config.enableFishing) {
      validatedData.fishing = this.calculateFishingConditions(validatedData);
    }

    return validatedData;
  }

  private async fetchAstronomyData(lat: number, lon: number) {
    try {
      const astronomyCacheKey = `astronomy:${lat.toFixed(2)}:${lon.toFixed(2)}`;
      const cached = await this.cache.get(astronomyCacheKey);
      
      if (cached?.astronomy) {
        return cached.astronomy;
      }

      return await this.moonPhaseCalculator.fetchAstronomy(lat, lon);
    } catch (error) {
      return null;
    }
  }

  private calculateFishingConditions(data: WeatherData) {
    const pressureTrend = calculatePressureTrend(data.hourly);
    
    const score = calculateFishingScore({
      pressure: data.current.pressure,
      pressureTrend,
      moonPhase: data.astronomy?.moonPhase,
      moonIllumination: data.astronomy?.moonIllumination,
      temperature: data.current.temperature,
      windSpeed: data.current.windSpeed,
      cloudCover: data.current.cloudCover
    });

    const bestTimes = [
      ...(data.astronomy?.majorPeriods?.map(period => ({
        start: period.start,
        end: period.end,
        quality: 'major'
      })) || []),
      ...(data.astronomy?.minorPeriods?.map(period => ({
        start: period.start,
        end: period.end,
        quality: 'minor'
      })) || [])
    ];

    return {
      score,
      rating: getRating(score),
      bestTimes,
      factors: {
        pressure: {
          value: data.current.pressure,
          trend: pressureTrend,
          impact: getPressureImpact(data.current.pressure, pressureTrend)
        },
        moon: {
          phase: data.astronomy?.moonPhase || 'unknown',
          illumination: data.astronomy?.moonIllumination || 0,
          impact: getMoonImpact(data.astronomy?.moonPhase)
        },
        temperature: {
          value: data.current.temperature,
          impact: getTemperatureImpact(data.current.temperature)
        },
        wind: {
          speed: data.current.windSpeed,
          impact: getWindImpact(data.current.windSpeed)
        }
      },
      recommendations: generateRecommendations(score, data)
    };
  }

  private validateCoordinates(lat: number, lon: number): void {
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new InvalidCoordinatesError(lat, lon);
    }
  }

  private getCacheKey(lat: number, lon: number): string {
    return `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  }

  private createDefaultCache(): CacheService {
    const cache = new Map<string, any>();
    
    return {
      async get(key: string) {
        return cache.get(key);
      },
      async set(key: string, value: any) {
        cache.set(key, value);
      },
      async delete(key: string) {
        cache.delete(key);
      }
    };
  }

  async getLocationName(lat: number, lon: number): Promise<{ name: string } | null> {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=tr`;
      const response = await fetch(url);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const name = result.name || result.admin1 || result.country || 'Bilinmeyen Konum';
        return { name };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  getProviderHealth() {
    return this.providerManager.getProviderHealth();
  }

  getCacheStats() {
    return this.cache.getCacheStats();
  }
}