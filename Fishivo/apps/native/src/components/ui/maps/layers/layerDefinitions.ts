import type { MapLayer, LayerCategory } from './types';
import { OPENFREEMAP_STYLES } from '@fishivo/utils';
import { MAPTILER_API_KEY } from '@/config';

// Professional Base Map Layers - OpenFreeMap + MapTiler with strict typing
export const baseMapLayers: readonly MapLayer[] = [
  {
    id: 'openfreemap-bright',
    name: 'Terrain',
    description: 'Açık renk harita stili',
    category: 'base',
    type: 'maplibre',
    styleURL: OPENFREEMAP_STYLES.bright,
    icon: 'sun',
    // previewImage will be lazy loaded
  },
  {
    id: 'maptiler-hybrid',
    name: 'Uydu',
    description: 'Uydu görüntüsü + sokak isimleri',
    category: 'base',
    type: 'maplibre',
    styleURL: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_API_KEY}`,
    icon: 'satellite',
    // previewImage will be lazy loaded
  },
  // Premium 3D Maps - Mapbox Only
  {
    id: 'mapbox-3d-terrain',
    name: '3D Arazi',
    description: 'Gerçek 3D dağ ve vadi görünümü',
    category: 'base',
    type: 'custom', // Will use Mapbox provider
    styleURL: 'mapbox://styles/mapbox/outdoors-v12',
    icon: 'mountain',
    isPremium: true, // Premium özellik
    config: {
      provider: 'mapbox',
      requires3D: true,
      minZoom: 6,
      maxZoom: 18,
      attribution: '© Mapbox © OpenStreetMap',
    },
    // previewImage: require('@/assets/images/map-layers/premium/terrain-3d.png'),
  },
  {
    id: 'mapbox-3d-satellite',
    name: '3D Uydu',
    description: 'Uydu görüntüsü + 3D arazi',
    category: 'base',
    type: 'custom', // Will use Mapbox provider
    styleURL: 'mapbox://styles/mapbox/satellite-streets-v12',
    icon: 'satellite',
    isPremium: true, // Premium özellik
    config: {
      provider: 'mapbox',
      requires3D: true,
      minZoom: 6,
      maxZoom: 18,
      attribution: '© Mapbox © Maxar',
    },
    // previewImage: require('@/assets/images/map-layers/premium/satellite-3d.png'),
  },
  {
    id: 'emodnet-bathymetry',
    name: 'EMODnet Derinlik',
    description: 'Avrupa deniz derinlik haritası',
    category: 'base',
    type: 'tile',
    tileURL: 'https://tiles.emodnet-bathymetry.eu/2020/baselayer/web_mercator/{z}/{x}/{y}.png',
    icon: 'waves',
    config: {
      attribution: '© EMODnet Bathymetry',
      minZoom: 3,
      maxZoom: 18,
    },
  },
];


// Professional Marine & Fishing Layers with type safety
export const marineLayers: readonly MapLayer[] = [
  {
    id: 'openseamap',
    name: 'OpenSeaMap',
    description: 'Denizcilik haritası ve derinlik bilgileri',
    category: 'marine',
    type: 'tile',
    tileURL: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    icon: 'anchor',
    isOverlay: true,
    opacity: 0.8,
    previewImage: require('@/assets/images/map-layers/marine/openseamap.png'),
    config: {
      attribution: '© OpenSeaMap contributors',
      minZoom: 3,
      maxZoom: 18,
    },
  },
  {
    id: 'gebco-contours',
    name: 'GEBCO Konturlar',
    description: 'Küresel deniz derinlik konturları (etiketli)',
    category: 'marine',
    type: 'tile',
    tileURL:
      'https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/web_mercator_gebco_2019_contours/MapServer/tile/{z}/{y}/{x}',
    icon: 'waves',
    isOverlay: true,
    opacity: 0.9,
    config: {
      attribution: '© GEBCO • NOAA NCEI',
      minZoom: 0,
      maxZoom: 23,
    },
  },
  {
    id: 'noaa-enc',
    name: 'NOAA ENC',
    description: 'ABD sahilleri – resmi deniz haritası (derinlik yazıları)',
    category: 'marine',
    type: 'wms',
    wmsParams: {
      service: 'WMS',
      version: '1.3.0',
      request: 'GetMap',
      layers: '0',
      styles: '',
      format: 'image/png',
      crs: 'EPSG:3857',
      width: 256,
      height: 256,
    },
    tileURL: 'https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/NOAAChartDisplay/MapServer/export?bbox={bbox}&size=256,256&format=png&transparent=true&f=image&sr=3857',
    icon: 'anchor',
    isOverlay: true,
    opacity: 0.9,
    config: {
      attribution: '© NOAA Office of Coast Survey',
      minZoom: 3,
      maxZoom: 16,
    },
  },
];

// Professional All Layers Combined with strict typing
export const allLayers: readonly MapLayer[] = [
  ...baseMapLayers,
  ...marineLayers,
] as const;

// Layer categories
export const layerCategories: LayerCategory[] = [
  {
    id: 'base',
    name: 'Temel Haritalar',
    description: 'Ana harita stilleri',
    icon: 'map',
    layers: baseMapLayers,
  },
  {
    id: 'marine',
    name: 'Denizcilik',
    description: 'Deniz ve balıkçılık haritaları',
    icon: 'anchor',
    layers: marineLayers,
  },
  {
    id: 'overlay',
    name: 'Katmanlar',
    description: 'Ekstra özellikler',
    icon: 'layers',
    layers: marineLayers,
  },
];

// Get layer by ID
export const getLayerById = (id: string): MapLayer | undefined => {
  return allLayers.find(layer => layer.id === id);
};

// Get layers by category
export const getLayersByCategory = (category: string): MapLayer[] => {
  return allLayers.filter(layer => layer.category === category);
};