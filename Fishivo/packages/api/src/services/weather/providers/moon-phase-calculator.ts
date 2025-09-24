import { AstronomyData } from '../types';

/**
 * Offline ay evresi hesaplayıcı
 * IPGeolocation API limiti bittiğinde kullanılır
 * Algoritma: John Conway'in ay evresi algoritması
 */
export class MoonPhaseCalculator {
  name = 'moon-phase-calculator';

  /**
   * Verilen tarih için ay evresini hesaplar
   * @param date Tarih (varsayılan: bugün)
   * @returns Ay evresi bilgileri
   */
  calculateMoonPhase(date: Date = new Date()): {
    phase: string;
    illumination: number;
    age: number;
    emoji: string;
  } {
    // Ay döngüsü: 29.53059 gün
    const lunarCycle = 29.53059;
    
    // Bilinen yeni ay tarihi (referans noktası)
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    
    // Günleri hesapla
    const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    
    // Ay yaşını hesapla (0-29.53 arası)
    const moonAge = daysSinceNewMoon % lunarCycle;
    const normalizedAge = moonAge < 0 ? moonAge + lunarCycle : moonAge;
    
    // Ay evresini belirle
    let phase: string;
    let emoji: string;
    
    if (normalizedAge < 1.84566) {
      phase = 'new_moon';
      emoji = '🌑';
    } else if (normalizedAge < 5.53699) {
      phase = 'waxing_crescent';
      emoji = '🌒';
    } else if (normalizedAge < 9.22831) {
      phase = 'first_quarter';
      emoji = '🌓';
    } else if (normalizedAge < 12.91963) {
      phase = 'waxing_gibbous';
      emoji = '🌔';
    } else if (normalizedAge < 16.61096) {
      phase = 'full_moon';
      emoji = '🌕';
    } else if (normalizedAge < 20.30228) {
      phase = 'waning_gibbous';
      emoji = '🌖';
    } else if (normalizedAge < 23.99361) {
      phase = 'last_quarter';
      emoji = '🌗';
    } else {
      phase = 'waning_crescent';
      emoji = '🌘';
    }
    
    // Aydınlanma yüzdesini hesapla
    const illumination = this.calculateIllumination(normalizedAge);
    
    return {
      phase,
      illumination,
      age: normalizedAge,
      emoji
    };
  }

  /**
   * Ay yaşına göre aydınlanma yüzdesini hesaplar
   */
  private calculateIllumination(moonAge: number): number {
    const lunarCycle = 29.53059;
    const angle = (moonAge / lunarCycle) * 2 * Math.PI;
    
    // Basitleştirilmiş aydınlanma formülü
    const illumination = (1 - Math.cos(angle)) / 2 * 100;
    
    return Math.round(illumination);
  }

