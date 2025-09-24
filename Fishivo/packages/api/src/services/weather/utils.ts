import { FishingConditions } from './types';

export function calculateFishingScore(params: {
  pressure: number;
  pressureTrend: string;
  moonPhase?: string;
  moonIllumination?: number;
  temperature: number;
  windSpeed: number;
  cloudCover: number;
  tides?: Array<{ time: string; height: number; type: 'high' | 'low' }>;
}): number {
  let score = 50; // Base score

  // Basınç faktörü (en önemli)
  if (params.pressure >= 1013 && params.pressure <= 1020) {
    score += 20;
  } else if (params.pressure < 1009 || params.pressure > 1025) {
    score -= 20;
  }

  // Basınç trendi
  if (params.pressureTrend === 'rising') {
    score += 10;
  } else if (params.pressureTrend === 'falling') {
    score -= 10;
  }

  // Ay evresi
  if (params.moonPhase) {
    if (params.moonPhase === 'new_moon' || params.moonPhase === 'full_moon') {
      score += 15;
    } else if (params.moonPhase === 'first_quarter' || params.moonPhase === 'last_quarter') {
      score += 10;
    }
  }

  // Sıcaklık
  if (params.temperature >= 15 && params.temperature <= 25) {
    score += 10;
  } else if (params.temperature < 5 || params.temperature > 35) {
    score -= 15;
  }

  // Rüzgar hızı
  if (params.windSpeed < 15) {
    score += 10;
  } else if (params.windSpeed > 30) {
    score -= 20;
  }

  // Bulut örtüsü
  if (params.cloudCover >= 30 && params.cloudCover <= 70) {
    score += 5;
  }

  // Score'u 0-100 arasında sınırla
  return Math.max(0, Math.min(100, score));
}

export function getRating(score: number): 'poor' | 'fair' | 'good' | 'excellent' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

export function calculatePressureTrend(hourlyData: Array<{ pressure?: number }>): string {
  if (!hourlyData || hourlyData.length < 3) return 'stable';

  const recentPressures = hourlyData
    .slice(0, 3)
    .map(h => h.pressure)
    .filter(p => p !== undefined) as number[];

  if (recentPressures.length < 2) return 'stable';

  const diff = recentPressures[0] - recentPressures[recentPressures.length - 1];
  
  if (diff > 1) return 'rising';
  if (diff < -1) return 'falling';
  return 'stable';
}

export function getPressureImpact(pressure: number, trend: string): string {
  if (pressure >= 1013 && pressure <= 1020 && trend === 'stable') {
    return 'İdeal koşullar';
  }
  if (trend === 'rising') {
    return 'İyileşen koşullar';
  }
  if (trend === 'falling') {
    return 'Kötüleşen koşullar';
  }
  if (pressure < 1009) {
    return 'Düşük basınç - zayıf aktivite';
  }
  if (pressure > 1025) {
    return 'Yüksek basınç - düşük aktivite';
  }
  return 'Normal koşullar';
}

export function getMoonImpact(moonPhase?: string): string {
  if (!moonPhase) return 'Bilinmiyor';
  
  const impacts: Record<string, string> = {
    'new_moon': 'En iyi zamanlar - yüksek aktivite',
    'waxing_crescent': 'Artan aktivite',
    'first_quarter': 'İyi aktivite',
    'waxing_gibbous': 'Orta aktivite',
    'full_moon': 'En iyi zamanlar - yüksek aktivite',
    'waning_gibbous': 'Azalan aktivite',
    'last_quarter': 'Orta aktivite',
    'waning_crescent': 'Düşük aktivite'
  };
  
  return impacts[moonPhase] || 'Normal aktivite';
}

export function getTemperatureImpact(temp: number): string {
  if (temp < 5) return 'Çok soğuk - düşük aktivite';
  if (temp >= 5 && temp < 15) return 'Serin - orta aktivite';
  if (temp >= 15 && temp <= 25) return 'İdeal sıcaklık';
  if (temp > 25 && temp <= 30) return 'Sıcak - orta aktivite';
  if (temp > 30) return 'Çok sıcak - düşük aktivite';
  return 'Normal';
}

export function getWindImpact(windSpeed: number): string {
  if (windSpeed < 10) return 'Sakin - ideal koşullar';
  if (windSpeed >= 10 && windSpeed < 20) return 'Hafif rüzgar - iyi koşullar';
  if (windSpeed >= 20 && windSpeed < 30) return 'Orta rüzgar - zor koşullar';
  if (windSpeed >= 30) return 'Güçlü rüzgar - kötü koşullar';
  return 'Normal';
}

export function generateRecommendations(score: number, data: any): string[] {
  const recommendations: string[] = [];
  const rating = getRating(score);

  // Genel öneri
  if (rating === 'excellent') {
    recommendations.push('Mükemmel balık tutma günü! En iyi zamanları kaçırmayın.');
  } else if (rating === 'good') {
    recommendations.push('İyi bir balık tutma günü. Sabah ve akşam saatlerini tercih edin.');
  } else if (rating === 'fair') {
    recommendations.push('Orta seviye aktivite bekleniyor. Sabırlı olun.');
  } else {
    recommendations.push('Zor koşullar. Farklı bir gün denemeyi düşünün.');
  }

  // Özel öneriler
  if (data.astronomy?.majorPeriods?.length > 0) {
    const period = data.astronomy.majorPeriods[0];
    recommendations.push(`En iyi zaman: ${new Date(period.start).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`);
  }

  if (data.weather?.current?.windSpeed > 20) {
    recommendations.push('Rüzgar hızı yüksek. Korunaklı alanları tercih edin.');
  }

  if (data.weather?.current?.pressure < 1009) {
    recommendations.push('Düşük basınç. Derin sularda deneyin.');
  }

  return recommendations;
}