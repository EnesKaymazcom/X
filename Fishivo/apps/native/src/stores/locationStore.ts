import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { ensurePreciseLocation } from '@/hooks/useLocation'

// Types
interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number | null
  heading?: number | null
  speed?: number | null
  timestamp: number
}

interface LocationError {
  code: number
  message: string
}

interface LocationState {
  // Current location state
  currentLocation: LocationData | null
  isLoading: boolean
  error: LocationError | null
  hasPermission: boolean | null
  
  // Fallback strategies
  ipLocation: LocationData | null
  lastKnownLocation: LocationData | null
  
  // Watch state
  watchId: number | null
  subscribers: Set<(location: LocationData | null) => void>
  
  // Config
  enableHighAccuracy: boolean
  timeout: number
  maximumAge: number
  distanceFilter: number
  
  // Actions
  setCurrentLocation: (location: LocationData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: LocationError | null) => void
  setPermission: (hasPermission: boolean) => void
  setIPLocation: (location: LocationData | null) => void
  
  // Methods
  requestPermission: () => Promise<boolean>
  getCurrentLocation: () => Promise<LocationData | null>
  startWatching: () => Promise<number | null>
  stopWatching: () => void
  subscribe: (callback: (location: LocationData | null) => void) => () => void
  
  // Fallback methods
  getIPLocation: () => Promise<LocationData | null>
  getLastKnownLocation: () => LocationData | null
  
  // Smart location with cascading fallback
  getSmartLocation: () => Promise<LocationData | null>
}

// Persistent state interface
interface PersistentLocationState {
  lastKnownLocation: LocationData | null
  ipLocation: LocationData | null
  hasPermission: boolean | null
  enableHighAccuracy: boolean
  timeout: number
  maximumAge: number
  distanceFilter: number
}

