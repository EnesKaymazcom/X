import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, AppHeader, ScreenContainer, SearchBar, Button, EmptyState } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api/services/native';
import type { FishingTechnique } from '@fishivo/types';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';

interface FishingDisciplinesScreenProps {
  navigation: any;
}

const FishingDisciplinesScreen: React.FC<FishingDisciplinesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useSupabaseUser();
  const [searchText, setSearchText] = useState('');
  const [disciplines, setDisciplines] = useState<FishingTechnique[]>([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState<FishingTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedTechniques, setFollowedTechniques] = useState<Set<number>>(new Set());
  const [followingStates, setFollowingStates] = useState<Record<number, boolean>>({});

  // Load fishing techniques from API
  useEffect(() => {
    const loadFishingTechniques = async () => {
      try {
        setLoading(true);
        const apiService = createNativeApiService();
        const data = await apiService.fishingTechniques.getAllFishingTechniques();
        setDisciplines(data);
        setFilteredDisciplines(data);
        
        // Load followed techniques if user is logged in
        if (user) {
          const supabase = getNativeSupabaseClient();
          const { data: followData } = await supabase
            .from('user_fishing_technique_follows')
            .select('fishing_technique_id')
            .eq('user_id', user.id);
          
          if (followData) {
            const followedIds = new Set(followData.map(f => f.fishing_technique_id));
            setFollowedTechniques(followedIds);
          }
        }
      } catch (error) {
        setDisciplines([]);
        setFilteredDisciplines([]);
      } finally {
        setLoading(false);
      }
    };

    loadFishingTechniques();
  }, [user]);

  // Filter disciplines based on search text
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredDisciplines(disciplines);
    } else {
      const filtered = disciplines.filter(discipline => {
        const name = locale === 'tr' ? discipline.name : (discipline.name_en || discipline.name);
        const description = locale === 'tr' ? 
          (discipline.description || '') : 
          (discipline.description_en || discipline.description || '');
        const searchLower = searchText.toLowerCase();
        
        return name.toLowerCase().includes(searchLower) || 
               description.toLowerCase().includes(searchLower);
      });
      setFilteredDisciplines(filtered);
    }
  }, [searchText, locale, disciplines]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };


  const handleFollowToggle = async (techniqueId: number) => {
    if (!user) {
      // Auth'a yönlendirme yapmıyoruz
      setModalMessage(t('common.loginRequired'));
      setShowErrorModal(true);
      return;
    }

    setFollowingStates(prev => ({ ...prev, [techniqueId]: true }));
    
    try {
      const supabase = getNativeSupabaseClient();
      const isFollowing = followedTechniques.has(techniqueId);
      
      if (isFollowing) {
        await supabase
          .from('user_fishing_technique_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('fishing_technique_id', techniqueId);
        
        setFollowedTechniques(prev => {
          const newSet = new Set(prev);
          newSet.delete(techniqueId);
          return newSet;
        });
      } else {
        await supabase
          .from('user_fishing_technique_follows')
          .insert({
            user_id: user.id,
            fishing_technique_id: techniqueId
          });
        
        setFollowedTechniques(prev => {
          const newSet = new Set(prev);
          newSet.add(techniqueId);
          return newSet;
        });
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setFollowingStates(prev => ({ ...prev, [techniqueId]: false }));
    }
  };

  const renderDisciplineItem = ({ item }: { item: FishingTechnique }) => {
    const name = locale === 'tr' ? item.name : (item.name_en || item.name);
    const description = locale === 'tr' ? 
      (item.description || '') : 
      (item.description_en || item.description || '');
    const isFollowing = followedTechniques.has(item.id);
    const isLoadingFollow = followingStates[item.id];

    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => navigation.navigate('FishingDisciplineDetail', { technique: item })}
        activeOpacity={0.7}
      >
        <View style={styles.listItemContent}>
          {/* Image Section */}
          <View style={styles.imageContainer}>
            {item.image_url ? (
              <Image 
                source={{ uri: item.image_url }}
                style={styles.techniqueImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: theme.colors.surface }]}>
                <Icon name={item.icon || 'anchor'} size={24} color={theme.colors.textSecondary} />
              </View>
            )}
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {description}
            </Text>
          </View>

          {/* Follow Button */}
          <View style={styles.followButtonContainer}>
            <Button
              onPress={() => handleFollowToggle(item.id)}
              variant={isFollowing ? 'secondary' : 'primary'}
              size="sm"
              loading={isLoadingFollow}
            >
              {isFollowing ? t('fishingDisciplines:following') : t('fishingDisciplines:followAction')}
            </Button>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('fishingDisciplines:title')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')
          }
        ]}
        searchBar={{
          value: searchText,
          onChangeText: handleSearch,
          placeholder: t('fishingDisciplines:searchPlaceholder')
        }}
      />

      <ScreenContainer paddingVertical="none" paddingHorizontal="none">
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : filteredDisciplines.length === 0 ? (
          <EmptyState
            title={t('fishingDisciplines:noDisciplinesFound')}
          />
        ) : (
          <FlatList
            data={filteredDisciplines}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.listContainer, theme.listContentStyle]}
            renderItem={renderDisciplineItem}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  listContainer: {
    paddingVertical: theme.spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  listItem: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  imageContainer: {
    marginRight: theme.spacing.md,
  },
  techniqueImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSection: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  itemTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    marginBottom: theme.spacing.xs,
  },
  itemDescription: {
    fontSize: theme.typography.sm,
    marginBottom: theme.spacing.xs,
    lineHeight: theme.typography.sm * 1.4,
  },
  followButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
});

export default FishingDisciplinesScreen;