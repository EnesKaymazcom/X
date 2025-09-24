interface __HistoricalWeatherData {
  date: string;
  temperature_max: number;
  temperature_min: number;
  temperature_mean: number;
  precipitation_sum: number;
  windspeed_max: number;
  winddirection_dominant: number;
  weather_code: number;
  description: string;
  humidity?: number;
  pressure?: number;
}

interface WeatherCondition {
  temperature: number;
  description: string;
  wind_speed: number;
  precipitation: number;
  weather_code: number;
  icon: string;
}

export class HistoricalWeatherService {
  private static readonly FISHIVO_API_URL = 'https://meteo.fishivo.com/v1/forecast';
  private static readonly FISHIVO_API_KEY = 'sk_fishivo_wx_7k9m2n8q4x6v1z3c5b8a9d2f7h1j4l6p';

  /**
   * Geçmişe dönük hava durumu verisi çek (Multi-provider fallback)
   */
  static async getHistoricalWeather(
    latitude: number,
    longitude: number,
    date: string // YYYY-MM-DD format
  ): Promise<WeatherCondition | null> {
    // 1. Primary: Open-Meteo Archive API (ERA5 data - ücretsiz)
    const openMeteoResult = await this.getOpenMeteoHistoricalWeather(latitude, longitude, date);
    if (openMeteoResult) {
      return openMeteoResult;
    }

    // 2. Fallback: Fishivo API with past_days parameter
    const fishivoResult = await this.getFishivoHistoricalWeather(latitude, longitude, date);
    if (fishivoResult) {
      return fishivoResult;
    }

    // 3. Last resort: return null (no historical data available)
    return null;
  }

  /**
   * Open-Meteo Archive API (Primary)
   */
  private static async getOpenMeteoHistoricalWeather(
    latitude: number,
    longitude: number,
    date: string
  ): Promise<WeatherCondition | null> {
    try {
      const url = 'https://archive-api.open-meteo.com/v1/era5?' +
        `latitude=${latitude}&` +
        `longitude=${longitude}&` +
        `start_date=${date}&` +
        `end_date=${date}&` +
        'daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant,weather_code&' +
        'timezone=auto';

      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('Open-Meteo Archive API error:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
        console.warn('No Open-Meteo historical data found for date:', date);
        return null;
      }

      // İlk günün verilerini al
      const dailyData = {
        date: data.daily.time[0],
        temperature_max: data.daily.temperature_2m_max[0],
        temperature_min: data.daily.temperature_2m_min[0],
        temperature_mean: data.daily.temperature_2m_mean[0],
        precipitation_sum: data.daily.precipitation_sum[0],
        windspeed_max: data.daily.windspeed_10m_max[0],
        winddirection_dominant: data.daily.winddirection_10m_dominant[0],
        weather_code: data.daily.weather_code[0]
      };

      return {
        temperature: Math.round(dailyData.temperature_mean || dailyData.temperature_max),
        description: this.mapWeatherCodeToDescription(dailyData.weather_code),
        wind_speed: Math.round(dailyData.windspeed_max || 0),
        precipitation: Math.round(dailyData.precipitation_sum || 0),
        weather_code: dailyData.weather_code,
        icon: this.mapWeatherCodeToIcon(dailyData.weather_code)
      };

    } catch (error) {
      console.warn('Open-Meteo Archive API fetch error:', error);
      return null;
    }
  }

