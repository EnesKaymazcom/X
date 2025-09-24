// POI types
export interface OverpassPOI {
  id: string;
  name: string;
  class: string;
  subclass?: string;
  rank?: number;
  latitude: number;
  longitude: number;
  properties?: Record<string, any>;
}

export interface OverpassNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassNode[];
}