  /**
   * Gün doğumu ve batımını yaklaşık hesaplar
   * NOT: Bu basit bir hesaplamadır, tam doğruluk için API kullanın
   */
  calculateSunTimes(lat: number, lon: number, date: Date = new Date()): {
    sunrise: string;
    sunset: string;
  } {
    // Basit gün doğumu/batımı hesaplaması
    const J2000 = 2451545.0;
    const daysSinceJ2000 = (date.getTime() / 86400000) - 10957.5;
    const n = daysSinceJ2000 - lon / 360;
    
    // Solar noon
    const J = n + 0.0053 * Math.sin((357.5291 + 0.98560028 * n) * Math.PI / 180);
    
    // Güneş deklinasyonu
    const declination = 23.45 * Math.sin((360 * (284 + J) / 365) * Math.PI / 180);
    
    // Saat açısı
    const latRad = lat * Math.PI / 180;
    const decRad = declination * Math.PI / 180;
    const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad)) * 180 / Math.PI;
    
    // Gün doğumu ve batımı (UTC)
    const sunrise = 12 - hourAngle / 15 - lon / 15;
    const sunset = 12 + hourAngle / 15 - lon / 15;
    
    // Yerel saate çevir (yaklaşık)
    const timezoneOffset = Math.round(lon / 15);
    
    const sunriseLocal = new Date(date);
    sunriseLocal.setUTCHours(Math.floor(sunrise), (sunrise % 1) * 60, 0, 0);
    
    const sunsetLocal = new Date(date);
    sunsetLocal.setUTCHours(Math.floor(sunset), (sunset % 1) * 60, 0, 0);
    
    return {
      sunrise: sunriseLocal.toISOString(),
      sunset: sunsetLocal.toISOString()
    };
  }

  /**
   * Solunar periyotları hesaplar (basitleştirilmiş)
   */
  calculateSolunarPeriods(moonPhase: { age: number }, sunTimes: { sunrise: string; sunset: string }): {
    majorPeriods: Array<{ start: string; end: string }>;
    minorPeriods: Array<{ start: string; end: string }>;
  } {
    const date = new Date();
    const moonTransit = this.calculateMoonTransit(moonPhase.age, date);
    
    // Major periyotlar (ay doğuşu/batışı civarı)
    const majorPeriods = [
      {
        start: new Date(moonTransit.rise.getTime() - 60 * 60 * 1000).toISOString(),
        end: new Date(moonTransit.rise.getTime() + 60 * 60 * 1000).toISOString()
      },
      {
        start: new Date(moonTransit.set.getTime() - 60 * 60 * 1000).toISOString(),
        end: new Date(moonTransit.set.getTime() + 60 * 60 * 1000).toISOString()
      }
    ];
    
    // Minor periyotlar (ay zenit/nadir)
    const minorPeriods = [
      {
        start: new Date(moonTransit.transit.getTime() - 30 * 60 * 1000).toISOString(),
        end: new Date(moonTransit.transit.getTime() + 30 * 60 * 1000).toISOString()
      },
      {
        start: new Date(moonTransit.antiTransit.getTime() - 30 * 60 * 1000).toISOString(),
        end: new Date(moonTransit.antiTransit.getTime() + 30 * 60 * 1000).toISOString()
      }
    ];
    
    return { majorPeriods, minorPeriods };
  }

  /**
   * Ay geçişlerini hesaplar (yaklaşık)
   */
  private calculateMoonTransit(moonAge: number, date: Date): {
    rise: Date;
    set: Date;
    transit: Date;
    antiTransit: Date;
  } {
    // Ay'ın günlük hareketi yaklaşık 13.2 derece
    const moonDailyMotion = 13.2;
    const hoursPerDegree = 24 / 360;
    
    // Ay yaşına göre gecikme hesapla
    const delayHours = (moonAge * moonDailyMotion * hoursPerDegree);
    
    // Yaklaşık ay doğuşu/batışı (güneşe göre gecikme ile)
    const baseTime = new Date(date);
    baseTime.setHours(6, 0, 0, 0); // Sabah 6
    
    const rise = new Date(baseTime.getTime() + delayHours * 60 * 60 * 1000);
    const set = new Date(rise.getTime() + 12 * 60 * 60 * 1000); // 12 saat sonra
    const transit = new Date(rise.getTime() + 6 * 60 * 60 * 1000); // Zenit
    const antiTransit = new Date(transit.getTime() + 12 * 60 * 60 * 1000); // Nadir
    
    return { rise, set, transit, antiTransit };
  }

  /**
   * API verisi olmadan astronomi verisi oluştur
   */
  async fetchAstronomy(lat: number, lon: number, date?: string): Promise<AstronomyData> {
    const targetDate = date ? new Date(date) : new Date();
    
    // Ay evresi hesapla
    const moonData = this.calculateMoonPhase(targetDate);
    
    // Gün doğumu/batımı hesapla
    const sunTimes = this.calculateSunTimes(lat, lon, targetDate);
    
    // Solunar periyotları hesapla
    const solunarPeriods = this.calculateSolunarPeriods(moonData, sunTimes);
    
    // Yaklaşık ay doğuşu/batışı
    const moonTransit = this.calculateMoonTransit(moonData.age, targetDate);
    
    return {
      moonPhase: moonData.phase,
      moonIllumination: moonData.illumination,
      moonrise: moonTransit.rise.toISOString(),
      moonset: moonTransit.set.toISOString(),
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset,
      majorPeriods: solunarPeriods.majorPeriods,
      minorPeriods: solunarPeriods.minorPeriods
    };
  }
}