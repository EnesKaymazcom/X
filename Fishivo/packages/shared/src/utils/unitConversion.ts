// unitConversion.ts - Unit conversion utilities
// Adapted for TurboRepo structure

// TODO: API'den bu veriler alınacak

// Type definitions for unit system
interface UnitData {
  symbol: string;
  precision: number;
  isBaseUnit?: boolean;
  conversionFactor?: number;
}

interface CategoryData {
  units: Record<string, UnitData>;
}

interface UnitDefinitions {
  categories: Record<string, CategoryData>;
  conversionRules: {
    displayRules: {
      autoSwitchThresholds: Record<string, Record<string, number>>;
    };
  };
}

const unitDefinitions: UnitDefinitions = {
  categories: {
    weight: {
      units: {
        kg: { symbol: 'kg', precision: 2, isBaseUnit: true },
        g: { symbol: 'g', precision: 0, conversionFactor: 1000 },
        lbs: { symbol: 'lbs', precision: 2, conversionFactor: 2.20462 },
        oz: { symbol: 'oz', precision: 1, conversionFactor: 35.274 }
      }
    },
    length: {
      units: {
        cm: { symbol: 'cm', precision: 1, isBaseUnit: true },
        m: { symbol: 'm', precision: 2, conversionFactor: 0.01 },
        inch: { symbol: 'in', precision: 1, conversionFactor: 0.393701 },
        ft: { symbol: 'ft', precision: 2, conversionFactor: 0.0328084 }
      }
    },
    depth: {
      units: {
        meters: { symbol: 'm', precision: 2, isBaseUnit: true },
        feet: { symbol: 'ft', precision: 1, conversionFactor: 3.28084 },
        fathoms: { symbol: 'ftm', precision: 2, conversionFactor: 0.546807 }
      }
    },
    distance: {
      units: {
        km: { symbol: 'km', precision: 2, isBaseUnit: true },
        m: { symbol: 'm', precision: 0, conversionFactor: 1000 },
        miles: { symbol: 'mi', precision: 2, conversionFactor: 0.621371 },
        nm: { symbol: 'nm', precision: 2, conversionFactor: 0.539957 }
      }
    },
    speed: {
      units: {
        kmh: { symbol: 'km/h', precision: 1, isBaseUnit: true },
        mph: { symbol: 'mph', precision: 1, conversionFactor: 0.621371 },
        knots: { symbol: 'knots', precision: 1, conversionFactor: 0.539957 },
        ms: { symbol: 'm/s', precision: 2, conversionFactor: 0.277778 }
      }
    },
    pressure: {
      units: {
        hpa: { symbol: 'hPa', precision: 0, isBaseUnit: true },
        inhg: { symbol: 'inHg', precision: 2, conversionFactor: 0.02953 },
        mbar: { symbol: 'mbar', precision: 0, conversionFactor: 1 },
        mmhg: { symbol: 'mmHg', precision: 0, conversionFactor: 0.750062 }
      }
    },
    temperature: {
      units: {
        celsius: { symbol: '°C', precision: 1, isBaseUnit: true },
        fahrenheit: { symbol: '°F', precision: 1 }
      }
    }
  },
  conversionRules: {
    displayRules: {
      autoSwitchThresholds: {
        weight: { g_to_kg: 1000, oz_to_lbs: 16 },
        length: { cm_to_m: 100, inch_to_ft: 12 },
        distance: { m_to_km: 1000 }
      }
    }
  }
};

const userUnitPreferences = {
  defaultPreferences: {
    TR: {
      weight: 'kg',
      length: 'cm',
      distance: 'km',
      temperature: 'celsius',
      depth: 'meters',
      speed: 'kmh',
      pressure: 'hpa'
    },
    US: {
      weight: 'lbs',
      length: 'inch',
      distance: 'miles',
      temperature: 'fahrenheit',
      depth: 'feet',
      speed: 'mph',
      pressure: 'inhg'
    },
    UK: {
      weight: 'kg',
      length: 'cm',
      distance: 'miles',
      temperature: 'celsius',
      depth: 'feet',
      speed: 'mph',
      pressure: 'hpa'
    }
  },
  userPreferences: [] as any[]
};

