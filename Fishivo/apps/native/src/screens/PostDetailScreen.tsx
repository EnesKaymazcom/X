import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Share,
  Platform,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Icon,
  EquipmentCard,
  AppHeader,
  ScreenContainer,
  FishInfoCard,
  FishivoModal,
  SectionHeader,
  ImageViewerModal,
  WeatherGrid
} from '@/components/ui';
import CatchCard from '@/components/ui/CatchCard';
import { useFollow } from '@/hooks/useFollow';
import { Weight, Ruler, Clock, Fish } from 'lucide-react-native';
import { FishivoMarker } from '@/components/ui/maps/markers/FishivoMarker';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService, postsServiceNative } from '@fishivo/api';
import { getNativeSupabaseClient } from '@fishivo/api';
import { getNativeGeocodingService } from '@fishivo/api';
import { type PostWithUser } from '@fishivo/api';
const nativeSupabase = getNativeSupabaseClient();
import { FishSpecies } from '@fishivo/types';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { useNavigationWithLock } from '@/hooks/useNavigationWithLock';
import { useUnits } from '@fishivo/hooks';
import { PostData } from '@/types/navigation';
import { UniversalMapView } from '@/components/ui/maps';
import { useProfileStore } from '@/stores/profileStore';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import { useFocusEffect } from '@react-navigation/native';
import CommentEventEmitter from '@/utils/CommentEventEmitter';

