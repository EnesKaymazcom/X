import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader, ScreenContainer, FishSpeciesCard, ErrorState, EmptyState } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api/services/native';
import { FishSpecies, FishSpeciesDisplay } from '@fishivo/types';

interface FishSpeciesScreenProps {
  navigation: any;
}


const FishSpeciesScreen: React.FC<FishSpeciesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [allFishSpecies, setAllFishSpecies] = useState<FishSpeciesDisplay[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<FishSpeciesDisplay[]>([]);
  const [originalSpeciesData, setOriginalSpeciesData] = useState<FishSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSpecies = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiService = createNativeApiService();
        
        if (!apiService.species) {
          throw new Error('Species service is not available');
        }
        
        const response = await apiService.species.getSpecies();
        
        setOriginalSpeciesData(response.data);
        
        const formattedSpecies: FishSpeciesDisplay[] = response.data.map((species: FishSpecies) => {
          return {
          id: species.id,
          name: locale === 'tr' && species.common_names_tr?.length 
            ? species.common_names_tr[0] 
            : species.common_name,
          scientificName: species.scientific_name,
          description: locale === 'tr' 
            ? species.description_tr || t('fishSpecies.screen.noDescription')
            : species.description_en || t('fishSpecies.screen.noDescription'),
          postCount: 0,
          difficulty: 'Orta' as const,
          season: t('fishSpecies.screen.allYear'),
          image: species.image_url || '',
          minWeight: 0,
          maxWeight: species.max_weight || 0,
          averageLength: species.max_length || 0,
          habitat: species.habitats?.join(', '),
          baitTypes: [],
          bestTimeOfDay: [],
          waterDepth: `${species.min_depth || 0}-${species.max_depth || 0}m`,
          family: species.family,
          conservationStatus: species.conservation_status
        };
        });
        
        
        setAllFishSpecies(formattedSpecies);
        setFilteredSpecies(formattedSpecies);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
        setError(errorMessage);
        setAllFishSpecies([]);
        setFilteredSpecies([]);
      } finally {
        setLoading(false);
      }
  }, [locale, t]);

  useEffect(() => {
    loadSpecies();
  }, [loadSpecies]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredSpecies(allFishSpecies.map(s => ({ ...s, matchedAlternativeName: undefined })));
    } else {
      const searchLower = text.toLowerCase();
      const filtered = allFishSpecies.map(species => {
        // Ana isimde ara
        if (species.name.toLowerCase().includes(searchLower)) {
          return { ...species, matchedAlternativeName: undefined };
        }
        
        // Bilimsel isimde ara
        if (species.scientificName.toLowerCase().includes(searchLower)) {
          return { ...species, matchedAlternativeName: undefined };
        }
        
        // Alternatif isimlerde ara
        const originalData = originalSpeciesData.find(s => s.id === species.id);
        
        // Türkçe alternatif isimlerde ara
        if (originalData?.common_names_tr) {
          const matchedName = originalData.common_names_tr.find(name => 
            name.toLowerCase().includes(searchLower)
          );
          if (matchedName && matchedName !== species.name) {
            return { ...species, matchedAlternativeName: matchedName };
          }
        }
        
        // İngilizce alternatif isimlerde ara  
        if (originalData?.common_names_en) {
          const matchedName = originalData.common_names_en.find(name => 
            name.toLowerCase().includes(searchLower)
          );
          if (matchedName && matchedName !== species.name) {
            return { ...species, matchedAlternativeName: matchedName };
          }
        }
        
        return null;
      }).filter(species => species !== null) as FishSpeciesDisplay[];
      
      setFilteredSpecies(filtered);
    }
  };

  const handleSpeciesPress = (species: FishSpeciesDisplay) => {
    const originalData = originalSpeciesData.find(s => s.id === species.id);
    if (originalData) {
      navigation.navigate('FishDetail', { species: originalData });
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('fishSpecies.screen.title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
          }
        ]}
        searchBar={{
          value: searchText,
          onChangeText: handleSearch,
          placeholder: t('fishSpecies.screen.searchPlaceholder')
        }}
      />

      <ScreenContainer paddingVertical="none">
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={() => loadSpecies()}
            retryText={t('common.retry')}
          />
        ) : filteredSpecies.length === 0 ? (
          <EmptyState
            message={t('fishSpecies.screen.noSpeciesFound')}
            iconName="fish"
          />
        ) : (
          <FlatList
            data={filteredSpecies}
            numColumns={2}
            key="2-columns"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.listContainer, theme.listContentStyle]}
            columnWrapperStyle={filteredSpecies.length % 2 === 0 ? styles.row : styles.rowOdd}
            renderItem={({ item: species, index }) => (
              <View style={[
                styles.cardContainer,
                filteredSpecies.length % 2 !== 0 && index === filteredSpecies.length - 1 && styles.singleCardContainer
              ]}>
                <FishSpeciesCard
                  species={species}
                  onPress={() => handleSpeciesPress(species)}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        )}
      </ScreenContainer>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  placeholder: {
    width: 24,
  },
  searchContainer: {
    paddingVertical: theme.spacing.md,
  },
  searchBar: {
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
  statsContainer: {
    paddingBottom: theme.spacing.md,
  },
  statsText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
  },
  listContainer: {
    paddingVertical: theme.spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  rowOdd: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  singleCardContainer: {
    flex: 0.48, // Tek kart yarım ekran kaplar
  },
});

export default FishSpeciesScreen; 