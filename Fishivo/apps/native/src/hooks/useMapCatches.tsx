import { useState, useEffect, useCallback, useRef } from 'react';
import { createNativeApiService } from '@fishivo/api';
import { adaptiveCluster, getClusteringStats, formatBoundsForDebug, type ClusterData as UtilsClusterData } from '@fishivo/utils';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { mapCacheManager } from '@/utils/map-cache-manager';
import type { MapBounds as TypesMapBounds, MapCatchData as TypesMapCatchData } from '@fishivo/types';
import type { MapBounds as ApiMapBounds, MapCatchData as ApiMapCatchData } from '@fishivo/api/services/posts/posts.native';

interface ClusterData {
  id: string;
  coordinate: { latitude: number; longitude: number };
  count: number;
  catches: TypesMapCatchData[];
}

// Type for clustering items with proper coordinates format
interface ClusterableMapCatch {
  id: number | string;
  coordinates: [number, number]; // [lng, lat]
  species: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  image_url?: string;
  created_at: string;
  weight?: number;
  length?: number;
}

// Helper function to convert Types bounds format to API bounds format
const convertBoundsToApiFormat = (bounds: TypesMapBounds): ApiMapBounds => ({
  ne: [bounds.east, bounds.north],
  sw: [bounds.west, bounds.south]
})

// Helper function to convert API MapCatchData to Types MapCatchData
const convertApiCatchToTypesFormat = (apiCatch: ApiMapCatchData): TypesMapCatchData => ({
  id: apiCatch.id,
  latitude: apiCatch.coordinates[1],
  longitude: apiCatch.coordinates[0],
  species_name: apiCatch.species,
  user_avatar: apiCatch.user.avatar_url,
  image_url: apiCatch.image_url,
  created_at: apiCatch.created_at,
  weight: apiCatch.weight,
  length: apiCatch.length,
  username: apiCatch.user.full_name
})

interface UseMapCatchesProps {
  bounds: TypesMapBounds | null
  zoom: number
  enabled?: boolean
}

interface UseMapCatchesReturn {
  catches: TypesMapCatchData[]
  clusters: ClusterData[]
  loading: boolean
  error: string | null
  refetch: () => void
  stats?: {
    totalCatches: number
    clustersCount: number
    individualCount: number
    reductionRatio: number
  }
  debugInfo?: string
  cacheInfo?: {
    fromCache: boolean
    lastSync: string | null
    isExpired: boolean
  }
}

// Always use fast performance
const getPerformanceTarget = (): 'fast' => 'fast'

