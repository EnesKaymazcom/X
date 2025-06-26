// useLocation.ts - Location management hook
// Adapted for TurboRepo structure

import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/LocationService';
import { calculateDistance } from '../utils';

// TODO: Import from types when available
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface LocationState {
  currentLocation: LocationData | null;
  isLoading: boolean;
  isWatching: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'not-determined' | 'restricted';
}

export const useLocation = () => {
  const [locationState, setLocationState] = useState<LocationState>({
    currentLocation: null,
    isLoading: false,
    isWatching: false,
    error: null,
    permissionStatus: 'not-determined'
  });

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      // Mock permission check for development
      setLocationState(prev => ({
        ...prev,
        permissionStatus: 'granted'
      }));
    } catch (error) {
      console.error('Permission check failed:', error);
      setLocationState(prev => ({
        ...prev,
        permissionStatus: 'denied'
      }));
    }
  };

  const requestPermission = useCallback(async () => {
    try {
      setLocationState(prev => ({ ...prev, error: null }));
      
      const granted = true; // Mock permission grant for development
      
      setLocationState(prev => ({
        ...prev,
        permissionStatus: granted ? 'granted' : 'denied'
      }));
      
      return granted;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Permission request failed';
      setLocationState(prev => ({
        ...prev,
        permissionStatus: 'denied',
        error: errorMessage
      }));
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      setLocationState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check permission first
      if (locationState.permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Location permission denied');
        }
      }
      
      const location = await locationService.getCurrentLocation();
      
      setLocationState(prev => ({
        ...prev,
        currentLocation: location,
        isLoading: false,
        error: null
      }));
      
      return location;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get current location';
      setLocationState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [locationState.permissionStatus, requestPermission]);

  const startWatching = useCallback(async () => {
    try {
      setLocationState(prev => ({ ...prev, error: null }));
      
      // Check permission first
      if (locationState.permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Location permission denied');
        }
      }
      
      locationService.startWatching((location) => {
        setLocationState(prev => ({
          ...prev,
          currentLocation: location,
          error: null
        }));
      });
      
      setLocationState(prev => ({
        ...prev,
        isWatching: true
      }));
      
      // Watch started successfully
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start watching location';
      setLocationState(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, [locationState.permissionStatus, requestPermission]);

  const stopWatching = useCallback(() => {
    try {
      locationService.stopWatching();
      setLocationState(prev => ({
        ...prev,
        isWatching: false
      }));
    } catch (error) {
      console.error('Failed to stop watching location:', error);
    }
  }, []);

  const calculateDistanceCallback = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    return calculateDistance(lat1, lon1, lat2, lon2);
  }, []);

  const formatLocationString = useCallback((location: LocationData): string => {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }, []);

  const getMapboxCoordinates = useCallback((location: LocationData): string => {
    return `${location.longitude},${location.latitude}`;
  }, []);

  const clearError = useCallback(() => {
    setLocationState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationState.isWatching) {
        stopWatching();
      }
    };
  }, [locationState.isWatching, stopWatching]);

  return {
    // State
    currentLocation: locationState.currentLocation,
    isLoading: locationState.isLoading,
    isWatching: locationState.isWatching,
    error: locationState.error,
    permissionStatus: locationState.permissionStatus,
    
    // Actions
    requestPermission,
    getCurrentLocation,
    startWatching,
    stopWatching,
    clearError,
    
    // Utilities
    calculateDistance: calculateDistanceCallback,
    formatLocationString,
    getMapboxCoordinates
  };
};

export default useLocation;