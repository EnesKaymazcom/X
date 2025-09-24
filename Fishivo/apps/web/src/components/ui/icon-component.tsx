// Simple weather icon mapping placeholder
const weatherIconMappings: Record<string, string> = {
  '800': 'day-sunny',
  '800d': 'day-sunny',
  '800n': 'night-clear',
  '801': 'day-cloudy',
  '801d': 'day-cloudy',
  '801n': 'night-alt-cloudy',
  '802': 'cloud',
  '803': 'cloudy',
  '804': 'cloudy',
  '500': 'rain',
  '501': 'rain',
  '502': 'rain',
  '600': 'snow',
  '200': 'thunderstorm',
  '701': 'fog',
  // Default
  'default': 'day-sunny'
}
import Image from "next/image"

interface IconComponentProps {
  weatherCode: any
  x?: any
  className?: string
}

// Backend'den gelen Türkçe hava durumu condition'larını weather code'lara çevir
const conditionToCode = (condition: string): string => {
  const conditionLower = condition.toLowerCase()
  
  if (conditionLower.includes('açık') || conditionLower.includes('güneşli')) {
    return '800' // Clear sky
  }
  if (conditionLower.includes('az bulutlu')) {
    return '801' // Few clouds
  }
  if (conditionLower.includes('parçalı bulutlu')) {
    return '802' // Scattered clouds
  }
  if (conditionLower.includes('bulutlu') || conditionLower.includes('kapalı')) {
    return '804' // Overcast clouds
  }
  // Yağmur varyasyonları
  if (conditionLower.includes('şiddetli yağmurlu')) {
    return '502' // Heavy rain
  }
  if (conditionLower.includes('hafif yağmurlu')) {
    return '500' // Light rain
  }
  if (conditionLower.includes('yağmurlu') || conditionLower.includes('yağmur')) {
    return '501' // Moderate rain
  }
  if (conditionLower.includes('kar')) {
    return '600' // Snow
  }
  if (conditionLower.includes('fırtına')) {
    return '200' // Thunderstorm
  }
  if (conditionLower.includes('sis') || conditionLower.includes('duman')) {
    return '701' // Mist
  }
  
  // Varsayılan olarak açık hava
  return '800'
}

export default function IconComponent({
  weatherCode,
  x,
  className,
}: IconComponentProps) {
  // Eğer weatherCode string ise (backend'den gelen condition), code'a çevir
  const actualWeatherCode = typeof weatherCode === 'string' && isNaN(Number(weatherCode))
    ? conditionToCode(weatherCode)
    : String(weatherCode)
    
  const iconNameKey = x ? `${actualWeatherCode}${x}` : actualWeatherCode
  const iconName = weatherIconMappings[iconNameKey]
  
  // Debug için
  // Debug logs removed for production

  // Hava durumu durumuna göre renkler
  const getWeatherColor = (code: string) => {
    const codeStr = String(code)
    
    // Güneşli hava (800)
    if (codeStr.startsWith('800')) {
      return '#F59E0B' // Altın sarısı
    }
    // Bulutlu hava (801-804)  
    if (codeStr.startsWith('80')) {
      return '#6B7280' // Gri
    }
    // Yağmurlu hava (5xx, 3xx)
    if (codeStr.startsWith('5') || codeStr.startsWith('3')) {
      return '#3B82F6' // Mavi
    }
    // Fırtınalı hava (2xx)
    if (codeStr.startsWith('2')) {
      return '#8B5CF6' // Mor
    }
    // Karlı hava (6xx)
    if (codeStr.startsWith('6')) {
      return '#E5E7EB' // Açık gri (kar)
    }
    // Sisli/dumanlı hava (7xx)
    if (codeStr.startsWith('7')) {
      return '#9CA3AF' // Orta gri
    }
    
    // Varsayılan renk
    return '#374151'
  }

  // Hava durumu durumuna göre CSS filter
  const getWeatherFilter = (code: string) => {
    const codeStr = String(code)
    
    // Debug log removed for production
    
    // Güneşli hava (800) - Altın sarısı
    if (codeStr.startsWith('800')) {
      // Güneşli filter
      return 'brightness(0) saturate(100%) invert(69%) sepia(58%) saturate(2134%) hue-rotate(15deg) brightness(102%) contrast(96%)'
    }
    // Bulutlu hava (801-804) - Gri  
    if (codeStr.startsWith('80')) {
      // Bulutlu filter
      return 'brightness(0) saturate(100%) invert(50%) sepia(8%) saturate(665%) hue-rotate(185deg) brightness(96%) contrast(85%)'
    }
    // Yağmurlu hava (5xx, 3xx) - Mavi
    if (codeStr.startsWith('5') || codeStr.startsWith('3')) {
      // Yağmurlu filter
      return 'brightness(0) saturate(100%) invert(29%) sepia(99%) saturate(1678%) hue-rotate(212deg) brightness(99%) contrast(93%)'
    }
    // Fırtınalı hava (2xx) - Mor
    if (codeStr.startsWith('2')) {
      return 'brightness(0) saturate(100%) invert(46%) sepia(54%) saturate(4717%) hue-rotate(244deg) brightness(96%) contrast(94%)'
    }
    // Karlı hava (6xx) - Açık gri
    if (codeStr.startsWith('6')) {
      return 'brightness(0) saturate(100%) invert(92%) sepia(5%) saturate(346%) hue-rotate(185deg) brightness(96%) contrast(89%)'
    }
    // Sisli/dumanlı hava (7xx) - Orta gri
    if (codeStr.startsWith('7')) {
      return 'brightness(0) saturate(100%) invert(64%) sepia(11%) saturate(665%) hue-rotate(185deg) brightness(96%) contrast(85%)'
    }
    
    // Varsayılan - Koyu gri
    return 'brightness(0) saturate(100%) invert(25%) sepia(15%) saturate(1019%) hue-rotate(185deg) brightness(95%) contrast(86%)'
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        fill
        alt={weatherCode}
        src={`/icons/wi-${iconName}.svg`}
        className="select-none"
        style={{
          filter: getWeatherFilter(actualWeatherCode),
        }}
      />
    </div>
  )
}