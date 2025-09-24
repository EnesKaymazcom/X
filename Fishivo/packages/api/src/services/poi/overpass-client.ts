import { OverpassNode, OverpassResponse, OverpassPOI } from './types';

// Convert OSM tags to our POI class/subclass system
export const mapOSMTagsToClass = (tags: Record<string, string>): { class: string; subclass?: string } => {
  if (tags.amenity) {
    switch (tags.amenity) {
      case 'restaurant':
      case 'cafe':
      case 'fast_food':
      case 'bar':
      case 'pub':
        return { class: 'restaurant', subclass: tags.amenity };
      case 'hospital':
      case 'clinic':
      case 'doctors':
        return { class: 'hospital', subclass: tags.amenity };
      case 'pharmacy':
        return { class: 'pharmacy' };
      case 'bank':
      case 'atm':
        return { class: 'bank', subclass: tags.amenity };
      case 'fuel':
        return { class: 'gas_station' };
      case 'school':
      case 'university':
      case 'college':
        return { class: 'school', subclass: tags.amenity };
      default:
        return { class: 'other', subclass: tags.amenity };
    }
  }
  
  if (tags.shop) {
    return { class: 'shopping', subclass: tags.shop };
  }
  
  if (tags.tourism) {
    return { class: 'tourism', subclass: tags.tourism };
  }
  
  if (tags.leisure === 'park') {
    return { class: 'park' };
  }
  
  if (tags.natural) {
    return { class: 'park', subclass: tags.natural };
  }
  
  return { class: 'other' };
};

// Calculate POI rank based on tags
export const calculateRank = (tags: Record<string, string>): number => {
  let rank = 5; // Default rank
  
  // Higher rank for named places
  if (tags.name) rank += 2;
  
  // Higher rank for popular amenities
  if (tags.amenity && ['restaurant', 'hospital', 'bank'].includes(tags.amenity)) {
    rank += 2;
  }
  
  // Higher rank for branded places
  if (tags.brand || tags.operator) rank += 1;
  
  return Math.min(rank, 10);
};

/**
 * Build Overpass query
 */
export const buildOverpassQuery = (
  latitude: number,
  longitude: number,
  radius: number = 1000
): string => {
  return `
    [out:json][timeout:10];
    (
      node["amenity"~"^(restaurant|cafe|fast_food|bar|pub|hospital|clinic|doctors|pharmacy|bank|atm|fuel|school|university|college)$"](around:${radius},${latitude},${longitude});
      node["shop"](around:${radius},${latitude},${longitude});
      node["tourism"](around:${radius},${latitude},${longitude});
      node["leisure"="park"](around:${radius},${latitude},${longitude});
    );
    out geom;
  `;
};

/**
 * Convert Overpass nodes to POI format
 */
export const convertNodesToPOIs = (nodes: OverpassNode[]): OverpassPOI[] => {
  return nodes
    .filter(node => node.tags && (node.tags.name || node.tags.amenity || node.tags.shop))
    .map(node => {
      const { class: poiClass, subclass } = mapOSMTagsToClass(node.tags || {});
      
      return {
        id: `osm-${node.id}`,
        name: node.tags?.name || node.tags?.amenity || node.tags?.shop || 'Bilinmeyen',
        class: poiClass,
        subclass,
        rank: calculateRank(node.tags || {}),
        latitude: node.lat,
        longitude: node.lon,
        properties: node.tags
      };
    });
};