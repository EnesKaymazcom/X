import { WeatherProvider } from '../types';
import { 
  WeatherData, 
  CurrentWeather, 
  HourlyWeather, 
  DailyWeather,
  OpenMeteoResponseSchema 
} from '../schemas';
import { ProviderError, ParseError, TimeoutError } from '../errors';

export class OpenMeteoProvider implements WeatherProvider {
  name = 'open-meteo';
  private readonly baseUrl = process.env.FISHIVO_WEATHER_API_KEY 
    ? 'https://meteo.fishivo.com/v1' 
    : 'https://api.open-meteo.com/v1';
  private readonly apiKey = process.env.FISHIVO_WEATHER_API_KEY || '';

  supports(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  async fetchWeather(lat: number, lon: number): Promise<WeatherData> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current: [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'pressure_msl',
          'wind_speed_10m',
          'wind_direction_10m',
          'wind_gusts_10m',
          'uv_index',
          'cloud_cover',
          'precipitation',
          'weather_code'
        ].join(','),
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'pressure_msl',
          'wind_speed_10m',
          'wind_direction_10m',
          'precipitation',
          'precipitation_probability',
          'weather_code',
          'cloud_cover',
          'visibility'
        ].join(','),
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'precipitation_probability_max',
          'wind_speed_10m_max',
          'uv_index_max',
          'sunrise',
          'sunset',
          'weather_code'
        ].join(','),
        timezone: 'auto',
        forecast_days: '7'
      });

      const url = `${this.baseUrl}/forecast?${params}`;
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'User-Agent': 'Fishivo/1.0'
      };
      
      // Add API key if using private instance
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status}`);
      }

      const rawData = await response.json();
      
      const validatedData = OpenMeteoResponseSchema.parse(rawData);
      
      return this.transformToUnifiedFormat(validatedData, lat, lon);
    } catch (error) {
      clearTimeout(timeout);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(30000, { provider: this.name });
      }
      
      if (error instanceof Error && error.message.includes('parse')) {
        throw new ParseError(this.name, error);
      }
      
      throw new ProviderError(this.name, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      clearTimeout(timeout);
    }
  }

  private transformToUnifiedFormat(data: any, lat: number, lon: number): WeatherData {
    const { current, hourly, daily, timezone } = data;

    const currentWeather: CurrentWeather = {
      temperature: current.temperature_2m,
      apparent_temperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      pressure: current.pressure_msl,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      windGust: current.wind_gusts_10m,
      uvIndex: current.uv_index || 0,
      visibility: 10000, // Open-Meteo doesn't provide visibility in current
      cloudCover: current.cloud_cover,
      precipitation: current.precipitation,
      weatherCode: current.weather_code
    };

    const hourlyWeather: HourlyWeather[] = hourly.time.map((time: string, index: number) => ({
      time,
      temperature: hourly.temperature_2m[index],
      humidity: hourly.relative_humidity_2m[index],
      windSpeed: hourly.wind_speed_10m[index],
      windDirection: hourly.wind_direction_10m[index],
      precipitation: hourly.precipitation[index],
      precipitationProbability: hourly.precipitation_probability[index] || 0,
      weatherCode: hourly.weather_code[index],
      cloudCover: hourly.cloud_cover[index],
      pressure: hourly.pressure_msl[index],
      visibility: hourly.visibility[index]
    }));

    const dailyWeather: DailyWeather[] = daily.time.map((date: string, index: number) => ({
      date,
      temperatureMax: daily.temperature_2m_max[index],
      temperatureMin: daily.temperature_2m_min[index],
      precipitationSum: daily.precipitation_sum[index],
      precipitationProbability: daily.precipitation_probability_max[index] || 0,
      windSpeedMax: daily.wind_speed_10m_max[index],
      uvIndexMax: daily.uv_index_max[index] || 0,
      sunrise: daily.sunrise[index],
      sunset: daily.sunset[index],
      weatherCode: daily.weather_code[index]
    }));

    return {
      current: currentWeather,
      hourly: hourlyWeather.slice(0, 168), // 7 days
      daily: dailyWeather,
      metadata: {
        provider: this.name,
        location: `${lat},${lon}`,
        lastUpdated: new Date().toISOString(),
        cached: false
      }
    };
  }
}