// Create the store with persistence
export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLocation: null,
      isLoading: false,
      error: null,
      hasPermission: null,
      ipLocation: null,
      lastKnownLocation: null,
      watchId: null,
      subscribers: new Set(),
      
      // Default config
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 300000, // 5 minutes
      distanceFilter: 10,
      
      // Actions
      setCurrentLocation: (location) => {
        set({ currentLocation: location })
        if (location) {
          // Save as last known location
          set({ lastKnownLocation: location })
          // Notify subscribers
          const { subscribers } = get()
          subscribers.forEach(callback => callback(location))
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setPermission: (hasPermission) => set({ hasPermission }),
      setIPLocation: (location) => set({ ipLocation: location }),
      
      // Request location permission
      requestPermission: async () => {
        try {
          const permission = Platform.OS === 'ios' 
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          
          const result = await request(permission)
          const isGranted = result === RESULTS.GRANTED
          
          get().setPermission(isGranted)
          return isGranted
        } catch (error) {
          get().setError({
            code: 1,
            message: 'Permission request failed'
          })
          return false
        }
      },
      
      // Get current location with GPS
      getCurrentLocation: async () => {
        const state = get()
        
        state.setLoading(true)
        state.setError(null)
        
        // Check permission first
        let hasPermission = state.hasPermission
        if (hasPermission === null) {
          hasPermission = await state.requestPermission()
        }
        
        if (!hasPermission) {
          state.setLoading(false)
          state.setError({
            code: 1,
            message: 'Location permission denied'
          })
          return null
        }
        
        // Ensure precise location on iOS
        if (Platform.OS === 'ios') {
          await ensurePreciseLocation()
        }
        
        return new Promise<LocationData | null>((resolve) => {
          Geolocation.getCurrentPosition(
            (position) => {
              const location: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                heading: position.coords.heading,
                speed: position.coords.speed,
                timestamp: Date.now(),
              }
              
              state.setCurrentLocation(location)
              state.setLoading(false)
              resolve(location)
            },
            (error) => {
              let errorMessage = 'Location unavailable'
              switch (error.code) {
                case 1:
                  errorMessage = 'Permission denied'
                  break
                case 2:
                  errorMessage = 'Position unavailable'
                  break
                case 3:
                  errorMessage = 'Timeout'
                  break
                case 4:
                  errorMessage = 'Google Play services unavailable'
                  break
                case 5:
                  errorMessage = 'Location services disabled'
                  break
              }
              
              state.setError({
                code: error.code,
                message: errorMessage
              })
              state.setLoading(false)
              resolve(null)
            },
            {
              enableHighAccuracy: state.enableHighAccuracy,
              timeout: state.timeout,
              maximumAge: state.maximumAge,
            }
          )
        })
      },
      
      // Start watching position changes
      startWatching: async () => {
        const state = get()
        
        // Stop existing watch
        if (state.watchId !== null) {
          state.stopWatching()
        }
        
        // Check permission
        let hasPermission = state.hasPermission
        if (hasPermission === null) {
          hasPermission = await state.requestPermission()
        }
        
        if (!hasPermission) {
          return null
        }
        
        const watchId = Geolocation.watchPosition(
          (position) => {
            const location: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              heading: position.coords.heading,
              speed: position.coords.speed,
              timestamp: Date.now(),
            }
            
            state.setCurrentLocation(location)
          },
          (error) => {
            state.setError({
              code: error.code,
              message: `Watch position error: ${error.message}`
            })
          },
          {
            enableHighAccuracy: state.enableHighAccuracy,
            distanceFilter: state.distanceFilter,
            interval: 5000,
            fastestInterval: 2000,
          }
        )
        
        set({ watchId })
        return watchId
      },
      
      // Stop watching position changes
      stopWatching: () => {
        const { watchId } = get()
        if (watchId !== null) {
          Geolocation.clearWatch(watchId)
          set({ watchId: null })
        }
      },
      
      // Subscribe to location updates
      subscribe: (callback) => {
        const { subscribers } = get()
        subscribers.add(callback)
        
        // DON'T call immediately to prevent infinite loops
        // Components should handle initial state themselves
        
        // Return unsubscribe function
        return () => {
          subscribers.delete(callback)
        }
      },
      
      // Get IP-based location (fallback)
      getIPLocation: async () => {
        try {
          // Simple IP geolocation - can be enhanced with services like IPStack
          const response = await fetch('http://ip-api.com/json/')
          const data = await response.json()
          
          if (data.status === 'success') {
            const ipLocation: LocationData = {
              latitude: data.lat,
              longitude: data.lon,
              accuracy: 10000, // City-level accuracy
              timestamp: Date.now(),
            }
            
            get().setIPLocation(ipLocation)
            return ipLocation
          }
          
          return null
        } catch (error) {
          return null
        }
      },
      
      // Get last known location from cache
      getLastKnownLocation: () => {
        return get().lastKnownLocation
      },
      
      // Smart location with cascading fallback
      getSmartLocation: async () => {
        const state = get()
        let locationToUse: LocationData | null = null
        
        try {
          // 1. Try GPS first
          const gpsLocation = await state.getCurrentLocation()
          if (gpsLocation) {
            locationToUse = gpsLocation
          }
        } catch (error) {
          // GPS failed, continue to fallbacks
        }
        
        if (!locationToUse) {
          try {
            // 2. Try IP geolocation
            const ipLocation = await state.getIPLocation()
            if (ipLocation) {
              locationToUse = ipLocation
            }
          } catch (error) {
            // IP geolocation failed
          }
        }
        
        if (!locationToUse) {
          // 3. Use last known location
          const lastKnown = state.getLastKnownLocation()
          if (lastKnown) {
            locationToUse = lastKnown
          }
        }
        
        
        // IMPORTANT: Set the location to state so UI can react
        state.setCurrentLocation(locationToUse)
        
        return locationToUse
      },
    }),
    {
      name: 'location-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): PersistentLocationState => ({
        lastKnownLocation: state.lastKnownLocation,
        ipLocation: state.ipLocation,
        hasPermission: state.hasPermission,
        enableHighAccuracy: state.enableHighAccuracy,
        timeout: state.timeout,
        maximumAge: state.maximumAge,
        distanceFilter: state.distanceFilter,
      }),
    }
  )
)

// Convenience hooks
export const useCurrentLocation = () => {
  const currentLocation = useLocationStore(state => state.currentLocation)
  const isLoading = useLocationStore(state => state.isLoading)
  const error = useLocationStore(state => state.error)
  
  return { currentLocation, isLoading, error }
}

export const useLocationPermission = () => {
  const hasPermission = useLocationStore(state => state.hasPermission)
  const requestPermission = useLocationStore(state => state.requestPermission)
  
  return { hasPermission, requestPermission }
}

// Location utilities
export const formatLocationString = (location: LocationData | null): string => {
  if (!location) return 'Location unavailable'
  
  const { latitude, longitude } = location
  const latDirection = latitude >= 0 ? 'N' : 'S'
  const lngDirection = longitude >= 0 ? 'E' : 'W'
  
  return `${Math.abs(latitude).toFixed(6)}°${latDirection}, ${Math.abs(longitude).toFixed(6)}°${lngDirection}`
}

export const getCoordinates = (location: LocationData | null): [number, number] | null => {
  if (!location) return null
  return [location.longitude, location.latitude]
}

export const getCameraConfig = (location: LocationData | null) => {
  if (location) {
    return {
      centerCoordinate: [location.longitude, location.latitude] as [number, number],
      zoomLevel: 14,
      pitch: 0,
      animationDuration: 1000,
      animationMode: 'flyTo' as const
    }
  }
  return {
    centerCoordinate: undefined,
    zoomLevel: 2,
    pitch: 0,
    animationDuration: 0,
    animationMode: 'moveTo' as const
  }
}