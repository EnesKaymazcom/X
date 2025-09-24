import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FishivoMarker } from '@/components/ui/maps/markers/FishivoMarker';

interface MapCatchMarkerProps {
  catch: {
    id: number
    coordinates: [number, number]
    species: string
    created_at: string
  }
  onPress: () => void
  zoom?: number
}

export const MapCatchMarker: React.FC<MapCatchMarkerProps> = ({ catch: catchData, onPress, zoom = 12 }) => {
  // Çok uzakta veya çok yakında hiçbir şey gösterme
  if (zoom < 8 || zoom > 18) {
    return null;
  }
  
  // Zoom seviyesine göre display type belirle
  const shouldShowAsPin = zoom >= 17;

  if (shouldShowAsPin) {
    // Yakın zoom: Pin marker
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{ 
          zIndex: 1000,
          elevation: 2
        }}
        key={`catch-marker-${catchData.id}`}
      >
        <FishivoMarker />
      </TouchableOpacity>
    )
  } else {
    // Uzak zoom: Mavi nokta
    const fixedDotSize = 8;
    
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          zIndex: 1000,
          elevation: 2
        }}
        key={`catch-dot-${catchData.id}`}
      >
        <View
          style={{
            width: fixedDotSize,
            height: fixedDotSize,
            borderRadius: fixedDotSize / 2,
            backgroundColor: '#007AFF',
            borderWidth: 1,
            borderColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 3
          }}
        />
      </TouchableOpacity>
    )
  }
}

export default MapCatchMarker