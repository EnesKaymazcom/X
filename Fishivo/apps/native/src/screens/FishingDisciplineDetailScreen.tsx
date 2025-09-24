import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Icon, 
  AppHeader, 
  ScreenContainer,
  Button,
  ReviewSection,
  RatingDisplay,
  SectionHeader,
  StickyTabLayout,
  FishivoModal,
  ReviewModal
} from '@/components/ui';
import { FishingTechniqueCatchesTab } from '@/components/fishing-techniques';
import { TabConfig } from '@/hooks';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { 
  createNativeApiService
} from '@fishivo/api';
interface TechniqueReview {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  review_text?: string;
  created_at: string;
  helpful_count?: number;
  unhelpful_count?: number;
  is_beginner_friendly?: boolean;
  is_weather_sensitive?: boolean;
  is_suitable_for_night?: boolean;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

import type { FishingTechnique } from '@/types/navigation';
import { Theme } from '@/theme';
import LinearGradient from 'react-native-linear-gradient';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { CommonActions } from '@react-navigation/native';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

type FishingDisciplineDetailScreenProps = StackScreenProps<RootStackParamList, 'FishingDisciplineDetail'>;

interface TechniqueStatistics {
  totalFollowers: number;
  totalCatches: number;
  avgRating: number;
  totalReviews: number;
}

const FishingDisciplineDetailScreen: React.FC<FishingDisciplineDetailScreenProps> = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useSupabaseUser();
  const styles = createStyles(theme, isDark);
  const { technique: routeTechnique } = route.params;
  
  const reviewSectionRef = useRef<View>(null);
  
  const [technique, setTechnique] = useState<FishingTechnique | null>(routeTechnique || null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [statistics, setStatistics] = useState<TechniqueStatistics | null>(null);
  const [userVotes, setUserVotes] = useState<{ [reviewId: string]: boolean }>({});
  const [reviews, setReviews] = useState<TechniqueReview[]>([]);
  const [userReview, setUserReview] = useState<TechniqueReview | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isBeginnerFriendly, setIsBeginnerFriendly] = useState<boolean | null>(null);
  const [isWeatherSensitive, setIsWeatherSensitive] = useState<boolean | null>(null);
  const [isSuitableForNight, setIsSuitableForNight] = useState<boolean | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getTechniqueName = (): string => {
    if (!technique) return '';
    return locale === 'tr' ? technique.name : (technique.name_en || technique.name);
  };

  const getDescription = (): string => {
    if (!technique) return '';
    return locale === 'tr' ? 
      (technique.description || '') : 
      (technique.description_en || technique.description || '');
  };

  const getDetailedDescription = (): string => {
    if (!technique) return '';
    return locale === 'tr' ? 
      (technique.detailed_description || '') : 
      (technique.detailed_description_en || technique.detailed_description || '');
  };

  const getTipsDetailed = () => {
    if (!technique?.tips_detailed) return [];
    return technique.tips_detailed;
  };

