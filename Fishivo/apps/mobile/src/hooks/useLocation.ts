import React, { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Konum İzni',
            message: 'Fishivo uygulaması konumunuza erişmek istiyor.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS için izin otomatik olarak istenir
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Konum izni reddedildi');
        setIsLoading(false);
        return null;
      }

      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const locationData: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            };
            setLocation(locationData);
            setIsLoading(false);
            resolve(locationData);
          },
          (error) => {
            console.error('Konum alınamadı:', error);
            setError('Konum alınamadı');
            setIsLoading(false);
            reject(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );
      });
    } catch (error) {
      console.error('Konum hatası:', error);
      setError('Konum hatası');
      setIsLoading(false);
      return null;
    }
  };

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    requestPermission,
  };
};