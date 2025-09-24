import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { FISHIVO_WEATHER_API_KEY } from '@/config';
import { Theme } from '@/theme';
import { Skeleton, SkeletonItem, IconButton } from '@/components/ui';
import { useLocationStore } from '@/stores/locationStore';

interface WeatherData {
  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
  humidity?: number;
  pressure?: number;
}

interface WeatherMapComponentProps {
  _initialCoordinates?: [number, number];
  _onLocationSelect?: (coordinates: [number, number]) => void;
  style?: object;
  _weatherData?: WeatherData;
}

const WeatherMapComponent: React.FC<WeatherMapComponentProps> = ({
  _initialCoordinates,
  _onLocationSelect,
  style,
  _weatherData
}) => {
  const { theme, isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webViewReady, setWebViewReady] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [hasRealData, setHasRealData] = useState(false);
  const [_userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);
  // LocationStore now handles all location management
  const locationStore = useLocationStore();
  const currentLocation = locationStore.currentLocation;
  const isLocationLoading = locationStore.isLoading;
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const styles = createStyles(theme);
  // Location permission now handled by LocationStore
  
  const getCurrentLocation = useCallback(async () => {
    setLocationError(null);
    try {
      const location = await locationStore.getSmartLocation();
      if (location) {
        const coordinates: [number, number] = [location.longitude, location.latitude];
        setUserCoordinates(coordinates);
        return location;
      }
      return null;
    } catch (error) {
      setLocationError('Konum alınamadı');
      return null;
    }
  }, [locationStore]);

  const sendLocationToWebView = useCallback((location: [number, number]) => {
    if (webViewRef.current && webViewReady) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'setNativeLocation',
        coordinates: location
      }));
    }
  }, [webViewReady]);

  const fetchWeatherData = useCallback(async (coordinates: Array<{latitude: number, longitude: number}>) => {
    try {
      const latitudes = coordinates.map(c => c.latitude).join(',');
      const longitudes = coordinates.map(c => c.longitude).join(',');
      const url = `https://meteo.fishivo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}&hourly=wind_speed_10m,wind_direction_10m`;
      
      const response = await fetch(url, {
        headers: {
          'X-API-Key': FISHIVO_WEATHER_API_KEY
        }
      });
      
      const data = await response.json();
      
      if (webViewRef.current && webViewReady) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'weatherData',
          data: data
        }));
      }
    } catch (error) {}
  }, [webViewReady]);
  
  const fetchUserWindData = useCallback(async (lat: number, lng: number) => {
    try {
      const url = `https://meteo.fishivo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,wind_direction_10m`;
      
      const response = await fetch(url, {
        headers: {
          'X-API-Key': FISHIVO_WEATHER_API_KEY
        }
      });
      
      const data = await response.json();
      
      if (webViewRef.current && webViewReady) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'userWindData',
          data: data
        }));
      }
    } catch (error) {}
  }, [webViewReady]);
  
  const handleLocationRequest = useCallback(async () => {
    if (currentLocation) {
      if (webViewRef.current && webViewReady) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'flyToLocation',
          coordinates: currentLocation
        }));
      }
    } else {
      const location = await getCurrentLocation();
      if (location) {
        sendLocationToWebView([location.longitude, location.latitude]);
      } else {
        if (webViewRef.current && webViewReady) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'fallbackToWebLocation'
          }));
        }
      }
    }
  }, [currentLocation, getCurrentLocation, webViewReady, sendLocationToWebView]);
  // Initialize location with LocationStore
  useEffect(() => {
    locationStore.getSmartLocation();
  }, [locationStore]);
  useEffect(() => {
    if (webViewReady && currentLocation) {
      setTimeout(() => sendLocationToWebView([currentLocation.longitude, currentLocation.latitude]), 500);
    }
  }, [webViewReady, currentLocation, sendLocationToWebView]);
  useFocusEffect(
    useCallback(() => {
      if (webViewReady) {
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'restartAnimation'
        }));
      }
      if (webViewReady && !currentLocation) {
        getCurrentLocation().then((location) => {
          if (location) {
            setTimeout(() => sendLocationToWebView([location.longitude, location.latitude]), 100);
          }
        });
      }
    }, [webViewReady, currentLocation, getCurrentLocation, sendLocationToWebView])
  );

  const windMapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js'></script>
        <link href='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css' rel='stylesheet' />
        <script>
            window.IS_DARK_THEME = ${isDark};
        </script>
        <style>
            body { margin: 0; padding: 0; overflow: hidden; }
            #map-container { 
                position: relative; 
                width: 100vw; 
                height: 100vh;
            }
            .maplibregl-ctrl-attrib {
                display: none !important;
            }
            .maplibregl-ctrl-logo {
                display: none !important;
            }
            .maplibregl-ctrl-bottom-right {
                display: none !important;
            }
            .maplibregl-ctrl-top-right {
                display: none !important;
            }
            .maplibregl-ctrl {
                display: none !important;
            }
            #map { 
                position: absolute; 
                top: 0; 
                bottom: 0; 
                width: 100%; 
                height: 100%;
            }
            #wind-canvas {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1000;
                background: transparent;
            }
            #location-btn {
                display: none !important;
            }
        </style>
    </head>
    <body>
        <div id='map-container'>
            <div id='map'></div>
            <canvas id='wind-canvas'></canvas>
            <button id='location-btn' onclick='requestCurrentLocation()'>📍 Konumuma Git</button>
        </div>
        <script>
            let userLocation = null;
            let isLocationLoaded = false;
            function requestCurrentLocation() {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'requestNativeLocation'
                    }));
                } else {
                    getUserLocation();
                }
            }
            function getUserLocation() {
                // WebView fallback removed - location now comes from native LocationStore
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'requestNativeLocation'
                    }));
                }
            }
            let map;
            let mapInitialized = false;
            
            function initializeMap(center) {
                if (mapInitialized) return;
                if (!center) return;
                
                const mapStyle = window.IS_DARK_THEME 
                    ? 'https://tiles.openfreemap.org/styles/dark'
                    : 'https://tiles.openfreemap.org/styles/positron';
                
                map = new maplibregl.Map({
                    container: 'map',
                    style: mapStyle,
                    center: center,
                    zoom: 10,
                    maxZoom: 15,
                    minZoom: 8,
                    attributionControl: false,
                    trackUserLocation: false,
                    dragRotate: false,
                    rotateControl: false,
                    touchPitch: false,
                    pitchWithRotate: false,
                    bearingSnap: 0,
                    bearing: 0,
                    pitch: 0
                });
                
                map.touchZoomRotate.disableRotation();
                
                mapInitialized = true;
                setupMapEvents();
            }
            
            function handleInitialLocation(lat, lng) {
                if (!mapInitialized) {
                    initializeMap([lng, lat]);
                }
                updateUserLocation(lat, lng, false);
            }
            async function fetchUserLocationWindData(lat, lng) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'requestUserWindData',
                        latitude: lat,
                        longitude: lng
                    }));
                    return;
                }
            }
            
            
            let userMarker = null;
            function updateUserLocation(lat, lng, flyTo = true) {
                if (!map) return;
                
                if (userMarker) {
                    userMarker.remove();
                }
                userLocation = { latitude: lat, longitude: lng };
                fetchUserLocationWindData(lat, lng);
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.alignItems = 'center';
                container.style.gap = '4px';
                const el = document.createElement('div');
                el.style.width = '8px';
                el.style.height = '8px';
                el.style.borderRadius = '50%';
                el.style.backgroundColor = '#007AFF';
                el.style.border = '2px solid white';
                el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                const windIndicator = document.createElement('div');
                windIndicator.id = 'user-wind-indicator';
                windIndicator.style.backgroundColor = window.IS_DARK_THEME ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)';
                windIndicator.style.padding = '4px 8px';
                windIndicator.style.borderRadius = '12px';
                windIndicator.style.fontSize = '11px';
                windIndicator.style.fontWeight = '600';
                windIndicator.style.color = '#007AFF';
                windIndicator.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
                windIndicator.style.whiteSpace = 'nowrap';
                windIndicator.innerHTML = '...';
                
                container.appendChild(el);
                container.appendChild(windIndicator);
                
                userMarker = new maplibregl.Marker({ element: container, anchor: 'center' })
                    .setLngLat([lng, lat])
                    .addTo(map);
                
                if (flyTo) {
                    map.flyTo({
                        center: [lng, lat],
                        zoom: 10,
                        duration: 1500,
                        essential: true,
                        easing: function(t) {
                            return t * (2 - t); // Smooth ease-out
                        }
                    });
                }
                
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ 
                        type: 'locationUpdated', 
                        lat, 
                        lng 
                    }));
                }
            }
            function handleMessage(event) {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'weatherData') {
                        processWeatherData(data.data);
                    } else if (data.type === 'userWindData') {
                        processUserWindData(data.data);
                    } else if (data.type === 'triggerLocation') {
                        getUserLocation();
                    } else if (data.type === 'setNativeLocation') {
                        const coordinates = data.coordinates;
                        if (coordinates && coordinates.length >= 2) {
                            const lat = coordinates[1];
                            const lng = coordinates[0];
                            if (!mapInitialized) {
                                handleInitialLocation(lat, lng);
                            } else {
                                updateUserLocation(lat, lng, true);
                            }
                            if (window.ReactNativeWebView) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'nativeLocationSet',
                                    latitude: lat,
                                    longitude: lng
                                }));
                            }
                            if (!userLocation) {
                                setTimeout(() => {
                                    if (map) fetchWindData();
                                }, 1000);
                            }
                        }
                    } else if (data.type === 'flyToLocation') {
                        const coordinates = data.coordinates;
                        if (coordinates && coordinates.length >= 2) {
                            const lat = coordinates[1];
                            const lng = coordinates[0];
                            if (map) {
                                map.flyTo({
                                    center: [lng, lat],
                                    zoom: 10,
                                    duration: 1500,
                                    essential: true,
                                    easing: function(t) {
                                        return t * (2 - t);
                                    }
                                });
                            }
                        }
                    } else if (data.type === 'fallbackToWebLocation') {
                        getUserLocation();
                    } else if (data.type === 'restartAnimation') {
                        startAnimation();
                    }
                } catch (e) {
                }
            }
        
            document.addEventListener('message', handleMessage);
            window.addEventListener('message', handleMessage);
            const canvas = document.getElementById('wind-canvas');
            const ctx = canvas.getContext('2d');
            
            function resizeCanvas() {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                canvas.style.width = rect.width + 'px';
                canvas.style.height = rect.height + 'px';
                return { width: rect.width, height: rect.height };
            }
            let canvasSize = resizeCanvas();
            
            const particles = [];
            
            function getParticleSettings(zoom) {
                if (zoom < 9) return { density: 0.6, min: 200, max: 700 };
                if (zoom <= 10) return { density: 0.7, min: 300, max: 900 };
                if (zoom >= 12) return { density: 0.9, min: 480, max: 1200 };
                return { density: 0.8, min: 360, max: 1080 };
            }
            const MAX_AGE = 125;
            const SPEED_FACTOR = 0.3;
            const VISUAL_SCALE = 0.5;
            const MAX_PATH_LENGTH = 50;
            
            let globalWindGrid = null;
            const FIXED_GRID_RESOLUTION = 0.5;
            
            function getFetchRadius(zoom) {
                if (zoom >= 8) return 3;
                if (zoom >= 6) return 5;
                if (zoom >= 5) return 8;
                return 10;
            }
            const CACHE_DURATION = 0; // Cache devre dışı
            const API_KEY = '${FISHIVO_WEATHER_API_KEY}';
            const API_BASE_URL = 'https://meteo.fishivo.com';
            const MAX_COORDS_PER_REQUEST = 100;
            let apiCallCount = 0;
            let totalGridPoints = 0;
            let cachedPoints = 0;
            
            const windCache = window.windDataCache || (window.windDataCache = {
                get: async function(lat, lon) {
                    // Cache devre dışı, her zaman null dön
                    return null;
                },
                set: async function(lat, lon, data) {
                    // Cache devre dışı, veri saklamıyoruz
                },
                data: new Map(),
                fetchedBounds: null
            });
            function processUserWindData(weatherData) {
                if (weatherData.hourly && weatherData.hourly.wind_speed_10m && weatherData.hourly.wind_direction_10m) {
                    const windSpeed = (weatherData.hourly.wind_speed_10m[0] || 0) / 3.6; // km/h to m/s
                    const windDirection = weatherData.hourly.wind_direction_10m[0] || 0;
                    
                    const indicator = document.getElementById('user-wind-indicator');
                    if (indicator) {
                        let color = '#4CAF50';
                        if (windSpeed >= 3 && windSpeed < 6) color = '#FFC107';
                        if (windSpeed >= 6 && windSpeed < 8) color = '#FF9800';
                        if (windSpeed >= 8) color = '#F44336';
                        indicator.style.color = color;
                        const arrowRotation = windDirection;
                        const arrowHtml = \`<span style="display: inline-block; transform: rotate(\${arrowRotation}deg); margin-left: 4px;">↓</span>\`;
                        indicator.innerHTML = \`\${windSpeed.toFixed(1)} m/s \${arrowHtml}\`;
                    }
                }
            }
            function processWeatherData(weatherData) {
                if (!globalWindGrid) {
                    globalWindGrid = {
                        resolution: FIXED_GRID_RESOLUTION,
                        data: new Map(),
                        lastUpdate: Date.now()
                    };
                }
                
                let processedCount = 0;
                
                if (Array.isArray(weatherData)) {
                    // Bulk response
                    weatherData.forEach(location => {
                        if (location.hourly && location.hourly.wind_speed_10m && location.hourly.wind_direction_10m) {
                            const lat = Math.round(location.latitude / FIXED_GRID_RESOLUTION) * FIXED_GRID_RESOLUTION;
                            const lon = Math.round(location.longitude / FIXED_GRID_RESOLUTION) * FIXED_GRID_RESOLUTION;
                            const key = \`\${lat},\${lon}\`;
                            
                            const windSpeed = (location.hourly.wind_speed_10m[0] || 0) / 3.6; // km/h to m/s
                            const windDir = location.hourly.wind_direction_10m[0] || 0;
                            
                            const dirRad = windDir * Math.PI / 180;
                            const u = -windSpeed * Math.sin(dirRad);
                            const v = windSpeed * Math.cos(dirRad);
                            
                            globalWindGrid.data.set(key, { u, v });
                            processedCount++;
                        }
                    });
                } else if (weatherData.hourly) {
                    // Single response
                    const lat = Math.round(weatherData.latitude / FIXED_GRID_RESOLUTION) * FIXED_GRID_RESOLUTION;
                    const lon = Math.round(weatherData.longitude / FIXED_GRID_RESOLUTION) * FIXED_GRID_RESOLUTION;
                    const key = \`\${lat},\${lon}\`;
                    
                    const windSpeed = (weatherData.hourly.wind_speed_10m[0] || 0) / 3.6;
                    const windDir = weatherData.hourly.wind_direction_10m[0] || 0;
                    
                    const dirRad = windDir * Math.PI / 180;
                    const u = -windSpeed * Math.sin(dirRad);
                    const v = windSpeed * Math.cos(dirRad);
                    
                    globalWindGrid.data.set(key, { u, v });
                    processedCount++;
                }
                
                if (processedCount > 0 && !window.hasRealData) {
                    window.hasRealData = true;
                    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'realDataLoaded' }));
                }
            }
            
            let fetchDebounceTimer = null;
            async function fetchWindData(forceRefetch = false) {
                let fetchBounds;
                
                // If user location available, fetch area based on current zoom
                const currentZoom = map.getZoom();
                const fetchRadius = getFetchRadius(currentZoom);
                
                if (userLocation && !windCache.fetchedBounds) {
                    // First time: fetch area around user based on zoom
                    fetchBounds = {
                        north: Math.min(90, userLocation.latitude + fetchRadius),
                        south: Math.max(-90, userLocation.latitude - fetchRadius),
                        east: userLocation.longitude + fetchRadius,
                        west: userLocation.longitude - fetchRadius
                    };
                    windCache.fetchedBounds = fetchBounds; // Remember what we fetched
                } else if (windCache.fetchedBounds) {
                    // Check if current view is outside fetched bounds
                    const bounds = map.getBounds();
                    const cached = windCache.fetchedBounds;
                    
                    if (bounds.getNorth() > cached.north || 
                        bounds.getSouth() < cached.south ||
                        bounds.getEast() > cached.east || 
                        bounds.getWest() < cached.west) {
                        // Outside cached area, fetch new area with zoom-adaptive expansion
                        const zoomExpansion = currentZoom >= 8 ? 1.5 : currentZoom >= 6 ? 2.0 : 2.5;
                        const latRange = bounds.getNorth() - bounds.getSouth();
                        const lonRange = bounds.getEast() - bounds.getWest();
                        fetchBounds = {
                            north: Math.min(90, bounds.getNorth() + latRange * zoomExpansion),
                            south: Math.max(-90, bounds.getSouth() - latRange * zoomExpansion),
                            east: bounds.getEast() + lonRange * zoomExpansion,
                            west: bounds.getWest() - lonRange * zoomExpansion
                        };
                        // Update fetched bounds
                        windCache.fetchedBounds = {
                            north: Math.max(cached.north, fetchBounds.north),
                            south: Math.min(cached.south, fetchBounds.south),
                            east: Math.max(cached.east, fetchBounds.east),
                            west: Math.min(cached.west, fetchBounds.west)
                        };
                    } else {
                        // Still within cached area, no need to fetch
                        return;
                    }
                } else {
                    // Fallback: fetch visible area with zoom-adaptive expansion
                    const bounds = map.getBounds();
                    const zoomExpansion = currentZoom >= 8 ? 1.5 : currentZoom >= 6 ? 2.0 : 2.5;
                    const latRange = bounds.getNorth() - bounds.getSouth();
                    const lonRange = bounds.getEast() - bounds.getWest();
                    fetchBounds = {
                        north: Math.min(90, bounds.getNorth() + latRange * zoomExpansion),
                        south: Math.max(-90, bounds.getSouth() - latRange * zoomExpansion),
                        east: bounds.getEast() + lonRange * zoomExpansion,
                        west: bounds.getWest() - lonRange * zoomExpansion
                    };
                    windCache.fetchedBounds = fetchBounds;
                }
                
                // Create global grid if not exists (never reset on zoom!)
                if (!globalWindGrid) {
                    globalWindGrid = {
                        resolution: FIXED_GRID_RESOLUTION,
                        data: new Map(),
                        lastUpdate: Date.now()
                    };
                }
                const gridPoints = [];
                const lat1 = Math.floor(fetchBounds.south / FIXED_GRID_RESOLUTION) * FIXED_GRID_RESOLUTION;
                const lat2 = Math.ceil(fetchBounds.north / FIXED_GRID_RESOLUTION) * FIXED_GRID_RESOLUTION;
                const lon1 = Math.floor(fetchBounds.west / FIXED_GRID_RESOLUTION) * FIXED_GRID_RESOLUTION;
                const lon2 = Math.ceil(fetchBounds.east / FIXED_GRID_RESOLUTION) * FIXED_GRID_RESOLUTION;
                let totalPointsInArea = 0;
                let cachedInArea = 0;
                
                for (let lat = lat1; lat <= lat2; lat += FIXED_GRID_RESOLUTION) {
                    for (let lon = lon1; lon <= lon2; lon += FIXED_GRID_RESOLUTION) {
                        const key = \`\${lat},\${lon}\`;
                        totalPointsInArea++;
                        if (!globalWindGrid.data.has(key)) {
                            // Cache devre dışı, direkt API'ye istek at
                            gridPoints.push({ lat, lon, key });
                        } else {
                            cachedInArea++;
                        }
                    }
                }
                totalGridPoints = totalPointsInArea;
                cachedPoints = cachedInArea;
                if (gridPoints.length > 0) {
                    window.isTransitioning = true;
                    const chunks = [];
                    for (let i = 0; i < gridPoints.length; i += MAX_COORDS_PER_REQUEST) {
                        chunks.push(gridPoints.slice(i, i + MAX_COORDS_PER_REQUEST));
                    }
                    chunks.forEach(chunk => {
                        const coordinates = chunk.map(p => ({ latitude: p.lat, longitude: p.lon }));
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'requestWeatherData',
                                coordinates: coordinates
                            }));
                        }
                    });
                    setTimeout(() => {
                        window.isTransitioning = false;
                    }, 2000);
                } else {
                    window.isTransitioning = false;
                }
                const now = Date.now();
                for (const [key, value] of windCache.data.entries()) {
                    // Parse timestamp from cache entry
                    if (value.timestamp && now - value.timestamp > CACHE_DURATION) {
                        windCache.data.delete(key);
                    }
                }
            }
            
            // Calculate particle count based on canvas size AND zoom level
            function calculateParticleCount() {
                const zoom = map.getZoom();
                const settings = getParticleSettings(zoom);
                const area = canvasSize.width * canvasSize.height;
                let count = Math.floor(area * settings.density / 10000);
                count = Math.max(settings.min, Math.min(settings.max, count));
                return count;
            }
            
            function initializeParticles() {
                particles.length = 0;
                const particleCount = calculateParticleCount();
                
                for (let i = 0; i < particleCount; i++) {
                    const x = Math.random() * canvasSize.width;
                    const y = Math.random() * canvasSize.height;
                    particles.push({
                        x: x,
                        y: y,
                        age: Math.random() * MAX_AGE,
                        speed: 0.5 + Math.random() * 0.5,
                        path: [{x: x, y: y}]  // Initialize path with starting position
                    });
                }
            }
            
            function speedToColor(speed) {
                const colors = window.IS_DARK_THEME ? [
                    { threshold: 0, r: 255, g: 255, b: 255 },
                    { threshold: 8, r: 255, g: 255, b: 255 },
                    { threshold: 12, r: 16, g: 185, b: 129 },
                    { threshold: 16, r: 234, g: 179, b: 8 },
                    { threshold: 20, r: 249, g: 115, b: 22 },
                    { threshold: 25, r: 239, g: 68, b: 68 },
                    { threshold: 30, r: 168, g: 85, b: 247 }
                ] : [
                    { threshold: 0, r: 0, g: 71, b: 171 },
                    { threshold: 8, r: 0, g: 71, b: 171 },
                    { threshold: 12, r: 0, g: 94, b: 184 },
                    { threshold: 16, r: 30, g: 64, b: 175 },
                    { threshold: 20, r: 25, g: 53, b: 148 },
                    { threshold: 25, r: 19, g: 43, b: 110 },
                    { threshold: 30, r: 13, g: 27, b: 82 }
                ];
                
                // Find the appropriate color range
                let color1, color2, factor;
                for (let i = 0; i < colors.length - 1; i++) {
                    if (speed >= colors[i].threshold && speed < colors[i + 1].threshold) {
                        color1 = colors[i];
                        color2 = colors[i + 1];
                        factor = (speed - color1.threshold) / (color2.threshold - color1.threshold);
                        break;
                    }
                }
                
                // Handle speeds above 30 m/s
                if (speed >= 30) {
                    return colors[colors.length - 1];
                }
                
                // Interpolate between colors
                if (color1 && color2) {
                    return {
                        r: Math.round(color1.r + (color2.r - color1.r) * factor),
                        g: Math.round(color1.g + (color2.g - color1.g) * factor),
                        b: Math.round(color1.b + (color2.b - color1.b) * factor)
                    };
                }
                
                return colors[0];
            }
            
            // Get wind data using world-space coordinates (viewport independent) - OPTIMIZED
            function getWind(x, y) {
                if (!globalWindGrid || globalWindGrid.data.size === 0) {
                    // No data available - return zero wind
                    return { u: 0, v: 0 };
                }
                
                // Convert screen coordinates to world coordinates (use display dimensions)
                const bounds = map.getBounds();
                const lat = bounds.getSouth() + (bounds.getNorth() - bounds.getSouth()) * (y / canvasSize.height);
                const lon = bounds.getWest() + (bounds.getEast() - bounds.getWest()) * (x / canvasSize.width);
                
                // Find the four surrounding grid points with FIXED resolution
                const lat0 = Math.floor(lat / FIXED_GRID_RESOLUTION) * FIXED_GRID_RESOLUTION;
                const lat1 = lat0 + FIXED_GRID_RESOLUTION;
                const lon0 = Math.floor(lon / FIXED_GRID_RESOLUTION) * FIXED_GRID_RESOLUTION;
                const lon1 = lon0 + FIXED_GRID_RESOLUTION;
                
                // Get wind data for the four corners
                const key00 = \`\${lat0},\${lon0}\`;
                const key01 = \`\${lat0},\${lon1}\`;
                const key10 = \`\${lat1},\${lon0}\`;
                const key11 = \`\${lat1},\${lon1}\`;
                
                const w00 = globalWindGrid.data.get(key00) || { u: 0, v: 0 };
                const w01 = globalWindGrid.data.get(key01) || { u: 0, v: 0 };
                const w10 = globalWindGrid.data.get(key10) || { u: 0, v: 0 };
                const w11 = globalWindGrid.data.get(key11) || { u: 0, v: 0 };
                
                // Bilinear interpolation factors
                const fx = (lon - lon0) / FIXED_GRID_RESOLUTION;
                const fy = (lat - lat0) / FIXED_GRID_RESOLUTION;
                
                // Interpolate u and v components
                const u = w00.u * (1 - fx) * (1 - fy) +
                         w01.u * fx * (1 - fy) +
                         w10.u * (1 - fx) * fy +
                         w11.u * fx * fy;
                         
                const v = w00.v * (1 - fx) * (1 - fy) +
                         w01.v * fx * (1 - fy) +
                         w10.v * (1 - fx) * fy +
                         w11.v * fx * fy;
                
                return { u, v };
            }
            
            // Animation state
            let frameCount = 0;
            let isTransitioning = false;
            let transitionOpacity = 1.0;
            let animationId = null;
            let isAnimating = false;
            
            // Animation control functions
            function startAnimation() {
                if (isAnimating) return;
                isAnimating = true;
                animate();
            }
            
            function stopAnimation() {
                isAnimating = false;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
            
            function animate() {
                // Clear canvas completely for clean trails
                ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
                
                // Update zoom display
                const currentZoom = map.getZoom();
                
                // Apply transition opacity when loading new data
                if (window.isTransitioning) {
                    transitionOpacity = Math.max(0.3, transitionOpacity - 0.02);
                } else {
                    transitionOpacity = Math.min(1.0, transitionOpacity + 0.05);
                }
                
                frameCount++;
                
                particles.forEach(p => {
                    const wind = getWind(p.x, p.y);
                    const speed = Math.sqrt(wind.u * wind.u + wind.v * wind.v);
                    
                    // Only process if wind exists
                    if (Math.abs(wind.u) > 0.01 || Math.abs(wind.v) > 0.01) {
                        // Calculate new position with visual scaling
                        const dx = wind.u * p.speed * SPEED_FACTOR * VISUAL_SCALE;
                        const dy = wind.v * p.speed * SPEED_FACTOR * VISUAL_SCALE;
                        
                        const newX = p.x + dx;
                        const newY = p.y + dy;
                        
                        // Add new position to path
                        p.path.push({x: newX, y: newY});
                        
                        // Limit path length for performance
                        if (p.path.length > MAX_PATH_LENGTH) {
                            p.path.shift(); // Remove oldest point
                        }
                        
                        // Get color based on wind speed
                        const color = speedToColor(speed);
                        
                        // Draw the trail with gradient opacity
                        if (p.path.length > 1) {
                            const zoom = map.getZoom();
                            const baseWidth = zoom > 7 ? 0.575 : zoom > 5 ? 0.92 : 1.15; // %15 kalın
                            
                            // Draw trail segments with decreasing opacity
                            for (let i = 1; i < p.path.length; i++) {
                                const segment = i / p.path.length;
                                
                                // Calculate opacity for this segment (comet tail effect)
                                const segmentOpacity = segment * segment; // Quadratic fade
                                const ageOpacity = p.age < 12 ? p.age / 12 : 
                                                 p.age > MAX_AGE - 12 ? (MAX_AGE - p.age) / 12 : 1;
                                
                                ctx.globalAlpha = transitionOpacity * segmentOpacity * ageOpacity * 0.8;
                                ctx.strokeStyle = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
                                
                                // Thinner lines for older segments (%15 kalın)
                                ctx.lineWidth = (baseWidth + (speed > 15 ? 0.575 : speed > 10 ? 0.345 : 0)) * segment;
                                
                                ctx.beginPath();
                                ctx.moveTo(p.path[i - 1].x, p.path[i - 1].y);
                                ctx.lineTo(p.path[i].x, p.path[i].y);
                                ctx.stroke();
                            }
                        }
                        
                        // Update particle position
                        p.x = newX;
                        p.y = newY;
                    } else {
                        // No wind - keep minimal path
                        if (p.path.length > 1) {
                            p.path = [p.path[p.path.length - 1]];
                        }
                    }
                    
                    p.age++;
                    
                    // Respawn particles that exit bounds or expire
                    if (p.age > MAX_AGE || p.x < -10 || p.x > canvasSize.width + 10 || 
                        p.y < -10 || p.y > canvasSize.height + 10) {
                        const newX = Math.random() * canvasSize.width;
                        const newY = Math.random() * canvasSize.height;
                        p.x = newX;
                        p.y = newY;
                        p.age = 0;
                        p.speed = 0.5 + Math.random() * 0.5;
                        p.path = [{x: newX, y: newY}]; // Reset path
                    }
                });
                
                // Reset global alpha for next frame
                ctx.globalAlpha = 1.0;
                
                animationId = requestAnimationFrame(animate);
            }
            
            // Window resize handler
            window.addEventListener('resize', () => {
                canvasSize = resizeCanvas();
                initializeParticles();
            });
            
            // Also listen for orientation changes on mobile
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    canvasSize = resizeCanvas();
                    initializeParticles();
                }, 100);
            });
            
            // Visibility change handler - stop/start animation based on page visibility
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stopAnimation();
                } else {
                    setTimeout(() => startAnimation(), 100);
                }
            });
            
            // Window focus/blur handlers for better animation control
            window.addEventListener('focus', () => {
                setTimeout(() => startAnimation(), 100);
            });
            
            window.addEventListener('blur', () => {
                stopAnimation();
            });
            
            function setupMapEvents() {
                if (!map) return;
                
                map.on('load', () => {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ 
                        type: 'mapLoaded' 
                    }));
                }
                window.updateUserLocation = updateUserLocation;
                
                setTimeout(() => {
                    canvasSize = resizeCanvas();
                    initializeParticles();
                    fetchWindData();
                    animate();
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'requestInitialLocation'
                        }));
                    } else {
                        getUserLocation();
                    }
                }, 100);
                let lastFetchBounds = null;
                map.on('moveend', () => {
                    const bounds = map.getBounds();
                    if (!lastFetchBounds) {
                        lastFetchBounds = bounds;
                        return;
                    }
                    if (fetchDebounceTimer) {
                        clearTimeout(fetchDebounceTimer);
                    }
                    fetchDebounceTimer = setTimeout(() => {
                        const latDiff = Math.abs(bounds.getNorth() - lastFetchBounds.getNorth());
                        const lonDiff = Math.abs(bounds.getEast() - lastFetchBounds.getEast());
                        const latThreshold = (lastFetchBounds.getNorth() - lastFetchBounds.getSouth()) * 0.2;
                        const lonThreshold = (lastFetchBounds.getEast() - lastFetchBounds.getWest()) * 0.2;
                        
                        if (latDiff > latThreshold || lonDiff > lonThreshold) {
                            lastFetchBounds = bounds;
                            fetchWindData();
                        }
                    }, 200);
                });
                let lastZoom = map.getZoom();
                map.on('zoomend', () => {
                    const currentZoom = map.getZoom();
                    const zoomDiff = Math.abs(currentZoom - lastZoom);
                    if (zoomDiff > 0.5) {
                        if (zoomDiff > 2 && currentZoom > lastZoom) {
                            const newRadius = getFetchRadius(currentZoom);
                            if (windCache.fetchedBounds && userLocation) {
                                const currentRadius = Math.abs(windCache.fetchedBounds.north - userLocation.latitude);
                                if (newRadius < currentRadius * 0.7) {}
                            }
                        }
                        lastZoom = currentZoom;
                    }
                });
                // Cache devre dışı olduğu için periyodik temizleme kaldırıldı
            });
            }
        </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      {(isLoading || isLocationLoading || !hasRealData) && !hasInitialLoad && (
        <View style={styles.skeletonContainer}>
          <Skeleton>
            <SkeletonItem width="100%" height="100%" borderRadius={0} />
          </Skeleton>
        </View>
      )}
      
      {locationError && !isLocationLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ html: windMapHTML }}
        style={styles.map}
        scrollEnabled={false}
        scalesPageToFit={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
        injectedJavaScriptBeforeContentLoaded={`
          true;
        `}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'requestWeatherData') {
              // WebView weather data istiyor
              fetchWeatherData(data.coordinates);
            } else if (data.type === 'requestUserWindData') {
              // WebView user location wind data istiyor
              fetchUserWindData(data.latitude, data.longitude);
            } else if (data.type === 'realDataLoaded') {
              // Gerçek veri geldi, skeleton'ı kaldır
              setHasRealData(true);
              if (!hasInitialLoad) {
                setTimeout(() => {
                  setIsLoading(false);
                  setHasInitialLoad(true);
                }, 300);
              }
            } else if (data.type === 'mapLoaded') {
              // Harita yüklendi ama veri henüz yok
            } else if (data.type === 'locationSuccess') {
              setUserCoordinates([data.longitude, data.latitude]);
            } else if (data.type === 'locationError') {
              // Konum hatası, skeleton'ı kaldır
              if (!hasInitialLoad) {
                setIsLoading(false);
                setHasInitialLoad(true);
              }
            } else if (data.type === 'requestNativeLocation') {
              handleLocationRequest();
            } else if (data.type === 'requestInitialLocation') {
              handleLocationRequest();
            } else if (data.type === 'nativeLocationSet') {
              setUserCoordinates([data.longitude, data.latitude]);
            }
          } catch (e) {}
        }}
        onLoad={() => {
          setWebViewReady(true);
          // Fallback: 3 saniye sonra skeleton'ı kapat
          setTimeout(() => {
            if (isLoading) {
              setIsLoading(false);
              setHasInitialLoad(true);
              setHasRealData(true);
            }
          }, 3000);
        }}
        onError={() => {
          // Hata durumunda skeleton'ı kaldır
          setIsLoading(false);
          setLocationError('Harita yüklenemedi');
        }}
      />
      
      {/* Native Location Button - Same as MapScreen */}
      <View style={styles.mapControls}>
        <IconButton
          icon="navigation"
          size="md"
          iconColor={currentLocation ? theme.colors.primary : theme.colors.textSecondary}
          onPress={handleLocationRequest}
          style={{
            ...styles.mapControlButton,
            ...(!currentLocation ? styles.disabledButton : {})
          }}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => 
  StyleSheet.create({
    container: {
      height: '100%',
      position: 'relative',
    },
    map: {
      height: '100%',
    },
    skeletonContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      backgroundColor: theme.colors.surface,
    },
    errorContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 15,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
    },
    errorText: {
      fontSize: theme.typography.sm,
      color: theme.colors.error,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    mapControls: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      gap: 12,
      zIndex: 1000,
      pointerEvents: 'box-none',
    },
    mapControlButton: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      pointerEvents: 'auto',
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

export default WeatherMapComponent;