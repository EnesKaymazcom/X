import { 
  UserUnits, 
  CONVERSION_FACTORS, 
  convertTemperature,
  UNIT_DEFINITIONS 
} from '@fishivo/types';

/**
 * Formats a weight value according to user's unit preference
 * @param value - Weight value in kg (metric base)
 * @param units - User's unit preferences
 * @param locale - Locale for number formatting (default: 'en-US')
 * @returns Formatted weight string with unit symbol
 */
export function formatWeight(value: number, units: UserUnits, locale: string = 'en-US'): string {
  if (!value || isNaN(value)) return '-';
  
  // value is in kg (metric base), convert to user's preference
  const convertedValue = units.weight === 'kg' 
    ? value 
    : value / CONVERSION_FACTORS.weight.lbs; // kg to lbs: kg / 0.453592
  
  const formattedNumber = formatNumber(convertedValue, locale, units.weight === 'kg' ? 1 : 2);
  const unitSymbol = UNIT_DEFINITIONS[units.weight].symbol;
  
  return `${formattedNumber} ${unitSymbol}`;
}

/**
 * Formats a length value according to user's unit preference
 * @param value - Length value in cm (metric base)
 * @param units - User's unit preferences
 * @param locale - Locale for number formatting (default: 'en-US')
 * @returns Formatted length string with unit symbol
 */
export function formatLength(value: number, units: UserUnits, locale: string = 'en-US'): string {
  if (!value || isNaN(value)) return '-';
  
  // value is in cm (metric base), convert to user's preference
  const convertedValue = units.length === 'cm' 
    ? value 
    : value / CONVERSION_FACTORS.length.inch; // cm to inches: cm / 2.54
  
  const formattedNumber = formatNumber(convertedValue, locale, units.length === 'cm' ? 0 : 1);
  const unitSymbol = UNIT_DEFINITIONS[units.length].symbol;
  
  return `${formattedNumber} ${unitSymbol}`;
}

/**
 * Formats a depth value according to user's unit preference
 * @param value - Depth value in meters (metric base)
 * @param units - User's unit preferences
 * @param locale - Locale for number formatting (default: 'en-US')
 * @returns Formatted depth string with unit symbol
 */
export function formatDepth(value: number, units: UserUnits, locale: string = 'en-US'): string {
  if (!value || isNaN(value)) return '-';
  
  // value is in meters (metric base), convert to user's preference
  const convertedValue = units.depth === 'meters' 
    ? value 
    : value / CONVERSION_FACTORS.depth.feet; // meters to feet: m / 0.3048
  
  const formattedNumber = formatNumber(convertedValue, locale, 1);
  const unitSymbol = UNIT_DEFINITIONS[units.depth].symbol;
  
  return `${formattedNumber} ${unitSymbol}`;
}

/**
 * Formats a temperature value according to user's unit preference
 * @param value - Temperature value in Celsius (metric base)
 * @param units - User's unit preferences
 * @param locale - Locale for number formatting (default: 'en-US')
 * @returns Formatted temperature string with unit symbol
 */
export function formatTemperature(value: number, units: UserUnits, locale: string = 'en-US'): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  
  const convertedValue = units.temperature === 'celsius' 
    ? value 
    : convertTemperature.celsiusToFahrenheit(value);
  
  const formattedNumber = formatNumber(convertedValue, locale, 0);
  const unitSymbol = UNIT_DEFINITIONS[units.temperature].symbol;
  
  return `${formattedNumber}${unitSymbol}`;
}

/**
 * Formats a wind speed value according to user's unit preference
 * @param value - Wind speed value in m/s (base unit)
 * @param units - User's unit preferences
 * @param locale - Locale for number formatting (default: 'en-US')
 * @returns Formatted wind speed string with unit symbol
 */
export function formatWindSpeed(value: number, units: UserUnits, locale: string = 'en-US'): string {
  if (!value || isNaN(value)) return '-';
  
  // Convert from m/s to user's preferred unit
  let convertedValue: number;
  let unitSymbol: string;
  
  switch (units.windSpeed) {
    case 'ms':
      convertedValue = value;
      unitSymbol = 'm/s';
      break;
    case 'kmh':
      convertedValue = value * 3.6; // m/s to km/h
      unitSymbol = 'km/h';
      break;
    case 'mph':
      convertedValue = value * 2.23694; // m/s to mph
      unitSymbol = 'mph';
      break;
    case 'knots':
      convertedValue = value * 1.94384; // m/s to knots
      unitSymbol = 'kts';
      break;
    default:
      convertedValue = value;
      unitSymbol = 'm/s';
  }
  
  const formattedNumber = formatNumber(convertedValue, locale, 1);
  return `${formattedNumber} ${unitSymbol}`;
}

/**
 * Formats a pressure value (always in hPa)
 * @param value - Pressure value in hPa
 * @param locale - Locale for number formatting (default: 'en-US')
 * @returns Formatted pressure string with unit symbol
 */
export function formatPressure(value: number, locale: string = 'en-US'): string {
  if (!value || isNaN(value)) return '-';
  
  const formattedNumber = formatNumber(value, locale, 0);
  return `${formattedNumber} hPa`;
}

/**
 * Helper function to format numbers based on locale
 * @param value - Number to format
 * @param locale - Locale for formatting
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
function formatNumber(value: number, locale: string, decimals: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}