import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Icon,
  Button,
  EquipmentSection,
  TabSelector,
  PostsGrid,
  UserProfileLayout,
  AppHeader,
  ScreenContainer,
  FishivoModal,
  Skeleton,
  SkeletonItem,
} from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';
import { useTranslation } from '@/contexts/LanguageContext';
import { userServiceNative, postsServiceNative, createNativeApiService } from '@fishivo/api';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { useNavigationWithLock } from '@/hooks/useNavigationWithLock';
import { useFollow } from '@/hooks/useFollow';
import { useFollowStore } from '@/stores/followStore';
import type { NativeUserProfile, UserEquipmentNative, PostWithUser } from '@fishivo/api';

interface UserProfileProps {
  route: {
    params: {
      userId: string;
    };
  };
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: object) => void;
  };
}

const { width: screenWidth } = Dimensions.get('window');
const UserProfileScreen: React.FC<UserProfileProps> = ({ route, navigation: _navigation }) => {
  const navigation = useNavigationWithLock();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { userId } = route.params;
  const { user: currentUser } = useSupabaseUser();
  
  // Follow system with optimistic updates
  const { 
    isFollowing, 
    isLoading: isFollowPending,
    followersCount: dynamicFollowersCount,
    setFollowersCount,
    toggleFollow,
    canFollow,
  } = useFollow(userId, {
    onError: (error) => {
      setModalMessage(error);
      setModals(prev => ({ ...prev, error: true }));
    }
  });
  
  // Block status - will be implemented later
  const [activeTab, setActiveTab] = useState<'posts' | 'equipment'>('posts');
  const styles = createStyles(theme);
  const [user, setUser] = useState<NativeUserProfile | null>(null);
  const [userCatches, setUserCatches] = useState<PostWithUser[]>([]);
  const [userEquipment, setUserEquipment] = useState<UserEquipmentNative[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [equipmentLoaded, setEquipmentLoaded] = useState(false);

  // Single modal state object
  const [modals, setModals] = useState({
    error: false,
    reportReason: false,
    options: false,
    share: false,
    blockConfirm: false,
    success: false
  });
  const [modalMessage, setModalMessage] = useState('');
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const loadUserProfileData = useCallback(async (loadEquipment = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is blocked
      if (currentUser) {
        const apiService = createNativeApiService();
        const blockedUsers = await apiService.contacts.getBlockedUsers(currentUser.id);
        const isBlocked = blockedUsers.some(blocked => blocked.blocked_id === userId);
        
        if (isBlocked) {
          setError(t('profile.userProfile.userBlocked'));
          setLoading(false);
          return;
        }
      }
      
      // Load profile and posts initially, equipment only when needed
      const promises: Promise<any>[] = [
        userServiceNative.getUserProfile(userId, currentUser?.id),
        postsServiceNative.getUserPosts(userId, 20, 0, currentUser?.id)
      ];

      // Load equipment only when equipment tab is selected or force load
      if (loadEquipment || activeTab === 'equipment') {
        promises.push(userServiceNative.getUserEquipment(userId));
      }

      const results = await Promise.allSettled(promises);

      // Handle profile data
      const profileResult = results[0];
      if (profileResult.status === 'fulfilled' && profileResult.value) {
        const profileData = profileResult.value;
        setUser(profileData);
        
        // Smart followers count update - respect optimistic updates
        const storeStats = useFollowStore.getState().getUserStats(userId);
        const FRESHNESS_THRESHOLD = 60000; // 1 minute
        const isStoreFresh = storeStats && (Date.now() - storeStats.lastUpdated < FRESHNESS_THRESHOLD);
        
        if (!isStoreFresh) {
          // Store is stale or empty, safe to update from DB
          setFollowersCount(profileData.followers_count || 0);
          
          // Also update the store with DB value for consistency
          useFollowStore.getState().updateUserStats(userId, {
            followers_count: profileData.followers_count || 0,
            following_count: profileData.following_count || 0
          });
        }
        // If store is fresh, keep the optimistic value (don't override)
        
      } else {
        throw new Error(t('profile.userNotFound'));
      }

      // Handle posts data
      const postsResult = results[1];
      if (postsResult.status === 'fulfilled') {
        setUserCatches(postsResult.value || []);
      }

      // Handle equipment data if loaded
      if (results.length > 2) {
        const equipmentResult = results[2];
        if (equipmentResult.status === 'fulfilled') {
          setUserEquipment(equipmentResult.value || []);
          setEquipmentLoaded(true);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('common.error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, t, activeTab, currentUser?.id, setFollowersCount]);

  // Component mount olduğunda ve userId değiştiğinde çağır
  useEffect(() => {
    loadUserProfileData();
  }, [userId, loadUserProfileData]); // Fresh data için dependency gerekli
  
  // Real-time updates handled by global follow store
  // User stats updates handled by global store automatically

  // Load equipment when tab changes
  useEffect(() => {
    if (activeTab === 'equipment' && !equipmentLoaded && userId && !loading) {
      userServiceNative.getUserEquipment(userId).then(equipment => {
        setUserEquipment(equipment || []);
        setEquipmentLoaded(true);
      });
    }
  }, [activeTab, equipmentLoaded, userId, loading]);

  const tabs = [
    { id: 'posts', label: t('profile.tabs.catches_others'), icon: 'fish' },
    { id: 'equipment', label: t('profile.tabs.gear_others'), icon: 'backpack' },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadUserProfileData(equipmentLoaded);
    } finally {
      setRefreshing(false);
    }
  }, [equipmentLoaded, loadUserProfileData]);

  const handleShare = useCallback(async () => {
    setModals(prev => ({ ...prev, options: false, share: true }));
  }, []);

  const handleNativeShare = useCallback(async () => {
    if (!user) return;
    try {
      await Share.share({
        title: t('profile.userProfile.profileShareTitle', { name: user.full_name }),
        message: t('profile.userProfile.profileShareMessage', { 
          name: user.full_name, 
          count: 0 
        }),
        url: 'https://fishivo.app/profile/' + user.id,
      });
      setModals(prev => ({ ...prev, share: false }));
    } catch (shareError: unknown) {
      // Silently handle share errors
    }
  }, [user, t]);

  const handleCopyLink = useCallback(() => {
    // Clipboard copy functionality burada olacak
    setSuccessMessage(t('profile.userProfile.linkCopied'));
    setModals(prev => ({ ...prev, share: false, success: true }));
  }, [t]);

  // handleFollow SİLİNDİ - Direkt FollowContext kullanılıyor

  const handleBlock = useCallback(() => {
    setModals(prev => ({ ...prev, options: false, blockConfirm: true }));
  }, []);

  const confirmBlock = useCallback(async () => {
    if (!user || !currentUser) return;
    
    try {
      const apiService = createNativeApiService();
      await apiService.contacts.blockUser(currentUser.id, userId);
      
      setSuccessMessage(t('profile.userProfile.blockSuccess', { name: user.full_name }));
      setModals(prev => ({ ...prev, blockConfirm: false, success: true }));
      
      // Navigate back after successful block
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      setModalMessage(t('profile.userProfile.blockError'));
      setModals(prev => ({ ...prev, blockConfirm: false, error: true }));
    }
  }, [user, currentUser, userId, t, navigation]);

  const handleReport = useCallback(() => {
    setModals(prev => ({ ...prev, options: false, reportReason: true }));
  }, []);
  
  const handleReportReasonSelect = useCallback(() => {
    if (!selectedReportReason) return;
    setSuccessMessage(t('profile.userProfile.reportSuccess'));
    setModals(prev => ({ ...prev, reportReason: false, success: true }));
    setSelectedReportReason(null);
  }, [selectedReportReason, t]);

  const handleStatPress = useCallback((index: number) => {
    if (!user) return;
    
    switch (index) {
      case 0: // Posts/Catches
        // Navigate to user's posts
        break;
      case 1: // Followers
        navigation.navigate('Followers', { userId, userName: user.full_name || user.username });
        break;
      case 2: // Following
        navigation.navigate('Following', { userId, userName: user.full_name || user.username });
        break;
      default:
        break;
    }
  }, [user, navigation, userId]);

  const handlePostPress = useCallback((post: PostWithUser) => {
    navigation.navigate('PostDetail', { 
      postData: {
        id: post.id,
        user: {
          name: post.user.full_name,
          avatar: post.user.avatar_url || '',
          location: user?.location || '',
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
        coordinates: post.location ? [post.location.longitude, post.location.latitude] : undefined,
        method: post.catch_details?.technique,
        released: post.catch_details?.released,
        weather: post.catch_details?.weather
      }
    });
  }, [navigation, user?.location]);

  const equipmentData = useMemo(() => 
    userEquipment.map(eq => ({
      id: eq.id,
      name: eq.name,
      category: eq.category,
      brand: eq.brand || '',
      icon: eq.icon || '',
      imageUrl: eq.image_url,
      condition: eq.condition
    })),
    [userEquipment]
  );

  const renderContent = useCallback(() => {
    if (activeTab === 'posts') {
      return (
        <PostsGrid
          data={userCatches}
          noPadding={true}
          onPostPress={handlePostPress}
        />
      );
    } else {
      return (
        <View style={styles.equipmentContainer}>
          <EquipmentSection
            equipment={equipmentData}
          />
        </View>
      );
    }
  }, [activeTab, userCatches, handlePostPress, equipmentData, styles.equipmentContainer]);

  // Prepare userData for UserProfileLayout
  const userProfileData = useMemo(() => ({
    name: user?.full_name || 'Unknown User',
    username: user?.username || '',
    avatar: typeof user?.avatar_url === 'string' 
            ? user.avatar_url 
            : user?.avatar_url && typeof user.avatar_url === 'object' && 'medium' in user.avatar_url
            ? (user.avatar_url as { medium?: string }).medium || undefined 
            : undefined,
    location: user?.location || '',
    countryCode: user?.country_code || '',
    bio: user?.bio || '',
    isPro: user?.is_pro || false,
    catchCount: user?.total_catches || 0,
    followers: dynamicFollowersCount || user?.followers_count || 0,
    following: user?.following_count || 0,
    instagram_url: user?.instagram_url || undefined,
    facebook_url: user?.facebook_url || undefined,
    youtube_url: user?.youtube_url || undefined,
    twitter_url: user?.twitter_url || undefined,
    tiktok_url: user?.tiktok_url || undefined,
    website: user?.website || undefined,
    coverImage: typeof user?.cover_image_url === 'string' 
               ? user.cover_image_url 
               : user?.cover_image_url && typeof user.cover_image_url === 'object' && 'medium' in user.cover_image_url
               ? (user.cover_image_url as { medium?: string }).medium || undefined 
               : undefined
  }), [user, dynamicFollowersCount]);

  // Prepare onPrimaryAction callback
  const handleEditProfile = useCallback(() => navigation.navigate('EditProfile'), [navigation]);

  // Loading state will be handled inline with Skeleton, not separate screen

  if (!user && error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('common.error')}
          onBackPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          }}
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button variant="primary" onPress={() => {
            setError(null);
            setLoading(true);
            loadUserProfileData();
          }}>
            {t('common.retry')}
          </Button>
        </View>
      </View>
    );
  }

  // Skeleton screen for loading state
  if (loading && !user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader
          title=" "
          onBackPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          }}
          rightButtons={[
            {
              icon: 'more-vertical',
              onPress: () => {}
            }
          ]}
        />

        <ScreenContainer paddingVertical="none">
          <ScrollView
            contentContainerStyle={[styles.scrollContent, theme.listContentStyleWithTabBar]}
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
              {/* Username only (no social media) */}
              <View style={styles.usernameRow}>
                <Skeleton>
                  <SkeletonItem width={100} height={16} borderRadius={4} />
                </Skeleton>
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
        title={loading ? ' ' : (user?.full_name || t('common.loading'))}
        onBackPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('MainTabs');
          }
        }}
        rightButtons={[
          {
            icon: 'more-vertical',
            onPress: () => setModals(prev => ({ ...prev, options: true }))
          }
        ]}
      />

      <ScreenContainer paddingVertical="none">
        <ScrollView
          contentContainerStyle={[styles.scrollContent, theme.listContentStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <UserProfileLayout
              userData={userProfileData}
              onPrimaryAction={handleEditProfile}
              onShareAction={handleShare}
              onFollowToggle={toggleFollow}
              followDisabled={!canFollow || isFollowPending}
              isFollowing={isFollowing}
              onStatPress={handleStatPress}
            />
          <View style={styles.tabsContainer}>
            <TabSelector
              tabs={tabs}
              activeTab={activeTab}
              onTabPress={(tabId) => setActiveTab(tabId as 'posts' | 'equipment')}
            />
            {renderContent()}
          </View>
        </ScrollView>
      </ScreenContainer>

      <FishivoModal
        visible={modals.options}
        title={t('profile.userProfile.options')}
        description={t('profile.userProfile.aboutUser', { name: user?.full_name || '' })}
        onClose={() => setModals(prev => ({ ...prev, options: false }))}
        buttons={[
          {
            text: t('profile.userProfile.report'),
            icon: 'flag',
            onPress: handleReport,
            variant: 'secondary'
          },
          {
            text: t('profile.userProfile.block'),
            icon: 'user-x',
            onPress: handleBlock,
            variant: 'secondary'
          }
        ]}
      />

      {/* Share Modal */}
      <FishivoModal
        visible={modals.share}
        title={t('profile.userProfile.profileShareOptions')}
        onClose={() => setModals(prev => ({ ...prev, share: false }))}
      >
        <Text style={styles.modalSubtitle}>{t('profile.userProfile.shareUserProfile', { name: user?.full_name || '' })}</Text>

        <View style={styles.shareOptionsList}>

          <TouchableOpacity style={styles.shareOptionItem} onPress={handleNativeShare}>
            <Icon name="share" size={24} color={theme.colors.primary} />
            <View style={styles.shareOptionInfo}>
              <Text style={styles.shareOptionTitle}>{t('profile.userProfile.systemShare')}</Text>
              <Text style={styles.shareOptionDesc}>{t('profile.userProfile.systemShareDesc')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareOptionItem} onPress={handleCopyLink}>
            <Icon name="copy" size={24} color={theme.colors.primary} />
            <View style={styles.shareOptionInfo}>
              <Text style={styles.shareOptionTitle}>{t('profile.userProfile.copyLink')}</Text>
              <Text style={styles.shareOptionDesc}>{t('profile.userProfile.copyLinkDesc')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.shareOptionItem, styles.cancelShareOption]}
            onPress={() => setModals(prev => ({ ...prev, share: false }))}
          >
            <Icon name="x" size={24} color={theme.colors.text} />
            <View style={styles.shareOptionInfo}>
              <Text style={styles.shareOptionTitle}>{t('common.cancel')}</Text>
              <Text style={styles.shareOptionDesc}>{t('profile.userProfile.cancelShare')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </FishivoModal>

      <FishivoModal
        visible={modals.blockConfirm}
        title={t('profile.userProfile.blockUser')}
        onClose={() => setModals(prev => ({ ...prev, blockConfirm: false }))}
        preset="delete"
        description={t('profile.userProfile.blockUserMessage', { name: user?.full_name || '' })}
        primaryButton={{
          text: t('profile.userProfile.blockConfirm'),
          onPress: confirmBlock,
          variant: 'destructive'
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => setModals(prev => ({ ...prev, blockConfirm: false }))
        }}
      />

      {/* Report Reason Modal */}
      <FishivoModal
        visible={modals.reportReason}
        title={t('profile.userProfile.reportReasonTitle')}
        description={t('profile.userProfile.reportReasonSelect')}
        onClose={() => {
          setModals(prev => ({ ...prev, reportReason: false }));
          setSelectedReportReason(null);
        }}
        preset="selector"
        renderRadioOptions={{
          options: [
            { key: 'spam', label: t('profile.userProfile.reportReasons.spam') },
            { key: 'inappropriate', label: t('profile.userProfile.reportReasons.inappropriate') },
            { key: 'harassment', label: t('profile.userProfile.reportReasons.harassment') },
            { key: 'fake', label: t('profile.userProfile.reportReasons.fake') },
            { key: 'other', label: t('profile.userProfile.reportReasons.other') }
          ],
          selectedKey: selectedReportReason,
          onSelect: setSelectedReportReason
        }}
        primaryButton={{
          text: t('profile.userProfile.reportConfirm'),
          onPress: handleReportReasonSelect,
          disabled: !selectedReportReason,
          variant: 'destructive'
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => {
            setModals(prev => ({ ...prev, reportReason: false }));
            setSelectedReportReason(null);
          }
        }}
      />

      <FishivoModal
        visible={modals.success}
        title={t('common.success')}
        onClose={() => setModals(prev => ({ ...prev, success: false }))}
        preset="success"
        description={successMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setModals(prev => ({ ...prev, success: false }))
        }}
      />

      {/* Error Modal */}
      <FishivoModal
        visible={modals.error}
        onClose={() => setModals(prev => ({ ...prev, error: false }))}
        preset="error"
        title={t('common.error')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setModals(prev => ({ ...prev, error: false }))
        }}
      />

    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  scrollContent: {},
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  equipmentContainer: {
    // EquipmentSection'ın kendi marginHorizontal'ı var
  },

  modalSubtitle: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  optionsList: {
    width: '100%',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    width: '100%',
    gap: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  optionText: {
    fontSize: theme.typography.lg,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  cancelOption: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.lg,
  },
  shareOptionsList: {
    width: '100%',
  },
  shareOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    width: '100%',
    gap: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  shareOptionInfo: {
    flex: 1,
  },
  shareOptionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
  },
  shareOptionDesc: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  cancelShareOption: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  // Skeleton styles
  coverContainer: {
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.sm,
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
  tabsContainer: {
    flex: 1,
  },
});

export default UserProfileScreen; 