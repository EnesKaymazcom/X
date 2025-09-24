/**
 * Coordinate parsing and formatting utilities
 * Supports DD (Decimal Degrees), DMS (Degrees Minutes Seconds), DDM (Degrees Decimal Minutes)
 */

export interface ParsedCoordinate {
  latitude: number;
  longitude: number;
}

/**
 * Validate if coordinates are within valid bounds
 * @param lat Latitude (-90 to 90)
 * @param lng Longitude (-180 to 180)
 * @returns true if valid, false otherwise
 */
export function validateCoordinateBounds(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Parse DD (Decimal Degrees) format coordinates
 * Examples: "40.123456, -74.567890", "40.123456,-74.567890", "40.123456 -74.567890"
 * @param input Coordinate string
 * @returns ParsedCoordinate or null if invalid
 */
export function parseCoordinateDD(input: string): ParsedCoordinate | null {
  if (!input || typeof input !== 'string') return null;
  
  // Clean input and handle various separators
  const cleaned = input.trim().replace(/\s+/g, ' ');
  
  // Match DD format: -?digits.digits, -?digits.digits
  const ddRegex = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
  const match = cleaned.match(ddRegex);
  
  if (!match) return null;
  
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  
  if (isNaN(lat) || isNaN(lng)) return null;
  if (!validateCoordinateBounds(lat, lng)) return null;
  
  return { latitude: lat, longitude: lng };
}

/**
 * Parse DMS (Degrees Minutes Seconds) format coordinates
 * Examples: "40°42'4.495"N, 74°34'4.404"W", "40 42 4.495 N, 74 34 4.404 W"
 * @param input Coordinate string  
 * @returns ParsedCoordinate or null if invalid
 */
export function parseCoordinateDMS(input: string): ParsedCoordinate | null {
  if (!input || typeof input !== 'string') return null;
  
  const cleaned = input.trim().toUpperCase();
  
  // Split by comma to get lat/lng parts
  const parts = cleaned.split(',');
  if (parts.length !== 2) return null;
  
  const latPart = parts[0].trim();
  const lngPart = parts[1].trim();
  
  // DMS regex: capture degrees, minutes, seconds, and direction
  const dmsRegex = /(\d+)[°\s]+(\d+)['\s]+(\d+\.?\d*)["\s]*([NSEW])/;
  
  const latMatch = latPart.match(dmsRegex);
  const lngMatch = lngPart.match(dmsRegex);
  
  if (!latMatch || !lngMatch) return null;
  
  // Parse latitude
  const latDegrees = parseInt(latMatch[1]);
  const latMinutes = parseInt(latMatch[2]);
  const latSeconds = parseFloat(latMatch[3]);
  const latDirection = latMatch[4];
  
  if (latDegrees > 90 || latMinutes >= 60 || latSeconds >= 60) return null;
  if (!['N', 'S'].includes(latDirection)) return null;
  
  let lat = latDegrees + (latMinutes / 60) + (latSeconds / 3600);
  if (latDirection === 'S') lat = -lat;
  
  // Parse longitude  
  const lngDegrees = parseInt(lngMatch[1]);
  const lngMinutes = parseInt(lngMatch[2]);
  const lngSeconds = parseFloat(lngMatch[3]);
  const lngDirection = lngMatch[4];
  
  if (lngDegrees > 180 || lngMinutes >= 60 || lngSeconds >= 60) return null;
  if (!['E', 'W'].includes(lngDirection)) return null;
  
  let lng = lngDegrees + (lngMinutes / 60) + (lngSeconds / 3600);
  if (lngDirection === 'W') lng = -lng;
  
  if (!validateCoordinateBounds(lat, lng)) return null;
  
  return { latitude: lat, longitude: lng };
}

/**
 * Parse DDM (Degrees Decimal Minutes) format coordinates
 * Examples: "40°42.075'N, 74°34.073'W", "40 42.075 N, 74 34.073 W"
 * @param input Coordinate string
 * @returns ParsedCoordinate or null if invalid
 */
export function parseCoordinateDDM(input: string): ParsedCoordinate | null {
  if (!input || typeof input !== 'string') return null;
  
  const cleaned = input.trim().toUpperCase();
  
  // Split by comma to get lat/lng parts
  const parts = cleaned.split(',');
  if (parts.length !== 2) return null;
  
  const latPart = parts[0].trim();
  const lngPart = parts[1].trim();
  
  // DDM regex: capture degrees, decimal minutes, and direction
  const ddmRegex = /(\d+)[°\s]+(\d+\.?\d*)['\s]*([NSEW])/;
  
  const latMatch = latPart.match(ddmRegex);
  const lngMatch = lngPart.match(ddmRegex);
  
  if (!latMatch || !lngMatch) return null;
  
  // Parse latitude
  const latDegrees = parseInt(latMatch[1]);
  const latMinutes = parseFloat(latMatch[2]);
  const latDirection = latMatch[3];
  
  if (latDegrees > 90 || latMinutes >= 60) return null;
  if (!['N', 'S'].includes(latDirection)) return null;
  
  let lat = latDegrees + (latMinutes / 60);
  if (latDirection === 'S') lat = -lat;
  
  // Parse longitude
  const lngDegrees = parseInt(lngMatch[1]);
  const lngMinutes = parseFloat(lngMatch[2]);
  const lngDirection = lngMatch[3];
  
  if (lngDegrees > 180 || lngMinutes >= 60) return null;
  if (!['E', 'W'].includes(lngDirection)) return null;
  
  let lng = lngDegrees + (lngMinutes / 60);
  if (lngDirection === 'W') lng = -lng;
  
  if (!validateCoordinateBounds(lat, lng)) return null;
  
  return { latitude: lat, longitude: lng };
}

/**
 * Format coordinates as DD (Decimal Degrees)
 * @param lat Latitude
 * @param lng Longitude  
 * @returns Formatted string like "40.123456, -74.567890"
 */
export function formatCoordinateDD(lat: number, lng: number): string {
  if (!validateCoordinateBounds(lat, lng)) return '';
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Format coordinates as DMS (Degrees Minutes Seconds)
 * @param lat Latitude
 * @param lng Longitude
 * @returns Formatted string like "40°42'4.495"N, 74°34'4.404"W"
 */
export function formatCoordinateDMS(lat: number, lng: number): string {
  if (!validateCoordinateBounds(lat, lng)) return '';
  
  // Latitude
  const latAbs = Math.abs(lat);
  const latDeg = Math.floor(latAbs);
  const latMinFloat = (latAbs - latDeg) * 60;
  const latMin = Math.floor(latMinFloat);
  const latSec = (latMinFloat - latMin) * 60;
  const latDir = lat >= 0 ? 'N' : 'S';
  
  // Longitude
  const lngAbs = Math.abs(lng);
  const lngDeg = Math.floor(lngAbs);
  const lngMinFloat = (lngAbs - lngDeg) * 60;
  const lngMin = Math.floor(lngMinFloat);
  const lngSec = (lngMinFloat - lngMin) * 60;
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${latDeg}°${latMin}'${latSec.toFixed(3)}"${latDir}, ${lngDeg}°${lngMin}'${lngSec.toFixed(3)}"${lngDir}`;
}

/**
 * Format coordinates as DDM (Degrees Decimal Minutes)
 * @param lat Latitude
 * @param lng Longitude
 * @returns Formatted string like "40°42.075'N, 74°34.073'W"
 */
export function formatCoordinateDDM(lat: number, lng: number): string {
  if (!validateCoordinateBounds(lat, lng)) return '';
  
  // Latitude
  const latAbs = Math.abs(lat);
  const latDeg = Math.floor(latAbs);
  const latMin = (latAbs - latDeg) * 60;
  const latDir = lat >= 0 ? 'N' : 'S';
  
  // Longitude  
  const lngAbs = Math.abs(lng);
  const lngDeg = Math.floor(lngAbs);
  const lngMin = (lngAbs - lngDeg) * 60;
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${latDeg}°${latMin.toFixed(3)}'${latDir}, ${lngDeg}°${lngMin.toFixed(3)}'${lngDir}`;
}

/**
 * Auto-detect coordinate format and parse
 * @param input Coordinate string in any supported format
 * @returns ParsedCoordinate or null if invalid
 */
export function parseCoordinateAuto(input: string): ParsedCoordinate | null {
  if (!input || typeof input !== 'string') return null;
  
  // Try DD first (most common)
  const ddResult = parseCoordinateDD(input);
  if (ddResult) return ddResult;
  
  // Try DMS 
  const dmsResult = parseCoordinateDMS(input);
  if (dmsResult) return dmsResult;
  
  // Try DDM
  const ddmResult = parseCoordinateDDM(input);
  if (ddmResult) return ddmResult;
  
  return null;
}

/**
 * Get coordinate format type from input string
 * @param input Coordinate string
 * @returns Format type or 'unknown'
 */
export function detectCoordinateFormat(input: string): 'DD' | 'DMS' | 'DDM' | 'unknown' {
  if (!input || typeof input !== 'string') return 'unknown';
  
  if (parseCoordinateDD(input)) return 'DD';
  if (parseCoordinateDMS(input)) return 'DMS';  
  if (parseCoordinateDDM(input)) return 'DDM';
  
  return 'unknown';
}