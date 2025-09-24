import { WeatherData, WeatherProvider, CacheService, WeatherServiceConfig, FishingConditions } from './types';
import { OpenMeteoProvider } from './providers/open-meteo';
import { NWSProvider } from './providers/nws';
import { IPGeolocationProvider } from './providers/ipgeolocation';
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

export class WeatherService {
  private providers: Map<string, WeatherProvider>;
  private astronomyProvider?: IPGeolocationProvider;
  private moonPhaseCalculator: MoonPhaseCalculator;
  private cache?: CacheService;
  private config: WeatherServiceConfig;
  private apiCallCount: number = 0;
  private apiCallResetTime: Date = new Date();

  constructor(cache?: CacheService, config?: WeatherServiceConfig) {
    this.cache = cache;
    this.config = {
      enableAstronomy: true,
      enableFishing: true,
      cacheEnabled: true,
      providers: {
        openMeteo: true,
        nws: true,
        ipGeolocation: true
      },
      ...config
    };

    this.providers = new Map();
    
    if (this.config.providers?.openMeteo) {
      this.providers.set('open-meteo', new OpenMeteoProvider());
    }
    
    if (this.config.providers?.nws) {
      this.providers.set('nws', new NWSProvider());
    }

    if (this.config.providers?.ipGeolocation && this.config.ipGeolocationApiKey) {
      this.astronomyProvider = new IPGeolocationProvider(this.config.ipGeolocationApiKey);
    }

    // Offline ay evresi hesaplayıcı her zaman mevcut
    this.moonPhaseCalculator = new MoonPhaseCalculator();
  }

  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    // Cache kontrolü
    if (this.cache && this.config.cacheEnabled) {
      const cacheKey = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached)) {
        return { ...cached, metadata: { ...cached.metadata, cached: true } };
      }
    }

    // Ana provider'ı seç
    const primaryProvider = this.selectPrimaryProvider(lat, lon);
    
    if (!primaryProvider) {
      throw new Error('No weather provider available for this location');
    }

    try {
      // Paralel veri toplama
      const [weatherData, astronomyData] = await Promise.all([
        // Ana hava durumu verisi
        primaryProvider.fetchWeather(lat, lon),
        
        // Astronomi verisi
        this.getAstronomyData(lat, lon)
      ]);

      // Astronomi verisini ekle
      if (astronomyData) {
        weatherData.astronomy = astronomyData;
      }

      // Balıkçılık koşullarını hesapla
      if (this.config.enableFishing) {
        weatherData.fishing = this.calculateFishingConditions(weatherData);
      }

      // Cache'e kaydet
      if (this.cache && this.config.cacheEnabled) {
        const cacheKey = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
        await this.cache.set(cacheKey, weatherData, 600); // 10 dakika
      }

      return weatherData;
    } catch (error) {
      // Fallback provider'ları dene
      return this.tryFallbackProviders(lat, lon, primaryProvider.name);
    }
  }

  private selectPrimaryProvider(lat: number, lon: number): WeatherProvider | null {
    // NWS'yi öncelikle kontrol et (ABD için)
    const nws = this.providers.get('nws');
    if (nws && nws.supports(lat, lon)) {
      return nws;
    }

    // Diğer durumlarda Open-Meteo kullan
    return this.providers.get('open-meteo') || null;
  }

  private async tryFallbackProviders(
    lat: number,
    lon: number,
    excludeProvider: string
  ): Promise<WeatherData> {
    const fallbackOrder = ['open-meteo', 'nws'].filter(name => name !== excludeProvider);

    for (const providerName of fallbackOrder) {
      const provider = this.providers.get(providerName);
      if (provider && provider.supports(lat, lon)) {
        try {
          const weatherData = await provider.fetchWeather(lat, lon);
          
          // Astronomi verisini ekle
          const astronomyData = await this.getAstronomyData(lat, lon);
          if (astronomyData) {
            weatherData.astronomy = astronomyData;
          }

          // Balıkçılık koşullarını hesapla
          if (this.config.enableFishing) {
            weatherData.fishing = this.calculateFishingConditions(weatherData);
          }

          return weatherData;
        } catch (error) {
          console.error(`Fallback provider ${providerName} failed:`, error);
        }
      }
    }

    throw new Error('All weather providers failed');
  }

  private calculateFishingConditions(data: WeatherData): FishingConditions {
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

    const bestTimes = data.astronomy?.majorPeriods?.map(period => ({
      start: period.start,
      end: period.end,
      quality: 'major'
    })) || [];

    if (data.astronomy?.minorPeriods) {
      bestTimes.push(...data.astronomy.minorPeriods.map(period => ({
        start: period.start,
        end: period.end,
        quality: 'minor'
      })));
    }

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

  private isCacheValid(cached: any): boolean {
    if (!cached.metadata?.lastUpdated) return false;
    
    const cacheAge = Date.now() - new Date(cached.metadata.lastUpdated).getTime();
    return cacheAge < 600000; // 10 dakika
  }

  /**
   * Astronomi verilerini al - önce API, limit aşımında offline hesaplama
   */
  private async getAstronomyData(lat: number, lon: number): Promise<any> {
    if (!this.config.enableAstronomy) {
      return null;
    }

    // Önce API'yi dene
    if (this.astronomyProvider) {
      try {
        // API çağrı sayısını kontrol et
        if (this.shouldResetApiCount()) {
          this.apiCallCount = 0;
          this.apiCallResetTime = new Date();
        }

        // Günlük limit kontrolü (güvenli limit: 25,000)
        if (this.apiCallCount < 25000) {
          const data = await this.astronomyProvider.fetchAstronomy(lat, lon);
          this.apiCallCount++;
          
          // Cache'e özel olarak kaydet (12 saat)
          if (this.cache && data) {
            const cacheKey = `astronomy:${lat.toFixed(2)}:${lon.toFixed(2)}`;
            await this.cache.set(cacheKey, data, 43200); // 12 saat
          }
          
          return data;
        } else {
          console.warn('IPGeolocation API daily limit approaching, using offline calculator');
        }
      } catch (error) {
        console.error('IPGeolocation API error, falling back to offline:', error);
      }
    }

    // API başarısız veya limit aşımı - offline hesapla
    console.log('Using offline moon phase calculator');
    return this.moonPhaseCalculator.fetchAstronomy(lat, lon);
  }

  /**
   * API çağrı sayacının sıfırlanması gerekiyor mu?
   */
  private shouldResetApiCount(): boolean {
    const now = new Date();
    const resetTime = new Date(this.apiCallResetTime);
    resetTime.setDate(resetTime.getDate() + 1); // Ertesi gün
    return now >= resetTime;
  }

  // Lokasyon adını almak için yardımcı metod
  async getLocationName(lat: number, lon: number): Promise<{ name: string } | null> {
    try {
      // Open-Meteo'nun geocoding API'sini kullan
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
      console.error('Error getting location name:', error);
      return null;
    }
  }
}