  /**
   * Fishivo API with past_days parameter (Fallback)
   */
  private static async getFishivoHistoricalWeather(
    latitude: number,
    longitude: number,
    date: string
  ): Promise<WeatherCondition | null> {
    try {
      // Calculate days difference from today
      const targetDate = new Date(date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

      // Fishivo API maximum past_days is 92
      if (daysDiff > 92 || daysDiff < 0) {
        console.warn('Fishivo API: Date out of range (max 92 past days)');
        return null;
      }

      const url = `${this.FISHIVO_API_URL}?` +
        `latitude=${latitude}&` +
        `longitude=${longitude}&` +
        'daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant,weather_code&' +
        `past_days=${daysDiff}&` +
        'forecast_days=1&' +
        'timezone=auto';

      const response = await fetch(url, {
        headers: {
          'x-api-key': this.FISHIVO_API_KEY
        }
      });

      if (!response.ok) {
        console.warn('Fishivo API historical weather error:', response.status);
        return null;
      }

      const data = await response.json();

      if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
        console.warn('No Fishivo historical data found for date:', date);
        return null;
      }

      // Find the exact date in the response
      const dateIndex = data.daily.time.findIndex((time: string) => time === date);
      if (dateIndex === -1) {
        console.warn('Fishivo API: Exact date not found in response');
        return null;
      }

      // Extract data for the target date
      const dailyData = {
        temperature_max: data.daily.temperature_2m_max[dateIndex],
        temperature_min: data.daily.temperature_2m_min[dateIndex],
        temperature_mean: data.daily.temperature_2m_mean?.[dateIndex],
        precipitation_sum: data.daily.precipitation_sum[dateIndex],
        windspeed_max: data.daily.windspeed_10m_max[dateIndex],
        winddirection_dominant: data.daily.winddirection_10m_dominant[dateIndex],
        weather_code: data.daily.weather_code[dateIndex]
      };

      return {
        temperature: Math.round(dailyData.temperature_mean || dailyData.temperature_max),
        description: this.mapWeatherCodeToDescription(dailyData.weather_code),
        wind_speed: Math.round(dailyData.windspeed_max || 0),
        precipitation: Math.round(dailyData.precipitation_sum || 0),
        weather_code: dailyData.weather_code,
        icon: this.mapWeatherCodeToIcon(dailyData.weather_code)
      };

    } catch (error) {
      console.warn('Fishivo API historical weather fetch error:', error);
      return null;
    }
  }

  /**
   * Tarih ve konum bazlı hava durumu çek (EXIF metadata ile)
   */
  static async getWeatherForCaptureTime(
    latitude: number,
    longitude: number,
    captureDateTime: Date
  ): Promise<WeatherCondition | null> {
    // Tarihi YYYY-MM-DD formatına çevir
    const dateString = captureDateTime.toISOString().split('T')[0];
    
    // Eğer bugünden sonraki bir tarih ise (gelecek), null döndür
    const today = new Date();
    if (captureDateTime > today) {
      console.warn('Future date provided, cannot get historical weather');
      return null;
    }

    // Eğer bugün ise, mevcut weather API'yi kullan
    if (dateString === today.toISOString().split('T')[0]) {
      try {
        // Mevcut weather service'yi kullan
        const { weatherServiceNative } = await import('@fishivo/api');
        const currentWeather = await weatherServiceNative.getCurrentWeatherSimple(latitude, longitude);
        
        return {
          temperature: Math.round(currentWeather.current.temperature),
          description: this.mapWeatherCodeToDescription(currentWeather.current.weatherCode),
          wind_speed: Math.round(currentWeather.current.windSpeed),
          precipitation: Math.round(currentWeather.current.precipitation || 0),
          weather_code: currentWeather.current.weatherCode,
          icon: this.mapWeatherCodeToIcon(currentWeather.current.weatherCode)
        };
      } catch (error) {
        console.warn('Current weather API error, falling back to historical:', error);
      }
    }

    // Geçmiş tarih ise historical API kullan
    return this.getHistoricalWeather(latitude, longitude, dateString);
  }

