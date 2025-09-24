import { WeatherData, WeatherProvider, CurrentWeather, HourlyWeather, DailyWeather, WeatherAlert } from '../types';

export class NWSProvider implements WeatherProvider {
  name = 'nws';
  private readonly baseUrl = 'https://api.weather.gov';
  private readonly userAgent = 'Fishivo/1.0 (contact@fishivo.com)';

  supports(lat: number, lon: number): boolean {
    // ABD ve ABD toprakları sınırları
    return (
      lat >= 24.396308 && lat <= 49.384358 && 
      lon >= -125.0 && lon <= -66.93457
    ) || (
      // Alaska
      lat >= 51.0 && lat <= 71.5 && 
      lon >= -180.0 && lon <= -129.0
    ) || (
      // Hawaii
      lat >= 18.0 && lat <= 23.0 && 
      lon >= -161.0 && lon <= -154.0
    );
  }

  async fetchWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      // 1. Grid koordinatlarını al
      const pointsResponse = await fetch(
        `${this.baseUrl}/points/${lat},${lon}`,
        { headers: { 'User-Agent': this.userAgent } }
      );

      if (!pointsResponse.ok) {
        throw new Error(`NWS Points API error: ${pointsResponse.status}`);
      }

      const pointsData = await pointsResponse.json();
      const properties = pointsData.properties;

      // 2. Paralel olarak verileri al
      const [forecastData, hourlyData, observationsData, alertsData] = await Promise.all([
        this.fetchForecast(properties.forecast),
        this.fetchHourlyForecast(properties.forecastHourly),
        this.fetchObservations(properties.observationStations),
        this.fetchAlerts(lat, lon)
      ]);

