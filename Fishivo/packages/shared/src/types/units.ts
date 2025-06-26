export interface UserUnits {
  weight: 'kg' | 'lbs' | 'g' | 'oz';
  length: 'cm' | 'inch' | 'm' | 'ft';
  distance: 'km' | 'miles' | 'm' | 'nm';
  temperature: 'celsius' | 'fahrenheit';
  depth: 'meters' | 'feet' | 'fathoms';
  speed: 'kmh' | 'mph' | 'knots' | 'ms';
  pressure: 'hpa' | 'inhg' | 'mbar' | 'mmhg';
}

export const UNITS_STORAGE_KEY = '@fishivo_user_units';

export const defaultUnits: UserUnits = {
  weight: 'kg',
  length: 'cm',
  distance: 'km',
  temperature: 'celsius',
  depth: 'meters',
  speed: 'kmh',
  pressure: 'hpa',
};

export const BASE_UNITS = {
  weight: 'kg',
  length: 'cm', 
  distance: 'km',
  temperature: 'celsius',
  depth: 'meters',
  speed: 'kmh',
  pressure: 'hpa'
} as const;

// Unit conversion types
export interface UnitConversion {
  from: string;
  to: string;
  factor: number;
  offset?: number;
}

export interface ConversionTable {
  [category: string]: {
    [unit: string]: UnitConversion[];
  };
}