import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ViewToken,
  InteractionManager,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { postsServiceNative, createNativeApiService } from '@fishivo/api';
import { getNativeSupabaseClient } from '@fishivo/api';
const nativeSupabase = getNativeSupabaseClient();
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatchCard, AppHeader, ScreenContainer, FishivoModal, EmptyState, Skeleton, SkeletonItem } from '@/components/ui';
import { useFollowStore } from '@/stores/followStore';
import { useLikeStore } from '@/stores/likeStore';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUnits } from '@fishivo/hooks';
import { ReportReason, FishSpecies } from '@fishivo/types';
import type { LikeState } from '@/stores/likeStore';
import CommentEventEmitter from '@/utils/CommentEventEmitter';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;
interface CatchItem {
  id: number; // Database BIGINT
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    location: string;
    country?: string;
    isPro?: boolean;
  };
  fish: {
    species: string;
    speciesId?: string;
    speciesImage?: string;
    weight: string;
    length: string;
  };
  image: string;
  images?: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  description?: string | null;
  isLiked?: boolean;
  hasUserCommented?: boolean;
  coordinates?: [number, number]; // [longitude, latitude]
  catchLocation?: string; // Av lokasyonu adı
  catchCountryCode?: string; // Av lokasyonunun ülke kodu
  privateNote?: string; // Private note - only visible to post owner
  equipmentDetails?: Array<{
    id: string;
    name: string;
    category: string;
    brand?: string;
    icon: string;
    condition: 'excellent' | 'good' | 'fair';
  }>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t, locale } = useTranslation();
  const { formatWeight, formatLength } = useUnits();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const apiService = createNativeApiService();
  const [posts, setPosts] = useState<CatchItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CatchItem | null>(null);
  const [selectedReportReason, setSelectedReportReason] = useState<ReportReason | null>(null);
  const [followingPending, setFollowingPending] = useState<Set<string>>(new Set());
  
  // İlk yükleme takibi için ref
  const hasInitiallyLoadedRef = useRef(false);
  
  // Global follow store
  const { getFollowStatus, followUser: globalFollowUser, unfollowUser: globalUnfollowUser } = useFollowStore();
  
  // Global like store
  const likeStore = useLikeStore();
  
  // Single modal state
  const [modals, setModals] = useState({
    options: false,
    ownPostOptions: false,
    deleteConfirm: false,
    block: false,
    success: false,
    error: false,
    report: false,
    reportSuccess: false,
    reportError: false
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // Global species cache for better performance
  const speciesCacheRef = useRef<Map<string, FishSpecies>>(new Map());
  const formatTimeAgo = useCallback((dateString: string): string => {
    try {
      const now = new Date();
      const created = new Date(dateString);
      const diffMs = now.getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffMins < 1) return t('time.now');
      if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
      if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
      if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
      return created.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US');
    } catch (error) {
      return t('common.unknown');
    }
  }, [locale, t]);
  // Get species data
  const getSpeciesData = useCallback(async (speciesId: string) => {
    if (!speciesId) return null;
    
    if (speciesCacheRef.current.has(speciesId)) {
      const species = speciesCacheRef.current.get(speciesId);
      if (species) {
        return {
          name: locale === 'tr' 
            ? (species.common_names_tr?.[0] || species.common_name)
            : species.common_name,
          image_url: species.image_url
        };
      }
    }
    
    try {
      const species = await apiService.species.getSpeciesById(speciesId);
      if (species) {
        speciesCacheRef.current.set(speciesId, species);
        return {
          name: locale === 'tr' 
            ? (species.common_names_tr?.[0] || species.common_name)
            : species.common_name,
          image_url: species.image_url
        };
      }
    } catch (error) {}
    return null;
  }, [apiService.species, locale]);
  // Load complete home data - optimized single render approach
  const loadCompleteHomeData = useCallback(async (forceRefresh: boolean = true) => {
    try {
      const { data: { user } } = await nativeSupabase.auth.getUser();
      const userId = user?.id;
      setCurrentUserId(userId || null);
      const apiPosts = await postsServiceNative.getPosts(20, 0, userId, forceRefresh);
      
      const formattedCatches = (apiPosts && Array.isArray(apiPosts) ? apiPosts : [])
        .map((post) => ({
          id: post.id,
          user: {
            id: post.user_id,
            name: post.user?.full_name || post.user?.username || t('common.defaultUser'),
            avatar: post.user?.avatar_url || null,
            location: post.location?.name || t('common.noLocation'), // Av lokasyonu
            country: post.location?.country_code || '', // Bayrak için ülke kodu
            isPro: post.user?.is_pro || false
          },
          fish: {
            species: post.catch_details?.species_name || post.catch_details?.species || post.metadata?.species || t('common.defaultFish'),
            speciesId: post.catch_details?.species_id || post.metadata?.species_id,
            speciesImage: post.catch_details?.species_image || post.metadata?.species_image,
            weight: post.catch_details?.weight 
              ? formatWeight(parseFloat(post.catch_details.weight?.toString()) || 0, locale === 'tr' ? 'tr-TR' : 'en-US')
              : (post.metadata?.weight ? formatWeight(parseFloat(post.metadata.weight?.toString()) || 0, locale === 'tr' ? 'tr-TR' : 'en-US') : '0 kg'),
            length: post.catch_details?.length 
              ? formatLength(parseFloat(post.catch_details.length?.toString()) || 0, locale === 'tr' ? 'tr-TR' : 'en-US')
              : (post.metadata?.length ? formatLength(parseFloat(post.metadata.length?.toString()) || 0, locale === 'tr' ? 'tr-TR' : 'en-US') : '0 cm')
          },
          image: post.image_url || post.images?.[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
          images: post.images || (post.image_url ? [post.image_url] : []),
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          timeAgo: formatTimeAgo(post.created_at),
          description: post.content || null,
          isLiked: post.is_liked || false,
          hasUserCommented: post.has_user_commented === true,
          isSecret: post.is_secret || false,
          privateNote: post.private_note || undefined, // Private note from API
          coordinates: post.location?.latitude && post.location?.longitude 
            ? [post.location.longitude, post.location.latitude] as [number, number]
            : undefined,
          catchLocation: post.location?.name,
          catchCountryCode: post.location?.country_code,
          equipmentDetails: post.metadata?.gear ? post.metadata.gear.map((g: string, idx: number) => ({
            id: `gear-${idx}`,
            name: g,
            category: 'gear',
            icon: 'tool',
            condition: 'good' as const
          })) : []
        }));
      
      // Follow durumları artık global store'dan alınacak
      // Store otomatik olarak cache'leyecek ve güncel tutacak
      
      // Species data'yı batch olarak çek - daha az API çağrısı
      const uniqueSpeciesIds = [...new Set(formattedCatches.map(c => c.fish.speciesId).filter(Boolean))];
      
      // İlk 5 species'i hemen, diğerlerini sonra yükle
      const prioritySpeciesIds = uniqueSpeciesIds.slice(0, 5);
      const remainingSpeciesIds = uniqueSpeciesIds.slice(5);
      
      // Öncelikli species'leri çek
      await Promise.all(prioritySpeciesIds.map(id => getSpeciesData(id as string)));
      
      // Follow status'ları async olarak güncelle (UI'yı bloklamaz)
      setTimeout(() => {
        // refreshStatus kaldırıldı - optimistic update kullanıyoruz
      }, 100);
      
      // Kalan species'leri async olarak yükle (scroll/interactions sonrası)
      if (remainingSpeciesIds.length > 0) {
        InteractionManager.runAfterInteractions(() => {
          (async () => {
            await Promise.all(remainingSpeciesIds.map(id => getSpeciesData(id as string)));
            setPosts(currentPosts =>
              currentPosts.map((catchItem) => {
                if (catchItem.fish.speciesId && speciesCacheRef.current.has(catchItem.fish.speciesId)) {
                  const speciesData = speciesCacheRef.current.get(catchItem.fish.speciesId);
                  if (speciesData) {
                    return {
                      ...catchItem,
                      fish: {
                        ...catchItem.fish,
                        species: locale === 'tr'
                          ? (speciesData.common_names_tr?.[0] || speciesData.common_name)
                          : speciesData.common_name,
                        speciesImage: speciesData.image_url || catchItem.fish.speciesImage
                      }
                    };
                  }
                }
                return catchItem;
              })
            );
          })();
        });
      }
      
      // Complete data preparation - species names + all other data
      const completeDataCatches = formattedCatches.map((catchItem) => {
        if (catchItem.fish.speciesId && speciesCacheRef.current.has(catchItem.fish.speciesId)) {
          const speciesData = speciesCacheRef.current.get(catchItem.fish.speciesId);
          if (speciesData) {
            catchItem.fish.species = locale === 'tr' 
              ? (speciesData.common_names_tr?.[0] || speciesData.common_name)
              : speciesData.common_name;
            if (speciesData.image_url) {
              catchItem.fish.speciesImage = speciesData.image_url;
            }
          }
        }
        return catchItem;
      });
      
      // Single state update with complete data - prevents flickering
      setPosts(completeDataCatches);
      
      // On refresh, completely reset store with fresh data
      const likesToSync = completeDataCatches.map(post => {
        const postId = post.id.toString();
        const existingState = likeStore.getPostLikeState(postId);
        
        // If forceRefresh or no existing state, update with fresh data
        if (forceRefresh || !existingState || (Date.now() - existingState.lastUpdated > 30000)) {
          return {
            postId,
            state: {
              isLiked: post.isLiked || false,
              likesCount: post.likes || 0,
              lastUpdated: Date.now()
            }
          };
        }
        return null;
      }).filter(Boolean);
      
      if (likesToSync.length > 0) {
        likeStore.batchSetPostLikes(likesToSync as Array<{postId: string; state: LikeState}>);
      }
      
    } catch (error) {
      setPosts([]);
      setErrorMessage(t('errors.postsLoadError'));
      setModals(prev => ({ ...prev, error: true }));
    } finally {
      // Complete loading finished - show cards with all data
      setIsInitialLoading(false);
      setRefreshing(false);
    }
  }, [formatLength, formatWeight, formatTimeAgo, getSpeciesData, locale, t, likeStore]);
  useFocusEffect(
    useCallback(() => {
      // İlk yüklemede veya uzun süre sonra tekrar gelince fresh data al
      if (!hasInitiallyLoadedRef.current && posts.length === 0) {
        hasInitiallyLoadedRef.current = true;
        loadCompleteHomeData();
      }
      
      // Edit mode'dan güncellenmiş post gelmiş mi kontrol et
      const tabParams = route.params?.params as { updatedPost?: {
        id: number;
        content?: string;
        images?: string[];
        species?: string;
        speciesId?: string;
        weight?: number;
        length?: number;
        technique?: string;
        equipment?: string[];
        weather?: string;
        latitude?: number;
        longitude?: number;
      }} | undefined;
      if (tabParams?.updatedPost) {
        const updatedPost = tabParams.updatedPost;
        
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === updatedPost.id) {
            return {
              ...post,
              description: updatedPost.content,
              fish: {
                ...post.fish,
                species: updatedPost.species || post.fish.species,
                speciesId: updatedPost.speciesId || post.fish.speciesId,
                weight: updatedPost.weight 
                  ? formatWeight(updatedPost.weight, locale === 'tr' ? 'tr-TR' : 'en-US')
                  : post.fish.weight,
                length: updatedPost.length 
                  ? formatLength(updatedPost.length, locale === 'tr' ? 'tr-TR' : 'en-US')
                  : post.fish.length
              },
              images: updatedPost.images || post.images,
              image: updatedPost.images?.[0] || post.image,
              coordinates: updatedPost.latitude && updatedPost.longitude 
                ? [updatedPost.longitude, updatedPost.latitude] as [number, number]
                : post.coordinates,
              equipmentDetails: updatedPost.equipment ? updatedPost.equipment.map((g: string, idx: number) => ({
                id: `gear-${idx}`,
                name: g,
                category: 'gear',
                icon: 'tool',
                condition: 'good' as const
              })) : post.equipmentDetails
            };
          }
          return post;
        }));
        
        // Params'ı temizle (infinite loop'u önlemek için)
        navigation.setParams({ params: { updatedPost: undefined } });
      }
    }, [loadCompleteHomeData, route?.params?.params, formatWeight, formatLength, locale, navigation, posts.length]) // ESLint dependency fix
  );
  
  // Listen for comment events
  useEffect(() => {
    const unsubscribeAdded = CommentEventEmitter.onCommentAdded(({ postId, newCount, hasUserCommented }) => {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: newCount, hasUserCommented }
          : post
      ));
    });

    const unsubscribeDeleted = CommentEventEmitter.onCommentDeleted(({ postId, newCount, hasUserCommented }) => {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: newCount, hasUserCommented }
          : post
      ));
    });

    return () => {
      unsubscribeAdded();
      unsubscribeDeleted();
    };
  }, []);


  
  const onRefresh = () => {
    setRefreshing(true);
    // Force bypass cache on pull-to-refresh for fresh data
    loadCompleteHomeData(true);
  };
  // Report handlers
  const handleReport = useCallback(() => {
    if (!selectedPost) return;
    setModals(prev => ({ ...prev, options: false, report: true }));
    setSelectedReportReason(null);
  }, [selectedPost]);
  const confirmReport = async () => {
    if (!selectedPost || !selectedReportReason) return;
    try {
      const { data: { user } } = await nativeSupabase.auth.getUser();
      if (!user) {
        setModals(prev => ({ ...prev, report: false, reportError: true }));
        setErrorMessage(t('common.loginRequired'));
        return;
      }
      const success = await apiService.reports.reportPost(
        user.id,
        selectedPost.id,
        selectedReportReason
      );
      setModals(prev => ({ 
        ...prev, 
        report: false, 
        reportSuccess: success, 
        reportError: !success 
      }));
    } catch (error) {
      setModals(prev => ({ ...prev, report: false, reportError: true }));
    }
  };
  // Block handler
  const handleBlock = useCallback(() => {
    setModals(prev => ({ ...prev, options: false, block: true }));
  }, []);
  const confirmBlock = async () => {
    if (!selectedPost) return;
    setModals(prev => ({ ...prev, block: false }));
    
    try {
      const { data: { user } } = await nativeSupabase.auth.getUser();
      if (!user) {
        setErrorMessage(t('common.loginRequired'));
        setModals(prev => ({ ...prev, error: true }));
        return;
      }
      
      await apiService.contacts.blockUser(user.id, selectedPost.user.id);
      setPosts(prevPosts => prevPosts.filter(post => post.user.id !== selectedPost.user.id));
      setSuccessMessage(t('home.success.blocked'));
      setModals(prev => ({ ...prev, success: true }));
    } catch (error) {
      setErrorMessage(t('home.error.blockFailed'));
      setModals(prev => ({ ...prev, error: true }));
    }
  };
  
  // Edit post handler
  const handleEditPost = useCallback(() => {
    if (!selectedPost) return;
    setModals(prev => ({ ...prev, ownPostOptions: false }));
    
    // Navigate to AddCatchScreen with edit mode
    navigation.navigate('AddCatch', {
      editMode: true,
      postId: selectedPost.id,
      postData: selectedPost
    });
  }, [selectedPost, navigation]);
  
  // Delete post handler
  const handleDeletePost = useCallback(() => {
    setModals(prev => ({ ...prev, ownPostOptions: false, deleteConfirm: true }));
  }, []);
  
  const confirmDeletePost = async () => {
    if (!selectedPost) return;
    setModals(prev => ({ ...prev, deleteConfirm: false }));
    
    try {
      const success = await postsServiceNative.deletePost(selectedPost.id);
      
      if (success) {
        // Remove post from list
        setPosts(prevPosts => prevPosts.filter(post => post.id !== selectedPost.id));
        // Success mesajı kaldırıldı - sadece listeden sil
      } else {
        setErrorMessage(t('home.error.deleteFailed'));
        setModals(prev => ({ ...prev, error: true }));
      }
    } catch (error) {
      setErrorMessage(t('home.error.deleteFailed'));
      setModals(prev => ({ ...prev, error: true }));
    }
  };
  const renderCatchCardSkeleton = useCallback(() => {
    return (
      <View style={styles.catchCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Skeleton>
              <SkeletonItem width={40} height={40} borderRadius={20} />
            </Skeleton>
            <View style={styles.userDetails}>
              <View style={styles.userNameRow}>
                <Skeleton>
                  <SkeletonItem width={120} height={16} borderRadius={4} />
                </Skeleton>
              </View>
              <View style={styles.locationRow}>
                <Skeleton>
                  <SkeletonItem width={12} height={12} borderRadius={2} marginRight={4} />
                </Skeleton>
                <Skeleton>
                  <SkeletonItem width={100} height={14} borderRadius={4} />
                </Skeleton>
              </View>
            </View>
          </View>
          <View style={styles.userActions}>
            <Skeleton>
              <SkeletonItem width={90} height={32} borderRadius={theme.borderRadius.md} />
            </Skeleton>
            <Skeleton>
              <SkeletonItem width={32} height={32} borderRadius={theme.borderRadius.md} />
            </Skeleton>
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <Skeleton>
            <SkeletonItem width="100%" height={14} borderRadius={4} />
          </Skeleton>
          <Skeleton>
            <SkeletonItem width="80%" height={14} borderRadius={4} marginTop={6} />
          </Skeleton>
        </View>
        <View style={styles.catchImageContainer}>
          <Skeleton>
            <SkeletonItem width="100%" aspectRatio={1} borderRadius={theme.borderRadius.sm} />
          </Skeleton>
        </View>
        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Skeleton>
              <SkeletonItem width={24} height={24} borderRadius={4} />
            </Skeleton>
            <Skeleton>
              <SkeletonItem width={30} height={16} borderRadius={4} marginLeft={4} />
            </Skeleton>
          </View>
          <View style={styles.actionButton}>
            <Skeleton>
              <SkeletonItem width={24} height={24} borderRadius={4} />
            </Skeleton>
            <Skeleton>
              <SkeletonItem width={30} height={16} borderRadius={4} marginLeft={4} />
            </Skeleton>
          </View>
          <View style={styles.actionButton}>
            <Skeleton>
              <SkeletonItem width={24} height={24} borderRadius={4} />
            </Skeleton>
          </View>
          <View style={styles.speciesContainer}>
            <Skeleton>
              <SkeletonItem width={48} height={40} borderRadius={4} />
            </Skeleton>
          </View>
        </View>
      </View>
    );
  }, [theme, styles]);

  const handleUserPress = useCallback((userId: string) => {
    if (userId === currentUserId) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    } else {
      navigation.navigate('UserProfile', { userId });
    }
  }, [navigation, currentUserId]);
  
  
  const handleMorePress = useCallback((item: CatchItem) => {
    setSelectedPost(item);
    // Check if it's the user's own post
    if (currentUserId && item.user.id === currentUserId) {
      setModals(prev => ({ ...prev, ownPostOptions: true }));
    } else {
      setModals(prev => ({ ...prev, options: true }));
    }
  }, [currentUserId]);
  

  // Görsel prefetch yardımcıları (tek kaynak)
  const postsRef = useRef<CatchItem[]>([]);
  useEffect(() => { postsRef.current = posts; }, [posts]);

  const imagePrefetchCacheRef = useRef<Set<string>>(new Set());
  const imagePrefetchPendingRef = useRef<Set<string>>(new Set());
  const lastPrefetchTsRef = useRef<number>(0);

  const prefetchImagesAround = useCallback((visibleIndexes: number[], radius: number = 2) => {
    const now = Date.now();
    if (now - lastPrefetchTsRef.current < 250) {
      return;
    }
    lastPrefetchTsRef.current = now;

    const list = postsRef.current;
    if (!Array.isArray(list) || list.length === 0) return;

    const targetIndexes = new Set<number>();
    for (const idx of visibleIndexes) {
      for (let d = -radius; d <= radius; d++) {
        const t = idx + d;
        if (t >= 0 && t < list.length) targetIndexes.add(t);
      }
    }

    for (const t of targetIndexes) {
      const item = list[t];
      if (!item) continue;
      const imgs = (item.images && item.images.length > 0 ? item.images : [item.image]).filter(Boolean);
      for (const url of imgs) {
        if (!imagePrefetchCacheRef.current.has(url) && !imagePrefetchPendingRef.current.has(url)) {
          imagePrefetchPendingRef.current.add(url);
          Image.prefetch(url)
            .then(() => {
              imagePrefetchPendingRef.current.delete(url);
              imagePrefetchCacheRef.current.add(url);
            })
            .catch(() => {
              imagePrefetchPendingRef.current.delete(url);
            });
        }
      }
    }
  }, []);

  // Görünür öğeleri takip et
  const [visiblePostIds, setVisiblePostIds] = useState<Set<number>>(new Set());
