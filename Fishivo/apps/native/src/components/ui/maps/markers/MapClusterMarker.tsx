import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MapClusterMarkerProps {
  coordinate: [number, number]
  count: number
  onPress: () => void
}

export const MapClusterMarker: React.FC<MapClusterMarkerProps> = ({ 
  count, 
  onPress 
}) => {
  const { theme } = useTheme()
  const styles = createStyles(theme, count)

  // Cluster boyutu count'a göre
  const getClusterSize = (count: number): number => {
    if (count <= 5) return 32
    if (count <= 15) return 40
    if (count <= 30) return 48
    return 56
  }

  const size = getClusterSize(count)

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Outer Ring */}
      <View style={[styles.outerRing, { width: size, height: size }]} />
      
      {/* Inner Circle */}
      <View style={[styles.innerCircle, { 
        width: size - 8, 
        height: size - 8,
        borderRadius: (size - 8) / 2
      }]}>
        <Text style={styles.countText}>
          {count >= 100 ? '99+' : count}
        </Text>
      </View>

      {/* Shadow */}
      <View style={[styles.shadow, { width: size * 0.7 }]} />
    </TouchableOpacity>
  )
}

const createStyles = (theme: any, _count: number) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  outerRing: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.3)', // Semi-transparent red
    borderWidth: 2,
    borderColor: '#EF4444'
  },
  innerCircle: {
    backgroundColor: '#EF4444', // Solid red
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  countText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: _count >= 100 ? 12 : _count >= 10 ? 14 : 16
  },
  shadow: {
    position: 'absolute',
    bottom: -4,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20
  }
})

export default MapClusterMarker