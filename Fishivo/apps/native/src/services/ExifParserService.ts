import { readAsync } from '@lodev09/react-native-exify';

export interface ExifMetadata {
  // Tarih ve saat bilgileri
  captureDate?: string;
  captureTime?: string;
  captureDateTime?: Date;
  
  // Konum bilgileri
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  altitude?: number;
  
  // Kamera bilgileri
  camera?: {
    make?: string;
    model?: string;
    orientation?: number;
  };
  
  // Hava durumu ipuçları
  weather?: {
    temperature?: number;
    humidity?: number;
    description?: string;
  };
  
  // Kontrol bilgileri
  hasLocation: boolean;
  hasDateTime: boolean;
  hasWeatherInfo: boolean;
  
  // Privacy ve güvenlik
  privacy: {
    shouldWarnUser: boolean;
    sensitiveDataFound: string[];
  };
}

export class ExifParserService {
  /**
   * Ana EXIF metadata çekme fonksiyonu
   */
  static async extractCatchMetadata(imageUri: string): Promise<ExifMetadata> {
    try {
      // @lodev09/react-native-exify ile EXIF data oku (MODAL AÇMIYOR!)
      const exif = await readAsync(imageUri);
      
      return {
        // Tarih ve saat işleme
        ...this.parseDateTime(exif),
        
        // GPS koordinatları işleme
        ...this.parseGPS(exif),
        
        // Kamera bilgileri
        camera: this.parseCamera(exif),
        
        // Hava durumu ipuçları
        weather: this.parseWeatherHints(exif),
        
        // Kontrol bilgileri
        hasLocation: this.hasValidGPS(exif),
        hasDateTime: this.hasValidDateTime(exif),
        hasWeatherInfo: this.hasWeatherInfo(exif),
        
        // Privacy kontrolü
        privacy: this.checkPrivacyConcerns(exif)
      };
    } catch (error) {
      console.warn('EXIF parsing error:', error);
      
      // Fallback - boş metadata döndür
      return {
        hasLocation: false,
        hasDateTime: false,
        hasWeatherInfo: false,
        privacy: {
          shouldWarnUser: false,
          sensitiveDataFound: []
        }
      };
    }
  }

