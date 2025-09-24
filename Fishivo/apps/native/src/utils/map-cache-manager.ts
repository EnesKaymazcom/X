import AsyncStorage from '@react-native-async-storage/async-storage'
import { MapCatchData, MapBounds } from '@fishivo/types'

interface CacheTile {
  zoom: number
  x: number
  y: number
  catches: MapCatchData[]
  lastSync: string
  version: number
}

interface CacheMetadata {
  lastFullSync: string
  totalCatches: number
  tiles: string[]
  version: number
}

const CACHE_VERSION = 1
const CACHE_PREFIX = 'map_cache_'
const METADATA_KEY = `${CACHE_PREFIX}metadata`
const TILE_EXPIRY_HOURS = 24

export class MapCacheManager {
  private static instance: MapCacheManager
  
  static getInstance(): MapCacheManager {
    if (!MapCacheManager.instance) {
      MapCacheManager.instance = new MapCacheManager()
    }
    return MapCacheManager.instance
  }

  // Convert lat/lng to tile coordinates
  private latLngToTile(lat: number, lng: number, zoom: number): { x: number, y: number } {
    const n = Math.pow(2, zoom)
    const x = Math.floor((lng + 180) / 360 * n)
    const latRad = lat * Math.PI / 180
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
    return { x, y }
  }

  // Get tile key for caching
  private getTileKey(zoom: number, x: number, y: number): string {
    return `${CACHE_PREFIX}tile_${zoom}_${x}_${y}`
  }

  // Get tiles that intersect with bounds
  private getTilesForBounds(bounds: MapBounds, zoom: number): { x: number, y: number }[] {
    const minTile = this.latLngToTile(bounds.minLat, bounds.minLng, zoom)
    const maxTile = this.latLngToTile(bounds.maxLat, bounds.maxLng, zoom)
    
    const tiles: { x: number, y: number }[] = []
    for (let x = minTile.x; x <= maxTile.x; x++) {
      for (let y = maxTile.y; y <= minTile.y; y++) {
        tiles.push({ x, y })
      }
    }
    return tiles
  }

  // Save catches to cache
  async saveCatchesToCache(
    catches: MapCatchData[], 
    bounds: MapBounds, 
    zoom: number
  ): Promise<void> {
    try {
      // Use zoom 10 for tile-based caching (balanced granularity)
      const tileZoom = Math.min(zoom, 10)
      const tiles = this.getTilesForBounds(bounds, tileZoom)
      
      // Group catches by tile
      const catchesByTile = new Map<string, MapCatchData[]>()
      
      for (const catchData of catches) {
        const lat = catchData.coordinates[1]
        const lng = catchData.coordinates[0]
        const tile = this.latLngToTile(lat, lng, tileZoom)
        const tileKey = this.getTileKey(tileZoom, tile.x, tile.y)
        
        if (!catchesByTile.has(tileKey)) {
          catchesByTile.set(tileKey, [])
        }
        catchesByTile.get(tileKey)!.push(catchData)
      }

      // Save each tile
      const tileKeys: string[] = []
      const keyValuePairs: [string, string][] = []
      const now = new Date().toISOString()

      for (const [tileKey, tileCatches] of catchesByTile) {
        const [, , , z, x, y] = tileKey.split('_')
        const cacheTile: CacheTile = {
          zoom: parseInt(z),
          x: parseInt(x),
          y: parseInt(y),
          catches: tileCatches,
          lastSync: now,
          version: CACHE_VERSION
        }
        
        keyValuePairs.push([tileKey, JSON.stringify(cacheTile)])
        tileKeys.push(tileKey)
      }

      // Batch save tiles
      if (keyValuePairs.length > 0) {
        await AsyncStorage.multiSet(keyValuePairs)
      }

      // Update metadata
      await this.updateMetadata(tileKeys, catches.length)
      
    } catch (error) {
      // Silent fail - cache is optional
    }
  }

  // Get cached catches for bounds
  async getCachedCatches(bounds: MapBounds, zoom: number): Promise<{
    catches: MapCatchData[]
    lastSync: string | null
    isExpired: boolean
  }> {
    try {
      const tileZoom = Math.min(zoom, 10)
      const tiles = this.getTilesForBounds(bounds, tileZoom)
      const tileKeys = tiles.map(t => this.getTileKey(tileZoom, t.x, t.y))
      
      const results = await AsyncStorage.multiGet(tileKeys)
      const allCatches: MapCatchData[] = []
      let oldestSync: string | null = null
      let isExpired = false

      const now = Date.now()
      const expiryMs = TILE_EXPIRY_HOURS * 60 * 60 * 1000

      for (const [, value] of results) {
        if (value) {
          try {
            const tile: CacheTile = JSON.parse(value)
            
            // Check version
            if (tile.version !== CACHE_VERSION) {
              continue
            }

            // Check expiry
            const syncTime = new Date(tile.lastSync).getTime()
            if (now - syncTime > expiryMs) {
              isExpired = true
            }

            // Track oldest sync time
            if (!oldestSync || tile.lastSync < oldestSync) {
              oldestSync = tile.lastSync
            }

            // Add catches
            allCatches.push(...tile.catches)
          } catch {
            // Skip invalid tile
          }
        }
      }

      // Remove duplicates (catches might appear in multiple tiles at boundaries)
      const uniqueCatches = Array.from(
        new Map(allCatches.map(c => [c.id, c])).values()
      )

      return {
        catches: uniqueCatches,
        lastSync: oldestSync,
        isExpired
      }
    } catch (error) {
      return {
        catches: [],
        lastSync: null,
        isExpired: true
      }
    }
  }

