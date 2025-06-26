// dateUtils.ts - Date and time utility functions
// Adapted for TurboRepo structure

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
  label?: string;
}

export interface FishingSession {
  date: Date;
  startTime: string;
  endTime: string;
  duration?: number; // in minutes
}

// Tarih formatları
export const formatDate = (date: Date, format: 'short' | 'long' | 'medium' = 'medium'): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'numeric' : format === 'long' ? 'long' : 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('tr-TR', options);
};

// Saat formatı
export const formatTime = (date: Date, format: '12h' | '24h' = '24h'): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: format === '12h'
  };
  
  return date.toLocaleTimeString('tr-TR', options);
};

// Tarih ve saat birlikte
export const formatDateTime = (date: Date, dateFormat: 'short' | 'long' | 'medium' = 'medium', timeFormat: '12h' | '24h' = '24h'): string => {
  return `${formatDate(date, dateFormat)} ${formatTime(date, timeFormat)}`;
};

// Göreceli zaman ("2 saat önce", "yarın" gibi)
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (Math.abs(diffDays) >= 7) {
    return formatDate(date, 'short');
  }
  
  if (diffDays > 1) {
    return `${diffDays} gün sonra`;
  }
  
  if (diffDays === 1) {
    return 'Yarın';
  }
  
  if (diffDays === 0) {
    if (Math.abs(diffHours) < 1) {
      if (diffMinutes > 0) {
        return `${diffMinutes} dakika sonra`;
      } else if (diffMinutes < 0) {
        return `${Math.abs(diffMinutes)} dakika önce`;
      } else {
        return 'Şimdi';
      }
    }
    
    if (diffHours > 0) {
      return `${diffHours} saat sonra`;
    } else {
      return `${Math.abs(diffHours)} saat önce`;
    }
  }
  
  if (diffDays === -1) {
    return 'Dün';
  }
  
  return `${Math.abs(diffDays)} gün önce`;
};

// İki tarih arasındaki farkı hesapla
export const getDateDifference = (date1: Date, date2: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} => {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};

// Süreyi formatla (dakika cinsinden)
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} dakika`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} saat`;
  }
  
  return `${hours} saat ${remainingMinutes} dakika`;
};

// Balık tutma seansının süresini hesapla
export const calculateSessionDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  let endTotalMinutes = endHour * 60 + endMinute;
  
  // Eğer bitiş saati başlangıç saatinden küçükse, ertesi gün olduğunu varsay
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }
  
  return endTotalMinutes - startTotalMinutes;
};

// Haftanın günlerini al
export const getWeekDays = (locale: 'tr' | 'en' = 'tr'): string[] => {
  if (locale === 'tr') {
    return ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  }
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
};

// Ayları al
export const getMonths = (locale: 'tr' | 'en' = 'tr'): string[] => {
  if (locale === 'tr') {
    return [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
  }
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
};

// Bugünün başlangıcını al
export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Bugünün sonunu al
export const getEndOfDay = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Haftanın başlangıcını al (Pazartesi)
export const getStartOfWeek = (date: Date = new Date()): Date => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi'yi başlangıç yap
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Haftanın sonunu al (Pazar)
export const getEndOfWeek = (date: Date = new Date()): Date => {
  const end = getStartOfWeek(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Ayın başlangıcını al
export const getStartOfMonth = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Ayın sonunu al
export const getEndOfMonth = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setMonth(end.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Tarih aralığı oluştur
export const createDateRange = (start: Date, end: Date): DateRange => {
  return { start, end };
};

// Tarih aralığında mı kontrol et
export const isDateInRange = (date: Date, range: DateRange): boolean => {
  return date >= range.start && date <= range.end;
};

// Gün sayısını hesapla
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Artık yıl kontrolü
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Yaş hesapla
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Zaman dilimi dönüştürme
export const convertToTimezone = (date: Date, timezone: string): Date => {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
};

// En iyi balık tutma saatleri (genel olarak)
export const getBestFishingTimes = (date: Date): TimeSlot[] => {
  return [
    {
      start: '05:00',
      end: '08:00',
      label: 'Sabah Erken'
    },
    {
      start: '18:00',
      end: '21:00',
      label: 'Akşam'
    },
    {
      start: '22:00',
      end: '02:00',
      label: 'Gece'
    }
  ];
};

// Güneş doğuş/batış saatlerini tahmin et (basit hesaplama)
export const estimateSunTimes = (date: Date, latitude: number): { sunrise: string; sunset: string } => {
  // Bu basit bir tahmindir, gerçek uygulamada daha karmaşık hesaplamalar gerekir
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const p = Math.asin(0.39795 * Math.cos(0.98563 * (dayOfYear - 173) * Math.PI / 180));
  const argument = -Math.tan(latitude * Math.PI / 180) * Math.tan(p);
  
  let hourAngle = 0;
  if (Math.abs(argument) < 1) {
    hourAngle = Math.acos(argument);
  }
  
  const sunrise = 12 - (hourAngle * 12 / Math.PI);
  const sunset = 12 + (hourAngle * 12 / Math.PI);
  
  const formatHour = (hour: number): string => {
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  return {
    sunrise: formatHour(sunrise),
    sunset: formatHour(sunset)
  };
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  getDateDifference,
  formatDuration,
  calculateSessionDuration,
  getWeekDays,
  getMonths,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  createDateRange,
  isDateInRange,
  getDaysInMonth,
  isLeapYear,
  calculateAge,
  convertToTimezone,
  getBestFishingTimes,
  estimateSunTimes
};