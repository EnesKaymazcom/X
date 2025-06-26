import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Icon, 
  DefaultAvatar,
  ProBadge,
  AppHeader,
  ScreenContainer
} from '@fishivo/ui';
import { theme } from '@fishivo/shared';
import { apiService } from '@fishivo/shared';

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
  const [searchText, setSearchText] = useState('');
  const [slideAnim] = useState(new Animated.Value(-Dimensions.get('window').width));
  const [filteredUsers, setFilteredUsers] = useState<SearchResult[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<SearchResult[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchText.trim() === '') {
        setFilteredUsers([]);
        setFilteredSpecies([]);
        setFilteredEquipment([]);
        return;
      }

      setIsLoading(true);
      try {
        // Real API çağrıları
        const [usersResult, speciesResult, equipmentResult] = await Promise.all([
          apiService.searchUsers(searchText),
          apiService.searchSpecies(searchText),
          apiService.searchEquipment(searchText)
        ]);
        
        // Format API responses to match UI expectations
        const formattedUsers: SearchResult[] = usersResult.items?.map((user: any) => ({
          id: user.id,
          type: 'user' as const,
          title: user.full_name || user.username,
          subtitle: `@${user.username}`,
          avatar: user.avatar_url
        })) || [];
        
        const formattedSpecies: SearchResult[] = speciesResult?.map((species: any) => ({
          id: species.id,
          type: 'species' as const,
          title: species.name,
          subtitle: species.description || species.latin_name || '',
          icon: 'fish'
        })) || [];
        
        const formattedEquipment: SearchResult[] = equipmentResult?.map((equipment: any) => ({
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
        console.error('Arama hatası:', error);
        // Hata durumunda boş sonuçlar göster
        setFilteredUsers([]);
        setFilteredSpecies([]);
        setFilteredEquipment([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  const handleResultPress = (result: SearchResult) => {
    // Navigate based on type
    if (result.type === 'user') {
      // Navigate to user profile
    } else if (result.type === 'species') {
      // Navigate to species page
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
      <SafeAreaView style={styles.safeArea}>
        <AppHeader
          title="Keşfet"
          canGoBack
          onBackPress={handleClose}
        />

        <ScreenContainer>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Kişi, balık, ekipman ara..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Icon name="x" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Cards */}
            <TouchableOpacity 
              style={styles.categoryCard}
              onPress={() => {}}
            >
              <View style={styles.categoryIcon}>
                <Icon name="users" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.categoryTitle}>Arkadaşlarım</Text>
              <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.categoryCard}
              onPress={() => navigation.navigate('FishSpecies')}
            >
              <View style={styles.categoryIcon}>
                <Icon name="fish" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.categoryTitle}>Balık Türleri</Text>
              <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.categoryCard}
              onPress={() => {}}
            >
              <View style={styles.categoryIcon}>
                <Icon name="backpack" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.categoryTitle}>Ekipmanlar</Text>
              <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.categoryCard}
              onPress={() => {}}
            >
              <View style={styles.categoryIcon}>
                <Icon name="fishing-rod" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.categoryTitle}>Balıkçılık Disiplini</Text>
              <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* No Results - only show when searching */}
            {searchText.length > 0 && 
             filteredUsers.length === 0 && 
             filteredSpecies.length === 0 && 
             filteredEquipment.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="search" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyStateTitle}>Sonuç Bulunamadı</Text>
                <Text style={styles.emptyStateText}>
                  "{searchText}" için sonuç bulunamadı
                </Text>
              </View>
            )}

            {/* Coming Soon Sections */}
            <View style={styles.comingSoonSection}>
              <Text style={styles.sectionTitle}>Yakında</Text>
              
              <TouchableOpacity style={styles.comingSoonCard} disabled>
                <View style={[styles.comingSoonIcon, { backgroundColor: theme.colors.surface }]}>
                  <Icon name="users" size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.comingSoonInfo}>
                  <Text style={styles.comingSoonTitle}>Gruplar</Text>
                  <Text style={styles.comingSoonSubtitle}>Balıkçı gruplarına katıl</Text>
                </View>
                <Text style={styles.comingSoonLabel}>Yakında</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.comingSoonCard} disabled>
                <View style={[styles.comingSoonIcon, { backgroundColor: theme.colors.surface }]}>
                  <Icon name="star" size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.comingSoonInfo}>
                  <Text style={styles.comingSoonTitle}>Markalar</Text>
                  <Text style={styles.comingSoonSubtitle}>Ekipman markalarını keşfet</Text>
                </View>
                <Text style={styles.comingSoonLabel}>Yakında</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: theme.spacing.xl }} />
          </ScrollView>
        </ScreenContainer>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    zIndex: 1000,
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
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingBottom: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.base,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.xl,
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
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    opacity: 0.6,
    minHeight: 80,
    marginBottom: theme.spacing.md,
  },
  comingSoonIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
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
  // New categorized styles
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
    gap: theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
  },
  emptyStateText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  categoryTitle: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    flex: 1,
  },
  categoryList: {
    gap: theme.spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    minHeight: 80,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconEmoji: {
    fontSize: 24,
  },
});

export default ExploreSearchScreen;