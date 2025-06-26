import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MapComponentProps {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  style?: any;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = { lat: 41.0082, lng: 29.0100 },
  zoom = 10,
  onLocationSelect,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.placeholder}>Map Component Placeholder</Text>
      <Text style={styles.info}>Center: {center.lat}, {center.lng}</Text>
      <Text style={styles.info}>Zoom: {zoom}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholder: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    color: '#999',
  },
});

export default MapComponent;