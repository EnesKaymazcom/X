import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, AppHeader, ScreenContainer, SearchBar, EmptyState, CategoryCard } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
// Mock JSON dosyaları kaldırıldı - API'den gelecek
// import { apiService } from '@fishivo/services/react-native';

interface ExploreSearchScreenProps {
  navigation: any;
}

interface SearchResult {
  id: string;
  type: 'user' | 'species' | 'equipment';
  title: string;
  subtitle: string;
  icon?: string;
  avatar?: string;
  verified?: boolean;
}

const ExploreSearchScreen: React.FC<ExploreSearchScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<SearchResult[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<SearchResult[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<SearchResult[]>([]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchText.trim() === '') {
        setFilteredUsers([]);
        setFilteredSpecies([]);
        setFilteredEquipment([]);
        return;
      }

      try {
        // Real API çağrıları
        // const [usersResult, speciesResult, equipmentResult] = await Promise.all([
        //   apiService.searchUsers(searchText),
        //   apiService.searchSpecies(searchText),
        //   apiService.searchEquipment(searchText)
        // ]);
        const usersResult = { items: [] };
        const speciesResult: { id: string; name: string; description?: string; latin_name?: string }[] = [];
        const equipmentResult: { id: string; name: string; brand?: string; category?: string }[] = [];
        
        // Format API responses to match UI expectations
        const formattedUsers: SearchResult[] = usersResult.items?.map((user: { id: string; full_name?: string; username: string; avatar_url?: string }) => ({
          id: user.id,
          type: 'user' as const,
          title: user.full_name || user.username,
          subtitle: `@${user.username}`,
          avatar: user.avatar_url
        })) || [];
        
        const formattedSpecies: SearchResult[] = speciesResult?.map((species) => ({
          id: species.id,
          type: 'species' as const,
          title: species.name,
          subtitle: species.description || species.latin_name || '',
          icon: 'fish'
        })) || [];
        
        const formattedEquipment: SearchResult[] = equipmentResult?.map((equipment) => ({
          id: equipment.id,
          type: 'equipment' as const,
          title: equipment.name,
          subtitle: equipment.brand || equipment.category || '',
          icon: 'backpack'
        })) || [];
        
        setFilteredUsers(formattedUsers);
        setFilteredSpecies(formattedSpecies);
        setFilteredEquipment(formattedEquipment);
      } catch (error) {
        console.error(t('explore.searchError'), error);
        // Hata durumunda boş sonuçlar göster
        setFilteredUsers([]);
        setFilteredSpecies([]);
        setFilteredEquipment([]);
      } finally {
        // Loading state kaldırıldı
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handleClose = () => {
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs');
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'user') {
      navigation.navigate('UserProfile', { userId: result.id });
    } else if (result.type === 'species') {
      navigation.navigate('FishSpecies', { speciesId: result.id });
    } else if (result.type === 'equipment') {
      navigation.navigate('Equipment', { equipmentId: result.id });
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('explore.title')}
          leftButtons={[
            {
              icon: 'arrow-left',
              onPress: handleClose
            }
          ]}
          searchBar={{
            value: searchText,
            onChangeText: setSearchText,
            placeholder: t('explore.searchPlaceholder')
          }}
        />
        
        <ScreenContainer paddingVertical="none">
          <ScrollView contentContainerStyle={[styles.scrollContent, theme.listContentStyleWithTabBar]} showsVerticalScrollIndicator={false}>
          <>
                                          {/* Category Cards */}
              <CategoryCard
                iconName="fish"
                title={t('explore.species')}
                subtitle={t('explore.speciesDesc')}
                onPress={() => navigation.navigate('FishSpecies')}
              />

              <CategoryCard
                iconName="users"
                title={t('common.friends')}
                subtitle={t('common.friendsDesc')}
                onPress={() => {}}
              />

              <CategoryCard
                iconName="backpack"
                title={t('explore.equipment')}
                subtitle={t('explore.equipmentDesc')}
                onPress={() => {}}
              />

              <CategoryCard
                iconName="fishing-rod"
                title={t('common.fishingDisciplines')}
                subtitle={t('common.fishingDisciplinesDesc')}
                onPress={() => navigation.navigate('FishingDisciplines')}
              />

              {/* No Results - only show when searching */}
              {searchText.length > 0 && 
               filteredUsers.length === 0 && 
               filteredSpecies.length === 0 && 
               filteredEquipment.length === 0 && (
                <EmptyState
                  title={t('explore.noResults')}
                  subtitle={t('explore.tryDifferentKeywords')}
                />
              )}
            </>

          {/* Coming Soon Sections */}
          <View style={styles.comingSoonSection}>
            <Text style={styles.sectionTitle}>{t('common.comingSoon')}</Text>
            
            <TouchableOpacity style={styles.comingSoonCard} disabled>
              <View style={[styles.comingSoonIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="edit" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.comingSoonInfo}>
                <Text style={styles.comingSoonTitle}>{t('common.posts')}</Text>
                <Text style={styles.comingSoonSubtitle}>{t('common.postsDesc')}</Text>
              </View>
              <Text style={styles.comingSoonLabel}>{t('common.comingSoon')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.comingSoonCard} disabled>
              <View style={[styles.comingSoonIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="message-circle" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.comingSoonInfo}>
                <Text style={styles.comingSoonTitle}>{t('common.messaging')}</Text>
                <Text style={styles.comingSoonSubtitle}>{t('common.messagingDesc')}</Text>
              </View>
              <Text style={styles.comingSoonLabel}>{t('common.comingSoon')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.comingSoonCard} disabled>
              <View style={[styles.comingSoonIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="users" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.comingSoonInfo}>
                <Text style={styles.comingSoonTitle}>{t('common.groups')}</Text>
                <Text style={styles.comingSoonSubtitle}>{t('common.groupsDesc')}</Text>
              </View>
              <Text style={styles.comingSoonLabel}>{t('common.comingSoon')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.comingSoonCard} disabled>
              <View style={[styles.comingSoonIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="star" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.comingSoonInfo}>
                <Text style={styles.comingSoonTitle}>{t('common.brands')}</Text>
                <Text style={styles.comingSoonSubtitle}>{t('common.brandsDesc')}</Text>
              </View>
              <Text style={styles.comingSoonLabel}>{t('common.comingSoon')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.comingSoonCard} disabled>
              <View style={[styles.comingSoonIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="backpack" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.comingSoonInfo}>
                <Text style={styles.comingSoonTitle}>{t('common.marketplace')}</Text>
                <Text style={styles.comingSoonSubtitle}>{t('common.marketplaceDesc')}</Text>
              </View>
              <Text style={styles.comingSoonLabel}>{t('common.comingSoon')}</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </ScreenContainer>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  scrollContent: {
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    marginBottom: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  resultsGrid: {
    gap: theme.spacing.sm,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: theme.typography.sm,
    color: '#FFFFFF',
    fontWeight: theme.typography.bold,
  },
  iconEmoji: {
    fontSize: 24,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  resultTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  verifiedBadge: {
    fontSize: 14,
  },
  comingSoonSection: {
    marginTop: theme.spacing.md,
  },
  comingSoonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    opacity: 0.6,
    minHeight: 64,
    marginBottom: theme.spacing.sm,
  },
  comingSoonIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonInfo: {
    flex: 1,
  },
  comingSoonTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    marginBottom: 2,
  },
  comingSoonSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  comingSoonLabel: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
});

export default ExploreSearchScreen; 