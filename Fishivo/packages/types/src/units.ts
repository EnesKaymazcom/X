// Unit Types for Fishing App
export type WeightUnit = 'kg' | 'lbs';
export type LengthUnit = 'cm' | 'inch';
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type DepthUnit = 'meters' | 'feet';
export type WindSpeedUnit = 'ms' | 'kmh' | 'mph' | 'knots';

// User Units Preferences
export interface UserUnits {
  weight: WeightUnit;
  length: LengthUnit;
  temperature: TemperatureUnit;
  depth: DepthUnit;
  windSpeed: WindSpeedUnit;
}

// Default Units (Metric System)
export const defaultUnits: UserUnits = {
  weight: 'kg',
  length: 'cm',
  temperature: 'celsius',
  depth: 'meters',
  windSpeed: 'ms'
};

// Storage Key for AsyncStorage
export const UNITS_STORAGE_KEY = '@fishivo/user_units';

// Unit Definitions with Symbol and Label
export interface UnitDefinition {
  symbol: string;
  label: string;
}

export const UNIT_DEFINITIONS: Record<string, UnitDefinition> = {
  // Weight
  kg: { symbol: 'kg', label: 'Kilogram' },
  lbs: { symbol: 'lbs', label: 'Pounds' },
  
  // Length  
  cm: { symbol: 'cm', label: 'Centimeter' },
  inch: { symbol: 'in', label: 'Inch' },
  
  // Temperature
  celsius: { symbol: '°C', label: 'Celsius' },
  fahrenheit: { symbol: '°F', label: 'Fahrenheit' },
  
  // Depth
  meters: { symbol: 'm', label: 'Meters' },
  feet: { symbol: 'ft', label: 'Feet' },
  
  // Wind Speed
  ms: { symbol: 'm/s', label: 'm/s' },
  kmh: { symbol: 'km/h', label: 'km/h' },
  mph: { symbol: 'mph', label: 'mph' },
  knots: { symbol: 'kts', label: 'kts' }
};

// Conversion Factors (to metric base)
export const CONVERSION_FACTORS = {
  // Weight (to kg)
  weight: {
    kg: 1,
    lbs: 0.453592
  },
  
  // Length (to cm)
  length: {
    cm: 1,
    inch: 2.54
  },
  
  // Depth (to meters)
  depth: {
    meters: 1,
    feet: 0.3048
  },
  
  // Wind Speed (to m/s)
  windSpeed: {
    ms: 1,
    kmh: 0.277778,  // 1 km/h = 0.277778 m/s
    mph: 0.44704,   // 1 mph = 0.44704 m/s
    knots: 0.514444 // 1 knot = 0.514444 m/s
  }
};

// Temperature conversion functions
export const convertTemperature = {
  celsiusToFahrenheit: (celsius: number): number => (celsius * 9/5) + 32,
  fahrenheitToCelsius: (fahrenheit: number): number => (fahrenheit - 32) * 5/9
};