      return this.transformToUnifiedFormat(
        forecastData,
        hourlyData,
        observationsData,
        alertsData,
        lat,
        lon
      );
    } catch (error) {
      console.error('NWS provider error:', error);
      throw error;
    }
  }

  private async fetchForecast(url: string): Promise<any> {
    const response = await fetch(url, {
      headers: { 'User-Agent': this.userAgent }
    });
    
    if (!response.ok) {
      throw new Error(`NWS Forecast API error: ${response.status}`);
    }
    
    return response.json();
  }

  private async fetchHourlyForecast(url: string): Promise<any> {
    const response = await fetch(url, {
      headers: { 'User-Agent': this.userAgent }
    });
    
    if (!response.ok) {
      throw new Error(`NWS Hourly API error: ${response.status}`);
    }
    
    return response.json();
  }

  private async fetchObservations(stationsUrl: string): Promise<any> {
    try {
      const stationsResponse = await fetch(stationsUrl, {
        headers: { 'User-Agent': this.userAgent }
      });
      
      if (!stationsResponse.ok) {
        return null;
      }
      
      const stationsData = await stationsResponse.json();
      if (!stationsData.features || stationsData.features.length === 0) {
        return null;
      }

      const stationId = stationsData.features[0].properties.stationIdentifier;
      const observationsResponse = await fetch(
        `${this.baseUrl}/stations/${stationId}/observations/latest`,
        { headers: { 'User-Agent': this.userAgent } }
      );

      if (!observationsResponse.ok) {
        return null;
      }

      return observationsResponse.json();
    } catch (error) {
      console.error('Error fetching observations:', error);
      return null;
    }
  }

  private async fetchAlerts(lat: number, lon: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/alerts/active?point=${lat},${lon}`,
        { headers: { 'User-Agent': this.userAgent } }
      );
      
      if (!response.ok) {
        return null;
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return null;
    }
  }

  private transformToUnifiedFormat(
    forecastData: any,
    hourlyData: any,
    observationsData: any,
    alertsData: any,
    lat: number,
    lon: number
  ): WeatherData {
    const currentWeather = this.parseCurrentWeather(observationsData, hourlyData);
    const hourlyWeather = this.parseHourlyWeather(hourlyData);
    const dailyWeather = this.parseDailyWeather(forecastData);
    const alerts = this.parseAlerts(alertsData);

    return {
      current: currentWeather,
      hourly: hourlyWeather,
      daily: dailyWeather,
      alerts,
      metadata: {
        provider: this.name,
        location: `${lat},${lon}`,
        lastUpdated: new Date().toISOString(),
        cached: false
      }
    };
  }

  private parseCurrentWeather(observations: any, hourly: any): CurrentWeather {
    if (observations && observations.properties) {
      const props = observations.properties;
      return {
        temperature: props.temperature?.value ?? 0,
        apparent_temperature: props.heatIndex?.value ?? props.windChill?.value ?? props.temperature?.value ?? 0,
        humidity: props.relativeHumidity?.value ?? 0,
        pressure: props.barometricPressure?.value ? props.barometricPressure.value / 100 : 1013,
        windSpeed: props.windSpeed?.value ?? 0,
        windDirection: props.windDirection?.value ?? 0,
        windGust: props.windGust?.value,
        uvIndex: 0, // NWS doesn't provide UV index
        visibility: props.visibility?.value ?? 10000,
        cloudCover: this.parseCloudCover(props.textDescription),
        precipitation: props.precipitationLastHour?.value ?? 0,
        weatherCode: this.mapToWeatherCode(props.textDescription)
      };
    }

    // Fallback to hourly data if observations are not available
    if (hourly && hourly.properties && hourly.properties.periods.length > 0) {
      const current = hourly.properties.periods[0];
      return {
        temperature: current.temperature,
        apparent_temperature: current.temperature,
        humidity: current.relativeHumidity?.value ?? 50,
        pressure: 1013, // Default
        windSpeed: this.parseWindSpeed(current.windSpeed),
        windDirection: this.parseWindDirection(current.windDirection),
        windGust: undefined,
        uvIndex: 0,
        visibility: 10000,
        cloudCover: 50,
        precipitation: 0,
        weatherCode: this.mapToWeatherCode(current.shortForecast)
      };
    }

    // Default values if no data available
    return {
      temperature: 0,
      apparent_temperature: 0,
      humidity: 0,
      pressure: 1013,
      windSpeed: 0,
      windDirection: 0,
      uvIndex: 0,
      visibility: 10000,
      cloudCover: 0,
      precipitation: 0,
      weatherCode: 0
    };
  }

  private parseHourlyWeather(hourlyData: any): HourlyWeather[] {
    if (!hourlyData || !hourlyData.properties || !hourlyData.properties.periods) {
      return [];
    }

    return hourlyData.properties.periods.map((period: any) => ({
      time: period.startTime,
      temperature: period.temperature,
      humidity: period.relativeHumidity?.value ?? 50,
      windSpeed: this.parseWindSpeed(period.windSpeed),
      windDirection: this.parseWindDirection(period.windDirection),
      precipitation: period.probabilityOfPrecipitation?.value ? period.probabilityOfPrecipitation.value / 100 : 0,
      precipitationProbability: period.probabilityOfPrecipitation?.value ?? 0,
      weatherCode: this.mapToWeatherCode(period.shortForecast),
      cloudCover: this.parseCloudCover(period.shortForecast)
    }));
  }

  private parseDailyWeather(forecastData: any): DailyWeather[] {
    if (!forecastData || !forecastData.properties || !forecastData.properties.periods) {
      return [];
    }

    const periods = forecastData.properties.periods;
    const dailyData: DailyWeather[] = [];

    for (let i = 0; i < periods.length; i += 2) {
      const day = periods[i];
      const night = periods[i + 1];

      if (!day) continue;

      dailyData.push({
        date: day.startTime.split('T')[0],
        temperatureMax: day.temperature,
        temperatureMin: night ? night.temperature : day.temperature - 10,
        precipitationSum: 0, // NWS doesn't provide daily precipitation sum
        precipitationProbability: Math.max(
          day.probabilityOfPrecipitation?.value ?? 0,
          night?.probabilityOfPrecipitation?.value ?? 0
        ),
        windSpeedMax: Math.max(
          this.parseWindSpeed(day.windSpeed),
          night ? this.parseWindSpeed(night.windSpeed) : 0
        ),
        uvIndexMax: 0, // NWS doesn't provide UV index
        sunrise: '', // Will be filled by astronomy provider
        sunset: '', // Will be filled by astronomy provider
        weatherCode: this.mapToWeatherCode(day.shortForecast)
      });
    }

    return dailyData.slice(0, 7); // Return only 7 days
  }

  private parseAlerts(alertsData: any): WeatherAlert[] {
    if (!alertsData || !alertsData.features) {
      return [];
    }

    return alertsData.features.map((feature: any) => ({
      title: feature.properties.headline,
      description: feature.properties.description,
      severity: feature.properties.severity,
      start: feature.properties.onset,
      end: feature.properties.expires
    }));
  }

  private parseWindSpeed(windSpeed: string): number {
    if (!windSpeed) return 0;
    const match = windSpeed.match(/\d+/);
    return match ? parseInt(match[0]) * 1.60934 : 0; // Convert mph to km/h
  }

  private parseWindDirection(direction: string): number {
    const directions: Record<string, number> = {
      'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
      'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
      'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
      'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    };
    return directions[direction] ?? 0;
  }

  private parseCloudCover(description: string): number {
    if (!description) return 0;
    const lower = description.toLowerCase();
    if (lower.includes('clear') || lower.includes('sunny')) return 0;
    if (lower.includes('few')) return 25;
    if (lower.includes('scattered')) return 50;
    if (lower.includes('broken')) return 75;
    if (lower.includes('overcast') || lower.includes('cloudy')) return 100;
    return 50;
  }

  private mapToWeatherCode(description: string): number {
    if (!description) return 0;
    const lower = description.toLowerCase();
    
    // Weather codes mapping (simplified)
    if (lower.includes('clear') || lower.includes('sunny')) return 0;
    if (lower.includes('partly')) return 2;
    if (lower.includes('cloudy')) return 3;
    if (lower.includes('fog')) return 45;
    if (lower.includes('drizzle')) return 51;
    if (lower.includes('rain')) return 61;
    if (lower.includes('snow')) return 71;
    if (lower.includes('shower')) return 80;
    if (lower.includes('thunderstorm')) return 95;
    
    return 0;
  }
}