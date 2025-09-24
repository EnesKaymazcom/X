"use client"

import { useEffect, useState, useRef } from 'react'
// @ts-ignore
import Map, { Marker, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl'
// @ts-ignore
import type { MapRef } from 'react-map-gl'
// @ts-ignore
import maplibregl from 'maplibre-gl'
import { MapSidebar } from './map-sidebar'
import { getIPLocation } from '@/lib/utils'

// MapLibre CSS import
import 'maplibre-gl/dist/maplibre-gl.css'

// OpenFreeMap styles - Native ile aynı
const OPENFREEMAP_STYLES = {
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  bright: 'https://tiles.openfreemap.org/styles/bright',
  dark: 'https://tiles.openfreemap.org/styles/dark',
  positron: 'https://tiles.openfreemap.org/styles/positron', // Legacy support
}

// MapTiler Satellite style URL
const MAPTILER_SATELLITE_STYLE = (apiKey: string) => 
  `https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`

// MapTiler Hybrid style - Gelişmiş uydu + sokak etiketleri
const MAPTILER_HYBRID_STYLE = (apiKey: string) => 
  `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`


interface MapLibreMapProps {
  style?: string
  zoom?: number
  className?: string
}

export function MapLibreMap({
  style = OPENFREEMAP_STYLES.bright,
  zoom = 1.5,
  className = 'w-full h-full'
}: MapLibreMapProps) {
  // All hooks must be at the top
  const mapRef = useRef<MapRef>(null)
  const [isClient, setIsClient] = useState(false)
  const [userLocation, setUserLocation] = useState<{longitude: number, latitude: number} | null>(null)
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 2  // Dünya görünümü
  })
  const [isViewStateReady, setIsViewStateReady] = useState(false)
  const [userInteracting, setUserInteracting] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [currentStyle, setCurrentStyle] = useState<string>(OPENFREEMAP_STYLES.bright)
  const [isSatellite, setIsSatellite] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Get country-based location using IP geolocation (no permission needed)
  useEffect(() => {
    if (!isClient) return

    const initializeLocation = async () => {
      try {
        const locationData = await getIPLocation()
        setViewState(prev => ({
          ...prev,
          longitude: locationData.longitude,
          latitude: locationData.latitude,
          zoom: locationData.zoom
        }))
        setIsViewStateReady(true)
      } catch (error) {
        console.error('Failed to get location:', error)
        setIsViewStateReady(true)
      }
    }

    initializeLocation()
  }, [isClient])

  const handleMapError = (error: any) => {
    console.error('MapLibre error details:', {
      error: error,
      message: error?.message,
      target: error?.target,
      type: error?.type,
      sourceId: error?.sourceId
    })
    
    // Don't set error state for minor issues
    if (error?.target?.style?._loaded === false) {
      // Style is still loading, ignore this error
      return
    }
    
    setMapError('Harita yüklenirken hata oluştu')
  }

  // Only render on client side and when viewState is ready
  if (!isClient || !isViewStateReady) {
    return (
      <div className={className + " flex items-center justify-center bg-gray-100"}>
        <p>Harita yükleniyor...</p>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className={className + " flex items-center justify-center bg-gray-100"}>
        <p>{mapError}</p>
      </div>
    )
  }

  // Handle style change from sidebar
  const handleStyleChange = (newStyle: string) => {
    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY
    
    // Check for MapTiler satellite
    if (newStyle === 'maptiler-satellite') {
      if (!apiKey || apiKey === 'your_maptiler_api_key_here') {
        console.warn('MapTiler API key not configured. Please add NEXT_PUBLIC_MAPTILER_API_KEY to your .env file')
        alert('MapTiler API anahtarı yapılandırılmamış. Lütfen .env dosyasına NEXT_PUBLIC_MAPTILER_API_KEY ekleyin.')
        return
      }
      setCurrentStyle(MAPTILER_SATELLITE_STYLE(apiKey))
      setIsSatellite(true)
      return
    }
    
    // Check for MapTiler hybrid
    if (newStyle === 'maptiler-hybrid') {
      if (!apiKey || apiKey === 'your_maptiler_api_key_here') {
        console.warn('MapTiler API key not configured. Please add NEXT_PUBLIC_MAPTILER_API_KEY to your .env file')
        alert('MapTiler API anahtarı yapılandırılmamış. Lütfen .env dosyasına NEXT_PUBLIC_MAPTILER_API_KEY ekleyin.')
        return
      }
      setCurrentStyle(MAPTILER_HYBRID_STYLE(apiKey))
      setIsSatellite(true)
      return
    }
    
    // Direct URL check (already full URL)
    if (newStyle.startsWith('https://')) {
      setCurrentStyle(newStyle)
      setIsSatellite(false)
      return
    }
    
    // Map style IDs to OpenFreeMap URLs
    const styleMap: Record<string, string> = {
      'liberty': OPENFREEMAP_STYLES.liberty,
      'bright': OPENFREEMAP_STYLES.bright,
      'dark': OPENFREEMAP_STYLES.dark,
      'positron': OPENFREEMAP_STYLES.positron,
      '3d-terrain': OPENFREEMAP_STYLES.liberty, // 3D terrain uses liberty as base
      // Legacy mappings for compatibility
      'standard-satellite': OPENFREEMAP_STYLES.liberty,
      'streets-v12': OPENFREEMAP_STYLES.bright,
      'outdoors-v12': OPENFREEMAP_STYLES.liberty,
      'light-v11': OPENFREEMAP_STYLES.positron,
      'dark-v11': OPENFREEMAP_STYLES.dark,
    }
    
    setCurrentStyle(styleMap[newStyle] || OPENFREEMAP_STYLES.bright)
    setIsSatellite(false)
  }

  return (
    <div className={className + " relative"}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMoveStart={() => setUserInteracting(true)}
        onMoveEnd={() => setUserInteracting(false)}
        mapStyle={currentStyle}
        mapLib={maplibregl}
        attributionControl={isSatellite ? true : {
          compact: false,
          customAttribution: [
            '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a>',
            '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
          ]
        }}
        onError={handleMapError}
        reuseMaps={true}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            color="#3B82F6"
          />
        )}
        
        {/* Navigation controls */}
        <NavigationControl position="top-right" />
        
        {/* Fullscreen control */}
        <FullscreenControl position="top-right" />
        
        {/* Scale control */}
        <ScaleControl position="bottom-right" maxWidth={80} unit="metric" />
        
        {/* Geolocation control - Only works when user clicks */}
        <GeolocateControl
          position="top-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={false}
          showUserHeading={false}
          showAccuracyCircle={false}
        />
      </Map>
      
      {/* Map Sidebar with OpenFreeMap styles */}
      <MapSidebar 
        onStyleChange={handleStyleChange}
        currentStyle={currentStyle}
        isOpenFreeMap={true}
      />
      
      {/* Manuel Attribution - Fallback */}
      <div className="absolute bottom-0 right-0 bg-white/95 dark:bg-gray-900/70 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 rounded-tl-md z-10">
        {isSatellite ? (
          <>
            {'© '}
            <a href="https://www.maptiler.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              MapTiler
            </a>
            {' © '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              OpenStreetMap contributors
            </a>
          </>
        ) : (
          <>
            <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              OpenFreeMap
            </a>
            {' © '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
              OpenStreetMap contributors
            </a>
          </>
        )}
      </div>
    </div>
  )
}