export interface MeasurementValue {
  value: number;
  unit: string;
  originalUnit: string;
  displayValue: string;
}

export interface UserUnitPreferences {
  weight: string;
  length: string;
  distance: string;
  temperature: string;
  depth: string;
  speed: string;
  pressure: string;
}

// Kullanıcının ölçü birimi tercihlerini al
export const getUserUnitPreferences = (userId?: string, locale: string = 'TR'): UserUnitPreferences => {
  if (userId) {
    const userPrefs = userUnitPreferences.userPreferences.find((pref: any) => pref.userId === userId);
    if (userPrefs) return userPrefs.preferences;
  }
  
  return userUnitPreferences.defaultPreferences[locale as keyof typeof userUnitPreferences.defaultPreferences] || 
         userUnitPreferences.defaultPreferences.TR;
};

// Ölçü birimi dönüştürme
export const convertUnit = (value: number, fromUnit: string, toUnit: string, category: string): number => {
  if (fromUnit === toUnit) return value;
  
  const categoryData = unitDefinitions.categories[category as keyof typeof unitDefinitions.categories];
  if (!categoryData) return value;
  
  const fromUnitData = categoryData.units[fromUnit as keyof typeof categoryData.units];
  const toUnitData = categoryData.units[toUnit as keyof typeof categoryData.units];
  
  if (!fromUnitData || !toUnitData) return value;
  
  // Önce base unit'e çevir
  let baseValue = value;
  if (!fromUnitData.isBaseUnit) {
    if (category === 'temperature' && fromUnit === 'fahrenheit') {
      baseValue = (value - 32) * 5/9;
    } else if (fromUnitData.conversionFactor) {
      baseValue = value / fromUnitData.conversionFactor;
    }
  }
  
  // Base unit'ten hedef unit'e çevir
  let finalValue = baseValue;
  if (!toUnitData.isBaseUnit) {
    if (category === 'temperature' && toUnit === 'fahrenheit') {
      finalValue = (baseValue * 9/5) + 32;
    } else if (toUnitData.conversionFactor) {
      finalValue = baseValue * toUnitData.conversionFactor;
    }
  }
  
  return Math.round(finalValue * Math.pow(10, toUnitData.precision)) / Math.pow(10, toUnitData.precision);
};

// Ölçü değerini kullanıcının tercihlerine göre formatla
export const formatMeasurementValue = (measurement: any, category: string, userPrefs: UserUnitPreferences): string => {
  if (!measurement || typeof measurement === 'string') return measurement;
  
  const userPreferredUnit = userPrefs[category as keyof UserUnitPreferences];
  if (measurement.unit === userPreferredUnit) {
    return measurement.displayValue;
  }
  
  // Dönüştürme yap
  const convertedValue = convertUnit(measurement.value, measurement.unit, userPreferredUnit, category);
  const categoryData = unitDefinitions.categories[category as keyof typeof unitDefinitions.categories];
  const unitData = categoryData?.units[userPreferredUnit as keyof typeof categoryData.units];
  
  if (unitData) {
    return `${convertedValue} ${unitData.symbol}`;
  }
  
  return measurement.displayValue;
};

// Ölçü birimi etiketini al
export const getUnitLabel = (category: string, userPrefs: UserUnitPreferences): string => {
  const unitKey = userPrefs[category as keyof UserUnitPreferences];
  const categoryData = unitDefinitions.categories[category as keyof typeof unitDefinitions.categories];
  if (categoryData && categoryData.units[unitKey as keyof typeof categoryData.units]) {
    return categoryData.units[unitKey as keyof typeof categoryData.units].symbol;
  }
  return unitKey;
};

// String formatından yeni formata dönüştür
export const convertStringToMeasurement = (value: string, category: string): MeasurementValue | null => {
  if (!value || typeof value !== 'string') return null;
  
  // "2.5 kg" formatından parse et
  const match = value.match(/^([\d.]+)\s*([a-zA-Z°]+)$/);
  if (!match) return null;
  
  const numValue = parseFloat(match[1]);
  let unit = match[2].toLowerCase();
  
  // Normalize unit names
  if (unit.includes('°c')) unit = 'celsius';
  if (unit.includes('°f')) unit = 'fahrenheit';
  
  return {
    value: numValue,
    unit: unit,
    originalUnit: unit,
    displayValue: value
  };
};

