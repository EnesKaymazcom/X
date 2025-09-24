import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildOverpassQuery, convertNodesToPOIs } from './overpass-client';
import { OverpassPOI, OverpassResponse } from './types';

// Cache configuration
const CACHE_KEY_PREFIX = 'poi_cache_';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch nearby POIs from Overpass API
 * DÖKÜMAN ÖRNEĞİ GİBİ OVERPASS QUERY
 */
export const fetchNearbyPOIs = async (
  latitude: number,
  longitude: number,
  radius: number = 1000
): Promise<OverpassPOI[]> => {
  try {
    // Check cache first
    const cacheKey = `${CACHE_KEY_PREFIX}${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radius}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    
    // Build Overpass query
    const query = buildOverpassQuery(latitude, longitude, radius);
    
    // Fetch from Overpass API
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }
    
    const data: OverpassResponse = await response.json();
    
    // Convert to POI format
    const pois = convertNodesToPOIs(data.elements);
    
    // Cache the results
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: pois
    }));
    
    return pois;
  } catch (error) {
    // Fallback to cached data if available
    const cacheKey = `${CACHE_KEY_PREFIX}${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radius}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      return data;
    }
    
    throw error;
  }
};

/**
 * Clear POI cache
 */
export const clearPOICache = async (): Promise<void> => {
  const keys = await AsyncStorage.getAllKeys();
  const poiCacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
  
  if (poiCacheKeys.length > 0) {
    await AsyncStorage.multiRemove(poiCacheKeys);
  }
};

/**
 * Search POIs by name
 */
export const searchPOIs = async (
  searchTerm: string,
  latitude: number,
  longitude: number,
  radius: number = 5000
): Promise<OverpassPOI[]> => {
  const allPOIs = await fetchNearbyPOIs(latitude, longitude, radius);
  
  const searchLower = searchTerm.toLowerCase();
  return allPOIs.filter(poi => 
    poi.name.toLowerCase().includes(searchLower) ||
    poi.class.toLowerCase().includes(searchLower) ||
    poi.subclass?.toLowerCase().includes(searchLower)
  );
};