  useEffect(() => {
    const fetchTechniqueDetail = async () => {
      try {
        setLoading(true);
        const apiService = createNativeApiService();
        
        if (!technique) {
          const data = await apiService.fishingTechniques.getFishingTechniqueById(routeTechnique.id);
          if (data) {
            setTechnique(data);
          }
        }
        
        // Check follow status
        if (user && technique) {
          const supabase = getNativeSupabaseClient();
          const { data: followData } = await supabase
            .from('user_fishing_technique_follows')
            .select('*')
            .eq('user_id', user.id)
            .eq('fishing_technique_id', technique.id)
            .single();
          
          setIsFollowing(!!followData);
        }

        // Fetch real statistics from API
        if (technique) {
          const stats = await apiService.fishingTechniques.getTechniqueStatistics(technique.id);
          setStatistics(stats);

          // Fetch reviews
          const techniqueReviews = await apiService.fishingTechniques.getTechniqueReviews(technique.id);
          setReviews(techniqueReviews);

          // Get user review if exists
          if (user) {
            const userTechniqueReview = await apiService.fishingTechniques.getUserReviewForTechnique(technique.id, user.id);
            setUserReview(userTechniqueReview);
          }

          // Get user votes for reviews
          if (techniqueReviews.length > 0 && user) {
            const reviewIds = techniqueReviews.map(r => r.id);
            try {
              const votes = await apiService.fishingTechniques.getUserReviewVotes(reviewIds);
              setUserVotes(votes);
            } catch (err) {
              // Voting might not be available yet
            }
          }

        }

      } catch (error) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchTechniqueDetail();
  }, [routeTechnique, technique, user]);

  const handleFollowToggle = async () => {
    if (!technique) return;
    
    // Login check
    const supabase = getNativeSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Auth'a yönlendirme yapmıyoruz
      setModalMessage(t('common.loginRequired'));
      setShowErrorModal(true);
      return;
    }
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from('user_fishing_technique_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('fishing_technique_id', technique.id);
        
        setIsFollowing(false);
        if (statistics) {
          setStatistics({
            ...statistics,
            totalFollowers: Math.max(0, statistics.totalFollowers - 1)
          });
        }
      } else {
        await supabase
          .from('user_fishing_technique_follows')
          .insert({
            user_id: user.id,
            fishing_technique_id: technique.id
          });
        
        setIsFollowing(true);
        if (statistics) {
          setStatistics({
            ...statistics,
            totalFollowers: statistics.totalFollowers + 1
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        setModalMessage(t('fishingDisciplines:follow.followSystemNotActive'));
        setShowErrorModal(true);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    if (!technique) return;
    
    try {
      await Share.share({
        message: `${getTechniqueName()} - ${getDescription()}`,
        title: getTechniqueName(),
      });
    } catch (error) {
      // Error handled silently
    }
  };

  // Tab configuration
  const disciplineTabs: TabConfig[] = [
    { id: 'details', label: t('fishingDisciplines:tabs.details') },
    { id: 'reviews', label: t('fishingDisciplines:tabs.reviews') },
    { id: 'catches', label: t('fishingDisciplines:tabs.catches') },
    { id: 'equipment', label: t('fishingDisciplines:tabs.topGear') }
  ];

  const handleReviewSubmit = async (data: {
    rating: number;
    review_text?: string;
    difficulty_level?: 'easy' | 'medium' | 'hard';
    caught_count?: number;
    best_season?: string;
    best_technique?: string;
    fishing_tips?: string;
    is_beginner_friendly?: boolean;
    is_weather_sensitive?: boolean;
    is_suitable_for_night?: boolean;
  }) => {
    if (!technique) return;

    try {
      /*
      // Submit community data if provided
      const communityData = {
        is_beginner_friendly: data.is_beginner_friendly ?? undefined,
        is_weather_sensitive: data.is_weather_sensitive ?? undefined,
        is_suitable_for_night: data.is_suitable_for_night ?? undefined
      };
      
      if (communityData.is_beginner_friendly !== undefined || 
          communityData.is_weather_sensitive !== undefined || 
          communityData.is_suitable_for_night !== undefined) {
        const apiService = createNativeApiService();
        try {
          // Check if submitCommunityData method exists for fishing techniques
          if (apiService.fishingTechniques.submitCommunityData) {
            await apiService.fishingTechniques.submitCommunityData(technique.id, communityData);
          }
          
          // Check if getCommunityStats method exists
          if (apiService.fishingTechniques.getCommunityStats) {
            const newStats = await apiService.fishingTechniques.getCommunityStats(technique.id);
            setCommunityStats(newStats);
          }
        } catch (err) {
          // Community features might not be available for fishing techniques yet
        }
      }
      */
      
      const reviewData = {
        rating: data.rating,
        review_text: data.review_text,
        is_beginner_friendly: data.is_beginner_friendly,
        is_weather_sensitive: data.is_weather_sensitive,
        is_suitable_for_night: data.is_suitable_for_night
      };
      
      const apiService = createNativeApiService();
      if (editingReview && userReview) {
        const updatedReview = await apiService.fishingTechniques.updateReview(userReview.id, reviewData);
        setUserReview(updatedReview);
        setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r));
        
        if (statistics) {
          const newStats = await apiService.fishingTechniques.getTechniqueStatistics(technique.id);
          if (newStats) setStatistics(newStats);
        }
      } else {
        const newReview = await apiService.fishingTechniques.createReview(technique.id, reviewData);
        setUserReview(newReview);
        setReviews([newReview, ...reviews]);
        
        if (statistics) {
          setStatistics({
            ...statistics,
            totalReviews: statistics.totalReviews + 1,
            avgRating: ((statistics.avgRating * statistics.totalReviews) + reviewData.rating) / (statistics.totalReviews + 1)
          });
        }
        
        // Update community stats after review
        try {
          // const updatedCommunityStats = await apiService.fishingTechniques.getCommunityStats(technique.id);
          // setCommunityStats(updatedCommunityStats);
        } catch (err) {
          // Silently handle error
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Review gönderilemedi';
      setModalMessage(errorMessage);
      setShowErrorModal(true);
    }
  };

  // Render tab content
  const renderTabContent = (activeTab: string) => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'reviews':
        return renderReviewsTab();
      case 'catches':
        return renderCatchesTab();
      case 'equipment':
        return renderEquipmentTab();
      default:
        return renderDetailsTab();
    }
  };

  const renderDetailsTab = () => (
    <View>
      {/* Short Description */}
      {getDescription() && (
        <View style={styles.infoSection}>
          <SectionHeader 
            title={t('fishingDisciplines:description')}
          />
          <View style={styles.card}>
            <Text style={styles.description}>{getDescription()}</Text>
          </View>
        </View>
      )}

      {/* Detailed Description */}
      {getDetailedDescription() && (
        <View style={styles.infoSection}>
          <SectionHeader 
            title={locale === 'tr' ? 'Detaylı Bilgi' : 'Detailed Information'}
          />
          <View style={styles.card}>
            <Text style={styles.detailedDescription}>{getDetailedDescription()}</Text>
          </View>
        </View>
      )}

      {/* Detailed Tips */}
      {getTipsDetailed().length > 0 && (
        <View style={styles.infoSection}>
          <SectionHeader 
            title={locale === 'tr' ? 'Teknik İpuçları' : 'Technical Tips'}
          />
          {getTipsDetailed().map((tip: any, index: number) => (
            <View key={index} style={[styles.card, index > 0 && styles.tipCardMargin]}>
              <View style={styles.tipDetailHeader}>
                <Icon name="check-circle" size={18} color={theme.colors.success} />
                <Text style={styles.tipDetailTitle}>
                  {locale === 'tr' ? tip.title : (tip.title_en || tip.title)}
                </Text>
              </View>
              <Text style={styles.tipDetailContent}>
                {locale === 'tr' ? tip.content : (tip.content_en || tip.content)}
              </Text>
            </View>
          ))}
        </View>
      )}

    </View>
  );

  const renderReviewsTab = () => (
    <View ref={reviewSectionRef}>
      <ReviewSection
        reviews={reviews as any}
        userReview={userReview as any}
        locale={locale}
      onAddReview={async () => {
        const supabase = getNativeSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Auth'a yönlendirme yapmıyoruz
          setModalMessage(t('common.loginRequired'));
          setShowErrorModal(true);
          return;
        }
        
        setEditingReview(false);
        setIsReviewModalOpen(true);
      }}
      onEditReview={() => {
        if (userReview) {
          setEditingReview(true);
          setReviewRating(userReview.rating || 0);
          setReviewText(userReview.review_text || userReview.comment || '');
          setIsBeginnerFriendly(userReview.is_beginner_friendly ?? null);
          setIsWeatherSensitive(userReview.is_weather_sensitive ?? null);
          setIsSuitableForNight(userReview.is_suitable_for_night ?? null);
          setIsReviewModalOpen(true);
        }
      }}
      onDeleteReview={() => {
        setShowDeleteConfirm(true);
      }}
      onUserPress={(userId) => {
        if (userId === user?.id) {
          navigation.navigate('MainTabs', { screen: 'Profile' });
        } else {
          navigation.navigate('UserProfile', { userId });
        }
      }}
      onVoteHelpful={async (reviewId, isHelpful) => {
        try {
          const apiService = createNativeApiService();
          
          // Vote for the review
          await apiService.fishingTechniques.voteReviewHelpful(reviewId, isHelpful);
          
          // Update local state immediately for better UX
          setUserVotes(prev => ({ ...prev, [reviewId]: isHelpful }));
          
          // Update review counts locally
          setReviews(prevReviews => 
            prevReviews.map(review => {
              if (review.id === reviewId) {
                const oldVote = userVotes[reviewId];
                let helpful_count = review.helpful_count || 0;
                let unhelpful_count = review.unhelpful_count || 0;
                
                // Remove old vote count if exists
                if (oldVote === true) helpful_count--;
                if (oldVote === false) unhelpful_count--;
                
                // Add new vote count
                if (isHelpful) helpful_count++;
                else unhelpful_count++;
                
                return { ...review, helpful_count, unhelpful_count };
              }
              return review;
            })
          );
        } catch (err) {
          setModalMessage(`${t('fishingDisciplines:reviews.couldNotVote')}: ${err instanceof Error ? err.message : String(err)}`);
          setShowErrorModal(true);
        }
      }}
      onReportReview={async (reviewId, reason, description) => {
        const supabase = getNativeSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigation.dispatch(
            CommonActions.reset({ 
              index: 0, 
              routes: [{ name: 'Auth' }] 
            })
          );
          throw new Error('Not authenticated');
        }
        
        const apiService = createNativeApiService();
        const success = await apiService.reports.reportReview(
          user.id,
          reviewId,
          reason,
          description
        );
        
        if (!success) {
          throw new Error('Failed to report review');
        }
        
        // ReviewSection kendi success/error modal'larını gösterecek
      }}
      userVotes={userVotes}
    />
    </View>
  );