// Otomatik birim dönüştürme (1000g -> 1kg gibi)
export const autoConvertUnit = (value: number, unit: string, category: string): MeasurementValue => {
  const categoryData = unitDefinitions.categories[category as keyof typeof unitDefinitions.categories];
  if (!categoryData) {
    return {
      value,
      unit,
      originalUnit: unit,
      displayValue: `${value} ${unit}`
    };
  }
  
  const conversionRules = unitDefinitions.conversionRules.displayRules.autoSwitchThresholds[category as keyof typeof unitDefinitions.conversionRules.displayRules.autoSwitchThresholds];
  let finalUnit = unit;
  let finalValue = value;
  
  if (conversionRules) {
    // Gram'dan kilogram'a dönüştürme
    if (unit === 'g' && 'g_to_kg' in conversionRules && value >= conversionRules.g_to_kg) {
      finalValue = value / 1000;
      finalUnit = 'kg';
    }
    // Ons'tan pound'a dönüştürme
    else if (unit === 'oz' && 'oz_to_lbs' in conversionRules && value >= conversionRules.oz_to_lbs) {
      finalValue = value / 16;
      finalUnit = 'lbs';
    }
    // Santimetre'den metre'ye dönüştürme
    else if (unit === 'cm' && 'cm_to_m' in conversionRules && value >= conversionRules.cm_to_m) {
      finalValue = value / 100;
      finalUnit = 'm';
    }
    // İnç'ten feet'e dönüştürme
    else if (unit === 'inch' && 'inch_to_ft' in conversionRules && value >= conversionRules.inch_to_ft) {
      finalValue = value / 12;
      finalUnit = 'ft';
    }
    // Metre'den kilometre'ye dönüştürme
    else if (unit === 'm' && 'm_to_km' in conversionRules && value >= conversionRules.m_to_km) {
      finalValue = value / 1000;
      finalUnit = 'km';
    }
  }
  
  const unitData = categoryData.units[finalUnit as keyof typeof categoryData.units];
  const precision = unitData?.precision || 2;
  const roundedValue = Math.round(finalValue * Math.pow(10, precision)) / Math.pow(10, precision);
  const symbol = unitData?.symbol || finalUnit;
  
  return {
    value: roundedValue,
    unit: finalUnit,
    originalUnit: unit,
    displayValue: `${roundedValue} ${symbol}`
  };
};

// Birim kategorisini al
export const getUnitCategory = (unit: string): string | null => {
  for (const [category, categoryData] of Object.entries(unitDefinitions.categories)) {
    if (unit in categoryData.units) {
      return category;
    }
  }
  return null;
};

// Kategori için mevcut birimleri al
export const getAvailableUnits = (category: string): string[] => {
  const categoryData = unitDefinitions.categories[category as keyof typeof unitDefinitions.categories];
  return categoryData ? Object.keys(categoryData.units) : [];
};

// Birim sembolünü al
export const getUnitSymbol = (unit: string, category?: string): string => {
  if (category) {
    const categoryData = unitDefinitions.categories[category as keyof typeof unitDefinitions.categories];
    const unitData = categoryData?.units[unit as keyof typeof categoryData.units];
    if (unitData) return unitData.symbol;
  }
  
  // Kategori belirtilmemişse tüm kategorilerde ara
  for (const categoryData of Object.values(unitDefinitions.categories)) {
    const unitData = categoryData.units[unit as keyof typeof categoryData.units];
    if (unitData) return unitData.symbol;
  }
  
  return unit;
};

export default {
  convertUnit,
  formatMeasurementValue,
  getUnitLabel,
  convertStringToMeasurement,
  autoConvertUnit,
  getUserUnitPreferences,
  getUnitCategory,
  getAvailableUnits,
  getUnitSymbol
};