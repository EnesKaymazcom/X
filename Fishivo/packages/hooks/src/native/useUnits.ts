import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserUnits, 
  defaultUnits, 
  UNITS_STORAGE_KEY, 
  UNIT_DEFINITIONS,
  CONVERSION_FACTORS,
  convertTemperature,
  WeightUnit,
  LengthUnit,
  TemperatureUnit,
  DepthUnit,
  WindSpeedUnit,
  UnitDefinition
} from '@fishivo/types';
import {
  formatWeight as formatWeightUtil,
  formatLength as formatLengthUtil,
  formatDepth as formatDepthUtil,
  formatTemperature as formatTemperatureUtil,
  formatWindSpeed as formatWindSpeedUtil,
  formatPressure as formatPressureUtil
} from '@fishivo/utils';

export interface UseUnitsReturn {
  units: UserUnits;
  isLoading: boolean;
  
  // Getter functions
  getWeightUnit: () => UnitDefinition;
  getLengthUnit: () => UnitDefinition;
  getTemperatureUnit: () => UnitDefinition;
  getDepthUnit: () => UnitDefinition;
  getWindSpeedUnit: () => UnitDefinition;
  
  // Update functions
  updateWeightUnit: (unit: WeightUnit) => Promise<void>;
  updateLengthUnit: (unit: LengthUnit) => Promise<void>;
  updateTemperatureUnit: (unit: TemperatureUnit) => Promise<void>;
  updateDepthUnit: (unit: DepthUnit) => Promise<void>;
  updateWindSpeedUnit: (unit: WindSpeedUnit) => Promise<void>;
  
  // Conversion functions
  convertFromUserUnit: (value: number, unitType: 'weight' | 'length' | 'depth') => number;
  convertToUserUnit: (value: number, unitType: 'weight' | 'length' | 'depth') => number;
  convertTemperatureFromUser: (value: number) => number;
  convertTemperatureToUser: (value: number) => number;
  
  // Format functions
  formatWeight: (value: number, locale?: string) => string;
  formatLength: (value: number, locale?: string) => string;
  formatDepth: (value: number, locale?: string) => string;
  formatTemperature: (value: number, locale?: string) => string;
  formatWindSpeed: (value: number, locale?: string) => string;
  formatPressure: (value: number, locale?: string) => string;
}

export const useUnits = (): UseUnitsReturn => {
  const [units, setUnits] = useState<UserUnits>(defaultUnits);
  const [isLoading, setIsLoading] = useState(true);

  // Load units from storage on mount
  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const savedUnits = await AsyncStorage.getItem(UNITS_STORAGE_KEY);
      if (savedUnits) {
        const parsedUnits = JSON.parse(savedUnits);
        setUnits({ ...defaultUnits, ...parsedUnits });
      }
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUnits = async (newUnits: UserUnits) => {
    try {
      await AsyncStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(newUnits));
      setUnits(newUnits);
    } catch (error) {
      console.error('Error saving units:', error);
      throw error;
    }
  };

  // Getter functions
  const getWeightUnit = (): UnitDefinition => UNIT_DEFINITIONS[units.weight];
  const getLengthUnit = (): UnitDefinition => UNIT_DEFINITIONS[units.length];
  const getTemperatureUnit = (): UnitDefinition => UNIT_DEFINITIONS[units.temperature];
  const getDepthUnit = (): UnitDefinition => UNIT_DEFINITIONS[units.depth];
  const getWindSpeedUnit = (): UnitDefinition => UNIT_DEFINITIONS[units.windSpeed];

  // Update functions
  const updateWeightUnit = async (unit: WeightUnit) => {
    const newUnits = { ...units, weight: unit };
    await saveUnits(newUnits);
  };

  const updateLengthUnit = async (unit: LengthUnit) => {
    const newUnits = { ...units, length: unit };
    await saveUnits(newUnits);
  };

  const updateTemperatureUnit = async (unit: TemperatureUnit) => {
    const newUnits = { ...units, temperature: unit };
    await saveUnits(newUnits);
  };

  const updateDepthUnit = async (unit: DepthUnit) => {
    const newUnits = { ...units, depth: unit };
    await saveUnits(newUnits);
  };

  const updateWindSpeedUnit = async (unit: WindSpeedUnit) => {
    const newUnits = { ...units, windSpeed: unit };
    await saveUnits(newUnits);
  };

  // Conversion functions
  const convertFromUserUnit = (value: number, unitType: 'weight' | 'length' | 'depth'): number => {
    const userUnit = units[unitType];
    const conversionFactor = CONVERSION_FACTORS[unitType][userUnit as keyof typeof CONVERSION_FACTORS[typeof unitType]];
    return value * conversionFactor;
  };

  const convertToUserUnit = (value: number, unitType: 'weight' | 'length' | 'depth'): number => {
    const userUnit = units[unitType];
    const conversionFactor = CONVERSION_FACTORS[unitType][userUnit as keyof typeof CONVERSION_FACTORS[typeof unitType]];
    return value / conversionFactor;
  };

  const convertTemperatureFromUser = (value: number): number => {
    if (units.temperature === 'fahrenheit') {
      return convertTemperature.fahrenheitToCelsius(value);
    }
    return value; // Already in Celsius
  };

  const convertTemperatureToUser = (value: number): number => {
    if (units.temperature === 'fahrenheit') {
      return convertTemperature.celsiusToFahrenheit(value);
    }
    return value; // Already in Celsius
  };

  // Format functions with locale support
  const formatWeight = (value: number, locale?: string): string => {
    return formatWeightUtil(value, units, locale || 'en-US');
  };

  const formatLength = (value: number, locale?: string): string => {
    return formatLengthUtil(value, units, locale || 'en-US');
  };

  const formatDepth = (value: number, locale?: string): string => {
    return formatDepthUtil(value, units, locale || 'en-US');
  };

  const formatTemperature = (value: number, locale?: string): string => {
    return formatTemperatureUtil(value, units, locale || 'en-US');
  };

  const formatWindSpeed = (value: number, locale?: string): string => {
    return formatWindSpeedUtil(value, units, locale || 'en-US');
  };

  const formatPressure = (value: number, locale?: string): string => {
    return formatPressureUtil(value, locale || 'en-US');
  };

  return {
    units,
    isLoading,
    
    // Getters
    getWeightUnit,
    getLengthUnit,
    getTemperatureUnit,
    getDepthUnit,
    getWindSpeedUnit,
    
    // Updaters
    updateWeightUnit,
    updateLengthUnit,
    updateTemperatureUnit,
    updateDepthUnit,
    updateWindSpeedUnit,
    
    // Converters
    convertFromUserUnit,
    convertToUserUnit,
    convertTemperatureFromUser,
    convertTemperatureToUser,
    
    // Formatters
    formatWeight,
    formatLength,
    formatDepth,
    formatTemperature,
    formatWindSpeed,
    formatPressure
  };
};