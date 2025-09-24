/**
 * Map Bounds Utilities
 * 
 * Harita bounds hesaplama, validation ve coordinate dönüşüm fonksiyonları
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface MapBounds {
  ne: [number, number] // [longitude, latitude] - northeast
  sw: [number, number] // [longitude, latitude] - southwest
}

export interface Region {
  latitude: number
  longitude: number
  latitudeDelta: number
  longitudeDelta: number
}

/**
 * Koordinat validasyonu
 * Latitude: -90 to 90, Longitude: -180 to 180
 */
export const isValidCoordinate = (latitude: number, longitude: number): boolean => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

/**
 * Bounds validasyonu
 * Northeast southwest koordinatları kontrol et
 */
export const isValidBounds = (bounds: MapBounds): boolean => {
  if (!bounds || !bounds.ne || !bounds.sw) return false
  
  const [neLng, neLat] = bounds.ne
  const [swLng, swLat] = bounds.sw
  
  return (
    isValidCoordinate(neLat, neLng) &&
    isValidCoordinate(swLat, swLng) &&
    neLat > swLat && // North > South
    neLng > swLng    // East > West (not considering 180° meridian)
  )
}

/**
 * Region'dan MapBounds'a dönüştürme
 */
export const regionToBounds = (region: Region): MapBounds => {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region
  
  const halfLatDelta = latitudeDelta / 2
  const halfLngDelta = longitudeDelta / 2
  
  return {
    ne: [longitude + halfLngDelta, latitude + halfLatDelta],
    sw: [longitude - halfLngDelta, latitude - halfLatDelta]
  }
}

/**
 * MapBounds'dan Region'a dönüştürme
 */
export const boundsToRegion = (bounds: MapBounds): Region => {
  const [neLng, neLat] = bounds.ne
  const [swLng, swLat] = bounds.sw
  
  const latitude = (neLat + swLat) / 2
  const longitude = (neLng + swLng) / 2
  const latitudeDelta = Math.abs(neLat - swLat)
  const longitudeDelta = Math.abs(neLng - swLng)
  
  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta
  }
}

/**
 * Koordinatın bounds içinde olup olmadığını kontrol et
 */
export const isCoordinateInBounds = (
  coordinate: [number, number], // [lng, lat]
  bounds: MapBounds
): boolean => {
  if (!isValidBounds(bounds)) return false
  
  const [lng, lat] = coordinate
  const [neLng, neLat] = bounds.ne
  const [swLng, swLat] = bounds.sw
  
  return lng >= swLng && lng <= neLng && lat >= swLat && lat <= neLat
}

/**
 * Bounds'u genişlet (padding ekle)
 * @param bounds Orijinal bounds
 * @param paddingPercent Genişletme yüzdesi (0.1 = %10)
 */
export const expandBounds = (bounds: MapBounds, paddingPercent: number = 0.1): MapBounds => {
  if (!isValidBounds(bounds)) return bounds
  
  const [neLng, neLat] = bounds.ne
  const [swLng, swLat] = bounds.sw
  
  const latRange = neLat - swLat
  const lngRange = neLng - swLng
  
  const latPadding = latRange * paddingPercent
  const lngPadding = lngRange * paddingPercent
  
  return {
    ne: [neLng + lngPadding, neLat + latPadding],
    sw: [swLng - lngPadding, swLat - latPadding]
  }
}

/**
 * Zoom seviyesinden yaklaşık bounds hesapla
 * @param center Merkez koordinat
 * @param zoom Zoom seviyesi (1-20)
 */
export const getBoundsFromZoom = (
  center: Coordinates,
  zoom: number
): MapBounds => {
  // Zoom seviyesine göre delta hesaplama
  // Zoom 1 = dünya geneli, Zoom 20 = sokak seviyesi
  const latDelta = 180 / Math.pow(2, zoom)
  const lngDelta = 360 / Math.pow(2, zoom)
  
  const halfLatDelta = latDelta / 2
  const halfLngDelta = lngDelta / 2
  
  return {
    ne: [center.longitude + halfLngDelta, center.latitude + halfLatDelta],
    sw: [center.longitude - halfLngDelta, center.latitude - halfLatDelta]
  }
}

/**
 * İki bounds'un kesişimini hesapla
 */
export const getIntersection = (bounds1: MapBounds, bounds2: MapBounds): MapBounds | null => {
  if (!isValidBounds(bounds1) || !isValidBounds(bounds2)) return null
  
  const [ne1Lng, ne1Lat] = bounds1.ne
  const [sw1Lng, sw1Lat] = bounds1.sw
  const [ne2Lng, ne2Lat] = bounds2.ne
  const [sw2Lng, sw2Lat] = bounds2.sw
  
  const neLng = Math.min(ne1Lng, ne2Lng)
  const neLat = Math.min(ne1Lat, ne2Lat)
  const swLng = Math.max(sw1Lng, sw2Lng)
  const swLat = Math.max(sw1Lat, sw2Lat)
  
  // Kesişim var mı kontrol et
  if (neLng <= swLng || neLat <= swLat) return null
  
  return {
    ne: [neLng, neLat],
    sw: [swLng, swLat]
  }
}

/**
 * Bounds alanını hesapla (km²)
 */
export const getBoundsArea = (bounds: MapBounds): number => {
  if (!isValidBounds(bounds)) return 0
  
  const [neLng, neLat] = bounds.ne
  const [swLng, swLat] = bounds.sw
  
  // Basit hesaplama - gerçek projeksiyonu dikkate almaz
  const latDiff = neLat - swLat
  const lngDiff = neLng - swLng
  
  // 1 derece yaklaşık 111 km
  const latKm = latDiff * 111
  const lngKm = lngDiff * 111 * Math.cos((neLat + swLat) / 2 * Math.PI / 180)
  
  return Math.abs(latKm * lngKm)
}

/**
 * Bounds'u SQL PostGIS formatına dönüştür
 * PostgreSQL/PostGIS ile kullanım için
 */
export const boundsToPostGIS = (bounds: MapBounds): string => {
  if (!isValidBounds(bounds)) return ''
  
  const [neLng, neLat] = bounds.ne
  const [swLng, swLat] = bounds.sw
  
  // POLYGON format for PostGIS
  return `POLYGON((${swLng} ${swLat}, ${neLng} ${swLat}, ${neLng} ${neLat}, ${swLng} ${neLat}, ${swLng} ${swLat}))`
}

/**
 * Bounds merkez noktasını hesapla
 */
export const getBoundsCenter = (bounds: MapBounds): Coordinates => {
  const [neLng, neLat] = bounds.ne
  const [swLng, swLat] = bounds.sw
  
  return {
    latitude: (neLat + swLat) / 2,
    longitude: (neLng + swLng) / 2
  }
}

/**
 * Debug için bounds bilgilerini formatla
 */
export const formatBoundsForDebug = (bounds: MapBounds): string => {
  if (!isValidBounds(bounds)) return 'Invalid bounds'
  
  const [neLng, neLat] = bounds.ne
  const [swLng, swLat] = bounds.sw
  const area = getBoundsArea(bounds)
  const center = getBoundsCenter(bounds)
  
  return [
    `Bounds: SW(${swLng.toFixed(4)}, ${swLat.toFixed(4)}) - NE(${neLng.toFixed(4)}, ${neLat.toFixed(4)})`,
    `Center: (${center.longitude.toFixed(4)}, ${center.latitude.toFixed(4)})`,
    `Area: ${area.toFixed(2)} km²`
  ].join(' | ')
}