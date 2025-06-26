import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, ScreenContainer } from '@fishivo/ui';
import { theme } from '@fishivo/shared';

const { width, height } = Dimensions.get('window');

interface MapScreenProps {
  navigation: any;
}

interface FishingSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'lake' | 'river' | 'sea';
  fishTypes: string[];
  rating: number;
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const [fishingSpots, setFishingSpots] = useState<FishingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for fishing spots
  const mockFishingSpots: FishingSpot[] = [
    {
      id: '1',
      name: 'Sapanca Gölü',
      latitude: 40.6917,
      longitude: 30.2683,
      type: 'lake',
      fishTypes: ['Sazan', 'Turna', 'Sudak'],
      rating: 4.5,
    },
    {
      id: '2',
      name: 'Bosphorus Köprüsü Altı',
      latitude: 41.0391,
      longitude: 29.0350,
      type: 'sea',
      fishTypes: ['Lüfer', 'Palamut', 'İstavrit'],
      rating: 4.2,
    },
    {
      id: '3',
      name: 'Sakarya Nehri',
      latitude: 40.7569,
      longitude: 30.3781,
      type: 'river',
      fishTypes: ['Alabalık', 'Sazan', 'Turna'],
      rating: 4.0,
    },
  ];

  useEffect(() => {
    // Simulate loading fishing spots
    setTimeout(() => {
      setFishingSpots(mockFishingSpots);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSpotPress = (spot: FishingSpot) => {
    setSelectedSpot(spot);
  };

  const handleAddSpot = () => {
    Alert.alert(
      'Yeni Nokta Ekle',
      'Bu özellik yakında eklenecek!',
      [{ text: 'Tamam' }]
    );
  };

  const renderSpotCard = (spot: FishingSpot) => (
    <TouchableOpacity
      key={spot.id}
      style={styles.spotCard}
      onPress={() => handleSpotPress(spot)}
    >
      <View style={styles.spotHeader}>
        <Text style={styles.spotName}>{spot.name}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color={theme.colors.warning} />
          <Text style={styles.rating}>{spot.rating}</Text>
        </View>
      </View>
      <Text style={styles.spotType}>
        {spot.type === 'lake' ? '🏞️ Göl' : spot.type === 'river' ? '🏞️ Nehir' : '🌊 Deniz'}
      </Text>
      <View style={styles.fishTypesContainer}>
        {spot.fishTypes.slice(0, 3).map((fish, index) => (
          <View key={index} style={styles.fishTag}>
            <Text style={styles.fishTagText}>{fish}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenContainer>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Harita yükleniyor...</Text>
            </View>
          </ScreenContainer>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Balıkçılık Noktaları</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddSpot}>
              <Icon name="plus" size={20} color={theme.colors.surface} />
            </TouchableOpacity>
          </View>

          {/* Map Placeholder */}
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Icon name="map" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.mapPlaceholderText}>
                Harita entegrasyonu yakında eklenecek
              </Text>
            </View>
          </View>

          {/* Fishing Spots List */}
          <View style={styles.spotsContainer}>
            <Text style={styles.sectionTitle}>Yakındaki Noktalar</Text>
            <View style={styles.spotsList}>
              {fishingSpots.map(renderSpotCard)}
            </View>
          </View>

          {/* Selected Spot Details */}
          {selectedSpot && (
            <View style={styles.selectedSpotContainer}>
              <View style={styles.selectedSpotHeader}>
                <Text style={styles.selectedSpotTitle}>{selectedSpot.name}</Text>
                <TouchableOpacity onPress={() => setSelectedSpot(null)}>
                  <Icon name="x" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.selectedSpotType}>
                {selectedSpot.type === 'lake' ? '🏞️ Göl' : 
                 selectedSpot.type === 'river' ? '🏞️ Nehir' : '🌊 Deniz'}
              </Text>
              <View style={styles.selectedSpotFish}>
                <Text style={styles.fishLabel}>Balık Türleri:</Text>
                <Text style={styles.fishList}>{selectedSpot.fishTypes.join(', ')}</Text>
              </View>
              <TouchableOpacity style={styles.navigateButton}>
                <Icon name="navigation" size={16} color={theme.colors.surface} />
                <Text style={styles.navigateButtonText}>Yol Tarifi Al</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScreenContainer>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography['2xl'],
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: height * 0.4,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  mapPlaceholderText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  spotsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  spotsList: {
    gap: theme.spacing.md,
  },
  spotCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  spotName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  rating: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  spotType: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  fishTypesContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  fishTag: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  fishTagText: {
    fontSize: theme.typography.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
  },
  selectedSpotContainer: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  selectedSpotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  selectedSpotTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    flex: 1,
  },
  selectedSpotType: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  selectedSpotFish: {
    marginBottom: theme.spacing.md,
  },
  fishLabel: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  fishList: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  navigateButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
  },
});

export default MapScreen;