  /**
   * Tarih ve saat parsing
   */
  private static parseDateTime(exif: any) {
    const result: any = {};
    
    // EXIF tarih formatları: "2024:01:15 14:30:25"
    const dateTimeOriginal = exif.DateTimeOriginal || exif.DateTime || exif.DateTimeDigitized;
    
    if (dateTimeOriginal) {
      try {
        // EXIF format: "YYYY:MM:DD HH:MM:SS" -> JavaScript Date
        const dateStr = dateTimeOriginal.replace(/:/g, '-').replace(/-(\d{2}:\d{2}:\d{2})/, ' $1');
        const date = new Date(dateStr);
        
        if (!isNaN(date.getTime())) {
          result.captureDateTime = date;
          result.captureDate = date.toLocaleDateString('tr-TR'); // DD.MM.YYYY
          result.captureTime = date.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }); // HH:MM
        }
      } catch (error) {
        console.warn('Date parsing error:', error);
      }
    }
    
    return result;
  }

  /**
   * GPS koordinatları parsing
   */
  private static parseGPS(exif: any) {
    const result: any = {};
    
    if (exif.GPSLatitude && exif.GPSLongitude) {
      try {
        // GPS koordinatları genelde decimal format olarak gelir
        let latitude = typeof exif.GPSLatitude === 'number' 
          ? exif.GPSLatitude 
          : parseFloat(exif.GPSLatitude);
          
        let longitude = typeof exif.GPSLongitude === 'number' 
          ? exif.GPSLongitude 
          : parseFloat(exif.GPSLongitude);

        // GPS referans kontrolü (N/S, E/W)
        if (exif.GPSLatitudeRef === 'S') latitude = -latitude;
        if (exif.GPSLongitudeRef === 'W') longitude = -longitude;

        // Koordinatların geçerli olup olmadığı kontrol et
        if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
          result.coordinates = {
            latitude: latitude,
            longitude: longitude
          };
        }

        // Altitude varsa ekle
        if (exif.GPSAltitude) {
          result.altitude = typeof exif.GPSAltitude === 'number' 
            ? exif.GPSAltitude 
            : parseFloat(exif.GPSAltitude);
        }
      } catch (error) {
        console.warn('GPS parsing error:', error);
      }
    }
    
    return result;
  }

  /**
   * Kamera bilgileri parsing
   */
  private static parseCamera(exif: any) {
    return {
      make: exif.Make || undefined,
      model: exif.Model || undefined,
      orientation: exif.Orientation || 1
    };
  }

  /**
   * Hava durumu ipuçları parsing (bazı telefonlarda mevcut)
   */
  private static parseWeatherHints(exif: any) {
    const weather: any = {};
    
    // iPhone ve bazı Android'lerde hava durumu bilgisi olabilir
    if (exif.WeatherInfo) {
      weather.description = exif.WeatherInfo;
    }
    
    if (exif.Temperature) {
      weather.temperature = parseFloat(exif.Temperature);
    }
    
    if (exif.Humidity) {
      weather.humidity = parseFloat(exif.Humidity);
    }
    
    return Object.keys(weather).length > 0 ? weather : undefined;
  }

  /**
   * GPS varlığı kontrolü
   */
  private static hasValidGPS(exif: any): boolean {
    return !!(exif.GPSLatitude && exif.GPSLongitude);
  }

  /**
   * DateTime varlığı kontrolü
   */
  private static hasValidDateTime(exif: any): boolean {
    return !!(exif.DateTimeOriginal || exif.DateTime || exif.DateTimeDigitized);
  }

  /**
   * Hava durumu bilgisi varlığı kontrolü
   */
  private static hasWeatherInfo(exif: any): boolean {
    return !!(exif.WeatherInfo || exif.Temperature || exif.Humidity);
  }

  /**
   * Privacy ve güvenlik kontrolü
   */
  private static checkPrivacyConcerns(exif: any) {
    const sensitiveDataFound: string[] = [];
    let shouldWarnUser = false;

    // Hassas bilgileri kontrol et
    if (exif.DeviceSerialNumber) {
      sensitiveDataFound.push('Device Serial Number');
      shouldWarnUser = true;
    }
    
    if (exif.CameraOwnerName) {
      sensitiveDataFound.push('Camera Owner Name');
      shouldWarnUser = true;
    }
    
    if (exif.Copyright) {
      sensitiveDataFound.push('Copyright Info');
    }
    
    // GPS hassasiyeti kontrolü
    if (exif.GPSLatitude && exif.GPSLongitude) {
      // Eğer GPS çok hassas (8+ decimal) ise uyar
      const latStr = String(exif.GPSLatitude);
      const lngStr = String(exif.GPSLongitude);
      
      if ((latStr.includes('.') && latStr.split('.')[1].length > 6) ||
          (lngStr.includes('.') && lngStr.split('.')[1].length > 6)) {
        sensitiveDataFound.push('High-precision GPS');
        shouldWarnUser = true;
      }
    }

    return {
      shouldWarnUser,
      sensitiveDataFound
    };
  }

  /**
   * EXIF verilerini temizle (privacy için)
   */
  static sanitizeExifData(exifData: any) {
    const sanitized = { ...exifData };
    
    // Hassas bilgileri kaldır
    delete sanitized.DeviceSerialNumber;
    delete sanitized.CameraOwnerName;
    delete sanitized.Copyright;
    delete sanitized.Software; // iOS version bilgisi
    
    // GPS hassasiyetini azalt (yaklaşık 100m accuracy)
    if (sanitized.GPSLatitude) {
      sanitized.GPSLatitude = Math.round(sanitized.GPSLatitude * 1000) / 1000;
    }
    
    if (sanitized.GPSLongitude) {
      sanitized.GPSLongitude = Math.round(sanitized.GPSLongitude * 1000) / 1000;
    }
    
    return sanitized;
  }

  /**
   * Tarih karşılaştırma yardımcı fonksiyonu
   */
  static isDefaultDate(dateString: string): boolean {
    const today = new Date().toLocaleDateString('tr-TR');
    return dateString === today || !dateString;
  }

  /**
   * Koordinat geçerliliği kontrolü
   */
  static isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}