import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { Icon, DisciplineCard, EmptyState } from '@/components/ui';
import type { FishingDiscipline } from '@/components/ui/DisciplineCard';
import { Theme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import { createNativeApiService } from '@fishivo/api/services/native';

type TechniqueWithStats = {
  technique: string;
  count: number;
  id?: number;
  name?: string;
  name_tr?: string;
  name_en?: string;
  description?: string;
  description_tr?: string;
  description_en?: string;
  icon?: string;
  image_url?: string;
  season?: string;
  tips?: Record<string, string>;
  equipment?: Record<string, string>;
  stats?: {
    totalFollowers: number;
    totalCatches: number;
    avgRating: number;
    totalReviews: number;
  } | null;
};


interface FishDisciplinesTabProps {
  speciesId: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const FishDisciplinesTab: React.FC<FishDisciplinesTabProps> = ({ speciesId }) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const styles = createStyles(theme);
  const apiService = createNativeApiService();

  const [disciplines, setDisciplines] = useState<FishingDiscipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'popularity' | 'success_rate'>('popularity');

  useEffect(() => {
    loadFishingDisciplines();
  }, [speciesId]);

  const loadFishingDisciplines = async () => {
    try {
      setLoading(true);
      
      // Bu balık türü için en çok kullanılan teknikleri getir
      const topTechniques = await apiService.species.getTopTechniquesForSpecies(speciesId);

      // API service'ten fishing techniques'i al
      const fishingTechniquesService = apiService.fishingTechniques;

      // Her teknik için istatistikleri çek
      const disciplinesWithStats: TechniqueWithStats[] = await Promise.all(
        topTechniques.map(async (item) => {
          const techniqueItem = item as TechniqueWithStats;
          // Teknik ID'si varsa istatistikleri çek
          if (techniqueItem.id) {
            try {
              const stats = await fishingTechniquesService.getTechniqueStatistics(techniqueItem.id.toString());
              return { ...techniqueItem, stats };
            } catch (error) {
              return { ...techniqueItem, stats: null };
            }
          }
          return { ...techniqueItem, stats: null };
        })
      );

      // Technique verilerini FishingDiscipline formatına dönüştür
      const disciplines: FishingDiscipline[] = disciplinesWithStats.map((item, index) => {

        // Popularity score'u kullanım sayısına göre hesapla
        const maxCount = Math.max(...topTechniques.map(t => t.count));
        const popularityScore = Math.round((item.count / maxCount) * 100);

        return {
          id: `technique-${index}`,
          name: locale === 'tr' && item.name_tr ? item.name_tr : (item.name_en || item.technique),
          name_tr: item.name_tr,
          description: locale === 'tr' && item.description_tr ? item.description_tr : (item.description_en || item.description || ''),
          description_tr: item.description_tr,
          popularity_score: popularityScore,
          success_rate: item.count > 10 ? 75 : item.count > 5 ? 60 : 45, // Kullanım sayısına göre tahmini başarı oranı
          best_season: item.season || undefined,
          best_time_of_day: undefined, // Gerçek veri olmadığı için kaldırıldı
          icon: item.icon || 'target',
          image_url: item.image_url,
          equipment_needed: item.equipment ? Object.keys(item.equipment) : [],
          rating: item.stats?.avgRating || 0,
          review_count: item.stats?.totalReviews || 0,
          technique_id: item.id
        };
      });

      // Sort disciplines based on selected criteria
      const sortedDisciplines = [...disciplines].sort((a, b) => {
        switch (sortBy) {
          case 'popularity':
            return b.popularity_score - a.popularity_score;
          case 'success_rate':
            return b.success_rate - a.success_rate;
          default:
            return 0;
        }
      });

      setDisciplines(sortedDisciplines);
    } catch (error) {
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (disciplines.length > 0) {
      loadFishingDisciplines(); // Re-sort when sortBy changes
    }
  }, [sortBy]);


  const renderSortButtons = () => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortLabel}>
        {t('fishSpecies.disciplines.sortBy')}
      </Text>
      <View style={styles.sortButtons}>
        {[
          { id: 'popularity', label: t('fishSpecies.disciplines.popularity') },
          { id: 'success_rate', label: t('fishSpecies.disciplines.success') }
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortButton,
              sortBy === option.id && styles.activeSortButton
            ]}
            onPress={() => setSortBy(option.id as 'popularity' | 'success_rate')}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === option.id && styles.activeSortButtonText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDisciplineItem = ({ item }: { item: FishingDiscipline }) => (
    <DisciplineCard
      item={item}
      locale={locale}
      onPress={() => {
        navigation.navigate('FishingDisciplineDetail', { 
          technique: {
            id: item.technique_id,
            name: item.name,
            name_tr: item.name_tr,
            description: item.description,
            description_tr: item.description_tr,
            icon: item.icon,
            best_season: item.best_season,
            equipment_needed: item.equipment_needed,
          }
        });
      }}
      reviewsText={t('fishSpecies.topGear.reviews')}
      noReviewsText={t('fishSpecies.disciplines.noReviews')}
      popularityText={t('fishSpecies.disciplines.popularity')}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      title={t('fishSpecies.disciplines.emptyState.title')}
      subtitle={t('fishSpecies.disciplines.emptyState.subtitle')}
    />
  );

  return (
    <View style={styles.container}>
      {renderSortButtons()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : disciplines.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={disciplines}
          numColumns={2}
          key="2-columns"
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          columnWrapperStyle={disciplines.length % 2 === 0 ? styles.row : styles.rowOdd}
          renderItem={({ item, index }) => (
            <View style={[
              styles.disciplineCardWrapper,
              disciplines.length % 2 !== 0 && index === disciplines.length - 1 && styles.singleCardContainer
            ]}>
              {renderDisciplineItem({ item })}
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
    minHeight: 200,
  },
  sortContainer: {
    marginBottom: theme.spacing.lg,
  },
  sortLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.medium,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sortButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeSortButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortButtonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  activeSortButtonText: {
    color: theme.colors.white,
  },
  // FlatList styles - FishSpeciesScreen ile aynı
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  rowOdd: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  disciplineCardWrapper: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  singleCardContainer: {
    flex: 0.48, // Tek kart yarım ekran kaplar
  },
});