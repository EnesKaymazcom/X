// weatherUtils.ts - Weather-related utility functions
// Adapted for TurboRepo structure

// TODO: Import theme from theme system when available
const theme = {
  colors: {
    textSecondary: '#6B7280'
  }
};

export interface WeatherCondition {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  rating?: string;
}

export interface WeatherLocation {
  type: 'current' | 'manual' | 'spot';
  name: string;
  latitude: number;
  longitude: number;
}

// Hava durumu koşuluna göre ikon al
export const getConditionIcon = (condition: string): string => {
  switch (condition) {
    // Açık hava durumları
    case 'Açık':
    case 'Clear':
    case 'Sunny': 
      return 'sun';
    
    // Bulutlu hava durumları
    case 'Az Bulutlu':
    case 'Parçalı Bulutlu':
    case 'Kapalı':
    case 'Sisli':
    case 'Partly Cloudy':
    case 'Cloudy':
    case 'Overcast':
    case 'Foggy': 
      return 'cloud';
    
    // Yağmurlu hava durumları
    case 'Hafif Yağmurlu':
    case 'Yağmurlu':
    case 'Şiddetli Yağmurlu':
    case 'Sağanak Yağış':
    case 'Light Rain':
    case 'Rain':
    case 'Heavy Rain':
    case 'Shower': 
      return 'cloud-rain';
    
    // Kar yağışı
    case 'Kar Yağışlı':
    case 'Karla Karışık Yağmur':
    case 'Snow':
    case 'Sleet': 
      return 'cloud-snow';
    
    // Fırtınalı hava
    case 'Gök Gürültülü':
    case 'Gök Gürültülü Yağmurlu':
    case 'Fırtınalı':
    case 'Thunderstorm':
    case 'Storm': 
      return 'zap';
    
    // Sisli hava
    case 'Sisli':
    case 'Puslu':
    case 'Fog':
    case 'Mist': 
      return 'cloud';
    
    default: 
      return 'cloud';
  }
};

// Balık tutma durumu değerlendirmesine göre renk al
export const getRatingColor = (rating: string): string => {
  switch (rating) {
    case 'Mükemmel':
    case 'Excellent':
    case 'Perfect': 
      return '#22C55E';
    case 'İyi':
    case 'Good':
    case 'Very Good': 
      return '#10B981';
    case 'Orta':
    case 'Average':
    case 'Fair':
    case 'Moderate': 
      return '#F59E0B';
    case 'Kötü':
    case 'Poor':
    case 'Bad': 
      return '#EF4444';
    default: 
      return theme.colors.textSecondary;
  }
};

// Konum tipine göre ikon al
export const getLocationIcon = (type: string): string => {
  switch (type) {
    case 'current': 
      return 'navigation';
    case 'manual': 
      return 'map-pin';
    case 'spot': 
      return 'flag';
    case 'saved': 
      return 'bookmark';
    case 'favorite': 
      return 'heart';
    default: 
      return 'map-pin';
  }
};

// Rüzgar yönünü derece cinsinden metne çevir
export const getWindDirectionText = (degrees: number): string => {
  const directions = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GKD', 'G', 'GKB', 'KB', 'KKB'];
  const index = Math.round(degrees / 30) % 12;
  return directions[index];
};

// İngilizce rüzgar yönü
export const getWindDirectionTextEN = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// UV indeks seviyesini belirle
export const getUVIndexLevel = (uvIndex: number): string => {
  if (uvIndex <= 2) return 'Düşük';
  if (uvIndex <= 5) return 'Orta';
  if (uvIndex <= 7) return 'Yüksek';
  if (uvIndex <= 10) return 'Çok Yüksek';
  return 'Aşırı';
};

// UV indeks seviyesi (İngilizce)
export const getUVIndexLevelEN = (uvIndex: number): string => {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
};

// UV indeks rengini al
export const getUVIndexColor = (uvIndex: number): string => {
  if (uvIndex <= 2) return '#22C55E'; // Yeşil
  if (uvIndex <= 5) return '#F59E0B'; // Sarı
  if (uvIndex <= 7) return '#F97316'; // Turuncu
  if (uvIndex <= 10) return '#EF4444'; // Kırmızı
  return '#7C2D12'; // Koyu kırmızı
};