type PostDetailScreenProps = StackScreenProps<RootStackParamList, 'PostDetail'>;

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ navigation: _navigation, route }) => {
  const navigation = useNavigationWithLock();
  const { theme, isDark } = useTheme();
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  
  // Handle both postData and postId params
  const [postData, setPostData] = useState<PostData | null>(
    route.params && 'postData' in route.params ? route.params.postData || null : null
  );
  const postId = 'postId' in route.params ? route.params.postId : postData?.id;
  
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showOwnPostOptionsModal, setShowOwnPostOptionsModal] = useState(false);
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showReportReasonModal, setShowReportReasonModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [formattedWeight, setFormattedWeight] = useState('');
  const [formattedLength, setFormattedLength] = useState('');
  const [formattedTemperature, setFormattedTemperature] = useState('');
  const [formattedSpeed, setFormattedSpeed] = useState('');
  const [formattedPressure, setFormattedPressure] = useState('');
  const [fishSpecies, setFishSpecies] = useState<FishSpecies | null>(null);
  const [fishDisplayName, setFishDisplayName] = useState(postData?.fish.species || '');
  const [fishingTechnique, setFishingTechnique] = useState<{ id: number; name: string; name_en?: string } | null>(null);
  const { user } = useSupabaseUser();
  const { formatWeight, formatLength, formatTemperature, formatWindSpeed, formatPressure } = useUnits();
  const styles = createStyles(theme, isDark);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [loading, setLoading] = useState(!postData);
  const [_viewerInitialIndex, _setViewerInitialIndex] = useState(0);
  const [privateNote, setPrivateNote] = useState<string | null>(null);
  const [geocodedLocation, setGeocodedLocation] = useState<string | null>(null);
  const [hasUserCommented, setHasUserCommented] = useState(postData?.hasUserCommented || false);
  const [commentsCount, setCommentsCount] = useState(postData?.comments || 0);
  
  // Error modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Follow hook
  const { isFollowing, toggleFollow, isLoading: isPending } = useFollow(postData?.user.id || '');

  // Load post data if only postId is provided
  useEffect(() => {
    const loadPostData = async () => {
      if (!postData && postId) {
        setLoading(true);
        try {
          const apiService = createNativeApiService();
          const post: PostWithUser | null = await apiService.posts.getPost(postId, user?.id);
          
          if (post) {
            const newPostData: PostData = {
              id: post.id,
              user: {
                id: post.user_id,
                name: post.user.full_name || 'Unknown User',
                avatar: post.user.avatar_url || '',
                location: post.user?.location || '',
                isPro: post.user.is_pro
              },
              fish: {
                species: post.catch_details?.species || 'Unknown',
                speciesId: post.catch_details?.species_id,
                speciesImage: post.catch_details?.species_image || undefined,
                weight: post.catch_details?.weight ? `${post.catch_details.weight} kg` : '0 kg',
                length: post.catch_details?.length ? `${post.catch_details.length} cm` : '0 cm'
              },
              images: post.images || [],
              likes: post.likes_count || 0,
              comments: post.comments_count || 0,
              hasUserCommented: post.has_user_commented || false,
              timeAgo: new Date(post.created_at).toLocaleDateString(),
              description: post.content,
              privateNote: post.private_note || null,
              isSecret: post.is_secret || false,
              coordinates: post.location?.latitude && post.location?.longitude 
                ? [post.location.latitude, post.location.longitude] 
                : undefined,
              catchLocation: post.location?.name || undefined,
              catchCountryCode: post.location?.country_code || undefined,
              method: post.catch_details?.technique,
              fishingTechniqueId: post.fishing_technique_id || null,
              released: post.catch_details?.released,
              weather: post.catch_details?.weather
            };
            setPostData(newPostData);
            setFishDisplayName(newPostData.fish.species);
            setHasUserCommented(newPostData.hasUserCommented || false);
            setCommentsCount(newPostData.comments || 0);
            
            // Check if this is user's own post and has private note
            if (post.private_note && user?.id && user.id.trim() === post.user_id.trim()) {
              setPrivateNote(post.private_note);
            }
            
            // Load fishing technique if available
            if (post.fishing_technique_id) {
              try {
                const { data: technique } = await nativeSupabase
                  .from('fishing_techniques')
                  .select('id, name, name_en')
                  .eq('id', post.fishing_technique_id)
                  .single();
                  
                if (technique) {
                  setFishingTechnique(technique);
                }
              } catch (error) {
                // Silently fail, technique is optional
              }
            }
          }
        } catch (error) {
          setErrorMessage(t('posts.loadError'));
          setShowErrorModal(true);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadPostData();
  }, [postId, postData, t, navigation, user?.id]);

  useEffect(() => {
    if (!postData) return;
    
    // Parse weight and length from postData
    const weightMatch = postData.fish.weight.match(/^([\d.]+)/);
    const lengthMatch = postData.fish.length.match(/^([\d.]+)/);
    
    if (weightMatch) {
      const weightValue = parseFloat(weightMatch[1]);
      if (!isNaN(weightValue)) {
        // Format weight according to user's unit preference
        setFormattedWeight(formatWeight(weightValue, locale === 'tr' ? 'tr-TR' : 'en-US'));
      }
    }
    
    if (lengthMatch) {
      const lengthValue = parseFloat(lengthMatch[1]);
      if (!isNaN(lengthValue)) {
        // Format length according to user's unit preference
        setFormattedLength(formatLength(lengthValue, locale === 'tr' ? 'tr-TR' : 'en-US'));
      }
    }

    // Format weather data from postData if available
    if (postData.weather) {
      if (postData.weather.temperature !== undefined) {
        setFormattedTemperature(formatTemperature(postData.weather.temperature, locale === 'tr' ? 'tr-TR' : 'en-US'));
      } else {
        setFormattedTemperature('-');
      }
      
      if (postData.weather.windSpeed !== undefined) {
        setFormattedSpeed(formatWindSpeed(postData.weather.windSpeed, locale === 'tr' ? 'tr-TR' : 'en-US'));
      } else {
        setFormattedSpeed('-');
      }
      
      if (postData.weather.pressure !== undefined) {
        setFormattedPressure(formatPressure(postData.weather.pressure, locale === 'tr' ? 'tr-TR' : 'en-US'));
      } else {
        setFormattedPressure('-');
      }
    } else {
      setFormattedTemperature('-');
      setFormattedSpeed('-');
      setFormattedPressure('-');
    }
  }, [postData, formatWeight, formatLength, formatTemperature, formatWindSpeed, formatPressure, locale]);

  // Fetch fish species details for proper localization
  useEffect(() => {
    const fetchSpeciesDetails = async () => {
      if (postData?.fish.speciesId) {
        try {
          const apiService = createNativeApiService();
          const species = await apiService.species.getSpeciesById(postData.fish.speciesId);
          if (species) {
            setFishSpecies(species);
            // Set display name based on locale
            if (locale === 'tr' && species.common_names_tr && species.common_names_tr.length > 0) {
              setFishDisplayName(species.common_names_tr[0]);
            } else {
              setFishDisplayName(species.common_name);
            }
          }
        } catch (error) {
        }
      }
    };

    fetchSpeciesDetails();
  }, [postData?.fish.speciesId, locale]);

  // Reverse geocoding for coordinates
  useEffect(() => {
    const fetchLocationName = async () => {
      if (postData?.coordinates && postData.coordinates.length === 2) {
        try {
          const geocodingService = getNativeGeocodingService();
          const [longitude, latitude] = postData.coordinates;
          
          const result = await geocodingService.reverseGeocode(latitude, longitude, {
            language: locale === 'tr' ? 'tr' : 'en',
            useCache: true
          });
          
          if (result.formattedAddress) {
            setGeocodedLocation(result.formattedAddress);
          }
        } catch (error) {
          // If geocoding fails, we'll just show coordinates
        }
      }
    };

    fetchLocationName();
  }, [postData?.coordinates, locale]);

  // Listen for comment events - HomeScreen pattern
  useEffect(() => {
    if (!postData) return;
    
    const unsubscribeAdded = CommentEventEmitter.onCommentAdded(({ postId, newCount, hasUserCommented }) => {
      if (postData && postData.id === postId) {
        setHasUserCommented(hasUserCommented);
        setCommentsCount(newCount);
        setPostData({
          ...postData,
          comments: newCount,
          hasUserCommented: hasUserCommented
        });
      }
    });

    const unsubscribeDeleted = CommentEventEmitter.onCommentDeleted(({ postId, newCount, hasUserCommented }) => {
      if (postData && postData.id === postId) {
        setHasUserCommented(hasUserCommented);
        setCommentsCount(newCount);
        setPostData({
          ...postData,
          comments: newCount,
          hasUserCommented: hasUserCommented
        });
      }
    });

    return () => {
      unsubscribeAdded();
      unsubscribeDeleted();
    };
  }, [postData]);

  // Listen for comments screen updates
  useFocusEffect(
    useCallback(() => {
      // Check if we're coming back from Comments screen with updated data
      if (route.params && 'updatedCommentData' in route.params) {
        const { updatedCommentData } = route.params;
        if (updatedCommentData) {
          setHasUserCommented(updatedCommentData.hasUserCommented);
          setCommentsCount(updatedCommentData.commentsCount);
          
          // Update postData to keep consistency - use proper database field names
          if (postData) {
            setPostData({
              ...postData,
              comments: updatedCommentData.commentsCount,
              hasUserCommented: updatedCommentData.hasUserCommented
            });
          }
        }
      }
    }, [route.params, postData])
  );

  const showMoreOptions = async () => {
    // Güncel user bilgisini al
    let currentUser = user;
    
    // Eğer user henüz yüklenmediyse, direkt Supabase'den al
    if (!currentUser) {
      try {
        const { data: { user: authUser } } = await nativeSupabase.auth.getUser();
        currentUser = authUser;
      } catch (error) {
        currentUser = null;
      }
    }
    
    // String'e çevir ve güvenli karşılaştırma yap
    const postUserId = String(postData?.user.id || '').trim();
    const currentUserId = String(currentUser?.id || '').trim();
    
    // Kullanıcı kendi postuna mı bakıyor kontrol et
    if (postUserId && currentUserId && postUserId === currentUserId) {
      setShowOwnPostOptionsModal(true);
    } else {
      setShowOptionsModal(true);
    }
  };

  const handleReport = () => {
    setShowOptionsModal(false);
    setShowReportReasonModal(true);
  };
  
  const handleReportReasonSelect = () => {
    if (!selectedReportReason) return;
    setShowReportReasonModal(false);
    setSuccessMessage(t('postDetail.reportSuccess'));
    setShowSuccessModal(true);
    setSelectedReportReason(null);
  };

  const handleBlock = () => {
    setShowOptionsModal(false);
    setShowBlockConfirmModal(true);
  };

  const confirmBlock = async () => {
    if (!postData || !postData.user.id) return;
    setShowBlockConfirmModal(false);
    
    try {
      // Check if user is logged in
      if (!user) {
        setErrorMessage(t('common.loginRequired'));
        setShowErrorModal(true);
        return;
      }
      
      const apiService = createNativeApiService();
      await apiService.contacts.blockUser(user.id, postData.user.id);
      
      setSuccessMessage(t('home.success.blocked'));
      setShowSuccessModal(true);
      
      // Remove blocked user's posts from feed
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('MainTabs');
        }
      }, 1500);
    } catch (error) {
      setErrorMessage(t('home.error.blockFailed'));
      setShowErrorModal(true);
    }
  };

  const handleDeletePost = () => {
    setShowOwnPostOptionsModal(false);
    setShowDeleteConfirmModal(true);
  };

  const handleEditPost = useCallback(() => {
    if (!postData) return;
    setShowOwnPostOptionsModal(false);
    
    // Navigate to AddCatchScreen with edit mode - PostDetailScreen'e geri dön
    navigation.navigate('AddCatch', {
      editMode: true,
      postId: postData.id,
      postData: postData,
      returnToPostDetail: true, // PostDetailScreen'e geri dön flag'i
      returnPostId: postData.id  // Hangi post detail'e dönecek
    });
  }, [postData, navigation]);

  const confirmDeletePost = async () => {
    if (!postData) return;
    setShowDeleteConfirmModal(false);
    
    // Check if user is logged in
    if (!user) {
      setErrorMessage(t('common.loginRequired'));
      setShowErrorModal(true);
      return;
    }
    
    const profileStore = useProfileStore.getState();
    
    // INSTAGRAM STYLE: Instant optimistic update
    profileStore.markPostAsDeleted(postData.id.toString());
    profileStore.markPostDeleted(user.id);
    
    // INSTANT navigate back - 0 delay, Instagram style
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  
    postsServiceNative.deletePost(postData.id).catch(() => {
    });
  };


  if (loading || !postData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('postDetail.catchDetails')}
          leftButtons={[
            {
              icon: 'arrow-left',
              onPress: () => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('MainTabs');
                }
              }
            }
          ]}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  const handleShare = async () => {
    if (!postData) return;
    
    try {
      const baseUrl = __DEV__ ? 'http://localhost:3000' : 'https://fishivo.com';
      const currentLocale = locale || 'tr';
      const referrerId = user?.id || '';
      const referrerFirstName = user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
      const shortReferrerId = referrerId.split('-')[0];
      const postUrl = `${baseUrl}/${currentLocale}/catches/${postData.id}?r=${shortReferrerId}&n=${encodeURIComponent(referrerFirstName)}`;
      
      const parseWeightLength = (value: string, defaultUnit: string) => {
        if (!value) return '';
        if (value.includes('kg') || value.includes('lbs') || value.includes('g') || value.includes('oz')) {
          return value;
        }
        if (value.includes('cm') || value.includes('in') || value.includes('m') || value.includes('ft')) {
          return value;
        }
        return `${value} ${defaultUnit}`;
      };
      
      const weight = parseWeightLength(postData.fish.weight, postData.fish.weightUnit || 'kg');
      const length = parseWeightLength(postData.fish.length, postData.fish.lengthUnit || 'cm');
      
      const message = t('common.sharePostMessage', {
        userName: postData.user.name,
        fishSpecies: fishDisplayName || postData.fish.species,
        weight: weight,
        length: length
      });

      const shareOptions = Platform.OS === 'ios' 
        ? {
            message: `${message}\n\n${postUrl}`,
          }
        : {
            title: t('common.sharePostTitle'),
            message: `${message}\n\n${postUrl}`,
          };

      await Share.share(shareOptions);
    } catch (error) {
      setErrorMessage(t('common.shareError'));
      setShowErrorModal(true);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={t('postDetail.catchDetails')}
        leftButtons={[
          {
            icon: 'arrow-left',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs');
              }
            }
          }
        ]}
        rightButtons={[
          {
            icon: 'share',
            onPress: handleShare
          },
          {
            icon: 'more-vertical',
            onPress: showMoreOptions
          }
        ]}
      />
      
      <ScreenContainer paddingVertical="none">
        {postData ? (
          <FlatList
            data={[{ type: 'content', data: postData }]}
            keyExtractor={(item) => item.type}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.listContent, theme.listContentStyleWithTabBar]}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={3}
            removeClippedSubviews={true}
            renderItem={({ item: _item }) => (
              <View>
            {/* CatchCard Component */}
            <CatchCard
              item={{
                ...postData,
                image: postData.images?.[0] || '',
                user: {
                  ...postData.user,
                  country: postData.catchCountryCode
                },
                fish: {
                  ...postData.fish,
                  weightUnit: 'kg',
                  lengthUnit: 'cm'
                },
                isLiked: postData.isLiked || false,
                hasUserCommented: hasUserCommented
              }}
              currentUserId={user?.id}
              isFollowing={isFollowing}
              isPending={isPending}
              onFollowToggle={toggleFollow}
              onUserPress={(userId: string) => navigation.navigate('Profile', { userId })}
              onPostPress={() => {}}
              onMorePress={showMoreOptions}
              onCommentPress={() => navigation.navigate('Comments', { 
                postId: postData.id,
                postUserId: postData.user.id,
                returnToPostDetail: true,
                currentCommentData: {
                  hasUserCommented: hasUserCommented,
                  commentsCount: commentsCount
                }
              })}
              hideSpeciesImage={true}
              hideBadge={true}
              hideMoreButton={true}
              hideShareButton={true}
              badgeActive={false}
            />
            
            <View style={styles.infoSection}>
          <SectionHeader 
            title={t('postDetail.catchDetails')}
          />
          <View style={styles.card}>
            {/* Weight */}
            <View style={[styles.infoRow, { marginTop: theme.spacing.xs }]}>
              <Weight size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoLabel}>{t('postDetail.weight')}:</Text>
              <Text style={styles.infoValue}>{formattedWeight || '-'}</Text>
            </View>

            {/* Length */}
            <View style={styles.infoRow}>
              <Ruler size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoLabel}>{t('postDetail.length')}:</Text>
              <Text style={styles.infoValue}>{formattedLength || '-'}</Text>
            </View>

            {/* Date */}
            <View style={styles.infoRow}>
              <Clock size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoLabel}>{t('postDetail.date')}:</Text>
              <Text style={styles.infoValue}>{postData.timeAgo || '-'}</Text>
            </View>

            {/* Method / Fishing Discipline */}
            <View style={styles.infoRow}>
              <Fish size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoLabel}>{t('postDetail.method')}:</Text>
              <Text style={styles.infoValue}>
                {fishingTechnique 
                  ? (locale === 'tr' ? fishingTechnique.name : fishingTechnique.name_en || fishingTechnique.name)
                  : (postData.method || '-')}
              </Text>
            </View>

            {/* Released Switch */}
            <View style={[styles.infoRow, styles.releasedRow]}>
              <Icon 
                name="refresh-cw" 
                size={16} 
                color={theme.colors.textSecondary} 
              />
              <Text style={styles.infoLabel}>{t('postDetail.catchAndRelease')}:</Text>
              <View style={styles.releasedSwitchContainer}>
                <Switch
                  value={postData.released || false}
                  trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
                  thumbColor={postData.released ? theme.colors.background : theme.colors.text}
                  style={styles.releaseSwitch}
                  disabled={true}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Map Section */}
        {postData.coordinates && (
          <View style={styles.infoSection}>
            <SectionHeader 
              title={t('postDetail.catchLocation')}
            />
            <View style={styles.mapContainer}>
            {UniversalMapView ? (
              <UniversalMapView
                key={`map-${postData.id}-${isDark ? 'dark' : 'light'}`}
                style={styles.map}
                provider="maplibre"
                fallbackProvider="maplibre"
                initialRegion={{
                  latitude: postData.coordinates[1],
                  longitude: postData.coordinates[0],
                  latitudeDelta: 4.0,
                  longitudeDelta: 4.0,
                }}
                mapStyle={isDark ? 'https://tiles.openfreemap.org/styles/dark' : 'https://tiles.openfreemap.org/styles/positron'}
                showUserLocation={false}
                showCompass={false}
                showScale={false}
                markers={[
                  {
                    id: `catch-location-${postData.id}`,
                    coordinate: {
                      latitude: postData.coordinates[1],
                      longitude: postData.coordinates[0],
                    },
                    customView: <FishivoMarker />,
                  },
                ]}
              />
            ) : (
              <View style={styles.mapLoading}>
                <Text>Harita yükleniyor...</Text>
              </View>
            )}

            <View style={styles.mapLocationOverlay}>
              <Text style={styles.locationName}>
                {(() => {
                  // Lokasyon bilgisini formatla - İl, İlçe, Ülke şeklinde
                  const location = postData.catchLocation || geocodedLocation || postData.user.location || t('common.noLocation');
                  // Eğer mahalle varsa kaldır (ilk virgülden öncesi mahalle olabilir)
                  const parts = location.split(', ');
                  if (parts.length >= 3) {
                    // Mahalle varsa atla, İl, İlçe, Ülke formatında göster
                    const formattedLocation = parts.length > 3 
                      ? `${parts[parts.length - 2]}, ${parts[parts.length - 3]}, ${parts[parts.length - 1]}`
                      : parts.join(', ');
                    return formattedLocation;
                  }
                  return location;
                })()}
                {' • '}
                {(() => {
                  const coords = postData.coordinates;
                  const latitude = coords[1];
                  const longitude = coords[0];
                  return `${Math.abs(latitude).toFixed(6)}°${latitude >= 0 ? 'N' : 'S'}, ${Math.abs(longitude).toFixed(6)}°${longitude >= 0 ? 'E' : 'W'}`;
                })()}
              </Text>
            </View>
          </View>
          </View>
        )}

        {/* Fish Info Section */}
        <View style={styles.infoSection}>
          <SectionHeader 
            title={t('postDetail.fishInfo')}
          />
          
          <FishInfoCard
            species={fishDisplayName}
            speciesId={postData.fish.speciesId}
            speciesImage={postData.fish.speciesImage}
            scientificName={fishSpecies?.scientific_name}
            conservationStatus={fishSpecies?.conservation_status}
            locale={locale}
            onPress={postData.fish.speciesId ? () => {
              navigation.navigate('FishDetail', { 
                species: {
                  id: postData.fish.speciesId
                }
              });
            } : undefined}
          />
        </View>

        {/* Weather Section */}
        <View style={styles.infoSection}>
          <SectionHeader 
            title={t('postDetail.weather')}
          />
          
          <WeatherGrid
            temperature={formattedTemperature}
            wind={formattedSpeed}
            windDirection={postData.weather?.windDirection}
            pressure={formattedPressure}
            sunDirection={postData.weather?.sun_direction}
            moonPhase={postData.weather?.moon_phase}
          />
        </View>

        {/* Equipment Section */}
        {postData.equipmentDetails && postData.equipmentDetails.length > 0 && (
          <View style={styles.infoSection}>
            <SectionHeader 
              title={t('postDetail.usedEquipment')}
            />
            <View style={styles.equipmentGrid}>
              {postData.equipmentDetails.map((item) => (
                <View key={item.id} style={styles.equipmentItem}>
                  <EquipmentCard
                    item={item}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Live Bait Section */}
        {(postData.useLiveBait && postData.liveBait) && (
          <View style={styles.infoSection}>
            <SectionHeader 
              title={t('postDetail.liveBait')}
            />
            <View style={styles.baitContainer}>
              <View style={styles.baitItem}>
                <Icon name="fish" size={16} color={theme.colors.accent} />
                <Text style={styles.baitLabel}>{t('postDetail.usedBait')}</Text>
                <Text style={styles.baitValue}>{postData.liveBait}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Private Note Section - Only visible to post owner */}
        {user?.id && postData && user.id.trim() === postData.user.id.trim() && privateNote && (
          <View style={styles.infoSection}>
            <SectionHeader 
              title={t('postDetail.privateNote')}
            />
            <View style={[styles.card, styles.privateNoteCard]}>
              <View style={styles.privateNoteHeader}>
                <Icon name="shield-check" size={16} color={theme.colors.primary} />
                <Text style={styles.privateNoteLabel}>
                  {t('postDetail.privateNoteInfo')}
                </Text>
              </View>
              <Text style={styles.privateNoteText}>
                {privateNote}
              </Text>
            </View>
          </View>
        )}
              </View>
            )}
          />
        ) : null}
      </ScreenContainer>

      {/* Options Modal - For other users' posts */}
      <FishivoModal
        visible={showOptionsModal}
        title={t('home.actions.title')}
        onClose={() => setShowOptionsModal(false)}
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

      {/* Own Post Options Modal */}
      <FishivoModal
        visible={showOwnPostOptionsModal}
        title={t('home.actions.postOptions')}
        onClose={() => setShowOwnPostOptionsModal(false)}
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

      {/* Delete Confirm Modal */}
      <FishivoModal
        visible={showDeleteConfirmModal}
        title={t('home.actions.deleteConfirmTitle')}
        onClose={() => setShowDeleteConfirmModal(false)}
        preset="confirm"
        description={t('home.actions.deleteConfirmMessage')}
        primaryButton={{
          text: t('home.actions.confirmDelete'),
          onPress: confirmDeletePost,
          variant: 'destructive'
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => setShowDeleteConfirmModal(false)
        }}
      />

      {/* Block Confirm Modal */}
      <FishivoModal
        visible={showBlockConfirmModal}
        title={t('home.actions.blockTitle')}
        onClose={() => setShowBlockConfirmModal(false)}
        preset="confirm"
        description={t('home.actions.blockConfirmMessage', { name: postData?.user.name || '' })}
        primaryButton={{
          text: t('home.actions.confirmBlock'),
          onPress: confirmBlock,
          variant: 'destructive'
        }}
        secondaryButton={{
          text: t('common.cancel'),
          onPress: () => setShowBlockConfirmModal(false)
        }}
      />

      {/* Report Reason Modal */}
      <FishivoModal
        visible={showReportReasonModal}
        title={t('profile.userProfile.reportReasonTitle')}
        description={t('profile.userProfile.reportReasonSelect')}
        onClose={() => {
          setShowReportReasonModal(false);
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
            setShowReportReasonModal(false);
            setSelectedReportReason(null);
          }
        }}
      />

      <FishivoModal
        visible={showSuccessModal}
        title={t('common.success')}
        onClose={() => setShowSuccessModal(false)}
        preset="success"
        description={successMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowSuccessModal(false)
        }}
      />

      {/* Error Modal */}
      <FishivoModal
        visible={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('MainTabs');
          }
        }}
        preset="error"
        title={t('common.error')}
        description={errorMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => {
            setShowErrorModal(false);
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          }
        }}
      />

      {/* Full-screen Image Viewer */}
      {postData.images && postData.images.length > 0 && (
        <ImageViewerModal
          visible={showImageViewer}
          images={postData.images}
          initialIndex={_viewerInitialIndex}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </View>
  );
};

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingBottom: theme.spacing.xl * 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  optionsList: {
    gap: theme.spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  cancelOption: {
    marginTop: theme.spacing.sm,
  },
  // Info sections - CatchDetailScreen ile aynı
  infoSection: {
    marginBottom: theme.spacing.xs,
    marginHorizontal: 0,
  },
  sectionTitle: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  weatherGrid: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '32%',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  weatherLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  weatherValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Map section - CatchDetailScreen'den birebir
  mapContainer: {
    height: 250,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 0,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  mapLocationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  locationName: {
    fontSize: theme.typography.xs, // Daha küçük font
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 0,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
  releaseSwitch: {
    transform: [{ scaleX: 0.69 }, { scaleY: 0.69 }], // %15 büyütüldü
    marginRight: -10,
  },
  releasedRow: {
    alignItems: 'center' as const,
    marginBottom: 0,
  },
  releasedSwitchContainer: {
    flex: 1,
    alignItems: 'flex-end' as const,
  },
  // Equipment styles
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  equipmentItem: {
    width: '48%',
  },
  equipmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    gap: 4,
  },
  equipmentTagText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  // Bait styles
  baitContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  baitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  baitLabel: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  baitValue: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.semibold,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
  },
  privateNoteCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    opacity: 0.95,
  },
  privateNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  privateNoteLabel: {
    fontSize: 12,
    color: theme.colors.primary,
    fontStyle: 'italic',
    flex: 1,
  },
  privateNoteText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

export default PostDetailScreen;