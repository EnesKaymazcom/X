import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, LocationCard, AppHeader, TabSelector, ScreenContainer, FishivoModal, SearchBar } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
// import { apiService } from '@fishivo/api';

interface LocationManagementScreenProps {
  navigation: any;
}

interface Location {
  id: string;
  name: string;
  type: 'manual' | 'spot' | 'private-spot';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  isFavorite: boolean;
  isPrivate?: boolean;
  lastUsed?: Date;
  createdAt: Date;
  catchCount?: number;
}

const LocationManagementScreen: React.FC<LocationManagementScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'spots' | 'private' | 'manual'>('all');
  const [locations, setLocations] = useState<Location[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // API'den spotları çek
  useEffect(() => {
    loadSpots();
  }, []);

  const loadSpots = async () => {
    try {
      setLoading(true);
      // const spotsResponse = await apiService.getSpots(1, 50);
      const spotsResponse = { items: [] };
      
      // API response'u Location formatına çevir
      const apiLocations: Location[] = spotsResponse.items.map(spot => ({
        id: spot.id.toString(),
        name: spot.name,
        type: 'spot' as const,
        coordinates: {
          latitude: spot.location?.latitude || 0,
          longitude: spot.location?.longitude || 0,
        },
        address: spot.location?.address || spot.name,
        isFavorite: false, // TODO: API'den gelecek
        isPrivate: false,
        lastUsed: new Date(),
        createdAt: new Date(spot.created_at),
        catchCount: 0 // TODO: API'den gelecek
      }));

      setLocations(apiLocations);
    } catch (error) {
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: t('locations.management.all'), icon: 'map', count: locations.length },
    { id: 'favorites', label: t('locations.management.favorites'), icon: 'heart', count: locations.filter(l => l.isFavorite).length },
    { id: 'spots', label: t('locations.management.spots'), icon: 'compass', count: locations.filter(l => l.type === 'spot').length },
    { id: 'private', label: t('locations.management.private'), icon: 'lock', count: locations.filter(l => l.type === 'private-spot').length },
    { id: 'manual', label: t('locations.management.manual'), icon: 'map-pin', count: locations.filter(l => l.type === 'manual').length },
  ];

  const getFilteredLocations = () => {
    let filtered = locations;

    // Tab filtresi
    switch (activeTab) {
      case 'favorites':
        filtered = filtered.filter(l => l.isFavorite);
        break;
      case 'spots':
        filtered = filtered.filter(l => l.type === 'spot');
        break;
      case 'private':
        filtered = filtered.filter(l => l.type === 'private-spot');
        break;
      case 'manual':
        filtered = filtered.filter(l => l.type === 'manual');
        break;
    }

    // Arama filtresi
    if (searchText) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchText.toLowerCase()) ||
        location.address.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Son kullanıma göre sırala
    return filtered.sort((a, b) => {
      if (!a.lastUsed && !b.lastUsed) return 0;
      if (!a.lastUsed) return 1;
      if (!b.lastUsed) return -1;
      return b.lastUsed.getTime() - a.lastUsed.getTime();
    });
  };

  const filteredLocations = getFilteredLocations();

  const toggleFavorite = (locationId: string) => {
    setLocations(prev => 
      prev.map(location => 
        location.id === locationId 
          ? { ...location, isFavorite: !location.isFavorite }
          : location
      )
    );
  };

  const deleteLocation = (locationId: string) => {
    setLocationToDelete(locationId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteLocation = () => {
    if (locationToDelete) {
      setLocations(prev => prev.filter(location => location.id !== locationToDelete));
      setLocationToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const selectLocation = (location: Location) => {
    // Güncelle lastUsed
    setLocations(prev => 
      prev.map(loc => 
        loc.id === location.id 
          ? { ...loc, lastUsed: new Date() }
          : loc
      )
    );
    
    // MainTabs'e git ve Map tab'ını aç
    navigation.navigate('MainTabs', { 
      screen: 'Map',
      params: {
        selectedLocation: {
          id: location.id,
          name: location.name,
          coordinates: location.coordinates,
          address: location.address,
          type: location.type
        }
      }
    });
  };

  const getLocationStats = () => {
    const totalCatches = locations.reduce((sum, loc) => sum + (loc.catchCount || 0), 0);
    const mostUsedSpot = locations
      .filter(l => l.catchCount && l.catchCount > 0)
      .sort((a, b) => (b.catchCount || 0) - (a.catchCount || 0))[0];
    
    return {
      totalLocations: locations.length,
      totalCatches,
      mostUsedSpot: mostUsedSpot?.name || t('locations.management.notYet')
    };
  };

  const stats = getLocationStats();

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('locations.management.title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
          }
        ]}
        rightButtons={[
          {
            icon: 'plus',
            onPress: () => navigation.navigate('AddSpot')
          }
        ]}
        searchBar={{
          value: searchText,
          onChangeText: setSearchText,
          placeholder: t('locations.management.searchPlaceholder')
        }}
      />


      <ScreenContainer paddingVertical="none">

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalLocations}</Text>
            <Text style={styles.statLabel}>{t('locations.management.totalLocations')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalCatches}</Text>
            <Text style={styles.statLabel}>{t('locations.management.totalCatches')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber} numberOfLines={1}>{stats.mostUsedSpot}</Text>
            <Text style={styles.statLabel}>{t('locations.management.mostUsed')}</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <TabSelector
          tabs={tabs}
          activeTab={activeTab}
          onTabPress={(tabId) => setActiveTab(tabId as any)}
        />

        {/* Locations List */}
        <ScrollView style={styles.content} contentContainerStyle={[styles.scrollContent, theme.listContentStyle]} showsVerticalScrollIndicator={false}>
          {filteredLocations.length > 0 ? (
            <View style={styles.locationsList}>
              {filteredLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  variant="list"
                  onPress={selectLocation}
                  onToggleFavorite={toggleFavorite}
                  onDelete={deleteLocation}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchText ? t('locations.management.locationNotFound') : t('locations.management.noCategoryLocation')}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchText 
                  ? t('locations.management.tryDifferentKeywords')
                  : t('locations.management.addNewLocationHelp')
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenContainer>

      <FishivoModal
        visible={showDeleteConfirm}
        title={t('locations.management.deleteLocation')}
        onClose={() => {
          setShowDeleteConfirm(false);
          setLocationToDelete(null);
        }}
        preset="delete"
        description={t('locations.management.deleteLocationConfirm')}
        primaryButton={{
          text: t('locations.management.confirmDelete'),
          onPress: confirmDeleteLocation
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => {
            setShowDeleteConfirm(false);
            setLocationToDelete(null);
          }
        }}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  scrollContent: {
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    paddingVertical: theme.spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  locationsList: {
    gap: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
    gap: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LocationManagementScreen; 