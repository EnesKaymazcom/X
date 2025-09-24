/**
 * Navigation utility functions for maritime compass
 * COG (Course Over Ground), SOG (Speed Over Ground), and Heading calculations
 */

export interface GPSPosition {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number; // m/s
  heading?: number; // degrees
  accuracy?: number; // meters
}

export interface NavigationData {
  cog: number; // Course Over Ground in degrees (0-360)
  sog: number; // Speed Over Ground in knots
  heading: number; // Compass heading in degrees (0-360)
  distance: number; // Distance traveled in nautical miles
}

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Convert radians to degrees
 */
const toDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

/**
 * Calculate bearing (COG) between two GPS coordinates
 * Uses the forward azimuth formula
 * @returns bearing in degrees (0-360)
 */
export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  
  // Normalize to 0-360 degrees
  return (toDegrees(θ) + 360) % 360;
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns distance in nautical miles
 */
export const calculateDistanceNautical = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3440.065; // Earth's radius in nautical miles
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Calculate Speed Over Ground in knots
 * @param distance - distance in nautical miles
 * @param timeDiff - time difference in milliseconds
 * @returns speed in knots
 */
export const calculateSOG = (distance: number, timeDiff: number): number => {
  if (timeDiff <= 0) return 0;
  
  const hours = timeDiff / (1000 * 60 * 60);
  const knots = distance / hours;
  
  return Math.round(knots * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate Course Over Ground from two GPS positions
 */
export const calculateCOG = (
  prevPosition: GPSPosition,
  currentPosition: GPSPosition
): number => {
  return calculateBearing(
    prevPosition.latitude,
    prevPosition.longitude,
    currentPosition.latitude,
    currentPosition.longitude
  );
};

/**
 * Get compass direction from degrees
 */
export const getCompassDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
};

/**
 * Get simplified compass direction (8 cardinal directions)
 */
export const getCardinalDirection = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degrees % 360) / 45)) % 8;
  return directions[index];
};

/**
 * Calculate complete navigation data from two GPS positions
 */
export const calculateNavigationData = (
  prevPosition: GPSPosition,
  currentPosition: GPSPosition,
  compassHeading: number
): NavigationData => {
  const distance = calculateDistanceNautical(
    prevPosition.latitude,
    prevPosition.longitude,
    currentPosition.latitude,
    currentPosition.longitude
  );
  
  const timeDiff = currentPosition.timestamp - prevPosition.timestamp;
  const sog = calculateSOG(distance, timeDiff);
  
  const cog = calculateCOG(prevPosition, currentPosition);
  
  return {
    cog,
    sog,
    heading: compassHeading,
    distance
  };
};

/**
 * Format bearing/heading for display
 */
export const formatDegrees = (degrees: number): string => {
  const normalized = Math.round(degrees % 360);
  return `${normalized}°`;
};

/**
 * Format SOG for display
 */
export const formatSpeed = (knots: number): string => {
  return `${knots.toFixed(1)} kts`;
};

/**
 * Convert meters per second to knots
 */
export const mpsToKnots = (mps: number): number => {
  return mps * 1.94384;
};

/**
 * Convert knots to meters per second
 */
export const knotsToMps = (knots: number): number => {
  return knots * 0.514444;
};

/**
 * Check if position is valid
 */
export const isValidPosition = (position: GPSPosition): boolean => {
  return (
    position &&
    typeof position.latitude === 'number' &&
    typeof position.longitude === 'number' &&
    !isNaN(position.latitude) &&
    !isNaN(position.longitude) &&
    Math.abs(position.latitude) <= 90 &&
    Math.abs(position.longitude) <= 180
  );
};

/**
 * Calculate moving average for smoother readings
 */
export class MovingAverage {
  private values: number[] = [];
  private maxSize: number;

  constructor(size = 5) {
    this.maxSize = size;
  }

  add(value: number): number {
    this.values.push(value);
    if (this.values.length > this.maxSize) {
      this.values.shift();
    }
    return this.getAverage();
  }

  getAverage(): number {
    if (this.values.length === 0) return 0;
    const sum = this.values.reduce((a, b) => a + b, 0);
    return sum / this.values.length;
  }

  reset(): void {
    this.values = [];
  }
}