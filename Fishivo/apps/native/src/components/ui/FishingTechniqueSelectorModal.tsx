import React, { useState, useEffect, useCallback } from 'react';
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
import { SearchBox } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api/services/native';
import type { FishingTechnique } from '@fishivo/types';
import { getProxiedImageUrl } from '@fishivo/utils';

interface FishingTechniqueSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (technique: string, techniqueId: number) => void;
  selectedTechnique?: string;
  selectedTechniqueId?: number;
}

const CACHE_KEY = '@fishivo/fishing_techniques_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const FishingTechniqueSelectorModal: React.FC<FishingTechniqueSelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedTechnique,
  selectedTechniqueId,
}) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const styles = createStyles(theme);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [filteredTechniques, setFilteredTechniques] = useState<FishingTechnique[]>([]);
  const [techniques, setTechniques] = useState<FishingTechnique[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Filter techniques based on search
  useEffect(() => {
    let filtered = [...techniques];

    // Filter by search text
    if (debouncedSearchText.trim().length >= 2) {
      const searchLower = debouncedSearchText.toLowerCase();
      filtered = filtered.filter(technique => {
        const name = locale === 'tr' ? technique.name : (technique.name_en || technique.name);
        const description = locale === 'tr' ? technique.description : (technique.description_en || technique.description);
        
        return name.toLowerCase().includes(searchLower) ||
               (description && description.toLowerCase().includes(searchLower));
      });
    }

    setFilteredTechniques(filtered);
  }, [debouncedSearchText, techniques, locale]);

  const loadTechniques = useCallback(async (isBackgroundUpdate: boolean = false) => {
    try {
      if (!isBackgroundUpdate) {
        setIsLoading(true);
      }
      setError(null);
      
      const apiService = createNativeApiService();
      const data = await apiService.fishingTechniques.getAllFishingTechniques();
      
      if (data) {
        setTechniques(data);
        
        // Cache the data
        try {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (cacheError) {
          // Ignore cache errors
        }
      }
    } catch (err: unknown) {
      if (!isBackgroundUpdate) {
        setError(t('common.error'));
      }
    } finally {
      if (!isBackgroundUpdate) {
        setIsLoading(false);
      }
    }
  }, [t]);

  const loadCachedTechniques = useCallback(async () => {
    try {
      // Try to load from cache first
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < CACHE_DURATION) {
          setTechniques(data);
          // Load fresh data in background
          loadTechniques(true);
          return;
        }
      }
      
      // No valid cache, load fresh data
      loadTechniques();
    } catch (err: unknown) {
      loadTechniques();
    }
  }, [loadTechniques]);

  // Load techniques when modal opens
  useEffect(() => {
    if (visible) {
      setSearchText('');
      loadCachedTechniques();
    }
  }, [visible, loadCachedTechniques]);

  const handleSelect = (technique: FishingTechnique) => {
    const displayName = locale === 'tr' ? technique.name : (technique.name_en || technique.name);
    onSelect(displayName, technique.id);
    onClose();
  };

  const getDifficultyColor = useCallback((difficulty: string) => {
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower === 'easy' || difficultyLower === 'kolay') {
      return '#4CAF50';
    } else if (difficultyLower === 'intermediate' || difficultyLower === 'orta') {
      return '#FF9800';
    } else if (difficultyLower === 'advanced' || difficultyLower === 'zor') {
      return '#F44336';
    }
    return theme.colors.textSecondary;
  }, [theme.colors.textSecondary]);

  const getDifficultyText = useCallback((difficulty: string) => {
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower === 'easy' || difficultyLower === 'kolay') {
      return locale === 'tr' ? 'Kolay' : 'Easy';
    } else if (difficultyLower === 'intermediate' || difficultyLower === 'orta') {
      return locale === 'tr' ? 'Orta' : 'Intermediate';
    } else if (difficultyLower === 'advanced' || difficultyLower === 'zor') {
      return locale === 'tr' ? 'Zor' : 'Advanced';
    }
    return difficulty;
  }, [locale]);

  const renderTechniqueItem = ({ item }: { item: FishingTechnique }) => {
    const displayName = locale === 'tr' ? item.name : (item.name_en || item.name);
    const displayDescription = locale === 'tr' ? item.description : (item.description_en || item.description);
    const isSelected = selectedTechniqueId ? selectedTechniqueId === item.id : selectedTechnique === displayName;
    
    return (
      <TouchableOpacity
        style={[
          styles.techniqueItem,
          isSelected && styles.selectedTechniqueItem
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.techniqueContent}>
          <View style={styles.techniqueHeader}>
            <View style={styles.techniqueImageWrapper}>
              {item.image_url ? (
                <Image 
                  source={{ uri: getProxiedImageUrl(item.image_url) }}
                  style={styles.techniqueImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.iconContainer}>
                  <Icon name={item.icon || 'target'} size={24} color={theme.colors.primary} />
                </View>
              )}
              <View style={styles.imageBadgesContainer}>
                <View style={[styles.difficultyBadgeBottom, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                  <Text style={styles.difficultyTextSmall}>
                    {getDifficultyText(item.difficulty)}
                  </Text>
                </View>
                {item.seasons && item.seasons.length > 0 && item.seasons.length < 4 && (
                  item.seasons.map((season, idx) => (
                    <View key={idx} style={styles.seasonBadgeSmall}>
                      <Icon name="calendar" size={8} color={theme.colors.textSecondary} />
                      <Text style={styles.seasonTextSmall}>
                        {season === 'summer' ? (locale === 'tr' ? 'Yaz' : 'Summer') : 
                         season === 'winter' ? (locale === 'tr' ? 'Kış' : 'Winter') :
                         season === 'spring' ? (locale === 'tr' ? 'İlkbahar' : 'Spring') :
                         season === 'fall' ? (locale === 'tr' ? 'Sonbahar' : 'Fall') : season}
                      </Text>
                    </View>
                  ))
                )}
                {(!item.seasons || item.seasons.length === 0) && (
                  <View style={styles.seasonBadgeSmall}>
                    <Icon name="calendar" size={8} color={theme.colors.textSecondary} />
                    <Text style={styles.seasonTextSmall}>
                      {locale === 'tr' ? 'Tüm Yıl' : 'All Year'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.techniqueTextContainer}>
              <Text style={[
                styles.techniqueName,
                isSelected && styles.selectedTechniqueName
              ]} numberOfLines={1}>
                {displayName}
              </Text>
              {displayDescription && (
                <Text style={styles.techniqueDescription}>
                  {displayDescription}
                </Text>
              )}
            </View>
          </View>
        </View>
        {isSelected && (
          <Icon name="check" size={20} color={theme.colors.primary} />
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
          <Text style={styles.title}>{locale === 'tr' ? 'Teknik Seçin' : 'Select Technique'}</Text>
          <CloseButton onPress={onClose} />
        </View>
        <Text style={styles.subtitle}>{locale === 'tr' ? 'Avınız için kullandığınız tekniği seçin' : 'Select the technique you used for your catch'}</Text>

        {/* Arama */}
        <SearchBox
          value={searchText}
          onChangeText={setSearchText}
          placeholder={locale === 'tr' ? 'Teknik ara...' : 'Search technique...'}
        />

        {/* Techniques List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>
              {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadTechniques()}>
              <Text style={styles.retryButtonText}>
                {locale === 'tr' ? 'Tekrar Dene' : 'Retry'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredTechniques.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchText.length > 0 ? 
                (locale === 'tr' ? 'Sonuç bulunamadı' : 'No results found') : 
                (locale === 'tr' ? 'Teknik bulunamadı' : 'No techniques available')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTechniques}
            renderItem={renderTechniqueItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
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
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  techniqueItem: {
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
  selectedTechniqueItem: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}05`,
  },
  techniqueContent: {
    flex: 1,
  },
  techniqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techniqueImageWrapper: {
    marginRight: theme.spacing.md,
  },
  techniqueImage: {
    width: 120,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  iconContainer: {
    width: 120,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
    width: 120, // Görsel genişliği ile sınırla
    maxWidth: 120,
  },
  difficultyBadgeBottom: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  difficultyTextSmall: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: theme.typography.medium,
  },
  seasonBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  seasonTextSmall: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    marginLeft: 1,
  },
  techniqueTextContainer: {
    flex: 1,
  },
  techniqueName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  selectedTechniqueName: {
    color: theme.colors.primary,
  },
  techniqueDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  techniqueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default FishingTechniqueSelectorModal;