const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
  const next = new Set<number>();
  const visibleIndexes: number[] = [];
  for (const v of viewableItems) {
    const data = v.item as CatchItem | undefined;
    if (typeof v.index === 'number') visibleIndexes.push(v.index);
    if (data?.id) next.add(data.id);
  }
  setVisiblePostIds(prev => {
    if (prev.size === next.size) {
      let allSame = true;
      for (const id of next) {
        if (!prev.has(id)) { allSame = false; break; }
      }
      if (allSame) return prev; // Değişiklik yoksa state güncelleme
    }
    return next;
  });
  // Yakın öğeler için görsel prefetch (ref tabanlı, state yok)
  if (visibleIndexes.length > 0) prefetchImagesAround(visibleIndexes, 2);
}).current;
const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

const renderItem = useCallback(({ item }: { item: CatchItem }) => {
    return (
      <CatchCard
        item={item}
        currentUserId={currentUserId}
        isFollowing={currentUserId ? (getFollowStatus(currentUserId, item.user.id) ?? false) : false}
        isPending={followingPending.has(item.user.id)}
        onFollowToggle={async () => {
          if (!currentUserId || followingPending.has(item.user.id)) return;
          
          setFollowingPending(prev => new Set(prev).add(item.user.id));
          
          try {
            const isCurrentlyFollowing = getFollowStatus(currentUserId, item.user.id) ?? false;
            
            let result;
            if (isCurrentlyFollowing) {
              result = await globalUnfollowUser(currentUserId, item.user.id);
            } else {
              result = await globalFollowUser(currentUserId, item.user.id);
            }
            
            if (!result.success) {
              throw new Error(result.error || t('common.error'));
            }
          } catch (error) {
            // Follow error handled silently
          } finally {
            setFollowingPending(prev => {
              const newSet = new Set(prev);
              newSet.delete(item.user.id);
              return newSet;
            });
          }
        }}
        onUserPress={() => handleUserPress(item.user.id)}
        onPostPress={() => {
          navigation.navigate('PostDetail', { 
            postData: {
              id: item.id,
              user: {
                id: item.user.id,
                name: item.user.name,
                avatar: item.user.avatar || '',
                location: item.user.location,
                isPro: item.user.isPro,
              },
              fish: item.fish,
              photo: item.image,
              images: item.images || [item.image],
              likes: item.likes,
              comments: item.comments,
              timeAgo: item.timeAgo,
              description: item.description || null,
              privateNote: item.privateNote || null,
              equipmentDetails: item.equipmentDetails,
              catchLocation: item.catchLocation,
              catchCountryCode: item.catchCountryCode,
              coordinates: item.coordinates,
            }
          });
        }}
        onCommentPress={() => {
          navigation.navigate('Comments', { 
            postId: item.id,
            postTitle: `${item.user.name} - ${item.fish.species}`,
            initialCommentCount: item.comments
          });
        }}
        onMorePress={() => handleMorePress(item)}
        badgeActive={visiblePostIds.has(item.id)}
      />
    );
  }, [navigation, currentUserId, handleUserPress, handleMorePress, visiblePostIds, getFollowStatus, globalFollowUser, globalUnfollowUser, followingPending, t]);
  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('home.title')}
          rightButtons={[
            {
              icon: 'search',
              onPress: () => navigation.navigate('ExploreSearch')
            },
            {
              icon: 'bell',
              onPress: () => navigation.navigate('Notifications')
            }
          ]}
        />
        <ScreenContainer paddingVertical="none">
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.listContent, theme.listContentStyleWithTabBar]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={3}
            removeClippedSubviews={true}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            ListEmptyComponent={
              isInitialLoading && posts.length === 0 ? (
                <View>
                  {renderCatchCardSkeleton()}
                  {renderCatchCardSkeleton()}
                  {renderCatchCardSkeleton()}
                </View>
              ) : (
                <EmptyState title={t('home.noContent.forYou')} />
              )
            }
          />
        </ScreenContainer>
        {/* Modals */}
        <FishivoModal
          visible={modals.options}
          title={t('home.actions.title')}
          onClose={() => setModals(prev => ({ ...prev, options: false }))}
          buttons={[
            {
              text: t('home.actions.report'),
              variant: 'secondary',
              onPress: handleReport,
              icon: 'flag'
            },
            {
              text: t('home.actions.block'),
              variant: 'secondary',
              onPress: handleBlock,
              icon: 'user-x'
            }
          ]}
        />
        <FishivoModal
          visible={modals.ownPostOptions}
          title={t('home.actions.postOptions')}
          onClose={() => setModals(prev => ({ ...prev, ownPostOptions: false }))}
          buttons={[
            {
              text: t('home.actions.edit'),
              variant: 'primary',
              onPress: handleEditPost,
              icon: 'edit'
            },
            {
              text: t('home.actions.delete'),
              variant: 'destructive',
              onPress: handleDeletePost,
              icon: 'trash-2'
            }
          ]}
        />
        <FishivoModal
          visible={modals.deleteConfirm}
          title={t('home.actions.deleteConfirmTitle')}
          onClose={() => setModals(prev => ({ ...prev, deleteConfirm: false }))}
          preset="confirm"
          description={t('home.actions.deleteConfirmMessage')}
          primaryButton={{
            text: t('common.delete'),
            onPress: confirmDeletePost,
            variant: 'destructive'
          }}
          secondaryButton={{
            text: t('common.cancel'),
            onPress: () => setModals(prev => ({ ...prev, deleteConfirm: false }))
          }}
        />
        <FishivoModal
          visible={modals.block}
          title={t('home.actions.blockConfirmTitle')}
          onClose={() => setModals(prev => ({ ...prev, block: false }))}
          preset="confirm"
          description={t('home.actions.blockConfirmMessage')}
          primaryButton={{
            text: t('home.actions.block'),
            onPress: confirmBlock,
            variant: 'destructive'
          }}
          secondaryButton={{
            text: t('common.cancel'),
            onPress: () => setModals(prev => ({ ...prev, block: false }))
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
        <FishivoModal
          visible={modals.error}
          onClose={() => setModals(prev => ({ ...prev, error: false }))}
          preset="error"
          title={t('common.error')}
          description={errorMessage}
          primaryButton={{
            text: t('common.ok'),
            onPress: () => setModals(prev => ({ ...prev, error: false }))
          }}
        />
        <FishivoModal
          visible={modals.report}
          title={t('home.reportTitle')}
          onClose={() => setModals(prev => ({ ...prev, report: false }))}
          backdropCloseable={false}
          showCloseButton={true}
          description={t('home.reportDescription')}
          buttons={[
            {
              text: t('common.cancel'),
              variant: 'secondary',
              onPress: () => setModals(prev => ({ ...prev, report: false }))
            },
            {
              text: t('common.report'),
              variant: 'destructive',
              onPress: confirmReport,
              disabled: !selectedReportReason
            }
          ]}
          contentAlign="left"
          renderRadioOptions={{
            options: Object.values(ReportReason).map(reason => ({
              key: reason,
              label: t(`home.reportReasons.${reason}`)
            })),
            selectedKey: selectedReportReason,
            onSelect: (key: string) => setSelectedReportReason(key as ReportReason)
          }}
        />
        <FishivoModal
          visible={modals.reportSuccess}
          onClose={() => setModals(prev => ({ ...prev, reportSuccess: false }))}
          preset="success"
          title={t('common.success')}
          description={t('home.reportSuccess')}
          primaryButton={{
            text: t('common.ok'),
            onPress: () => setModals(prev => ({ ...prev, reportSuccess: false }))
          }}
        />
        <FishivoModal
          visible={modals.reportError}
          onClose={() => setModals(prev => ({ ...prev, reportError: false }))}
          preset="error"
          title={t('common.error')}
          description={t('home.reportError')}
          primaryButton={{
            text: t('common.ok'),
            onPress: () => setModals(prev => ({ ...prev, reportError: false }))
          }}
        />
      </View>
    </>
  );
};
const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingBottom: theme.spacing.xl * 2,
  },
  catchCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: theme.shadows.sm.shadowColor,
    shadowOffset: theme.shadows.sm.shadowOffset,
    shadowOpacity: theme.shadows.sm.shadowOpacity,
    shadowRadius: theme.shadows.sm.shadowRadius,
    elevation: theme.shadows.sm.elevation,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
    marginRight: theme.spacing.sm,
    minWidth: 0,
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    flex: 1,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flexShrink: 0,
  },
  descriptionContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  catchImageContainer: {
    aspectRatio: 1,
    backgroundColor: theme.colors.surfaceVariant,
    position: 'relative',
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speciesContainer: {
    marginLeft: 'auto',
    marginRight: theme.spacing.xs,
    alignItems: 'flex-end',
    marginTop: -theme.spacing.sm,
  },
});
export default HomeScreen;
