import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Icon, 
  AppHeader, 
  ScreenContainer, 
 
  EquipmentCard, 
  ErrorState, 
  EmptyState,
  TabSelector,
  Touchable
} from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api/services/native';
import { Theme } from '@/theme';

interface Equipment {
  id: number;
  user_id?: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  image_url?: string;
  description_tr?: string;
  description_en?: string;
  user_rating?: number;
  rating_count?: number;
  review_count?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface EquipmentListScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const EquipmentListScreen: React.FC<EquipmentListScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, isDark);
  const apiService = createNativeApiService();

  const [searchText, setSearchText] = useState('');
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: t('common.all', { defaultValue: 'Tümü' }), icon: 'layers' },
    { id: 'Makine', label: t('equipment.reel', { defaultValue: 'Makine' }), icon: 'settings' },
    { id: 'Olta', label: t('equipment.rod', { defaultValue: 'Olta' }), icon: 'fishing-rod' },
    { id: 'Suni Yem', label: t('equipment.lure', { defaultValue: 'Suni Yem' }), icon: 'fish' },
    { id: 'İğne', label: t('equipment.hook', { defaultValue: 'İğne' }), icon: 'anchor' },
    { id: 'Misina', label: t('equipment.line', { defaultValue: 'Misina' }), icon: 'git-branch' },
    { id: 'Aksesuar', label: t('equipment.accessory', { defaultValue: 'Aksesuar' }), icon: 'package' },
  ];

  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Gerçek API'den verileri çek
      if (!apiService.equipment?.getEquipment) {
        throw new Error('Equipment service not available');
      }
      const data = await apiService.equipment.getEquipment();
      
      // ID'leri string'e çevir (DB'de bigint olarak saklanıyor)
      const items = Array.isArray(data) ? data : (data as { items?: unknown[] })?.items || [];
      const formattedData: Equipment[] = items.map((item: unknown) => {
        const equipmentItem = item as Record<string, unknown>;
        return {
          id: Number(equipmentItem.id),
          name: String(equipmentItem.name || ''),
          category: String(equipmentItem.category || 'other') as Equipment['category'],
          brand: equipmentItem.brand ? String(equipmentItem.brand) : undefined,
          model: equipmentItem.model ? String(equipmentItem.model) : undefined,
          description: equipmentItem.description ? String(equipmentItem.description) : undefined,
          icon: equipmentItem.icon ? String(equipmentItem.icon) : undefined,
        };
      });

      setAllEquipment(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setAllEquipment([]);
      setFilteredEquipment([]);
    } finally {
      setLoading(false);
    }
  }, [apiService, t]);

  const filterEquipment = useCallback((equipment: Equipment[], search: string, category: string) => {
    let filtered = [...equipment];

    // Kategori filtresi
    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    // Arama filtresi
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        (item.model && item.model.toLowerCase().includes(searchLower)) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEquipment(filtered);
  }, []);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  useEffect(() => {
    filterEquipment(allEquipment, searchText, selectedCategory);
  }, [allEquipment, searchText, selectedCategory, filterEquipment]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleEquipmentPress = (equipment: Equipment) => {
    navigation.navigate('GearDetail', { equipment });
  };

  const handleAddPress = () => {
    navigation.navigate('AddGear');
  };

  const renderEquipmentItem = ({ item, index }: { item: Equipment; index: number }) => {
    const isLastOdd = filteredEquipment.length % 2 !== 0 && index === filteredEquipment.length - 1;
    
    return (
      <Touchable activeOpacity={1}
        style={[styles.cardContainer, isLastOdd && styles.singleCardContainer]}
        onPress={() => handleEquipmentPress(item)}
        
      >
        <EquipmentCard
          item={{
            id: item.id,
            name: item.name,
            category: item.category,
            brand: item.brand,
            icon: (item as { icon?: string }).icon || 'package',
            condition: (item as { condition?: 'poor' | 'fair' | 'good' | 'excellent' }).condition || 'excellent'
          }}
          rating={typeof item.user_rating === 'string' ? parseFloat(item.user_rating) : item.user_rating}
          reviewCount={item.review_count}
          showStats={true}
          variant="recommendation"
        />
      </Touchable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('equipment.title', { defaultValue: 'Ekipmanlar' })}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.goBack()
          }
        ]}
        rightButtons={[
          {
            icon: 'plus',
            onPress: handleAddPress
          }
        ]}
        searchBar={{
          value: searchText,
          onChangeText: handleSearch,
          placeholder: t('equipment.searchPlaceholder', { defaultValue: 'Ekipman ara...' })
        }}
      />

      <View style={styles.filterContainer}>
        <TabSelector
          tabs={categories}
          activeTab={selectedCategory}
          onTabPress={handleCategoryChange}
          scrollable={true}
        />
      </View>

      <ScreenContainer paddingVertical="none">
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>{t('common.loading', { defaultValue: 'Yükleniyor...' })}</Text>
          </View>
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={loadEquipment}
            retryText={t('common.retry', { defaultValue: 'Tekrar Dene' })}
          />
        ) : filteredEquipment.length === 0 ? (
          <EmptyState
            message={
              searchText || selectedCategory !== 'all'
                ? t('equipment.noResultsFound', { defaultValue: 'Sonuç bulunamadı' })
                : t('equipment.noEquipment', { defaultValue: 'Henüz ekipman eklenmemiş' })
            }
            iconName="package"
          />
        ) : (
          <FlatList
            data={filteredEquipment}
            numColumns={2}
            key="2-columns"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.listContainer, theme.listContentStyle]}
            columnWrapperStyle={filteredEquipment.length > 1 ? styles.row : undefined}
            renderItem={renderEquipmentItem}
            keyExtractor={(item) => item.id}
          />
        )}
      </ScreenContainer>

      {/* Floating Add Button - Alternative */}
      {!loading && !error && (
        <Touchable activeOpacity={1}
          style={styles.floatingButton}
          onPress={handleAddPress}
          
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </Touchable>
      )}
    </View>
  );
};

const createStyles = (theme: Theme, _isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  listContainer: {
    paddingVertical: theme.spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  singleCardContainer: {
    flex: 0.48,
    marginRight: '50%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default EquipmentListScreen;