  const renderCatchesTab = () => (
    <FishingTechniqueCatchesTab techniqueId={String(technique!.id)} />
  );

  const renderEquipmentTab = () => (
    <View>
      {technique?.equipment && (
        <View style={styles.infoSection}>
          <SectionHeader 
            title={t('fishingDisciplines:recommendedEquipment')}
          />
          <View style={styles.card}>
            {Object.entries(technique.equipment).map(([key, value]: [string, any]) => (
              <View key={key} style={styles.infoRow}>
                <Icon name="package" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>{key}:</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  // Header content (technique image + info)
  const renderHeaderContent = () => (
    <>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <Text style={styles.scientificName}>{(technique as { code?: string }).code || technique!.name}</Text>
          <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            onPress={handleFollowToggle}
            disabled={followLoading}
            loading={followLoading}
            icon={isFollowing ? 'user' : 'user-plus'}
            size="sm"
          >
            {isFollowing ? t('fishingDisciplines:following') : t('fishingDisciplines:followAction')}
          </Button>
        </View>
        {statistics && (
          <View style={styles.statsColumn}>
            <View style={styles.statItem}>
              <Icon name="users" size={16} color={theme.colors.primary} />
              <Text style={styles.statText}>
                {`${statistics.totalFollowers} ${statistics.totalFollowers === 1 ? t('fishingDisciplines:follower') : t('fishingDisciplines:followers')}`}
              </Text>
            </View>
            <RatingDisplay 
              rating={statistics.avgRating || 0} 
              count={statistics.totalReviews}
              size="small"
              onPress={() => {}} // Reviews'a geçiş StickyTabLayout'da handle edilecek
            />
          </View>
        )}
      </View>

      {/* Image */}
      <View style={styles.imageCard}>
        <View style={styles.imageContainer}>
          {technique!.image_url && !imageError ? (
            <Image
              source={{ uri: technique!.image_url }}
              style={styles.image}
              onError={() => setImageError(true)}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={isDark ? ['#1E3A8A', '#1E40AF'] : ['#EFF6FF', '#DBEAFE']}
              style={styles.imagePlaceholder}
            >
              <Icon name={technique!.icon || 'anchor'} size={64} color="#60A5FA" />
            </LinearGradient>
          )}
        </View>
      </View>
    </>
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader
          title=""
          onBackPress={() => {
            navigation.goBack();
          }}
        />
        <ScreenContainer paddingVertical="none">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </ScreenContainer>
      </View>
    );
  }

  if (!technique) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('common.error')}
          onBackPress={() => {
            navigation.goBack();
          }}
        />
        <ScreenContainer paddingVertical="none">
          <View style={styles.errorContainer}>
            <Icon name="alert-triangle" size={24} color={theme.colors.error} />
            <Text style={styles.errorText}>{String(t('fishingDisciplines:errorLoadingData') || 'Technique not found')}</Text>
            <Button
              variant="primary"
              onPress={() => {
                navigation.goBack()
              }}
              icon="arrow-left"
            >
              {t('common.back')}
            </Button>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={getTechniqueName()}
        onBackPress={() => {
          navigation.goBack()
        }}
        rightButtons={[{ icon: 'share', onPress: handleShare }]}
      />

      <ScreenContainer paddingVertical="none" paddingHorizontal="none">
        <StickyTabLayout
          headerContent={renderHeaderContent()}
          tabs={disciplineTabs}
          renderTabContent={renderTabContent}
          contentContainerStyle={[styles.scrollContent, theme.listContentStyle]}
          stickyPoint={350}
          initialTab="details"
        />
      </ScreenContainer>

      {/* Review Modal */}
      <ReviewModal
        visible={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(false);
          // Reset form
          setReviewRating(0);
          setReviewText('');
          setIsBeginnerFriendly(null);
          setIsWeatherSensitive(null);
          setIsSuitableForNight(null);
        }}
        onSubmit={async (data) => {
          try {
            await handleReviewSubmit({
              rating: data.rating,
              review_text: data.reviewText,
              is_beginner_friendly: data.isBeginnerFriendly ?? undefined,
              is_weather_sensitive: data.isWeatherSensitive ?? undefined,
              is_suitable_for_night: data.isSuitableForNight ?? undefined
            });
            // Reset form after successful submit
            setReviewRating(0);
            setReviewText('');
            setIsBeginnerFriendly(null);
            setIsWeatherSensitive(null);
            setIsSuitableForNight(null);
            setIsReviewModalOpen(false);
          } catch (error) {
            // Error is handled in handleReviewSubmit
            // Modal stays open for user to retry
          }
        }}
        title={editingReview
          ? t('fishingDisciplines:reviews.editReview')
          : t('fishingDisciplines:reviews.addReview')
        }
        itemName={technique ? getTechniqueName() : ''}
        itemIcon="anchor"
        rating={reviewRating}
        onRatingChange={setReviewRating}
        reviewText={reviewText}
        onReviewTextChange={setReviewText}
        showCommunityQuestions={true}
        isBeginnerFriendly={isBeginnerFriendly}
        onIsBeginnerFriendlyChange={setIsBeginnerFriendly}
        isWeatherSensitive={isWeatherSensitive}
        onIsWeatherSensitiveChange={setIsWeatherSensitive}
        isSuitableForNight={isSuitableForNight}
        onIsSuitableForNightChange={setIsSuitableForNight}
        labels={{
          yourRating: t('fishingDisciplines:reviews.yourRating'),
          tapToRate: t('fishingDisciplines:reviews.tapToRate'),
          yourReview: t('fishingDisciplines:reviews.yourReview'),
          reviewPlaceholder: t('fishingDisciplines:reviews.reviewPlaceholder'),
          communityQuestions: t('fishingDisciplines:reviews.communityQuestions'),
          optional: t('fishingDisciplines:reviews.optional'),
          communityDescription: t('fishingDisciplines:reviews.communityDescription'),
          beginnerFriendly: t('fishingDisciplines:reviews.beginnerFriendly'),
          weatherSensitive: t('fishingDisciplines:reviews.weatherSensitive'),
          suitableForNight: t('fishingDisciplines:reviews.suitableForNight'),
          goodEating: undefined,
          goodFighter: undefined,
          hardToCatch: undefined,
          cancel: t('common:cancel'),
          submit: t('common:submit'),
          update: t('fishingDisciplines:reviews.update')
        }}
        isEditing={editingReview}
        isLoading={loading}
      />

      {/* Delete Confirmation Modal */}
      <FishivoModal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('fishingDisciplines:reviews.deleteReview')}
        preset="delete"
        description={t('fishingDisciplines:reviews.deleteReviewConfirm')}
        primaryButton={{
          text: t('common:delete'),
          onPress: async () => {
            try {
              if (!userReview) {
                throw new Error('No review to delete');
              }
              
              const apiService = createNativeApiService();
              await apiService.fishingTechniques.deleteReview(userReview.id);
              
              // Remove from reviews list
              setReviews(reviews.filter(r => r.id !== userReview.id));
              setUserReview(null);
              setShowDeleteConfirm(false);
              
              // Update statistics if exists
              if (statistics && statistics.totalReviews > 0) {
                setStatistics({
                  ...statistics,
                  totalReviews: Math.max(0, statistics.totalReviews - 1),
                  avgRating: statistics.totalReviews > 1 ? 
                    ((statistics.avgRating * statistics.totalReviews) - (userReview.rating || 0)) / (statistics.totalReviews - 1) : 
                    0
                });
              }
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Değerlendirme silinemedi';
              console.error('Delete review error:', err);
              setModalMessage(`Hata: ${errorMessage}`);
              setShowErrorModal(true);
              setShowDeleteConfirm(false);
            }
          }
        }}
        secondaryButton={{
          text: t('common:cancel'),
          onPress: () => setShowDeleteConfirm(false)
        }}
      />

      {/* Error Modal */}
      <FishivoModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        preset="error"
        title={t('common.error')}
        description={modalMessage}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowErrorModal(false)
        }}
      />
    </View>
  );
};

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  headerSection: {
    marginBottom: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: theme.typography.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  statsColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  imageCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    backgroundColor: 'transparent',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: theme.borderRadius.lg - theme.spacing.xs,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginBottom: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  detailedDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    textAlign: 'left',
  },
  tipDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tipDetailTitle: {
    fontSize: 16,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  tipDetailContent: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    textAlign: 'left',
  },
  tipCardMargin: {
    marginTop: theme.spacing.md,
  },
  statsGrid: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  statItemGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '32%',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  lastTipItem: {
    marginBottom: 0,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  bestForGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  bestForBadge: {
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  bestForText: {
    fontSize: 12,
    color: theme.colors.text,
  },
});

export default FishingDisciplineDetailScreen;