export const useMapCatches = ({ 
  bounds, 
  zoom, 
  enabled = true 
}: UseMapCatchesProps): UseMapCatchesReturn => {
  const [allCatches, setAllCatches] = useState<TypesMapCatchData[]>([])
  const [catches, setCatches] = useState<TypesMapCatchData[]>([])
  const [clusters, setClusters] = useState<ClusterData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<UseMapCatchesReturn['stats']>()
  const [debugInfo, setDebugInfo] = useState<string>()
  const [cacheInfo, setCacheInfo] = useState<UseMapCatchesReturn['cacheInfo']>()
  
  // Track if initial load from cache has happened
  const initialLoadRef = useRef(false)
  const lastSyncRef = useRef<string | null>(null)

  const { user } = useSupabaseUser()
  const apiService = createNativeApiService()

  // Load from cache immediately on mount or bounds change
  const loadFromCache = useCallback(async () => {
    if (!bounds || !enabled) return

    try {
      const cachedData = await mapCacheManager.getCachedCatches(bounds, zoom)
      
      if (cachedData.catches.length > 0) {
        setAllCatches(cachedData.catches)
        
        // Simple clustering - convert cached data to clustering format
        const performanceTarget = getPerformanceTarget()
        const clusterableItems: ClusterableMapCatch[] = cachedData.catches.map(catchItem => ({
          id: catchItem.id,
          coordinates: [catchItem.longitude, catchItem.latitude] as [number, number],
          species: catchItem.species_name || 'Unknown',
          user: {
            id: catchItem.id.toString(),
            full_name: catchItem.username || 'Unknown User',
            avatar_url: catchItem.user_avatar
          },
          image_url: catchItem.image_url,
          created_at: catchItem.created_at,
          weight: catchItem.weight,
          length: catchItem.length
        }));
        const { individualItems, clusters: clusterData } = adaptiveCluster(
          clusterableItems, 
          zoom, 
          performanceTarget
        )

        const convertedClusters: ClusterData[] = clusterData.map((cluster: UtilsClusterData<ClusterableMapCatch>) => ({
          id: cluster.id,
          coordinate: { 
            latitude: cluster.coordinate[1], 
            longitude: cluster.coordinate[0] 
          },
          count: cluster.count,
          catches: cluster.items.map(item => ({
            id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
            latitude: item.coordinates[1],
            longitude: item.coordinates[0],
            species_name: item.species,
            user_avatar: item.user.avatar_url,
            image_url: item.image_url,
            created_at: item.created_at,
            weight: item.weight,
            length: item.length,
            username: item.user.full_name
          }))
        }))

        // Convert clustered items back to TypesMapCatchData format
        const convertedIndividualItems: TypesMapCatchData[] = individualItems.map(item => ({
          id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
          latitude: item.coordinates[1],
          longitude: item.coordinates[0],
          species_name: item.species,
          user_avatar: item.user.avatar_url,
          image_url: item.image_url,
          created_at: item.created_at,
          weight: item.weight,
          length: item.length,
          username: item.user.full_name
        }))
        setCatches(convertedIndividualItems)
        setClusters(convertedClusters)
        
        // Set cache info
        setCacheInfo({
          fromCache: true,
          lastSync: cachedData.lastSync,
          isExpired: cachedData.isExpired
        })
        
        lastSyncRef.current = cachedData.lastSync
        
        // Generate stats
        const clusteringStats = getClusteringStats(clusterableItems, clusterData, individualItems)
        setStats({
          totalCatches: clusteringStats.totalItems,
          clustersCount: clusteringStats.clusters,
          individualCount: clusteringStats.individualItems,
          reductionRatio: clusteringStats.reductionRatio
        })
        
        const apiBounds = convertBoundsToApiFormat(bounds)
        const boundsDebug = formatBoundsForDebug(apiBounds)
        setDebugInfo(
          `${boundsDebug} | ` +
          `Cache: ${cachedData.catches.length} catches | ` +
          `Expired: ${cachedData.isExpired} | ` +
          `Last sync: ${cachedData.lastSync?.slice(0, 19)}`
        )
      }
    } catch (cacheError) {
      // Silent fail for cache - it's optional
    }
  }, [bounds, zoom, enabled])

  // Fetch fresh data from API with delta sync
  const fetchCatches = useCallback(async () => {
    if (!bounds || !enabled) {
      setAllCatches([])
      setCatches([])
      setClusters([])
      setStats(undefined)
      setDebugInfo(undefined)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Debug info - convert bounds format first
      const apiBoundsForDebug = convertBoundsToApiFormat(bounds)
      const boundsDebug = formatBoundsForDebug(apiBoundsForDebug)
      
      // Use delta sync if we have a last sync time - convert bounds format
      const apiBounds = convertBoundsToApiFormat(bounds)
      const syncResult = await apiService.posts.getCatchesWithDeltaSync(
        apiBounds, 
        zoom, 
        user?.id,
        lastSyncRef.current || undefined
      )
      
      let finalCatches: TypesMapCatchData[] = []
      
      // Convert API format to Types format
      finalCatches = syncResult.catches.map(convertApiCatchToTypesFormat)
      
      // Save to cache
      if (finalCatches.length > 0) {
        await mapCacheManager.saveCatchesToCache(finalCatches, bounds, zoom)
      }
      
      setDebugInfo(
        `${boundsDebug} | ` +
        `Loaded: ${finalCatches.length} catches`
      )
      
      setAllCatches(finalCatches)
      
      if (finalCatches.length === 0) {
        setCatches([])
        setClusters([])
        setStats({
          totalCatches: 0,
          clustersCount: 0,
          individualCount: 0,
          reductionRatio: 0
        })
        setCacheInfo({
          fromCache: false,
          lastSync: new Date().toISOString(),
          isExpired: false
        })
        return
      }

      // Simple clustering - convert to correct format for clustering
      const performanceTarget = getPerformanceTarget()
      const clusterableItems: ClusterableMapCatch[] = finalCatches.map(catchItem => ({
        id: catchItem.id,
        coordinates: [catchItem.longitude, catchItem.latitude] as [number, number],
        species: catchItem.species_name || 'Unknown',
        user: {
          id: catchItem.id.toString(), // Use catch id as fallback
          full_name: catchItem.username || 'Unknown User',
          avatar_url: catchItem.user_avatar
        },
        image_url: catchItem.image_url,
        created_at: catchItem.created_at,
        weight: catchItem.weight,
        length: catchItem.length
      }));
      const { individualItems, clusters: clusterData } = adaptiveCluster(
        clusterableItems, 
        zoom, 
        performanceTarget
      )

      // Convert cluster format to match existing types
      const convertedClusters: ClusterData[] = clusterData.map((cluster: UtilsClusterData<ClusterableMapCatch>) => ({
        id: cluster.id,
        coordinate: { 
          latitude: cluster.coordinate[1], 
          longitude: cluster.coordinate[0] 
        },
        count: cluster.count,
        catches: cluster.items.map(item => ({
          id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
          latitude: item.coordinates[1],
          longitude: item.coordinates[0],
          species_name: item.species,
          user_avatar: item.user.avatar_url,
          image_url: item.image_url,
          created_at: item.created_at,
          weight: item.weight,
          length: item.length,
          username: item.user.full_name
        }))
      }))

      // Convert clustered items back to TypesMapCatchData format  
      const convertedIndividualItems: TypesMapCatchData[] = individualItems.map(item => ({
        id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
        latitude: item.coordinates[1],
        longitude: item.coordinates[0],
        species_name: item.species,
        user_avatar: item.user.avatar_url,
        image_url: item.image_url,
        created_at: item.created_at,
        weight: item.weight,
        length: item.length,
        username: item.user.full_name
      }))
      setCatches(convertedIndividualItems)
      setClusters(convertedClusters)
      
      // Update cache info
      setCacheInfo({
        fromCache: false,
        lastSync: new Date().toISOString(),
        isExpired: false
      })
      
      lastSyncRef.current = new Date().toISOString()

      // Generate stats for debugging
      const clusteringStats = getClusteringStats(clusterableItems, clusterData, individualItems)
      setStats({
        totalCatches: clusteringStats.totalItems,
        clustersCount: clusteringStats.clusters,
        individualCount: clusteringStats.individualItems,
        reductionRatio: clusteringStats.reductionRatio
      })

      const finalDebugInfo = 
        `Result: ${individualItems.length} individual + ${convertedClusters.length} clusters | ` +
        `Performance: ${performanceTarget} | ` +
        `Reduction: ${clusteringStats.reductionRatio}%`
      
      setDebugInfo(finalDebugInfo)

    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Catch verileri yüklenirken hata oluştu'
      setError(errorMessage)
      // Keep cached data if available
      if (allCatches.length === 0) {
        setCatches([])
        setClusters([])
        setStats(undefined)
      }
      setDebugInfo(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [bounds, zoom, enabled, apiService, user?.id])

  // Initial load from cache
  useEffect(() => {
    if (!initialLoadRef.current && bounds && enabled) {
      initialLoadRef.current = true
      loadFromCache()
    }
  }, [loadFromCache, bounds, enabled])

  // Simple fetch with fixed debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCatches()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [fetchCatches])

  const refetch = useCallback(() => {
    // Clear last sync to force full refresh
    lastSyncRef.current = null
    fetchCatches()
  }, [fetchCatches])

  return {
    catches,
    clusters,
    loading,
    error,
    refetch,
    stats,
    debugInfo,
    cacheInfo
  }
}

export default useMapCatches