import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Icon, EquipmentCard, EmptyState } from '@/components/ui';
import { Theme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import { createNativeApiService } from '@fishivo/api/services/native';
import { FishingGearUI } from '@fishivo/types';

interface GearRecommendation {
  id: string;
  name: string;
  category: 'rod' | 'reel' | 'line' | 'bait' | 'lure' | 'hook' | 'other';
  brand?: string;
  usage_count: number; // Kaç kişi kullanıyor
  rating?: number;
  review_count?: number;
}

interface FishTopGearTabProps {
  speciesId: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const FishTopGearTab: React.FC<FishTopGearTabProps> = ({ speciesId }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const styles = createStyles(theme);
  const apiService = createNativeApiService();

  const [gearRecommendations, setGearRecommendations] = useState<GearRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: t('fishSpecies.topGear.categories.all') },
    { id: 'rod', label: t('fishSpecies.topGear.categories.rod') },
    { id: 'reel', label: t('fishSpecies.topGear.categories.reel') },
    { id: 'line', label: t('fishSpecies.topGear.categories.line') },
    { id: 'bait', label: t('fishSpecies.topGear.categories.bait') },
    { id: 'lure', label: t('fishSpecies.topGear.categories.lure') },
    { id: 'hook', label: t('fishSpecies.topGear.categories.hook') },
  ];

  useEffect(() => {
    loadGearRecommendations();
  }, [speciesId]);

  const loadGearRecommendations = async () => {
    try {
      setLoading(true);
      
      // Bu balık türü için en çok kullanılan ekipmanları getir
      const topGear = await apiService.species.getTopGearForSpecies(speciesId);

      // Gear verilerini GearRecommendation formatına dönüştür
      const recommendations: GearRecommendation[] = topGear.map((item, index) => ({
        id: `gear-${index}`,
        name: item.gear,
        category: detectGearCategory(item.gear),
        brand: item.brand,
        usage_count: item.count,
        rating: item.rating,
        review_count: item.review_count
      }));

      setGearRecommendations(recommendations);
    } catch (error) {
      setGearRecommendations([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Gear string'inden kategori tespit et
  const detectGearCategory = (gear: string): GearRecommendation['category'] => {
    const gearLower = gear.toLowerCase();
    
    if (gearLower.includes('rod') || gearLower.includes('olta')) return 'rod';
    if (gearLower.includes('reel') || gearLower.includes('makara') || gearLower.includes('makine')) return 'reel';
    if (gearLower.includes('line') || gearLower.includes('misina')) return 'line';
    if (gearLower.includes('bait') || gearLower.includes('yem')) return 'bait';
    if (gearLower.includes('lure') || gearLower.includes('rapala') || gearLower.includes('jig')) return 'lure';
    if (gearLower.includes('hook') || gearLower.includes('iğne') || gearLower.includes('kanca')) return 'hook';
    
    return 'other';
  };
  
  

  const filteredGear = activeCategory === 'all' 
    ? gearRecommendations 
    : gearRecommendations.filter(gear => gear.category === activeCategory);

  const getCategoryIcon = (category: string): string => {
    return 'backpack'; // Tüm ekipmanlar için tek icon
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.categoryButton,
              activeCategory === item.id && styles.activeCategoryButton
            ]}
            onPress={() => setActiveCategory(item.id)}
          >
            <Text style={[
              styles.categoryButtonText,
              activeCategory === item.id && styles.activeCategoryButtonText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderGearItem = (item: GearRecommendation) => {
    // Convert GearRecommendation to FishingGearUI format
    const gearItem: FishingGearUI = {
      id: item.id,
      name: item.name,
      category: item.category,
      brand: item.brand,
      icon: getCategoryIcon(item.category),
      imageUrl: undefined,
      condition: 'good'
    };

    return (
      <EquipmentCard
        item={gearItem}
        rating={item.rating}
        reviewCount={item.review_count}
        usageCount={item.usage_count}
        showStats={true}
        variant="recommendation"
      />
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      title={t('fishSpecies.topGear.emptyState.title')}
      subtitle={t('fishSpecies.topGear.emptyState.subtitle')}
    />
  );

  return (
    <View style={styles.container}>
      {renderCategoryFilter()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredGear.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredGear}
          numColumns={2}
          key="2-columns"
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          columnWrapperStyle={filteredGear.length % 2 === 0 ? styles.row : styles.rowOdd}
          renderItem={({ item, index }) => (
            <View style={[
              styles.gearCardWrapper,
              filteredGear.length % 2 !== 0 && index === filteredGear.length - 1 && styles.singleCardContainer
            ]}>
              {renderGearItem(item)}
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
  categoryContainer: {
    marginBottom: theme.spacing.lg,
  },
  categoryList: {
    paddingHorizontal: theme.spacing.sm,
  },
  categoryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeCategoryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  activeCategoryButtonText: {
    color: theme.colors.white,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  rowOdd: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  gearCardWrapper: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  singleCardContainer: {
    flex: 0.48, // Tek kart yarım ekran kaplar
  },
});