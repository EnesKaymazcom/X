import { AstronomyData } from '../types';

interface IPGeolocationResponse {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_altitude: number;
  moon_azimuth: number;
  moon_distance: number;
  sun_altitude: number;
  sun_azimuth: number;
  sun_distance: number;
  solar_noon: string;
  day_length: string;
}

export class IPGeolocationProvider {
  name = 'ipgeolocation';
  private readonly baseUrl = 'https://api.ipgeolocation.io/astronomy';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchAstronomy(lat: number, lon: number, date?: string): Promise<AstronomyData | null> {
    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        lat: lat.toString(),
        long: lon.toString()
      });

      if (date) {
        params.append('date', date);
      }

      const url = `${this.baseUrl}?${params}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`IPGeolocation API error: ${response.status}`);
      }

      const data: IPGeolocationResponse = await response.json();
      return this.transformToAstronomyData(data);
    } catch (error) {
      console.error('IPGeolocation provider error:', error);
      return null;
    }
  }

  private transformToAstronomyData(data: IPGeolocationResponse): AstronomyData {
    const moonPhase = this.getMoonPhaseName(data.moon_phase);
    const moonIllumination = this.calculateMoonIllumination(data.moon_phase);
    
    // Solunar teori için major ve minor periyotları hesapla
    const { majorPeriods, minorPeriods } = this.calculateSolunarPeriods(
      data.moonrise,
      data.moonset,
      data.sunrise,
      data.sunset
    );

    return {
      moonPhase,
      moonIllumination,
      moonrise: data.moonrise,
      moonset: data.moonset,
      sunrise: data.sunrise,
      sunset: data.sunset,
      majorPeriods,
      minorPeriods
    };
  }

  private getMoonPhaseName(phase: string): string {
    // IPGeolocation API'den gelen phase değerini standart isimlere çevir
    const phaseMap: Record<string, string> = {
      'New Moon': 'new_moon',
      'Waxing Crescent': 'waxing_crescent',
      'First Quarter': 'first_quarter',
      'Waxing Gibbous': 'waxing_gibbous',
      'Full Moon': 'full_moon',
      'Waning Gibbous': 'waning_gibbous',
      'Last Quarter': 'last_quarter',
      'Waning Crescent': 'waning_crescent'
    };

    return phaseMap[phase] || 'unknown';
  }

  private calculateMoonIllumination(phase: string): number {
    // Ay evresine göre yaklaşık aydınlanma yüzdesi
    const illuminationMap: Record<string, number> = {
      'New Moon': 0,
      'Waxing Crescent': 25,
      'First Quarter': 50,
      'Waxing Gibbous': 75,
      'Full Moon': 100,
      'Waning Gibbous': 75,
      'Last Quarter': 50,
      'Waning Crescent': 25
    };

    return illuminationMap[phase] || 0;
  }

  private calculateSolunarPeriods(
    moonrise: string,
    moonset: string,
    sunrise: string,
    sunset: string
  ): { majorPeriods: Array<{ start: string; end: string }>; minorPeriods: Array<{ start: string; end: string }> } {
    const majorPeriods: Array<{ start: string; end: string }> = [];
    const minorPeriods: Array<{ start: string; end: string }> = [];

    // Major periyotlar (ay doğuşu/batışı etrafında)
    if (moonrise && moonrise !== '-') {
      const moonriseTime = this.parseTime(moonrise);
      majorPeriods.push({
        start: this.addMinutes(moonriseTime, -60),
        end: this.addMinutes(moonriseTime, 60)
      });
    }

    if (moonset && moonset !== '-') {
      const moonsetTime = this.parseTime(moonset);
      majorPeriods.push({
        start: this.addMinutes(moonsetTime, -60),
        end: this.addMinutes(moonsetTime, 60)
      });
    }

    // Minor periyotlar (ay zenit ve nadir zamanları - yaklaşık hesaplama)
    if (moonrise && moonset && moonrise !== '-' && moonset !== '-') {
      const moonriseTime = this.parseTime(moonrise);
      const moonsetTime = this.parseTime(moonset);
      
      // Zenit (ay en yüksekte)
      const zenitTime = this.calculateMidpoint(moonriseTime, moonsetTime);
      minorPeriods.push({
        start: this.addMinutes(zenitTime, -30),
        end: this.addMinutes(zenitTime, 30)
      });

      // Nadir (ay en alçakta)
      const nadirTime = new Date(zenitTime.getTime() + 720 * 60000); // 12 saat sonra
      minorPeriods.push({
        start: this.addMinutes(nadirTime, -30),
        end: this.addMinutes(nadirTime, 30)
      });
    }

    return { majorPeriods, minorPeriods };
  }

  private parseTime(timeStr: string): Date {
    const today = new Date();
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour = hours;
    if (period === 'PM' && hours !== 12) hour += 12;
    if (period === 'AM' && hours === 12) hour = 0;
    
    today.setHours(hour, minutes, 0, 0);
    return today;
  }

  private addMinutes(date: Date, minutes: number): string {
    const newDate = new Date(date.getTime() + minutes * 60000);
    return newDate.toISOString();
  }

  private calculateMidpoint(time1: Date, time2: Date): Date {
    const diff = time2.getTime() - time1.getTime();
    return new Date(time1.getTime() + diff / 2);
  }
}