import { useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { checkLocationAccuracy, requestLocationAccuracy } from 'react-native-permissions';
import i18n from '@/lib/i18n/i18n';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
}

type LocationAccuracyStatus = 'full' | 'reduced' | 'unavailable' | 'unknown';

export const ensurePreciseLocationIOS = async (purposeKey: string = 'mapPrecision'): Promise<LocationAccuracyStatus> => {
  if (Platform.OS !== 'ios') return 'full';
  try {
    const current = await checkLocationAccuracy();
    if (current === 'full') return 'full';
    const requested = await requestLocationAccuracy({ purposeKey });
    return (requested as LocationAccuracyStatus) || 'unknown';
  } catch {
    return 'unknown';
  }
};

// Android 12+ approximate vs precise kontrolü
export const ensurePreciseLocationAndroid = async (): Promise<LocationAccuracyStatus> => {
  if (Platform.OS !== 'android') return 'full';
  try {
    const hasFine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (hasFine) return 'full';

    // Android 12+ tekrar FINE talep etmeyi dene
    const version = Number(Platform.Version) || 0;
    if (version >= 31) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: i18n.t('permissions.location.preciseTitle'),
          message: i18n.t('permissions.location.preciseMessage'),
          buttonNeutral: i18n.t('permissions.location.askLater'),
          buttonNegative: i18n.t('permissions.location.cancel'),
          buttonPositive: i18n.t('permissions.location.allow'),
        }
      );
      if (result === PermissionsAndroid.RESULTS.GRANTED) return 'full';
    }

    const hasCoarse = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
    return hasCoarse ? 'reduced' : 'unavailable';
  } catch {
    return 'unknown';
  }
};

// Platform-agnostic helper
export const ensurePreciseLocation = async (): Promise<LocationAccuracyStatus> => {
  if (Platform.OS === 'ios') return ensurePreciseLocationIOS('mapPrecision');
  if (Platform.OS === 'android') return ensurePreciseLocationAndroid();
  return 'unknown';
};

export const useLocation = (options: UseLocationOptions = {}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const {
    enableHighAccuracy = true,
    timeout = 20000,
    maximumAge = 0,
    distanceFilter = 10,
  } = options;

  // Request location permission
  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      const isAuthorized = auth === 'granted' || auth === 'restricted';
      setHasPermission(isAuthorized);
      return isAuthorized;
    }

    if (Platform.OS === 'android') {
      try {
        // Android 12+ (API 31+) için coarse + fine tek istekte
        if (Platform.Version && Number(Platform.Version) >= 31) {
          const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ]);
          const isGranted =
            results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
            results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
          setHasPermission(isGranted);
          return isGranted;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: i18n.t('permissions.location.title'),
            message: i18n.t('permissions.location.message'),
            buttonNeutral: i18n.t('permissions.location.askLater'),
            buttonNegative: i18n.t('permissions.location.cancel'),
            buttonPositive: i18n.t('permissions.location.allow'),
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasPermission(isGranted);
        return isGranted;
      } catch {
        setError('Konum izni alınamadı');
        setHasPermission(false);
        return false;
      }
    }

    return false;
  };

  // Get current location
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);

    // Check permission first
    let permission = hasPermission;
    if (permission === null) {
      permission = await requestPermission();
    }

    if (!permission) {
      // Permission denied
      setLoading(false);
      setError('Konum izni verilmedi');
      return null;
    }

    // iOS: Yaklaşık konum yerine geçici tam doğruluk iste
    if (Platform.OS === 'ios') {
      await ensurePreciseLocationIOS('mapPrecision');
    }

    // Android: mümkünse FINE talep ederek doğruluğu artır
    if (Platform.OS === 'android') {
      await ensurePreciseLocationAndroid();
    }

    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
          };
          setLocation(locationData);
          setLoading(false);
          setError(null);
          resolve(locationData);
        },
        (err) => {
          let errorMessage = 'Konum alınamadı';
          switch (err.code) {
            case 1:
              errorMessage = 'Konum izni reddedildi';
              break;
            case 2:
              errorMessage = 'Konum servisi kullanılamıyor';
              break;
            case 3:
              errorMessage = 'Konum isteği zaman aşımına uğradı';
              break;
            case 4:
              errorMessage = 'Google Play servisleri kullanılamıyor';
              break;
            case 5:
              errorMessage = 'Konum servisi kapalı';
              break;
          }
          setError(errorMessage);
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
          distanceFilter,
        }
      );
    });
  };

  // Watch position changes
  const watchPosition = (callback: (location: LocationData) => void) => {
    if (!hasPermission) {
      return null;
    }

    const watchId = Geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
        };
        setLocation(locationData);
        callback(locationData);
      },
      (err) => {
        setError(`Konum takibi hatası: ${err.message}`);
      },
      {
        enableHighAccuracy,
        distanceFilter,
        interval: 5000,
        fastestInterval: 2000,
      }
    );

    return watchId;
  };

  // Clear watch
  const clearWatch = (watchId: number) => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
    }
  };

  // Check if location services are enabled
  const checkLocationServices = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          () => resolve(true),
          (err) => {
            if (err.code === 5) {
              resolve(false);
            } else {
              resolve(true);
            }
          },
          { enableHighAccuracy: false, timeout: 1000 }
        );
      });
    }
    return true;
  };

  return {
    location,
    loading,
    error,
    hasPermission,
    requestPermission,
    getCurrentLocation,
    watchPosition,
    clearWatch,
    checkLocationServices,
  };
};

// Format location to display string
export const formatLocationString = (location: LocationData | { latitude: number; longitude: number }): string => {
  const lat = location.latitude;
  const lng = location.longitude;
  
  const latDirection = lat >= 0 ? 'K' : 'G';
  const lngDirection = lng >= 0 ? 'D' : 'B';
  
  const absLat = Math.abs(lat);
  const absLng = Math.abs(lng);
  
  return `${absLat.toFixed(6)}°${latDirection}, ${absLng.toFixed(6)}°${lngDirection}`;
};

// Convert to coordinates format [longitude, latitude]
export const getCoordinates = (location: { latitude: number; longitude: number } | LocationData): [number, number] => {
  if ('latitude' in location) {
    return [location.longitude, location.latitude];
  }
  // Backward compatibility - should not reach here with new code
  return [0, 0];
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // km
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default useLocation;