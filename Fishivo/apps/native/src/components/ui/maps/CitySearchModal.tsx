import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FishivoModal } from '@/components/ui/FishivoModal';
import { CloseButton } from '@/components/ui/CloseButton';
import { SearchBox, Icon } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { getNativeGeocodingService } from '@fishivo/api';

// Define ForwardGeocodingResult type locally
interface ForwardGeocodingResult {
  coordinates: [number, number];
  formattedAddress: string;
  city?: string;
  country?: string;
  state?: string;
}

interface CitySearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: { latitude: number; longitude: number; name: string }) => void;
}

const RECENT_SEARCHES_KEY = '@fishivo/recent_city_searches';
const MAX_RECENT_SEARCHES = 5;

const CitySearchModal: React.FC<CitySearchModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
}) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const styles = createStyles(theme);

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<ForwardGeocodingResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<ForwardGeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load recent searches
  useEffect(() => {
    if (visible) {
      loadRecentSearches();
    }
  }, [visible]);

  const loadRecentSearches = async () => {
    try {
      const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (data) {
        const searches = JSON.parse(data);
        setRecentSearches(searches);
      }
    } catch (err) {
      // Ignore errors
    }
  };

  const saveRecentSearch = async (location: ForwardGeocodingResult) => {
    try {
      const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      let searches: ForwardGeocodingResult[] = data ? JSON.parse(data) : [];
      
      // Remove if already exists
      searches = searches.filter(s => 
        s.coordinates[0] !== location.coordinates[0] || 
        s.coordinates[1] !== location.coordinates[1]
      );
      
      // Add to beginning
      searches.unshift(location);
      
      // Keep only MAX_RECENT_SEARCHES
      searches = searches.slice(0, MAX_RECENT_SEARCHES);
      
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (err) {
      // Ignore errors
    }
  };

  const searchCities = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const geocodingService = getNativeGeocodingService();
      const results = await geocodingService.forwardGeocode!(query, {
        language: locale,
        timeout: 2000, // Faster timeout
      });

      setSearchResults(results);
    } catch (err) {
      setError(t('map.citySearch.searchError'));
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [locale, t]);

  // Simple search - no debounce
  useEffect(() => {
    if (searchText.trim().length >= 2) {
      searchCities(searchText);
    } else {
      setSearchResults([]);
      setError(null);
    }
  }, [searchText, searchCities]);

  const handleSelectLocation = async (location: ForwardGeocodingResult) => {
    await saveRecentSearch(location);
    onSelectLocation({
      latitude: location.coordinates[1],
      longitude: location.coordinates[0],
      name: location.formattedAddress,
    });
    onClose();
    setSearchText('');
    setSearchResults([]);
  };

  const renderLocationItem = ({ item }: { item: ForwardGeocodingResult }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleSelectLocation(item)}
      activeOpacity={0.7}
    >
      <View style={styles.locationIcon}>
        <Icon name="map-pin" size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName} numberOfLines={1}>
          {item.city || item.formattedAddress.split(',')[0]}
        </Text>
        <Text style={styles.locationAddress} numberOfLines={1}>
          {item.formattedAddress}
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t('map.citySearch.searching')}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="alert-circle" size={32} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (searchText.trim().length > 0 && searchText.trim().length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="info" size={32} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>{t('map.citySearch.minChars')}</Text>
        </View>
      );
    }

    if (searchText.trim().length >= 2 && searchResults.length === 0 && !isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="search" size={32} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>{t('map.citySearch.noResults')}</Text>
        </View>
      );
    }

    return null;
  };

  const dataToShow = searchText.trim().length >= 2 ? searchResults : recentSearches;

  return (
    <FishivoModal
      visible={visible}
      onClose={onClose}
      showDragIndicator={true}
      showCloseButton={false}
    >
      <View style={{ height: Dimensions.get('window').height * 0.7 }}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('map.citySearch.title')}</Text>
          <CloseButton onPress={onClose} />
        </View>
        
        <SearchBox
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t('map.citySearch.placeholder')}
          autoFocus={true}
        />

        {searchText.trim().length === 0 && recentSearches.length > 0 && (
          <Text style={styles.sectionTitle}>{t('map.citySearch.recentSearches')}</Text>
        )}

        <FlatList
          data={dataToShow}
          renderItem={renderLocationItem}
          keyExtractor={(item, index) => `${item.coordinates[0]}-${item.coordinates[1]}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    </FishivoModal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  listContent: {
    paddingBottom: theme.spacing.md,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 3,
  },
  emptyText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.typography.base,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});

export default CitySearchModal;