  /**
   * Weather code'u Türkçe açıklamaya çevir
   */
  private static mapWeatherCodeToDescription(code: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: 'Açık',
      1: 'Açık', 
      2: 'Parçalı Bulutlu',
      3: 'Bulutlu',
      45: 'Sisli',
      48: 'Dondurucu Sis',
      51: 'Hafif Çisenti',
      53: 'Çisenti',
      55: 'Yoğun Çisenti',
      56: 'Dondurucu Çisenti',
      57: 'Yoğun Dondurucu Çisenti',
      61: 'Hafif Yağmur',
      63: 'Yağmur',
      65: 'Şiddetli Yağmur',
      66: 'Dondurucu Yağmur',
      67: 'Şiddetli Dondurucu Yağmur',
      71: 'Hafif Kar',
      73: 'Kar',
      75: 'Yoğun Kar',
      77: 'Kar Taneleri',
      80: 'Hafif Sağanak',
      81: 'Sağanak Yağmur',
      82: 'Şiddetli Sağanak',
      85: 'Hafif Kar Yağışı',
      86: 'Yoğun Kar Yağışı',
      95: 'Fırtına',
      96: 'Dolu ile Fırtına',
      99: 'Şiddetli Dolu Fırtınası'
    };

    return weatherCodes[code] || 'Bilinmeyen';
  }

  /**
   * Weather code'u emoji icon'a çevir
   */
  private static mapWeatherCodeToIcon(code: number): string {
    const weatherIcons: { [key: number]: string } = {
      0: '☀️', // Açık
      1: '☀️', // Açık
      2: '⛅', // Parçalı Bulutlu
      3: '☁️', // Bulutlu
      45: '🌫️', // Sisli
      48: '🌫️', // Dondurucu Sis
      51: '🌦️', // Hafif Çisenti
      53: '🌦️', // Çisenti
      55: '🌧️', // Yoğun Çisenti
      56: '🌨️', // Dondurucu Çisenti
      57: '🌨️', // Yoğun Dondurucu Çisenti
      61: '🌧️', // Hafif Yağmur
      63: '🌧️', // Yağmur
      65: '⛈️', // Şiddetli Yağmur
      66: '🌨️', // Dondurucu Yağmur
      67: '🌨️', // Şiddetli Dondurucu Yağmur
      71: '🌨️', // Hafif Kar
      73: '❄️', // Kar
      75: '❄️', // Yoğun Kar
      77: '❄️', // Kar Taneleri
      80: '🌦️', // Hafif Sağanak
      81: '⛈️', // Sağanak Yağmur
      82: '⛈️', // Şiddetli Sağanak
      85: '🌨️', // Hafif Kar Yağışı
      86: '❄️', // Yoğun Kar Yağışı
      95: '⛈️', // Fırtına
      96: '⛈️', // Dolu ile Fırtına
      99: '⛈️'  // Şiddetli Dolu Fırtınası
    };

    return weatherIcons[code] || '🌤️';
  }

  /**
   * Hava durumu kodundan dropdown için seçenek oluştur
   */
  static createWeatherOption(weatherCondition: WeatherCondition) {
    return {
      code: weatherCondition.weather_code,
      description: weatherCondition.description,
      icon: weatherCondition.icon,
      temperature: weatherCondition.temperature,
      displayText: `${weatherCondition.icon} ${weatherCondition.description}` + 
                  (weatherCondition.temperature ? ` (${weatherCondition.temperature}°C)` : '')
    };
  }

  /**
   * Tarih string'ini Date objesine çevir (EXIF format support)
   */
  static parseExifDate(dateString: string): Date | null {
    try {
      // EXIF format: '2024:01:15 14:30:25' -> JavaScript Date
      const formattedDate = dateString.replace(/:/g, '-').replace(/-(\d{2}:\d{2}:\d{2})/, ' $1');
      const date = new Date(formattedDate);
      
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.warn('Date parsing error:', error);
      return null;
    }
  }

  /**
   * Cache key oluştur (coordinate + date combination)
   */
  private static getCacheKey(lat: number, lng: number, date: string): string {
    return `weather_${lat.toFixed(3)}_${lng.toFixed(3)}_${date}`;
  }
}