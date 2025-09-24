import { useEffect, useReducer, useCallback, useRef } from 'react';
import { Linking, Image } from 'react-native';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { createNativeApiService } from '@fishivo/api';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { uploadAvatar, deleteAvatar } from '@/utils/avatar-upload';
import { uploadCoverImage, deleteCoverImage } from '@/utils/cover-upload';
import { useTranslation } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfileStore } from '@/stores/profileStore';
import type { NativeUserProfile } from '@fishivo/api';
import type {
  EditProfileState,
  EditProfileAction,
  UseEditProfileReturn,
  ProfileFormData
} from './types';

// Initial state
const initialState: EditProfileState = {
  loadingState: 'loading',
  avatarUploadState: 'idle',
  coverUploadState: 'idle',
  user: null,
  profile: {
    name: '',
    username: '',
    bio: '',
    location: '',
    country: '',
    countryCode: '',
    city: '',
    avatar_url: null,
    cover_image_url: null,
    phone: '',
    phoneCode: '+90',
    website: '',
    instagram_url: '',
    facebook_url: '',
    youtube_url: '',
    twitter_url: '',
    tiktok_url: ''
  },
  error: null,
  validationErrors: {},
  imagesLoaded: false
};

// Reducer for edit profile state
function editProfileReducer(
  state: EditProfileState,
  action: EditProfileAction
): EditProfileState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loadingState: action.payload, error: null };
    
    case 'SET_AVATAR_UPLOAD':
      return { ...state, avatarUploadState: action.payload };
    
    case 'SET_COVER_UPLOAD':
      return { ...state, coverUploadState: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    
    case 'UPDATE_PROFILE_FIELD':
      return {
        ...state,
        profile: { ...state.profile, [action.field]: action.value },
        validationErrors: {
          ...state.validationErrors,
          [action.field]: '' // Clear validation error when field is updated
        }
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loadingState: 'error' };
    
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };
    
    case 'CLEAR_VALIDATION_ERROR':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.field]: _, ...restErrors } = state.validationErrors;
      return { ...state, validationErrors: restErrors };
    
    case 'SET_IMAGES_LOADED':
      return { ...state, imagesLoaded: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Transform API profile data to form data
function transformProfileToFormData(
  profileData: NativeUserProfile,
  t: (key: string) => string
): Partial<ProfileFormData> {
  const countryName = profileData.country_code
    ? t(`locations.countries.${profileData.country_code}`)
    : '';

  return {
    name: profileData.full_name || profileData.username || '',
    username: profileData.username || '',
    bio: profileData.bio || '',
    location: profileData.location || '',
    country: countryName,
    countryCode: profileData.country_code || '',
    city: profileData.location || '',
    avatar_url: typeof profileData.avatar_url === 'string' ? profileData.avatar_url : null,
    cover_image_url: typeof profileData.cover_image_url === 'string' ? profileData.cover_image_url : null,
    phone: profileData.phone || '',
    phoneCode: profileData.phone_code || '+90',
    website: profileData.website || '',
    instagram_url: profileData.instagram_url
      ? profileData.instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\/@?/, '')
      : '',
    facebook_url: profileData.facebook_url
      ? profileData.facebook_url.replace(/https?:\/\/(www\.)?facebook\.com\//, '')
      : '',
    youtube_url: profileData.youtube_url
      ? profileData.youtube_url.replace(/https?:\/\/(www\.)?youtube\.com\/@?/, '')
      : '',
    twitter_url: profileData.twitter_url
      ? profileData.twitter_url.replace(/https?:\/\/(www\.)?(twitter\.com|x\.com)\/@?/, '')
      : '',
    tiktok_url: profileData.tiktok_url
      ? profileData.tiktok_url.replace(/https?:\/\/(www\.)?tiktok\.com\/@?/, '')
      : ''
  };
}

// Main custom hook
export function useEditProfile(navigation: any): UseEditProfileReturn {
  const [state, dispatch] = useReducer(editProfileReducer, initialState);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize auth and load profile
  useEffect(() => {
    let abortController: AbortController | null = null;

    const initializeProfile = async () => {
      dispatch({ type: 'SET_LOADING', payload: 'loading' });

      try {
        const supabase = getNativeSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          // Auth'a yönlendirme yapmıyoruz - AppNavigator halleder
          dispatch({ type: 'SET_ERROR', payload: 'Session expired. Please login again.' });
          dispatch({ type: 'SET_LOADING', payload: 'error' });
          return;
        }

        dispatch({ type: 'SET_USER', payload: user });

        // Create abort controller for this request
        abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Load profile data
        const apiService = createNativeApiService();
        const profileData = await apiService.user.getUserProfile(user.id);

        if (profileData) {
          const formData = transformProfileToFormData(profileData, t);
          dispatch({ type: 'SET_PROFILE', payload: formData });
          
          // Preload images
          const imagesToLoad: string[] = [];
          if (formData.avatar_url && typeof formData.avatar_url === 'string') {
            imagesToLoad.push(formData.avatar_url);
          }
          if (formData.cover_image_url && typeof formData.cover_image_url === 'string') {
            imagesToLoad.push(formData.cover_image_url);
          }
          
          if (imagesToLoad.length > 0) {
            await Promise.allSettled(
              imagesToLoad.map(url => 
                Image.prefetch(url)
              )
            );
          }
          
          dispatch({ type: 'SET_IMAGES_LOADED', payload: true });
        } else {
          // No profile data, no images to load
          dispatch({ type: 'SET_IMAGES_LOADED', payload: true });
        }

        dispatch({ type: 'SET_LOADING', payload: 'success' });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: t('errors.profileLoadFailed') });
      }
    };

    initializeProfile();

    // Auth state listener
    const supabase = getNativeSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        // SIGNED_OUT durumunda navigation yapmıyoruz - AppNavigator halleder
        if (event === 'SIGNED_IN' && session?.user) {
          dispatch({ type: 'SET_USER', payload: session.user });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (abortController) {
        abortController.abort();
      }
    };
  }, [navigation, t]);

  // Update field
  const updateField = useCallback((field: keyof ProfileFormData, value: string) => {
    dispatch({ type: 'UPDATE_PROFILE_FIELD', field, value });
  }, []);

  // Handle save
  const handleSave = useCallback(async (): Promise<boolean> => {
    // Simple validation
    const errors: Record<string, string> = {};
    if (!state.profile.username || state.profile.username.trim().length < 2) {
      errors.username = t('errors.usernameRequired');
    }
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
      return false;
    }

    dispatch({ type: 'SET_LOADING', payload: 'saving' });

    try {
      const apiService = createNativeApiService();
      const userId = state.user?.id;

      if (!userId) {
        throw new Error(t('errors.userNotFound'));
      }

      // Prepare social media URLs
      const socialUrls = {
        instagram_url: state.profile.instagram_url?.trim()
          ? `https://instagram.com/${state.profile.instagram_url.trim().replace('@', '')}`
          : '',
        facebook_url: state.profile.facebook_url?.trim()
          ? `https://facebook.com/${state.profile.facebook_url.trim()}`
          : '',
        youtube_url: state.profile.youtube_url?.trim()
          ? `https://youtube.com/@${state.profile.youtube_url.trim().replace('@', '')}`
          : '',
        twitter_url: state.profile.twitter_url?.trim()
          ? `https://x.com/${state.profile.twitter_url.trim().replace('@', '')}`
          : '',
        tiktok_url: state.profile.tiktok_url?.trim()
          ? `https://tiktok.com/@${state.profile.tiktok_url.trim().replace('@', '')}`
          : ''
      };

      // Clean phone number
      const cleanPhone = state.profile.phone
        ? state.profile.phone.trim().replace(/\D/g, '')
        : '';

      // Prepare update data
      const updateData: Record<string, any> = {
        full_name: state.profile.name || '',
        username: state.profile.username.trim(),
        bio: state.profile.bio || '',
        location: state.profile.city || '',
        country_code: state.profile.countryCode || '',
        phone: cleanPhone,
        phone_code: state.profile.phoneCode || '+90',
        website: state.profile.website?.trim() || '',
        ...socialUrls
      };

      // Include avatar and cover if they exist
      if (state.profile.avatar_url) {
        updateData.avatar_url = state.profile.avatar_url;
      }
      if (state.profile.cover_image_url) {
        updateData.cover_image_url = state.profile.cover_image_url;
      }

      // Update profile
      const updatedProfile = await apiService.user.updateUserProfile(userId, updateData);

      // Update auth metadata
      const supabase = getNativeSupabaseClient();
      await supabase.auth.updateUser({
        data: {
          full_name: state.profile.name || '',
          username: state.profile.username.trim(),
          bio: state.profile.bio || '',
          location: state.profile.location || '',
          name: state.profile.name || '',
          cover_image_url: state.profile.cover_image_url || ''
        }
      });

      // Update global profile store and mark as changed
      if (updatedProfile) {
        const profileStore = useProfileStore.getState();
        profileStore.setCurrentUserProfile(updatedProfile);
        profileStore.markProfileAsChanged(userId);
      }

      dispatch({ type: 'SET_LOADING', payload: 'success' });
      return true;
    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || '';
      
      if (errorMessage.includes('username') && errorMessage.includes('unique')) {
        dispatch({ type: 'SET_ERROR', payload: t('errors.usernameTaken') });
      } else {
        dispatch({ type: 'SET_ERROR', payload: t('errors.profileUpdateFailed') });
      }
      
      return false;
    }
  }, [state.profile, state.user?.id, t]);

  // Handle avatar upload
  const handleAvatarUpload = useCallback(async () => {
    dispatch({ type: 'SET_AVATAR_UPLOAD', payload: 'uploading' });
    
    try {
      const result = await uploadAvatar();

      if (result.success && result.avatarUrl) {
        // Preload new image
        await Image.prefetch(result.avatarUrl).catch(() => {});
        
        dispatch({ type: 'UPDATE_PROFILE_FIELD', field: 'avatar_url', value: result.avatarUrl });
        dispatch({ type: 'SET_AVATAR_UPLOAD', payload: 'idle' });
      } else if (result.error && result.error !== 'cancelled') {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        dispatch({ type: 'SET_AVATAR_UPLOAD', payload: 'idle' });
      } else {
        // User cancelled - reset loading state
        dispatch({ type: 'SET_AVATAR_UPLOAD', payload: 'idle' });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: t('errors.avatarUploadFailed') });
      dispatch({ type: 'SET_AVATAR_UPLOAD', payload: 'idle' });
    }
  }, [t]);

  // Handle cover upload
  const handleCoverUpload = useCallback(async () => {
    dispatch({ type: 'SET_COVER_UPLOAD', payload: 'uploading' });
    
    try {
      const result = await uploadCoverImage();

      if (result.success && result.coverUrl) {
        // Preload new image
        await Image.prefetch(result.coverUrl).catch(() => {});
        
        dispatch({ type: 'UPDATE_PROFILE_FIELD', field: 'cover_image_url', value: result.coverUrl });
        dispatch({ type: 'SET_COVER_UPLOAD', payload: 'idle' });
      } else if (result.error && result.error !== 'cancelled') {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        dispatch({ type: 'SET_COVER_UPLOAD', payload: 'idle' });
      } else {
        // User cancelled - reset loading state
        dispatch({ type: 'SET_COVER_UPLOAD', payload: 'idle' });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: t('errors.coverUploadFailed') });
      dispatch({ type: 'SET_COVER_UPLOAD', payload: 'idle' });
    }
  }, [t]);

  // Handle avatar delete
  const handleAvatarDelete = useCallback(async () => {
    dispatch({ type: 'SET_AVATAR_UPLOAD', payload: 'uploading' });

    try {
      const result = await deleteAvatar();

      if (result.success) {
        dispatch({ type: 'UPDATE_PROFILE_FIELD', field: 'avatar_url', value: null });
        dispatch({ type: 'SET_AVATAR_UPLOAD', payload: 'idle' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || t('errors.avatarDeleteFailed') });
        dispatch({ type: 'SET_AVATAR_UPLOAD', payload: 'error' });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: t('errors.avatarDeleteFailed') });
      dispatch({ type: 'SET_AVATAR_UPLOAD', payload: 'error' });
    }
  }, [t]);

  // Handle cover delete
  const handleCoverDelete = useCallback(async () => {
    dispatch({ type: 'SET_COVER_UPLOAD', payload: 'uploading' });

    try {
      const result = await deleteCoverImage();

      if (result.success) {
        dispatch({ type: 'UPDATE_PROFILE_FIELD', field: 'cover_image_url', value: null });
        dispatch({ type: 'SET_COVER_UPLOAD', payload: 'idle' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || t('errors.coverDeleteFailed') });
        dispatch({ type: 'SET_COVER_UPLOAD', payload: 'error' });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: t('errors.coverDeleteFailed') });
      dispatch({ type: 'SET_COVER_UPLOAD', payload: 'error' });
    }
  }, [t]);

  // Open social media link
  const openSocialMediaLink = useCallback(async (platform: string, username: string) => {
    if (!username || username.trim() === '') return;

    let webUrl = '';
    const cleanUsername = username.trim();

    switch (platform) {
      case 'website':
        webUrl = cleanUsername.startsWith('http') ? cleanUsername : `https://${cleanUsername}`;
        break;
      case 'instagram':
        webUrl = `https://instagram.com/${cleanUsername.replace('@', '')}`;
        break;
      case 'facebook':
        webUrl = `https://facebook.com/${cleanUsername}`;
        break;
      case 'youtube':
        webUrl = `https://youtube.com/@${cleanUsername.replace('@', '')}`;
        break;
      case 'twitter':
        webUrl = `https://x.com/${cleanUsername.replace('@', '')}`;
        break;
      case 'tiktok':
        webUrl = `https://tiktok.com/@${cleanUsername.replace('@', '')}`;
        break;
    }

    if (webUrl) {
      try {
        const isAvailable = await InAppBrowser.isAvailable();
        if (isAvailable) {
          await InAppBrowser.open(webUrl, {
            dismissButtonStyle: 'close',
            preferredBarTintColor: theme.colors.surface,
            preferredControlTintColor: theme.colors.primary,
            readerMode: false,
            animated: true,
            modalPresentationStyle: 'fullScreen',
            modalTransitionStyle: 'coverVertical',
            modalEnabled: true,
            enableBarCollapsing: false,
            showTitle: true,
            toolbarColor: theme.colors.surface,
            secondaryToolbarColor: theme.colors.primary,
            navigationBarColor: theme.colors.background,
            navigationBarDividerColor: theme.colors.border,
            enableUrlBarHiding: true,
            enableDefaultShare: true,
            forceCloseOnRedirection: false
          });
        } else {
          await Linking.openURL(webUrl);
        }
      } catch {
        await Linking.openURL(webUrl);
      }
    }
  }, [theme]);

  return {
    state,
    updateField,
    handleSave,
    handleAvatarUpload,
    handleCoverUpload,
    handleAvatarDelete,
    handleCoverDelete,
    openSocialMediaLink
  };
}