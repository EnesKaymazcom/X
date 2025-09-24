import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@/components/ui/Icon';
import { FishivoModal } from '@/components/ui/FishivoModal';
import { CloseButton } from '@/components/ui/CloseButton';
import { SearchBox, CategorySelector } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api/services/native';
import type { FishSpecies } from '@fishivo/types';
import { getProxiedImageUrl } from '@fishivo/utils';

interface FishSpeciesSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (species: string, waterType: 'freshwater' | 'saltwater', speciesId?: string) => void;
  selectedSpecies?: string;
  selectedSpeciesId?: string;
}

const CACHE_KEY = '@fishivo/fish_species_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const FishSpeciesSelectorModal: React.FC<FishSpeciesSelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedSpecies,
  selectedSpeciesId,
}) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const styles = createStyles(theme);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [filteredSpecies, setFilteredSpecies] = useState<FishSpecies[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'freshwater' | 'saltwater' | null>('all');
  const [fishSpecies, setFishSpecies] = useState<{
    saltwater: FishSpecies[];
    freshwater: FishSpecies[];
  }>({
    saltwater: [],
    freshwater: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;
  const [_lastCacheUpdate, setLastCacheUpdate] = useState<number | null>(null);

  const categories = useMemo(() => [
    { id: 'all', title: t('common.fishCategories.all') },
    { id: 'saltwater', title: t('common.fishCategories.saltwater') },
    { id: 'freshwater', title: t('common.fishCategories.freshwater') },
  ], [t]);



  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    let currentSpecies: FishSpecies[] = [];
    
    if (selectedCategory === 'all') {
      currentSpecies = [...fishSpecies.saltwater, ...fishSpecies.freshwater];
    } else if (selectedCategory === 'saltwater') {
      currentSpecies = fishSpecies.saltwater;
    } else if (selectedCategory === 'freshwater') {
      currentSpecies = fishSpecies.freshwater;
    } else {
      currentSpecies = [];
    }

    if (debouncedSearchText.trim() === '') {
      setFilteredSpecies(currentSpecies);
    } else if (debouncedSearchText.length >= 2) { // Min 2 karakter
      const searchLower = debouncedSearchText.toLowerCase();
      const filtered = currentSpecies.filter(species => {
        const displayName = locale === 'tr' 
          ? (species.common_names_tr?.[0] || species.common_name)
          : (species.common_names_en?.[0] || species.common_name);
        
        return displayName.toLowerCase().includes(searchLower) ||
               species.scientific_name.toLowerCase().includes(searchLower) ||
               species.common_names_tr?.some(name => name.toLowerCase().includes(searchLower)) ||
               species.common_names_en?.some(name => name.toLowerCase().includes(searchLower));
      });
      setFilteredSpecies(filtered);
    } else {
      setFilteredSpecies(currentSpecies); // Show all if less than 2 chars
    }
  }, [debouncedSearchText, selectedCategory, fishSpecies, locale]);

  const categorizeSpecies = (allSpecies: FishSpecies[]) => {
    const marineHabitats = [
      'demersal', 'benthopelagic', 'epipelagic', 'pelagic-neritic',
      'pelagic-oceanic', 'reef-associated', 'bathydemersal'
    ];
    
    const freshwaterOnlyHabitats = ['freshwater', 'river', 'lake'];
    
    const saltwater = allSpecies.filter((species) => {
      if (!species.habitats || species.habitats.length === 0) return false;
      return species.habitats.some(h => marineHabitats.includes(h));
    });
    
    const freshwater = allSpecies.filter((species) => {
      if (!species.habitats || species.habitats.length === 0) return false;
      const hasMarine = species.habitats.some(h => marineHabitats.includes(h) || h === 'brackish');
      if (hasMarine) return false;
      return species.habitats.some(h => freshwaterOnlyHabitats.includes(h));
    });
    
    setFishSpecies({ saltwater, freshwater });
  };

  const loadSpecies = useCallback(async (pageNum: number = 0, reset: boolean = false, isBackgroundUpdate: boolean = false) => {
    if (!reset && (!hasMore || isLoadingMore)) return;
    
    try {
      if (!isBackgroundUpdate) {
        if (pageNum === 0) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
      }
      setError(null);
      
      const apiService = createNativeApiService();
      
      // For initial load, get all species for caching
      const response = await apiService.species.getSpecies(
        pageNum === 0 && reset ? {} : {
          limit: PAGE_SIZE,
          offset: pageNum * PAGE_SIZE
        }
      );
      
      if (response.data) {
        // If this is initial load, cache the data
        if (pageNum === 0 && reset && response.data.length > 0) {
          try {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
              data: response.data,
              timestamp: Date.now()
            }));
          } catch (cacheError: unknown) {
            // Ignore cache errors
          }
        }
        
        // Check if we have more data
        if (response.data.length < PAGE_SIZE && pageNum > 0) {
          setHasMore(false);
        }
        
        if (response.data.length > 0) {
          if (reset) {
            categorizeSpecies(response.data);
          } else {
            // For pagination, manually categorize and append
            const marineHabitats = [
              'demersal', 'benthopelagic', 'epipelagic', 'pelagic-neritic',
              'pelagic-oceanic', 'reef-associated', 'bathydemersal'
            ];
            
            const freshwaterOnlyHabitats = ['freshwater', 'river', 'lake'];
            
            const newSaltwater = response.data.filter((species) => {
              if (!species.habitats || species.habitats.length === 0) return false;
              return species.habitats.some(h => marineHabitats.includes(h));
            });
            
            const newFreshwater = response.data.filter((species) => {
              if (!species.habitats || species.habitats.length === 0) return false;
              const hasMarine = species.habitats.some(h => marineHabitats.includes(h) || h === 'brackish');
              if (hasMarine) return false;
              return species.habitats.some(h => freshwaterOnlyHabitats.includes(h));
            });
            
            setFishSpecies(prev => ({
              saltwater: [...prev.saltwater, ...newSaltwater.filter(s => !prev.saltwater.some(ps => ps.id === s.id))],
              freshwater: [...prev.freshwater, ...newFreshwater.filter(f => !prev.freshwater.some(pf => pf.id === f.id))]
            }));
          }
          setPage(pageNum);
        }
      }
    } catch (err: unknown) {
      if (!isBackgroundUpdate) {
        setError(err instanceof Error ? err.message : t('common.fish.loadError'));
      }
    } finally {
      if (!isBackgroundUpdate) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [hasMore, isLoadingMore, t]);

  // Stabilize loadCachedSpecies function
  const loadCachedSpecies = useCallback(async () => {
    const loadData = async (pageNum: number = 0, reset: boolean = false, isBackgroundUpdate: boolean = false) => {
      if (!reset && (!hasMore || isLoadingMore)) return;
      
      try {
        if (!isBackgroundUpdate) {
          if (pageNum === 0) {
            setIsLoading(true);
          } else {
            setIsLoadingMore(true);
          }
        }
        setError(null);
        
        const apiService = createNativeApiService();
        
        const response = await apiService.species.getSpecies(
          pageNum === 0 && reset ? {} : {
            limit: PAGE_SIZE,
            offset: pageNum * PAGE_SIZE
          }
        );
        
        if (response.data) {
          if (pageNum === 0 && reset && response.data.length > 0) {
            try {
              await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                data: response.data,
                timestamp: Date.now()
              }));
            } catch (cacheError: unknown) {
              // Ignore cache errors
            }
          }
          
          if (response.data.length < PAGE_SIZE && pageNum > 0) {
            setHasMore(false);
          }
          
          if (response.data.length > 0) {
            if (reset) {
              categorizeSpecies(response.data);
            } else {
              // For pagination
              const marineHabitats = [
                'demersal', 'benthopelagic', 'epipelagic', 'pelagic-neritic',
                'pelagic-oceanic', 'reef-associated', 'bathydemersal'
              ];
              
              const freshwaterOnlyHabitats = ['freshwater', 'river', 'lake'];
              
              const newSaltwater = response.data.filter((species) => {
                if (!species.habitats || species.habitats.length === 0) return false;
                return species.habitats.some(h => marineHabitats.includes(h));
              });
              
              const newFreshwater = response.data.filter((species) => {
                if (!species.habitats || species.habitats.length === 0) return false;
                const hasMarine = species.habitats.some(h => marineHabitats.includes(h) || h === 'brackish');
                if (hasMarine) return false;
                return species.habitats.some(h => freshwaterOnlyHabitats.includes(h));
              });
              
              setFishSpecies(prev => ({
                saltwater: [...prev.saltwater, ...newSaltwater.filter(s => !prev.saltwater.some(ps => ps.id === s.id))],
                freshwater: [...prev.freshwater, ...newFreshwater.filter(f => !prev.freshwater.some(pf => pf.id === f.id))]
              }));
            }
            setPage(pageNum);
          }
        }
      } catch (err: unknown) {
        if (!isBackgroundUpdate) {
          setError(err instanceof Error ? err.message : t('common.fish.loadError'));
        }
      } finally {
        if (!isBackgroundUpdate) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    };

    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < CACHE_DURATION) {
          // Use cached data
          categorizeSpecies(data);
          setLastCacheUpdate(timestamp);
          
          // Load fresh data in background
          loadData(0, true, true);
          return;
        }
      }
      
      // No valid cache, load fresh data
      loadData(0, true);
    } catch (err: unknown) {
      loadData(0, true);
    }
  }, [hasMore, isLoadingMore, t]);

  // Modal ilk açılışında veri yükleme
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  
  useEffect(() => {
    if (visible) {
      if (isFirstOpen) {
        // Sadece ilk açılışta temizle ve yükle
        setSelectedCategory('all');
        setSearchText('');
        setPage(0);
        setHasMore(true);
        loadCachedSpecies();
        setIsFirstOpen(false);
      }
      // Modal açıldığında sadece kategoriyi varsayılana çek, arama kutusunu temizleme
      setSelectedCategory('all');
    }
  }, [visible]);
  
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadSpecies(page + 1);
    }
  };

  const handleSelect = (species: FishSpecies) => {
    if (selectedCategory && selectedCategory !== 'all') {
      const displayName = locale === 'tr' 
        ? (species.common_names_tr?.[0] || species.common_name)
        : (species.common_names_en?.[0] || species.common_name);
      onSelect(displayName, selectedCategory, species.id);
      onClose();
    } else if (selectedCategory === 'all') {
      // 'all' seçiliyse balığın gerçek su türünü belirle
      const marineHabitats = [
        'demersal', 'benthopelagic', 'epipelagic', 'pelagic-neritic',
        'pelagic-oceanic', 'reef-associated', 'bathydemersal'
      ];
      const waterType = species.habitats?.some(h => marineHabitats.includes(h)) 
        ? 'saltwater' 
        : 'freshwater';
      
      const displayName = locale === 'tr' 
        ? (species.common_names_tr?.[0] || species.common_name)
        : (species.common_names_en?.[0] || species.common_name);
      onSelect(displayName, waterType, species.id);
      onClose();
    }
  };

  const renderSpeciesItem = ({ item }: { item: FishSpecies }) => {
    const displayName = locale === 'tr' 
      ? (item.common_names_tr?.[0] || item.common_name)
      : (item.common_names_en?.[0] || item.common_name);
    const isSelected = selectedSpeciesId ? selectedSpeciesId === item.id : selectedSpecies === displayName;
    
    // Balığın hangi su türünde yaşadığını belirle
    const getWaterType = () => {
      const marineHabitats = [
        'demersal', 'benthopelagic', 'epipelagic', 'pelagic-neritic',
        'pelagic-oceanic', 'reef-associated', 'bathydemersal'
      ];
      const hasMarine = item.habitats?.some(h => marineHabitats.includes(h));
      return hasMarine ? 'saltwater' : 'freshwater';
    };
    
    const waterType = getWaterType();
    const showWaterTypeBadge = selectedCategory === 'all';
    
    // Alternatif isimle arama eşleşmesini kontrol et
    const getMatchedAlternativeName = () => {
      if (!debouncedSearchText || debouncedSearchText.length < 2) return null;
      
      const searchLower = debouncedSearchText.toLowerCase();
      const names = locale === 'tr' ? item.common_names_tr : item.common_names_en;
      
      // İlk isimle eşleşiyorsa gösterme
      if (names?.[0]?.toLowerCase().includes(searchLower)) return null;
      
      // Alternatif isimlerden hangisiyle eşleşti?
      return names?.find(name => name.toLowerCase().includes(searchLower)) || null;
    };
    
    const matchedAlternativeName = getMatchedAlternativeName();
    
    return (
      <TouchableOpacity
        style={[
          styles.speciesItem,
          isSelected && styles.selectedSpeciesItem
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        {showWaterTypeBadge && (
          <View style={[
            styles.waterTypeBadge,
            waterType === 'saltwater' ? styles.saltwaterBadge : styles.freshwaterBadge
          ]}>
            <Text style={styles.waterTypeText}>
              {waterType === 'saltwater' ? 'Tuzlu Su' : 'Tatlı Su'}
            </Text>
          </View>
        )}
        <View style={styles.speciesContent}>
          {item.image_url ? (
            <Image 
              source={{ uri: getProxiedImageUrl(item.image_url) }} 
              style={styles.fishIcon}
              resizeMode="contain"
            />
          ) : (
            <View style={{ marginRight: theme.spacing.md }}>
              <Icon name="fish" size={64} color={theme.colors.primary} />
            </View>
          )}
          <View style={styles.speciesTextContainer}>
            <Text style={[
              styles.speciesName,
              isSelected && styles.selectedSpeciesName
            ]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.speciesScientificName} numberOfLines={1}>
              {item.scientific_name}
            </Text>
            {matchedAlternativeName && (
              <View style={styles.matchBadge}>
                <Icon name="search" size={10} color={theme.colors.primary} />
                <Text style={styles.matchText}>
                  {locale === 'tr' 
                    ? `${matchedAlternativeName} olarak da bilinir`
                    : `Also known as ${matchedAlternativeName}`
                  }
                </Text>
              </View>
            )}
          </View>
        </View>
        {isSelected && (
          <Icon name="check" size={16} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FishivoModal
      visible={visible}
      onClose={onClose}
      showDragIndicator={true}
      showCloseButton={false}
    >
      <View style={{ height: Dimensions.get('window').height * 0.7 }}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('common.fish.selectSpecies')}</Text>
          <CloseButton onPress={onClose} />
        </View>
        <Text style={styles.subtitle}>{t('common.fish.selectCatchDescription')}</Text>

          {/* Arama */}
          <SearchBox
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('common.fish.searchSpecies')}
          />

          {/* Kategoriler */}
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(categoryId: string) => setSelectedCategory(categoryId as 'all' | 'freshwater' | 'saltwater')}
          />

          {/* Balık Türleri Listesi */}
          <View style={styles.listContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>{t('common.loading')}</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={32} color={theme.colors.error} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => loadSpecies(0, true)}>
                  <Text style={styles.retryText}>{t('common.fish.retry')}</Text>
                </TouchableOpacity>
              </View>
            ) : filteredSpecies.length > 0 ? (
              <FlatList
                data={filteredSpecies}
                renderItem={renderSpeciesItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.speciesList}
                contentContainerStyle={styles.listContentContainer}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isLoadingMore ? (
                    <View style={styles.loadingMoreContainer}>
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                      <Text style={styles.loadingMoreText}>{t('common.loading')}</Text>
                    </View>
                  ) : null
                }
                // Performance optimizations
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={true}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Icon name="search" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.noResultsText}>{t('common.fish.noSpeciesFound')}</Text>
                <Text style={styles.noResultsSubtext}>
                  {t('common.fish.tryDifferentKeywords')}
                </Text>
              </View>
            )}
          </View>
      </View>
    </FishivoModal>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  title: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
    textAlign: 'left',
    flex: 1,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'left',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  listContainer: {
    flex: 1,
    minHeight: 300,
  },
  speciesList: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 0,
  },
  speciesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  selectedSpeciesItem: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}05`,
  },
  speciesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fishIcon: {
    width: 120,
    height: 80,
    marginRight: theme.spacing.md,
  },
  fishImage: {
    width: '100%',
    height: '100%',
  },
  speciesName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    marginBottom: 0,
  },
  selectedSpeciesName: {
    color: theme.colors.primary,
    fontWeight: theme.typography.semibold,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  noResultsText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  noResultsSubtext: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  speciesTextContainer: {
    flex: 1,
  },
  speciesScientificName: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  matchText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
  },
  waterTypeBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saltwaterBadge: {
    backgroundColor: '#0077BE',
  },
  freshwaterBadge: {
    backgroundColor: '#4CAF50',
  },
  waterTypeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: theme.typography.medium,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.base,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  retryText: {
    fontSize: theme.typography.base,
    color: '#FFFFFF',
    fontWeight: theme.typography.medium,
  },
  loadingMoreContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  loadingMoreText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
});

export default FishSpeciesSelectorModal; 