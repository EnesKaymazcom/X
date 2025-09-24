import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { UniversalMapViewProps, MapProviderType } from '@/components/ui/maps/types';
// Direct imports to fix lazy loading error
import MapLibreProvider from './providers/MapLibreProvider';
import MapboxProvider from './providers/MapboxProvider';
const UniversalMapView = forwardRef<any, UniversalMapViewProps>(({
  provider = 'maplibre',
  fallbackProvider = 'maplibre',
  onProviderError,

  ...mapProps
}, ref) => {
  const { theme } = useTheme();
  const [currentProvider, setCurrentProvider] = useState<MapProviderType>(provider);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const styles = createStyles(theme);

  // Provider configuration
  const providerConfig = useMemo(() => {
    const config: Record<MapProviderType, {
      Component: React.ComponentType<any> | null;
      isAvailable: () => boolean;
      config: any;
    }> = {
      maplibre: {
        Component: MapLibreProvider,
        isAvailable: () => true, // MapLibre always available (no token needed)
        config: {
          // MapLibreProvider will handle the style URL based on layerSelection
        }
      },
      mapbox: {
        Component: MapboxProvider,
        isAvailable: () => true, // Mapbox available with token
        config: {
          // MapboxProvider will handle the access token and 3D terrain
        }
      },
      leaflet: {
        Component: null, // LeafletProvider, // Şimdilik devre dışı
        isAvailable: () => false,
        config: {}
      },
      osm: {
        Component: null, // OSMProvider, // Şimdilik devre dışı
        isAvailable: () => false,
        config: {}
      },
      google: {
        Component: null,
        isAvailable: () => false,
        config: {}
      }
    };
    return config;
  }, []);

  // Provider değişimi durumunda state'i reset et
  useEffect(() => {
    setCurrentProvider(provider);
    setIsLoading(true);
    setError(null);
  }, [provider]);

  // Provider yüklenme ve hata yönetimi
  useEffect(() => {
    const loadProvider = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const providerInfo = providerConfig[currentProvider];
        
        if (!providerInfo.isAvailable()) {
          throw new Error(`${currentProvider} provider is not available`);
        }

        if (!providerInfo.Component) {
          throw new Error(`${currentProvider} provider is not implemented yet`);
        }

        setIsLoading(false);
      } catch (err) {
        const error = err as Error;
        setError(error);
        
        if (onProviderError) {
          onProviderError(error, currentProvider);
        }

        // Fallback provider'a geç
        if (currentProvider !== fallbackProvider && providerConfig[fallbackProvider].isAvailable()) {
          setCurrentProvider(fallbackProvider);
        } else {
          setIsLoading(false);
        }
      }
    };

    loadProvider();
  }, [currentProvider, fallbackProvider, onProviderError, providerConfig]);

  // Debug mode logging removed - console logs yasak!

  // Error state
  if (error && !providerConfig[currentProvider].Component) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Harita yüklenemedi</Text>
        <Text style={styles.errorSubText}>{error.message}</Text>
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Harita yükleniyor...</Text>
      </View>
    );
  }

  // Provider component render
  const ProviderComponent = providerConfig[currentProvider].Component;
  
  if (!ProviderComponent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Harita provider bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProviderComponent
        key={`${currentProvider}-${mapProps.layerSelection?.baseMapId || 'default'}`}
        ref={ref}
        {...mapProps}
        {...providerConfig[currentProvider].config}
        mapStyle={mapProps.mapStyle}
        layerSelection={mapProps.layerSelection}
        enable3DTerrain={currentProvider === 'mapbox' ? (mapProps.layerSelection?.enable3DTerrain || 
          (['mapbox-3d-terrain', 'mapbox-3d-satellite'].includes(mapProps.layerSelection?.baseMapId || ''))) : false}
      >
        {mapProps.children}
      </ProviderComponent>
      
    </View>
  );
});

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error || '#ff0000',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default UniversalMapView;