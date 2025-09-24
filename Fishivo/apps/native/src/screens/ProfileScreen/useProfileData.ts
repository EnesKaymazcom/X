import { useEffect, useReducer, useCallback, useRef } from 'react';
import { Image } from 'react-native';
import { createNativeApiService, getNativeSupabaseClient } from '@fishivo/api';
import { withRetry, getErrorMessage } from '@fishivo/utils';
import { postsServiceNative } from '@fishivo/api';
import { useFollowStore } from '@/stores/followStore';
import { useProfileStore } from '@/stores/profileStore';
import type { NativeUserProfile } from '@fishivo/api';
import type {
  ProfileState,
  ProfileAction,
  UseProfileDataReturn,
  UserProfileState,
  UserStats,
  FishingGearUI
} from './types';

const initialState: ProfileState = {
  loadingState: 'initial', // Start with initial state
  user: null,
  profile: {
    name: '',
    username: '',
    location: '',
    countryCode: '',
    bio: '',
    avatar: '',
    coverImage: '',
    isPro: false,
    proSince: '',
    instagram_url: '',
    facebook_url: '',
    youtube_url: '',
    twitter_url: '',
    tiktok_url: '',
    website: ''
  },
  stats: {
    totalCatches: 0,
    totalSpots: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    totalLikes: 0
  },
  catches: [],
  gearItems: [],
  error: null,
  imagesLoaded: false,
  gearLoaded: false
};

