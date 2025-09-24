/**
 * Map Clustering Utilities
 * 
 * Clustering algoritmaları ve distance hesaplama fonksiyonları
 * Zoom seviyesine göre adaptive clustering
 */

export interface ClusterableItem {
  id: string | number
  coordinates: [number, number] // [lng, lat]
}

export interface ClusterData<T extends ClusterableItem = ClusterableItem> {
  id: string
  coordinate: [number, number] // [lng, lat] 
  count: number
  items: T[]
}

export interface ClusteringOptions {
  zoom: number
  minZoomForIndividual?: number // Default: 12
  radiusKm?: {
    low: number // Default: 50km for zoom <= 8
    medium: number // Default: 20km for zoom 8-10
    high: number // Default: 10km for zoom 10-12
  }
}

/**
 * Haversine distance hesaplama (km)
 * İki koordinat arasındaki mesafeyi hesaplar
 */
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Zoom seviyesine göre cluster radius'u belirle
 */
export const getClusterRadius = (zoom: number, options?: ClusteringOptions): number => {
  const radiusConfig = options?.radiusKm || {
    low: 50,
    medium: 20, 
    high: 10
  }

  if (zoom <= 8) return radiusConfig.low
  if (zoom <= 10) return radiusConfig.medium
  return radiusConfig.high
}

/**
 * Ana clustering fonksiyonu
 * Zoom seviyesine göre items'ları cluster'lar veya individual items olarak döner
 */
export const clusterItems = <T extends ClusterableItem>(
  items: T[], 
  options: ClusteringOptions
): { 
  individualItems: T[], 
  clusters: ClusterData<T>[] 
} => {
  const { zoom, minZoomForIndividual = 12 } = options

  // Yüksek zoom'da individual marker'lar göster
  if (zoom >= minZoomForIndividual) {
    return { individualItems: items, clusters: [] }
  }

  // Düşük zoom'da clustering yap
  const clusters: ClusterData<T>[] = []
  const clustered = new Set<string | number>()
  const individualItems: T[] = []

  const clusterRadius = getClusterRadius(zoom, options)

  items.forEach((item1, index) => {
    if (clustered.has(item1.id)) return

    const nearby: T[] = [item1]
    clustered.add(item1.id)

    // Yakındaki items'ları bul
    items.forEach((item2, index2) => {
      if (index2 <= index || clustered.has(item2.id)) return

      const distance = calculateDistance(
        item1.coordinates[1], item1.coordinates[0],
        item2.coordinates[1], item2.coordinates[0]
      )

      if (distance <= clusterRadius) {
        nearby.push(item2)
        clustered.add(item2.id)
      }
    })

    // Birden fazla item varsa cluster oluştur
    if (nearby.length > 1) {
      // Cluster merkez koordinatını hesapla (centroid)
      const avgLat = nearby.reduce((sum, item) => sum + item.coordinates[1], 0) / nearby.length
      const avgLng = nearby.reduce((sum, item) => sum + item.coordinates[0], 0) / nearby.length

      clusters.push({
        id: `cluster-${item1.id}`,
        coordinate: [avgLng, avgLat],
        count: nearby.length,
        items: nearby
      })
    } else {
      individualItems.push(item1)
    }
  })

  return { individualItems, clusters }
}

/**
 * Cluster içindeki items'ları bounds'a göre filtrele
 * Performance için kullanılır
 */
export const filterItemsByBounds = <T extends ClusterableItem>(
  items: T[],
  bounds: {
    ne: [number, number] // [lng, lat]
    sw: [number, number] // [lng, lat]
  }
): T[] => {
  const { ne, sw } = bounds
  
  return items.filter(item => {
    const [lng, lat] = item.coordinates
    return lng >= sw[0] && lng <= ne[0] && lat >= sw[1] && lat <= ne[1]
  })
}

/**
 * Cluster stats hesaplama
 * Debug ve monitoring için
 */
export const getClusteringStats = <T extends ClusterableItem>(
  items: T[],
  clusters: ClusterData<T>[],
  individualItems: T[]
) => {
  const totalItems = items.length
  const clusteredItems = clusters.reduce((sum, cluster) => sum + cluster.count, 0)
  const reductionRatio = totalItems > 0 ? (totalItems - clusters.length - individualItems.length) / totalItems : 0

  return {
    totalItems,
    clusters: clusters.length,
    individualItems: individualItems.length,
    clusteredItems,
    reductionRatio: Math.round(reductionRatio * 100), // Percentage
    avgClusterSize: clusters.length > 0 ? Math.round(clusteredItems / clusters.length) : 0
  }
}

/**
 * Adaptive clustering
 * Performansa göre otomatik clustering ayarları
 */
export const adaptiveCluster = <T extends ClusterableItem>(
  items: T[],
  zoom: number,
  performanceTarget: 'fast' | 'balanced' | 'detailed' = 'balanced'
): { individualItems: T[], clusters: ClusterData<T>[] } => {
  let options: ClusteringOptions

  switch (performanceTarget) {
    case 'fast':
      options = {
        zoom,
        minZoomForIndividual: 14, // Daha az individual marker
        radiusKm: { low: 100, medium: 50, high: 25 } // Daha büyük cluster'lar
      }
      break
      
    case 'detailed':
      options = {
        zoom,
        minZoomForIndividual: 10, // Daha çok individual marker
        radiusKm: { low: 25, medium: 10, high: 5 } // Daha küçük cluster'lar
      }
      break
      
    default: // balanced
      options = {
        zoom,
        minZoomForIndividual: 12,
        radiusKm: { low: 50, medium: 20, high: 10 }
      }
  }

  return clusterItems(items, options)
}