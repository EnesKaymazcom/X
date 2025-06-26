// useUnits.ts - Custom hook for unit management and conversion
// Adapted for TurboRepo structure

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UnitsApiService } from '../services/UnitsApiService';

// TODO: Import from types when available
export interface UserUnits {
  temperature: string;
  weight: string;
  length: string;
  depth: string;
  distance: string;
  speed: string;
  pressure: string;
}

// TODO: Move to constants file
export const UNITS_STORAGE_KEY = '@fishivo_user_units';

export const defaultUnits: UserUnits = {
  temperature: 'celsius',
  weight: 'kg',
  length: 'cm',
  depth: 'meters',
  distance: 'km',
  speed: 'kmh',
  pressure: 'hpa'
};

export const useUnits = () => {
  const [units, setUnits] = useState<UserUnits>(defaultUnits);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const savedUnits = await AsyncStorage.getItem(UNITS_STORAGE_KEY);
      if (savedUnits) {
        setUnits(JSON.parse(savedUnits));
      }
    } catch (error) {
      console.log('Units yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUnits = async (newUnits: UserUnits) => {
    try {
      await AsyncStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(newUnits));
      setUnits(newUnits);
    } catch (error) {
      console.error('Units kaydedilirken hata:', error);
    }
  };

  const getDepthUnit = () => {
    switch (units.depth) {
      case 'meters': return 'metre';
      case 'feet': return 'ft';
      case 'fathoms': return 'ftm';
      default: return 'metre';
    }
  };

  const getWeightUnit = () => {
    switch (units.weight) {
      case 'kg': return 'kg';
      case 'lbs': return 'lbs';
      case 'g': return 'g';
      case 'oz': return 'oz';
      default: return 'kg';
    }
  };

  const getLengthUnit = () => {
    switch (units.length) {
      case 'cm': return 'cm';
      case 'inch': return 'in';
      case 'm': return 'm';
      case 'ft': return 'ft';
      default: return 'cm';
    }
  };

  const getTemperatureUnit = () => {
    switch (units.temperature) {
      case 'celsius': return '°C';
      case 'fahrenheit': return '°F';
      default: return '°C';
    }
  };

  const getDistanceUnit = () => {
    switch (units.distance) {
      case 'km': return 'km';
      case 'miles': return 'mi';
      case 'm': return 'm';
      case 'nm': return 'nm';
      default: return 'km';
    }
  };

  const getSpeedUnit = () => {
    switch (units.speed) {
      case 'kmh': return 'km/h';
      case 'mph': return 'mph';
      case 'knots': return 'knots';
      case 'ms': return 'm/s';
      default: return 'km/h';
    }
  };

  const getPressureUnit = () => {
    switch (units.pressure) {
      case 'hpa': return 'hPa';
      case 'inhg': return 'inHg';
      case 'mbar': return 'mbar';
      case 'mmhg': return 'mmHg';
      default: return 'hPa';
    }
  };

  const formatDepth = (value: number | string) => {
    if (!value) return '';
    return `${value} ${getDepthUnit()}`;
  };

  const formatWeight = (value: number | string) => {
    if (!value) return '';
    return `${value} ${getWeightUnit()}`;
  };

  const formatLength = (value: number | string) => {
    if (!value) return '';
    return `${value} ${getLengthUnit()}`;
  };

  const formatTemperature = (value: number | string) => {
    if (!value) return '';
    return `${value}${getTemperatureUnit()}`;
  };

  const formatDistance = (value: number | string) => {
    if (!value) return '';
    return `${value} ${getDistanceUnit()}`;
  };

  const formatSpeed = (value: number | string) => {
    if (!value) return '';
    return `${value} ${getSpeedUnit()}`;
  };

  const formatPressure = (value: number | string) => {
    if (!value) return '';
    return `${value} ${getPressureUnit()}`;
  };

  // **GERÇEK CONVERSION FONKSİYONLARI**
  
  // Backend'e gönderilecek base unit'e çevir
  const convertToBaseUnit = useCallback(async (value: number, fromUnit: string, category: string): Promise<number> => {
    try {
      return await UnitsApiService.convertToBaseUnit(value, fromUnit, category);
    } catch (error) {
      console.error('convertToBaseUnit error:', error);
      return value;
    }
  }, []);

  // Kullanıcının biriminden base unit'e (kayıt için)
  const convertFromUserUnit = useCallback(async (value: number, category: string): Promise<number> => {
    try {
      const userUnit = units[category as keyof UserUnits];
      return await UnitsApiService.convertToBaseUnit(value, userUnit, category);
    } catch (error) {
      console.error('convertFromUserUnit error:', error);
      return value;
    }
  }, [units]);

  // Base unit'ten kullanıcı birimine (gösterim için)  
  const convertToUserUnit = useCallback(async (value: number, fromUnit: string, category: string): Promise<number> => {
    try {
      const userUnit = units[category as keyof UserUnits];
      return await UnitsApiService.convertUnit(value, fromUnit, userUnit);
    } catch (error) {
      console.error('convertToUserUnit error:', error);
      return value;
    }
  }, [units]);

  // Backend'den gelen base unit değerini kullanıcı birimine çevirip formatla (ASYNC)
  const convertAndFormat = useCallback(async (value: number | string, category: string): Promise<string> => {
    if (!value) return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    
    try {
      const baseUnit = await UnitsApiService.getBaseUnit(category);
      const userUnit = units[category as keyof UserUnits];
      
      if (!baseUnit) {
        const unitSymbol = getUserUnitSymbol(category);
        return `${numValue} ${unitSymbol}`;
      }
      
      if (baseUnit === userUnit) {
        // Aynı birimse direkt formatla
        const unitSymbol = getUserUnitSymbol(category);
        return `${numValue} ${unitSymbol}`;
      }
      
      // Farklı birimse dönüştür
      const convertedValue = await UnitsApiService.convertUnit(numValue, baseUnit, userUnit);
      const unitSymbol = getUserUnitSymbol(category);
      
      // Precision'a göre yuvarla
      const precision = getPrecisionForUnit(userUnit, category);
      const roundedValue = Math.round(convertedValue * Math.pow(10, precision)) / Math.pow(10, precision);
      
      return `${roundedValue} ${unitSymbol}`;
    } catch (error) {
      console.error('convertAndFormat error:', error);
      const unitSymbol = getUserUnitSymbol(category);
      return `${numValue} ${unitSymbol}`;
    }
  }, [units]);

  const convertAndFormatSync = (value: number | string, category: string): string => {
    if (!value) return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    
    const unitSymbol = getUserUnitSymbol(category);
    return `${numValue} ${unitSymbol}`;
  };

  const getUserUnitSymbol = (category: string): string => {
    switch (category) {
      case 'temperature': return getTemperatureUnit();
      case 'weight': return getWeightUnit();
      case 'length': return getLengthUnit();
      case 'depth': return getDepthUnit();
      case 'distance': return getDistanceUnit();
      case 'speed': return getSpeedUnit();
      case 'pressure': return getPressureUnit();
      default: return '';
    }
  };

  const getPrecisionForUnit = (unit: string, category: string): number => {
    // Default precision values
    switch (category) {
      case 'temperature': return 1;
      case 'weight': return 2;
      case 'length': return 2;
      case 'depth': return 2;
      case 'distance': return 2;
      case 'speed': return 1;
      case 'pressure': return 0;
      default: return 2;
    }
  };

  return {
    units,
    isLoading,
    saveUnits,
    getDepthUnit,
    getWeightUnit,
    getLengthUnit,
    getTemperatureUnit,
    getDistanceUnit,
    getSpeedUnit,
    getPressureUnit,
    formatDepth,
    formatWeight,
    formatLength,
    formatTemperature,
    formatDistance,
    formatSpeed,
    formatPressure,
    // **YENİ ASYNC CONVERSION FONKSİYONLARI**
    convertFromUserUnit,
    convertToUserUnit,
    convertAndFormat,
    convertToBaseUnit,
    convertAndFormatSync, // Legacy support
  };
};

export default useUnits;