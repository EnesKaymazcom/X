import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Icon,
  TabSelector,
  UserProfileLayout,
  AppHeader,
  ScreenContainer,
  FishivoModal,
  EquipmentSection,
  ShareModal,
  PostsGrid,
  Skeleton,
  SkeletonItem,
} from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';
import { useTranslation } from '@/contexts/LanguageContext';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { createNativeApiService } from '@fishivo/api/services/native';
import type { NativeUserProfile, PostWithUser } from '@fishivo/api';
import { uploadCoverImage } from '@/utils/cover-upload';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, MainTabParamList } from '@/types/navigation';
import { useProfileData } from './useProfileData';
import { useFollowStore } from '@/stores/followStore';
import { useProfileStore } from '@/stores/profileStore';
import type { ProfileTab } from './types';

type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  StackScreenProps<RootStackParamList>
>;

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const {
    loadingState,
    user,
    profile,
    stats,
    catches,
    gearItems,
    gearLoaded,
    error,
    refreshProfile,
    updateCoverImage,
    loadEquipment,
  } = useProfileData();

  // Local UI state
  const [activeTab, setActiveTab] = useState<ProfileTab>('catches');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGearId, setSelectedGearId] = useState<string | null>(null);

  // Load equipment when gear tab is selected
  useEffect(() => {
    if (activeTab === 'gear' && !gearLoaded) {
      loadEquipment();
    }
  }, [activeTab, gearLoaded, loadEquipment]);

  // Check for store updates and refresh profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      
      // Get latest stats from store when screen focuses
      const currentStoreStats = useFollowStore.getState().getUserStats(user.id);
      if (currentStoreStats) {
        // Stats will be updated via the subscription in useProfileData
        // This just ensures we have the latest data when navigating back
      }
      
      // Only refresh if profile has been marked as changed
      const profileStore = useProfileStore.getState();
      if (profileStore.hasProfileChanged(user.id)) {
        refreshProfile();
        // Mark as refreshed to prevent infinite loop
        profileStore.markProfileAsRefreshed(user.id);
      }
    }, [user?.id, refreshProfile])
  );


  // Memoized tabs
  const tabs = useMemo(() => [
    { id: 'catches', label: t('profile.tabs.catches'), icon: 'fish' },
    { id: 'gear', label: t('profile.tabs.gear'), icon: 'backpack' },
  ], [t]);

  // Handle gear deletion
  const handleDeleteGear = useCallback((gearId: string) => {
    setSelectedGearId(gearId);
    setShowDeleteModal(true);
  }, []);

  // Handle cover image upload
  const handleCoverImageUpload = useCallback(async () => {
    try {
      const result = await uploadCoverImage();
      
      if (result.success && result.coverUrl) {
        // Update local state
        updateCoverImage(result.coverUrl);
        
        // Update in database
        const apiService = createNativeApiService();
        await apiService.user.updateUserProfile(user?.id || '', {
          cover_image_url: result.coverUrl
        } as Partial<NativeUserProfile>);
        
        // Update auth metadata
        const supabase = getNativeSupabaseClient();
        await supabase.auth.updateUser({
          data: { cover_image_url: result.coverUrl }
        });
        
        setModalMessage(t('profile.coverImageUpdated'));
        setShowSuccessModal(true);
      } else if (result.error && result.error !== 'cancelled') {
        setModalMessage(result.error);
        setShowErrorModal(true);
      }
    } catch {
      setModalMessage(t('profile.coverImageError'));
      setShowErrorModal(true);
    }
  }, [user, t, updateCoverImage]);

  // Confirm gear deletion
  const confirmDeleteGear = useCallback(async () => {
    if (!selectedGearId) return;
    
    setShowDeleteModal(false);
    
    try {
      const apiService = createNativeApiService();
      const success = await apiService.equipment.deleteEquipment(selectedGearId);
      
      if (success) {
        await refreshProfile();
      } else {
        setModalMessage(t('profile.equipment.deleteError'));
        setShowErrorModal(true);
      }
    } catch {
      setModalMessage(t('profile.equipment.deleteError'));
      setShowErrorModal(true);
    }
    
    setSelectedGearId(null);
  }, [selectedGearId, t, refreshProfile]);

  const handleStatPress = useCallback((index: number, stat: { value: number; label: string }) => {
    if (!user?.id) return;
    
    // Navigate based on which stat was pressed
    if (stat.label === t('profile.stats.followers')) {
      navigation.navigate('Followers', { 
        userId: user.id,
        userName: profile.name || profile.username 
      });
    } else if (stat.label === t('profile.stats.following')) {
      navigation.navigate('Following', { 
        userId: user.id,
        userName: profile.name || profile.username 
      });
    } else if (stat.label === t('profile.stats.catches')) {
      // Catches tab'a scroll yap
      setActiveTab('catches');
    }
  }, [user?.id, profile.name, profile.username, navigation, t]);

  // Handle post press
  const handlePostPress = useCallback((post: PostWithUser) => {
    navigation.navigate('PostDetail', { 
      postData: {
        id: post.id,
        user: {
          id: post.user_id,
          name: post.user.full_name || 'Unknown User',
          avatar: post.user.avatar_url || '',
          location: profile.location || '',
          isPro: post.user.is_pro
        },
        fish: {
          species: post.catch_details?.species || 'Unknown',
          speciesId: post.catch_details?.species_id,
          weight: post.catch_details?.weight ? `${post.catch_details.weight} kg` : '0 kg',
          length: post.catch_details?.length ? `${post.catch_details.length} cm` : '0 cm'
        },
        images: post.images || [],
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        timeAgo: new Date(post.created_at).toLocaleDateString(),
        description: post.content,
        privateNote: post.private_note || null,
        coordinates: post.location && typeof post.location.longitude === 'number' && typeof post.location.latitude === 'number' 
          ? [post.location.longitude, post.location.latitude] 
          : undefined,
        method: post.catch_details?.technique,
        released: post.catch_details?.released,
        weather: post.catch_details?.weather
      }
    });
  }, [navigation, profile.location]);

  // Render tab content
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'catches':
        return <PostsGrid data={catches} onPostPress={handlePostPress} noPadding={true} />;
      case 'gear':
        return (
          <EquipmentSection 
            equipment={gearItems}
            onDeleteGear={handleDeleteGear} 
            showStats={true}
            variant="default"
          />
        );
      default:
        return null;
    }
  }, [activeTab, catches, gearItems, handleDeleteGear, handlePostPress]);

  // Loading state check - show skeleton when initial loading
  const isLoading = loadingState === 'loading' || loadingState === 'initial' || (!profile.name && !error);
  const isRefreshing = loadingState === 'refreshing';

  // Skeleton screen for loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader
          title=" "
          rightButtons={[
            {
              icon: 'search',
              onPress: () => navigation.navigate('ExploreSearch')
            },
            {
              icon: 'bell',
              onPress: () => navigation.navigate('Notifications')
            },
            {
              icon: 'settings',
              onPress: () => navigation.navigate('Settings')
            }
          ]}
        />

        <ScreenContainer paddingVertical="none">
          <ScrollView 
            contentContainerStyle={theme.listContentStyleWithTabBar} 
            showsVerticalScrollIndicator={false}
          >
            {/* Cover + Avatar Section */}
            <View style={styles.coverContainer}>
              <Skeleton>
                <SkeletonItem width="100%" height={screenWidth * 0.32} borderRadius={theme.spacing.sm} />
              </Skeleton>
              <View style={styles.profileSection}>
                <View style={styles.avatarWrapper}>
                  <View style={[styles.avatarBorder, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                    <Skeleton>
                      <SkeletonItem width={69} height={69} borderRadius={34.5} />
                    </Skeleton>
                  </View>
                </View>
                <View style={styles.buttonsContainer}>
                  <Skeleton>
                    <SkeletonItem width={100} height={32} borderRadius={theme.borderRadius.md} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={32} height={32} borderRadius={theme.borderRadius.md} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={32} height={32} borderRadius={theme.borderRadius.md} />
                  </Skeleton>
                </View>
              </View>
            </View>

            {/* Stats Section - 3 CONTAINER */}
            <View style={styles.statsContainer}>
              <View style={styles.statItemSkeleton}>
                <Skeleton>
                  <SkeletonItem width="100%" height="100%" borderRadius={theme.borderRadius.lg} />
                </Skeleton>
              </View>
              <View style={styles.statItemSkeleton}>
                <Skeleton>
                  <SkeletonItem width="100%" height="100%" borderRadius={theme.borderRadius.lg} />
                </Skeleton>
              </View>
              <View style={styles.statItemSkeleton}>
                <Skeleton>
                  <SkeletonItem width="100%" height="100%" borderRadius={theme.borderRadius.lg} />
                </Skeleton>
              </View>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfoContainer}>
              {/* Username + Social */}
              <View style={styles.usernameRow}>
                <Skeleton>
                  <SkeletonItem width={100} height={16} borderRadius={4} />
                </Skeleton>
                <View style={styles.socialIcons}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i}>
                      <SkeletonItem width={16} height={16} borderRadius={8} />
                    </Skeleton>
                  ))}
                </View>
              </View>
              
              {/* Location */}
              <View style={styles.locationRowSkeleton}>
                <Skeleton>
                  <SkeletonItem width={14} height={14} borderRadius={2} />
                </Skeleton>
                <Skeleton>
                  <SkeletonItem width={120} height={14} borderRadius={4} />
                </Skeleton>
                <Skeleton>
                  <SkeletonItem width={16} height={16} borderRadius={8} />
                </Skeleton>
              </View>
              
              {/* Bio */}
              <View style={styles.bioContainer}>
                <Skeleton>
                  <SkeletonItem width="100%" height={14} borderRadius={4} />
                </Skeleton>
                <Skeleton>
                  <SkeletonItem width="80%" height={14} borderRadius={4} marginTop={6} />
                </Skeleton>
              </View>
            </View>

            {/* Your Map Card */}
            <View style={styles.quickActionsSection}>
              <Skeleton>
                <SkeletonItem width="100%" height={64} borderRadius={theme.borderRadius.lg} />
              </Skeleton>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <View style={styles.tabWrapper}>
                <View style={styles.tabItemSkeleton}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={50} height={14} borderRadius={4} marginLeft={8} />
                  </Skeleton>
                </View>
                <View style={styles.tabItemSkeleton}>
                  <Skeleton>
                    <SkeletonItem width={18} height={18} borderRadius={4} />
                  </Skeleton>
                  <Skeleton>
                    <SkeletonItem width={45} height={14} borderRadius={4} marginLeft={8} />
                  </Skeleton>
                </View>
              </View>
            </View>

            {/* Posts Grid */}
            <View style={styles.postsContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                <View key={item} style={styles.postItem}>
                  <Skeleton>
                    <SkeletonItem width="100%" height="100%" borderRadius={theme.borderRadius.sm} />
                  </Skeleton>
                </View>
              ))}
            </View>
          </ScrollView>
        </ScreenContainer>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={profile.name}
        rightButtons={[
          {
            icon: 'search',
            onPress: () => navigation.navigate('ExploreSearch')
          },
          {
            icon: 'bell',
            onPress: () => navigation.navigate('Notifications')
          },
          {
            icon: 'settings',
            onPress: () => navigation.navigate('Settings')
          }
        ]}
      />

      <ScreenContainer paddingVertical="none">
        <ScrollView 
          contentContainerStyle={theme.listContentStyleWithTabBar} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refreshProfile}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          <UserProfileLayout
            userData={{
              name: profile.name,
              username: profile.username,
              location: profile.location,
              countryCode: profile.countryCode,
              bio: profile.bio,
              avatar: profile.avatar,
              coverImage: profile.coverImage,
              isPro: profile.isPro,
              catchCount: stats.totalCatches,
              followers: stats.totalFollowers,
              following: stats.totalFollowing,
              instagram_url: profile.instagram_url,
              facebook_url: profile.facebook_url,
              youtube_url: profile.youtube_url,
              twitter_url: profile.twitter_url,
              tiktok_url: profile.tiktok_url,
              website: profile.website,
            }}
            isOwnProfile={true}
            onPrimaryAction={() => navigation.navigate('EditProfile')}
            onShareAction={() => setShowShareModal(true)}
            onFindFriends={() => navigation.navigate('FindFriends')}
            onProPress={() => navigation.navigate('Premium')}
            onCoverImagePress={handleCoverImageUpload}
            onStatPress={handleStatPress}
            noPadding={true}
          />

          <View style={styles.quickActionsSection}>
            <TouchableOpacity 
              style={styles.yourMapCard}
              onPress={() => navigation.navigate('YourMap')}
            >
              <View style={styles.yourMapIcon}>
                <Icon name="navigation" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.yourMapContent}>
                <Text style={styles.yourMapTitle}>{t('map.yourMap.title')}</Text>
                <Text style={styles.yourMapSubtitle}>
                  {t('map.yourMap.subtitle')}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TabSelector
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={(tabId) => setActiveTab(tabId as ProfileTab)}
          />

          {renderTabContent()}
        </ScrollView>
      </ScreenContainer>

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        username={profile.username}
      />

      {/* Error Modal */}
      <FishivoModal
        visible={showErrorModal || !!error}
        onClose={() => setShowErrorModal(false)}
        preset="error"
        title={t('common.error')}
        description={modalMessage || error || ''}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowErrorModal(false)
        }}
      />

      {/* Success Modal */}
      <FishivoModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        preset="success"
        title={t('common.success')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowSuccessModal(false)
        }}
      />

      {/* Delete Confirmation Modal */}
      <FishivoModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        preset="delete"
        title={t('profile.equipment.deleteTitle')}
        description={t('profile.equipment.deleteMessage')}
        primaryButton={{
          text: t('common.delete'),
          onPress: confirmDeleteGear
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => setShowDeleteModal(false)
        }}
      />
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  quickActionsSection: {
    marginBottom: theme.spacing.md,
  },
  yourMapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    minHeight: 64,
  },
  yourMapIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yourMapContent: {
    flex: 1,
  },
  yourMapTitle: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  yourMapSubtitle: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  // Skeleton styles
  coverContainer: {
    width: '100%',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  avatarWrapper: {
    marginTop: -(69 / 2),
  },
  avatarBorder: {
    padding: 3,
    borderRadius: (69 + 6) / 2,
    borderWidth: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statItemSkeleton: {
    flex: 1,
    height: 56,
  },
  profileInfoContainer: {
    paddingVertical: theme.spacing.md,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  locationRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  bioContainer: {
    marginTop: theme.spacing.xs,
  },
  tabContainer: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  tabWrapper: {
    flexDirection: 'row',
    gap: theme.spacing.xs / 2,
  },
  tabItemSkeleton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  postsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  postItem: {
    width: '33.333%',
    aspectRatio: 1,
    padding: 1,
  },
});

export default ProfileScreen;