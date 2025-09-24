/**
 * Weather utility functions
 */

/**
 * Get icon name based on weather condition
 */
export function getConditionIcon(condition: string | number | undefined | null): string {
  if (!condition && condition !== 0) {
    return 'help-circle';
  }
  
  if (typeof condition === 'number') {
    const weatherCodeMap: Record<number, string> = {
      0: 'sun',
      1: 'cloud-sun',
      2: 'cloud-sun',
      3: 'cloud',
      45: 'cloud-fog',
      48: 'cloud-fog',
      51: 'cloud-drizzle',
      53: 'cloud-drizzle',
      55: 'cloud-drizzle',
      61: 'cloud-rain',
      63: 'cloud-rain',
      65: 'cloud-rain',
      71: 'cloud-snow',
      73: 'cloud-snow',
      75: 'cloud-snow',
      77: 'cloud-snow',
      80: 'cloud-rain',
      81: 'cloud-rain',
      82: 'cloud-rain',
      95: 'cloud-lightning',
      96: 'cloud-hail',
      99: 'cloud-hail'
    };
    return weatherCodeMap[condition] || 'cloud';
  }
  
  if (typeof condition !== 'string') {
    return 'help-circle';
  }
  
  const conditionMap: Record<string, string> = {
    'clear': 'sun',
    'sunny': 'sun',
    'partly_cloudy': 'cloud-sun',
    'cloudy': 'cloud',
    'overcast': 'cloud',
    'rain': 'cloud-rain',
    'drizzle': 'cloud-drizzle',
    'snow': 'cloud-snow',
    'sleet': 'cloud-snow',
    'hail': 'cloud-hail',
    'thunderstorm': 'cloud-lightning',
    'fog': 'cloud-fog',
    'mist': 'cloud-fog',
    'wind': 'wind',
    'tornado': 'tornado',
  };
  
  return conditionMap[condition.toLowerCase()] || 'cloud';
}

/**
 * Get icon based on location type
 */
export function getLocationIcon(locationType?: string): string {
  const locationMap: Record<string, string> = {
    'current': 'navigation',
    'manual': 'map-pin',
    'spot': 'anchor',
    'saved': 'bookmark',
  };
  
  return locationMap[locationType || 'manual'] || 'map-pin';
}

/**
 * Get color based on rating value
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4) return '#22c55e'; // green
  if (rating >= 3) return '#eab308'; // yellow
  if (rating >= 2) return '#f97316'; // orange
  return '#ef4444'; // red
}