// Hava durumu kalitesini değerlendir
export const evaluateWeatherForFishing = (weather: WeatherCondition): string => {
  let score = 0;
  
  // Sıcaklık değerlendirmesi (15-25°C ideal)
  if (weather.temperature >= 15 && weather.temperature <= 25) {
    score += 25;
  } else if (weather.temperature >= 10 && weather.temperature <= 30) {
    score += 15;
  } else {
    score += 5;
  }
  
  // Rüzgar hızı değerlendirmesi (5-15 km/h ideal)
  if (weather.windSpeed >= 5 && weather.windSpeed <= 15) {
    score += 25;
  } else if (weather.windSpeed <= 25) {
    score += 15;
  } else {
    score += 5;
  }
  
  // Basınç değerlendirmesi (1013-1023 hPa ideal)
  if (weather.pressure >= 1013 && weather.pressure <= 1023) {
    score += 25;
  } else if (weather.pressure >= 1000 && weather.pressure <= 1030) {
    score += 15;
  } else {
    score += 5;
  }
  
  // Hava durumu koşulu değerlendirmesi
  if (weather.condition.includes('Açık') || weather.condition.includes('Clear')) {
    score += 25;
  } else if (weather.condition.includes('Bulutlu') || weather.condition.includes('Cloudy')) {
    score += 15;
  } else if (weather.condition.includes('Yağmur') || weather.condition.includes('Rain')) {
    score += 5;
  } else {
    score += 10;
  }
  
  // Sonuç değerlendirmesi
  if (score >= 80) return 'Mükemmel';
  if (score >= 60) return 'İyi';
  if (score >= 40) return 'Orta';
  return 'Kötü';
};

// Hava durumu önerileri
export const getWeatherAdvice = (weather: WeatherCondition): string[] => {
  const advice: string[] = [];
  
  if (weather.windSpeed > 25) {
    advice.push('Güçlü rüzgar nedeniyle dikkatli olun');
  }
  
  if (weather.temperature < 10) {
    advice.push('Soğuk hava için uygun kıyafet giyin');
  }
  
  if (weather.temperature > 30) {
    advice.push('Sıcak havada bol su için ve güneş kremi kullanın');
  }
  
  if (weather.uvIndex > 7) {
    advice.push('Yüksek UV indeksi - güneş koruması gerekli');
  }
  
  if (weather.condition.includes('Yağmur') || weather.condition.includes('Rain')) {
    advice.push('Yağmur nedeniyle su geçirmez kıyafet öneririz');
  }
  
  if (weather.visibility < 5) {
    advice.push('Düşük görüş mesafesi - dikkatli olun');
  }
  
  return advice;
};

// Sıcaklık birimini dönüştür
export const convertTemperature = (temp: number, from: 'C' | 'F', to: 'C' | 'F'): number => {
  if (from === to) return temp;
  
  if (from === 'C' && to === 'F') {
    return (temp * 9/5) + 32;
  }
  
  if (from === 'F' && to === 'C') {
    return (temp - 32) * 5/9;
  }
  
  return temp;
};

// Rüzgar hızı birimini dönüştür
export const convertWindSpeed = (speed: number, from: 'kmh' | 'mph' | 'ms' | 'knots', to: 'kmh' | 'mph' | 'ms' | 'knots'): number => {
  if (from === to) return speed;
  
  // Önce km/h'ye çevir
  let kmh = speed;
  switch (from) {
    case 'mph':
      kmh = speed * 1.60934;
      break;
    case 'ms':
      kmh = speed * 3.6;
      break;
    case 'knots':
      kmh = speed * 1.852;
      break;
  }
  
  // Hedef birime çevir
  switch (to) {
    case 'mph':
      return kmh / 1.60934;
    case 'ms':
      return kmh / 3.6;
    case 'knots':
      return kmh / 1.852;
    default:
      return kmh;
  }
};

export default {
  getConditionIcon,
  getRatingColor,
  getLocationIcon,
  getWindDirectionText,
  getWindDirectionTextEN,
  getUVIndexLevel,
  getUVIndexLevelEN,
  getUVIndexColor,
  evaluateWeatherForFishing,
  getWeatherAdvice,
  convertTemperature,
  convertWindSpeed
};