// Reducer for profile state management
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loadingState: action.payload, error: null };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_CATCHES':
      return { ...state, catches: action.payload };
    case 'SET_GEAR':
      return { ...state, gearItems: action.payload, gearLoaded: true };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loadingState: 'error' };
    case 'SET_IMAGES_LOADED':
      return { ...state, imagesLoaded: action.payload };
    case 'SET_GEAR_LOADED':
      return { ...state, gearLoaded: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Helper function to transform profile data
function transformProfileData(data: NativeUserProfile): UserProfileState {
  return {
    name: data.full_name || data.username || '',
    username: data.username || '',
    location: data.location || '',
    countryCode: data.country_code || '',
    bio: data.bio || '',
    avatar: typeof data.avatar_url === 'string' ? data.avatar_url : '',
    coverImage: typeof data.cover_image_url === 'string' ? data.cover_image_url : '',
    isPro: data.is_pro || false,
    proSince: data.pro_until ? new Date(data.pro_until).getFullYear().toString() : '',
    instagram_url: data.instagram_url || '',
    facebook_url: data.facebook_url || '',
    youtube_url: data.youtube_url || '',
    twitter_url: data.twitter_url || '',
    tiktok_url: data.tiktok_url || '',
    website: data.website || ''
  };
}
// Main custom hook
export function useProfileData(): UseProfileDataReturn {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirstLoadRef = useRef(true);

  // Initialize auth listener
  useEffect(() => {
    const supabase = getNativeSupabaseClient();
    
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      dispatch({ type: 'SET_USER', payload: session?.user ?? null });
    };
    
    getInitialSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        dispatch({ type: 'SET_USER', payload: session?.user ?? null });
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);


  // Load user data
  const loadUserData = useCallback(async (isRefresh = false) => {
    const userId = state.user?.id;
    if (!userId) {
      dispatch({ type: 'SET_LOADING', payload: 'idle' });
      return;
    }
    
    // Always show loading on first load
    const currentLoadingState = state.loadingState;
    if (currentLoadingState === 'initial' || (!isRefresh && !state.profile.name)) {
      dispatch({ type: 'SET_LOADING', payload: 'loading' });
    } else {
      dispatch({ type: 'SET_LOADING', payload: isRefresh ? 'refreshing' : 'loading' });
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;

    const profileStore = useProfileStore.getState();

    try {
      const apiService = createNativeApiService();
      
      // Don't use cache on initial load to ensure skeleton shows
      const isInitialLoad = state.loadingState === 'initial' || !state.profile.name;
      if (!isInitialLoad) {
        // Check if we have cached profile data and it's fresh
        const cachedProfile = profileStore.getProfile(userId);
        if (cachedProfile && !profileStore.isStale(userId, 1000) && isRefresh) {
          // Only use cache for refresh to avoid skeleton flash
          const transformedProfile = transformProfileData(cachedProfile);
          dispatch({ type: 'SET_PROFILE', payload: transformedProfile });
          // Don't return, still fetch fresh data
        }
      }

      // Parallel API calls with abort signal support (no equipment initially)
      const [userProfileData, userPostsData] = await Promise.all([
        withRetry(
          () => apiService.user.getUserProfile(userId),
          {
            maxRetries: 2,
            onRetry: () => {}
          }
        ).catch((err) => {
          if (signal.aborted) return null;
          dispatch({ type: 'SET_ERROR', payload: getErrorMessage(err) });
          return null;
        }),
        
        postsServiceNative.getUserPosts(userId, 50, 0, state.user?.id).catch(() => [])
      ]);

      // Check if request was aborted
      if (signal.aborted) return;

      // Update profile data
      let profileData: UserProfileState | null = null;
      if (userProfileData) {
        profileData = transformProfileData(userProfileData as NativeUserProfile);
        dispatch({ 
          type: 'SET_PROFILE', 
          payload: profileData
        });
        
        // Update profile store cache
        profileStore.setCurrentUserProfile(userProfileData);
        
        // Update stats from user profile data
        const typedUserData = userProfileData as NativeUserProfile;
        const stats: UserStats = {
          totalCatches: typedUserData.total_catches || typedUserData.catches_count || 0,
          totalSpots: typedUserData.total_spots || typedUserData.spots_count || 0,
          totalFollowers: typedUserData.followers_count || 0,
          totalFollowing: typedUserData.following_count || 0,
          totalLikes: 0 // This might need to be calculated differently
        };
        dispatch({ type: 'SET_STATS', payload: stats });
        
        // Also update the follow store with current user stats - ensure it's initialized
        const existingStats = useFollowStore.getState().getUserStats(userId) || {
          followers_count: 0,
          following_count: 0,
          lastUpdated: Date.now()
        };
        
        useFollowStore.getState().updateUserStats(userId, {
          ...existingStats,
          followers_count: typedUserData.followers_count || 0,
          following_count: typedUserData.following_count || 0
        });
      }

      // Update catches/posts - filter out deleted posts (both API and optimistic)
      if (userPostsData && userPostsData.length > 0) {
        // Get optimistic deleted posts from store
        const profileStore = useProfileStore.getState();
        
        // Filter out posts with status 'deleted' OR optimistically deleted posts
        const activePosts = userPostsData.filter(post => {
          const isApiDeleted = post.status && post.status === 'deleted';
          const isOptimisticallyDeleted = profileStore.isPostDeleted(String(post.id));
          
          return !isApiDeleted && !isOptimisticallyDeleted;
        });
        
        dispatch({ type: 'SET_CATCHES', payload: activePosts });
        
        // Update stats with correct catch count - only update totalCatches to match visible posts
        if (profileData && userProfileData) {
          const typedUserData = userProfileData as NativeUserProfile;
          const currentStats = {
            totalCatches: activePosts.length, // Use actual visible post count (after optimistic filtering)
            totalSpots: typedUserData.total_spots || typedUserData.spots_count || 0,
            totalFollowers: typedUserData.followers_count || 0,
            totalFollowing: typedUserData.following_count || 0,
            totalLikes: 0
          };
          dispatch({ type: 'SET_STATS', payload: currentStats });
        }
      } else {
        dispatch({ type: 'SET_CATCHES', payload: [] });
        
        // Update stats with zero catch count if no posts
        if (profileData && userProfileData) {
          const typedUserData = userProfileData as NativeUserProfile;
          const zeroStats = {
            totalCatches: 0,
            totalSpots: typedUserData.total_spots || typedUserData.spots_count || 0,
            totalFollowers: typedUserData.followers_count || 0,
            totalFollowing: typedUserData.following_count || 0,
            totalLikes: 0
          };
          dispatch({ type: 'SET_STATS', payload: zeroStats });
        }
      }

      // Preload images AFTER all data is ready
      const imagesToLoad: string[] = [];
      
      if (profileData?.avatar) {
        if (typeof profileData.avatar === 'string' && profileData.avatar.trim()) {
          imagesToLoad.push(profileData.avatar);
        } else if (typeof profileData.avatar === 'object' && profileData.avatar !== null) {
          const avatarObj = profileData.avatar as { medium?: string; large?: string };
          const avatarUrl = avatarObj.medium || avatarObj.large;
          if (avatarUrl) imagesToLoad.push(avatarUrl);
        }
      }
      
      if (profileData?.coverImage) {
        if (typeof profileData.coverImage === 'string' && profileData.coverImage.trim()) {
          imagesToLoad.push(profileData.coverImage);
        } else if (typeof profileData.coverImage === 'object' && profileData.coverImage !== null) {
          const coverObj = profileData.coverImage as { medium?: string; large?: string };
          const coverUrl = coverObj.large || coverObj.medium;
          if (coverUrl) imagesToLoad.push(coverUrl);
        }
      }

      if (imagesToLoad.length > 0) {
        await Promise.all(
          imagesToLoad.map(url => Image.prefetch(url).catch(() => null))
        );
      }

      dispatch({ type: 'SET_LOADING', payload: 'success' });
      dispatch({ type: 'SET_IMAGES_LOADED', payload: true });

    } catch (error) {
      if (!signal.aborted) {
        dispatch({ type: 'SET_ERROR', payload: getErrorMessage(error) });
      }
    } finally {
      // Clean up abort controller reference if it's the current one
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [state.user?.id, state.loadingState, state.profile.name]);

  useEffect(() => {
    if (state.user?.id && isFirstLoadRef.current) {
      loadUserData();
      isFirstLoadRef.current = false;
    }
  }, [state.user?.id, loadUserData]);

  useEffect(() => {
    if (!state.user?.id) return;

    const userId = state.user.id;

    const unsubscribe = useFollowStore.subscribe(
      (newState) => {
        const currentUserStats = newState.userStats.get(userId);
        if (currentUserStats) {
          // Update following count from store
          dispatch({
            type: 'SET_STATS',
            payload: {
              totalCatches: state.stats.totalCatches,
              totalSpots: state.stats.totalSpots,
              totalFollowers: currentUserStats.followers_count,
              totalFollowing: currentUserStats.following_count,
              totalLikes: state.stats.totalLikes
            }
          });
        }
      }
    );

    const currentStoreStats = useFollowStore.getState().getUserStats(userId);
    if (currentStoreStats) {
      dispatch({
        type: 'SET_STATS',
        payload: {
          totalCatches: state.stats.totalCatches,
          totalSpots: state.stats.totalSpots,
          totalFollowers: currentStoreStats.followers_count,
          totalFollowing: currentStoreStats.following_count,
          totalLikes: state.stats.totalLikes
        }
      });
    }

    return () => unsubscribe();
  }, [state.user?.id, state.stats.totalCatches, state.stats.totalSpots, state.stats.totalLikes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    await loadUserData(true);
  }, [loadUserData]);

  // Load equipment data separately (lazy loading)
  const loadEquipment = useCallback(async () => {
    const userId = state.user?.id;
    if (!userId || state.gearLoaded) return;
    
    try {
      const apiService = createNativeApiService();
      const userEquipmentData = await apiService.equipment.getUserEquipment(userId);
      
      if (userEquipmentData && userEquipmentData.length > 0) {
        const formattedGearItems: FishingGearUI[] = userEquipmentData.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          brand: item.brand || '',
          icon: 'backpack',
          imageUrl: item.imageUrl,
          condition: item.condition || 'good',
          rating: item.user_rating || undefined,
          reviewCount: item.review_count || undefined
        }));
        dispatch({ type: 'SET_GEAR', payload: formattedGearItems });
      } else {
        dispatch({ type: 'SET_GEAR', payload: [] });
      }
    } catch (error) {
      dispatch({ type: 'SET_GEAR', payload: [] });
    }
  }, [state.user?.id, state.gearLoaded]);

  // Update cover image
  const updateCoverImage = useCallback((url: string) => {
    dispatch({ type: 'SET_PROFILE', payload: { coverImage: url } });
  }, []);

  // Update dynamic counts (followers/following)
  const updateDynamicCounts = useCallback((followersCount: number, followingCount: number) => {
    dispatch({
      type: 'SET_STATS',
      payload: {
        ...state.stats,
        totalFollowers: followersCount,
        totalFollowing: followingCount
      }
    });
  }, [state.stats]);

  return {
    loadingState: state.loadingState,
    user: state.user,
    profile: state.profile,
    stats: state.stats,
    catches: state.catches,
    gearItems: state.gearItems,
    error: state.error,
    imagesLoaded: state.imagesLoaded,
    gearLoaded: state.gearLoaded,
    refreshProfile,
    updateCoverImage,
    loadEquipment,
    updateDynamicCounts
  };
}

    