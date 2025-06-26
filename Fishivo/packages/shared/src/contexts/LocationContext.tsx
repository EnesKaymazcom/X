import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationContextType {
  currentLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;
  isLocationEnabled: boolean;
  getCurrentLocation: () => Promise<LocationData | null>;
  watchLocation: () => void;
  stopWatching: () => void;
  requestPermission: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [watchSubscription, setWatchSubscription] = useState<any>(null);

  // İlk yüklemede permission kontrol et
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        setIsLocationEnabled(granted);
      } else {
        // iOS için permission check
        setIsLocationEnabled(true); // iOS'ta runtime'da kontrol edilir
      }
    } catch (err) {
      console.log('Permission check error:', err);
      setIsLocationEnabled(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      setError(null);

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Konum İzni',
            message: 'Fishivo uygulaması konum bilginize erişmek istiyor.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'İzin Ver',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError('Konum izni reddedildi - Harita özelliklerini kullanmak için konum iznine ihtiyacımız var.');
          return false;
        }
      }

      setIsLocationEnabled(true);
      return true;
    } catch (err) {
      setError(`İzin hatası: ${err}`);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      setIsLoading(true);
      setError(null);

      console.log('🌍 GPS konum alınıyor... (React Native Geolocation)');

      // Mock implementation for development
      setTimeout(() => {
        const mockLocation: LocationData = {
          latitude: 41.0082, // Istanbul coordinates
          longitude: 28.9784,
          accuracy: 10,
          timestamp: Date.now(),
        };

        console.log('📍 Mock GPS Konum bulundu:', {
          lat: mockLocation.latitude.toFixed(6),
          lng: mockLocation.longitude.toFixed(6),
          accuracy: mockLocation.accuracy ? `±${Math.round(mockLocation.accuracy)}m` : 'N/A',
          timestamp: new Date(mockLocation.timestamp).toLocaleTimeString('tr-TR'),
        });

        setCurrentLocation(mockLocation);
        setIsLoading(false);
        resolve(mockLocation);
      }, 1000);
    });
  };

  const watchLocation = async () => {
    try {
      if (!isLocationEnabled) {
        await requestPermission();
        return;
      }

      if (watchSubscription) {
        clearInterval(watchSubscription);
      }

      console.log('🔄 Konum izleme başlatıldı');

      // Mock watch implementation for development
      const watchId = setInterval(() => {
        const mockLocation: LocationData = {
          latitude: 41.0082 + (Math.random() - 0.5) * 0.001,
          longitude: 28.9784 + (Math.random() - 0.5) * 0.001,
          accuracy: 5 + Math.random() * 10,
          timestamp: Date.now(),
        };

        console.log('📍 Mock Konum güncellendi:', {
          lat: mockLocation.latitude.toFixed(6),
          lng: mockLocation.longitude.toFixed(6),
          accuracy: mockLocation.accuracy ? `±${Math.round(mockLocation.accuracy)}m` : 'N/A',
          timestamp: new Date(mockLocation.timestamp).toLocaleTimeString('tr-TR'),
        });

        setCurrentLocation(mockLocation);
      }, 5000);

      setWatchSubscription(watchId);
    } catch (err) {
      console.error('Watch location error:', err);
      setError('Konum izleme başlatılamadı');
    }
  };

  const stopWatching = () => {
    if (watchSubscription) {
      clearInterval(watchSubscription);
      setWatchSubscription(null);
      console.log('⏹️ Konum izleme durduruldu');
    }
  };

  const value: LocationContextType = {
    currentLocation,
    isLoading,
    error,
    isLocationEnabled,
    getCurrentLocation,
    watchLocation,
    stopWatching,
    requestPermission,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Utility functions - Mapbox formatına uygun
export const formatLocationString = (location: LocationData): string => {
  return `${location.latitude.toFixed(6)}°K, ${location.longitude.toFixed(6)}°D`;
};

export const getMapboxCoordinates = (location: LocationData): [number, number] => {
  return [location.longitude, location.latitude]; // Mapbox lng, lat formatı
};

export const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const dLng = ((point2.longitude - point1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.latitude * Math.PI) / 180) *
      Math.cos((point2.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};