  // Update cache with delta changes
  async applyDeltaSync(
    newCatches: MapCatchData[],
    deletedIds: string[],
    updatedCatches: MapCatchData[],
    bounds: MapBounds,
    zoom: number
  ): Promise<void> {
    try {
      const tileZoom = Math.min(zoom, 10)
      
      // Get all affected tiles
      const affectedTiles = new Set<string>()
      
      // Process new and updated catches
      const catchesToProcess = [...newCatches, ...updatedCatches]
      for (const catchData of catchesToProcess) {
        const tile = this.latLngToTile(
          catchData.coordinates[1],
          catchData.coordinates[0],
          tileZoom
        )
        affectedTiles.add(this.getTileKey(tileZoom, tile.x, tile.y))
      }

      // Load affected tiles
      const tileKeys = Array.from(affectedTiles)
      const results = await AsyncStorage.multiGet(tileKeys)
      const updatedTiles: [string, string][] = []

      for (const [tileKey, value] of results) {
        let tile: CacheTile | null = null
        
        if (value) {
          try {
            tile = JSON.parse(value)
          } catch {
            // Create new tile if parse fails
          }
        }

        if (!tile || tile.version !== CACHE_VERSION) {
          // Create new tile
          const [, , , z, x, y] = tileKey.split('_')
          tile = {
            zoom: parseInt(z),
            x: parseInt(x),
            y: parseInt(y),
            catches: [],
            lastSync: new Date().toISOString(),
            version: CACHE_VERSION
          }
        }

        // Apply deletions
        if (deletedIds.length > 0) {
          tile.catches = tile.catches.filter(c => !deletedIds.includes(c.id))
        }

        // Apply updates
        const updateMap = new Map(updatedCatches.map(c => [c.id, c]))
        tile.catches = tile.catches.map(c => updateMap.get(c.id) || c)

        // Add new catches for this tile
        for (const newCatch of newCatches) {
          const catchTile = this.latLngToTile(
            newCatch.coordinates[1],
            newCatch.coordinates[0],
            tileZoom
          )
          const catchTileKey = this.getTileKey(tileZoom, catchTile.x, catchTile.y)
          
          if (catchTileKey === tileKey && !tile.catches.some(c => c.id === newCatch.id)) {
            tile.catches.push(newCatch)
          }
        }

        // Update sync time
        tile.lastSync = new Date().toISOString()

        // Save updated tile
        updatedTiles.push([tileKey, JSON.stringify(tile)])
      }

      // Batch save updated tiles
      if (updatedTiles.length > 0) {
        await AsyncStorage.multiSet(updatedTiles)
      }
    } catch (error) {
      // Silent fail
    }
  }

  // Update metadata
  private async updateMetadata(tileKeys: string[], totalCatches: number): Promise<void> {
    try {
      const existingMetadata = await this.getMetadata()
      
      const metadata: CacheMetadata = {
        lastFullSync: new Date().toISOString(),
        totalCatches: existingMetadata?.totalCatches || 0 + totalCatches,
        tiles: Array.from(new Set([...(existingMetadata?.tiles || []), ...tileKeys])),
        version: CACHE_VERSION
      }

      await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(metadata))
    } catch {
      // Silent fail
    }
  }

  // Get metadata
  async getMetadata(): Promise<CacheMetadata | null> {
    try {
      const data = await AsyncStorage.getItem(METADATA_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  // Clear all cache
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX))
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys)
      }
    } catch {
      // Silent fail
    }
  }

  // Get cache stats for debugging
  async getCacheStats(): Promise<{
    totalTiles: number
    totalCatches: number
    cacheSize: number
    oldestSync: string | null
  }> {
    try {
      const metadata = await this.getMetadata()
      if (!metadata) {
        return {
          totalTiles: 0,
          totalCatches: 0,
          cacheSize: 0,
          oldestSync: null
        }
      }

      // Calculate approximate cache size
      let cacheSize = 0
      const tileData = await AsyncStorage.multiGet(metadata.tiles)
      for (const [, value] of tileData) {
        if (value) {
          cacheSize += value.length
        }
      }

      return {
        totalTiles: metadata.tiles.length,
        totalCatches: metadata.totalCatches,
        cacheSize: Math.round(cacheSize / 1024), // KB
        oldestSync: metadata.lastFullSync
      }
    } catch {
      return {
        totalTiles: 0,
        totalCatches: 0,
        cacheSize: 0,
        oldestSync: null
      }
    }
  }
}

export const mapCacheManager = MapCacheManager.getInstance()