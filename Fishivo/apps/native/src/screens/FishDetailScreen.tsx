import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Icon, 
  AppHeader, 
  ScreenContainer, 
  FishSpeciesCard,
  CommunityStats,
  ConservationStatusChart,
  ReviewSection,
  RatingDisplay,
  Button,
  SectionHeader,
  StickyTabLayout,
  FishivoModal,
  ReviewModal
} from '@/components/ui';
import { FishCatchesTab, FishTopGearTab, FishDisciplinesTab } from '@/components/fish';
import { TabConfig } from '@/hooks';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService, CommunityStats as CommunityStatsType } from '@fishivo/api';
import { FishSpecies, SpeciesStatistics, SpeciesReview } from '@fishivo/types';
import { Theme } from '@/theme';
import { getProxiedImageUrl } from '@fishivo/utils';
import { getFeedingType } from '@/utils/feeding-types';
import { getHabitatType } from '@/utils/fish-habitats';
import { useUnits } from '@fishivo/hooks';
import LinearGradient from 'react-native-linear-gradient';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { CommonActions } from '@react-navigation/native';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

type FishDetailScreenProps = StackScreenProps<RootStackParamList, 'FishDetail'>;

const FishDetailScreen: React.FC<FishDetailScreenProps> = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { t, locale } = useTranslation();
  const { formatWeight, formatLength, formatDepth } = useUnits();
  const { user } = useSupabaseUser();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, isDark);
  const { species: routeSpecies, openReviewModal = false } = route.params;
  const apiService = createNativeApiService();
  
  const reviewSectionRef = useRef<View>(null);
  
  const [species, setSpecies] = useState<FishSpecies | null>(null);
  const [relatedSpecies, setRelatedSpecies] = useState<FishSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [statistics, setStatistics] = useState<SpeciesStatistics | null>(null);
  const [reviews, setReviews] = useState<SpeciesReview[]>([]);
  const [userReview, setUserReview] = useState<SpeciesReview | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isGoodEating, setIsGoodEating] = useState<boolean | null>(null);
  const [putsUpGoodFight, setPutsUpGoodFight] = useState<boolean | null>(null);
  const [isHardToCatch, setIsHardToCatch] = useState<boolean | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [communityStats, setCommunityStats] = useState<CommunityStatsType | null>(null);
  const [userVotes, setUserVotes] = useState<{ [reviewId: string]: boolean }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const getFishDisplayName = (fish: FishSpecies): string => {
    const localizedNames = locale === 'tr' ? fish.common_names_tr : fish.common_names_en;
    return localizedNames?.[0] || fish.common_name;
  };


  const fishTabs: TabConfig[] = [
    { id: 'details', label: t('fishSpecies:tabs.details') },
    { id: 'reviews', label: t('fishSpecies:tabs.reviews') },
    { id: 'catches', label: t('fishSpecies:tabs.catches') },
    { id: 'similar', label: t('fishSpecies:tabs.similar') },
    { id: 'gear', label: t('fishSpecies:tabs.gear') },
    { id: 'disciplines', label: t('fishSpecies:tabs.disciplines') }
  ];
  
  const getDescription = (fish: FishSpecies): string | undefined => {
    return locale === 'tr' ? fish.description_tr : fish.description_en;
  };

  useEffect(() => {
    const fetchSpeciesDetail = async () => {
      try {
        // If we have the species ID, fetch the full data
        if (routeSpecies && routeSpecies.id) {
          let speciesData = routeSpecies;
          
          // Check if we only have ID (from PostDetail) or full object (from FishSpeciesScreen)
          if (!routeSpecies.scientific_name) {
            // We only have ID, fetch full species data
            const fullSpecies = await apiService.species.getSpeciesById(routeSpecies.id);
            if (fullSpecies) {
              setSpecies(fullSpecies);
              speciesData = fullSpecies; // Update for use below
            } else {
              throw new Error('Species not found');
            }
          } else {
            // We have full species object
            setSpecies(routeSpecies);
          }
          
          // Still fetch additional data
          try {
            const following = await apiService.species.isFollowingSpecies(routeSpecies.id);
            setIsFollowing(following);
          } catch (err) {
          }
          
          try {
            const stats = await apiService.species.getSpeciesStatistics(routeSpecies.id);
            setStatistics(stats);
          } catch (err) {
          }
          
          try {
            const speciesReviews = await apiService.species.getSpeciesReviews(routeSpecies.id);
            setReviews(speciesReviews);
            
              if (speciesReviews.length > 0) {
              const reviewIds = speciesReviews.map(r => r.id);
              try {
                const votes = await apiService.species.getUserReviewVotes(reviewIds);
                setUserVotes(votes);
              } catch (err) {
              }
            }
          } catch (err) {
          }
          
          try {
            const supabase = getNativeSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              const userSpeciesReview = await apiService.species.getUserReviewForSpecies(routeSpecies.id);
              setUserReview(userSpeciesReview);
            } else {
              setUserReview(null);
            }
          } catch (err) {
            setUserReview(null);
          }
          
          try {
            const stats = await apiService.species.getCommunityStats(routeSpecies.id);
            setCommunityStats(stats);
          } catch (err) {
          }
          
          // Fetch related species
          if (speciesData.family) {
            const { data: relatedSpecies } = await apiService.species.getSpecies({
              family: speciesData.family,
              limit: 5
            });
            
            const filteredRelated = relatedSpecies.filter(s => s.id !== speciesData.id).slice(0, 4);
            
            if (filteredRelated.length > 0) {
              setRelatedSpecies(filteredRelated);
            }
          }
        } else {
          throw new Error('Species not found');
        }
      } catch (err) {
        setError(String(t('fishSpecies:speciesNotFound') || 'Species not found'));
      } finally {
        setLoading(false);
      }
    };

    fetchSpeciesDetail();
  }, [routeSpecies, locale, apiService.species, t]);

  // Check if we should auto-open review modal
  useEffect(() => {
    if (openReviewModal && !loading) {
      setIsReviewModalOpen(true);
    }
  }, [openReviewModal, loading]);

  const handleShare = async () => {
    if (!species) return;
    
    try {
      await Share.share({
        message: t('fishDetail.shareMessage', {
          name: getFishDisplayName(species),
          scientificName: species.scientific_name
        }),
        title: getFishDisplayName(species),
      });
    } catch (err) {
    }
  };

  const handleFollowToggle = async () => {
    if (!species) return;
    
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
        await apiService.species.unfollowSpecies(species.id);
        setIsFollowing(false);
        if (statistics) {
          setStatistics({
            ...statistics,
            follower_count: Math.max(0, statistics.follower_count - 1)
          });
        }
      } else {
        await apiService.species.followSpecies(species.id);
        setIsFollowing(true);
        if (statistics) {
          setStatistics({
            ...statistics,
            follower_count: statistics.follower_count + 1
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        setModalMessage(t('fishSpecies:follow.followSystemNotActive'));
        setShowErrorModal(true);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleReviewSubmit = async (data: {
    rating: number;
    review_text?: string;
    difficulty_level?: 'easy' | 'medium' | 'hard';
    caught_count?: number;
    best_season?: string;
    best_technique?: string;
    fishing_tips?: string;
    is_good_eating?: boolean;
    puts_up_good_fight?: boolean;
    is_hard_to_catch?: boolean;
  }) => {
    if (!species) return;

    try {
      // Submit community data if provided
      const communityData = {
        is_good_eating: data.is_good_eating ?? undefined,
        puts_up_good_fight: data.puts_up_good_fight ?? undefined,
        is_hard_to_catch: data.is_hard_to_catch ?? undefined
      };
      
      if (communityData.is_good_eating !== undefined || 
          communityData.puts_up_good_fight !== undefined || 
          communityData.is_hard_to_catch !== undefined) {
        await apiService.species.submitCommunityData(species.id, communityData);
        
        const newStats = await apiService.species.getCommunityStats(species.id);
        setCommunityStats(newStats);
      }
      
      const reviewData = { ...data };
      delete reviewData.is_good_eating;
      delete reviewData.puts_up_good_fight;
      delete reviewData.is_hard_to_catch;
      
      if (editingReview && userReview) {
        const updatedReview = await apiService.species.updateReview(userReview.id, reviewData);
        setUserReview(updatedReview);
        setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r));
        
        if (statistics) {
          const newStats = await apiService.species.getSpeciesStatistics(species.id);
          if (newStats) setStatistics(newStats);
        }
      } else {
        const newReview = await apiService.species.createReview(species.id, reviewData);
        setUserReview(newReview);
        setReviews([newReview, ...reviews]);
        
        if (statistics) {
          setStatistics({
            ...statistics,
            review_count: statistics.review_count + 1,
            average_rating: ((statistics.average_rating * statistics.review_count) + reviewData.rating) / (statistics.review_count + 1)
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Review gönderilemedi';
      setModalMessage(errorMessage);
      setShowErrorModal(true);
    }
  };


  const renderTabContent = (activeTab: string) => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'reviews':
        return renderReviewsTab();
      case 'catches':
        return renderCatchesTab();
      case 'similar':
        return renderSimilarTab();
      case 'gear':
        return renderGearTab();
      case 'disciplines':
        return renderDisciplinesTab();
      default:
        return renderDetailsTab();
    }
  };

  const renderDetailsTab = () => (
    <View>
      <View style={styles.infoSection}>
        <SectionHeader 
          title={t('fishSpecies:details.basicInfo')}
        />
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
          <Icon name="globe" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoLabel}>{t('fishSpecies:details.scientificName')}:</Text>
          <Text style={[styles.infoValue, styles.italic]}>{species?.scientific_name}</Text>
        </View>

        {(species?.common_names_en?.length || species?.common_names_tr?.length) && (
          <View style={styles.infoRow}>
            <Icon name="fish" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoLabel}>{t('fishSpecies:details.commonNames')}:</Text>
            <Text style={styles.infoValue}>
              {(locale === 'tr' ? species?.common_names_tr : species?.common_names_en)?.join(', ') || t('common:unknown')}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Icon name="users" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoLabel}>{t('fishSpecies:details.family')}:</Text>
          <Text style={styles.infoValue}>{String(species?.family || t('common:unknown'))}</Text>
        </View>

        {species?.order && (
          <View style={styles.infoRow}>
            <Icon name="layers" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoLabel}>{t('fishSpecies:details.order')}:</Text>
            <Text style={styles.infoValue}>{String(species.order || t('common:unknown'))}</Text>
          </View>
        )}

        {species?.habitats && species.habitats.length > 0 && (
          <View style={styles.infoRow}>
            <Icon name="waves" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoLabel}>{t('fishSpecies:details.waterType')}:</Text>
            <View style={styles.badgeContainer}>
              {species.habitats.map((h: string, idx: number) => {
                const habitat = getHabitatType(h, locale);
                if (!habitat) return null;
                const label = habitat.label || habitat.code || t('common:unknown');
                return (
                  <View key={idx} style={styles.badge}>
                    <Text style={styles.badgeText}>{String(label)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {species?.feeding_types && species.feeding_types.length > 0 && (
          <View style={styles.infoRow}>
            <Icon name="utensils" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoLabel}>
              {t('fishSpecies:details.feedingTypes')}:
            </Text>
            <View style={styles.badgeContainer}>
              {species.feeding_types.map((type: string, idx: number) => {
                const feedingType = getFeedingType(type, locale);
                const label = feedingType?.label || type || t('common:unknown');
                return (
                  <View key={idx} style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {String(label)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        </View>
      </View>

      {getDescription(species!) && (
        <View style={styles.infoSection}>
          <SectionHeader 
            title={t('fishSpecies:details.generalInfo')}
          />
          <View style={styles.card}>
            <Text style={styles.description}>{getDescription(species!)}</Text>
          </View>
        </View>
      )}

      {species?.conservation_status && (
        <View style={styles.infoSection}>
          <SectionHeader 
            title={t('fishSpecies:details.conservationStatus')}
          />
          <View style={styles.card}>
            <ConservationStatusChart
            currentStatus={species.conservation_status}
            locale={locale}
            size="small"
            showLabels={true}
          />
          </View>
        </View>
      )}

      <View style={styles.infoSection}>
        <SectionHeader 
          title={t('fishSpecies:details.physicalCharacteristics')}
        />
        
        <View style={styles.card}>
          <View style={styles.infoRow}>
          <Icon name="ruler" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoLabel}>{String(t('fishSpecies:details.maxLength') || 'Max Length')}:</Text>
          <Text style={styles.infoValue}>
            {species?.max_length && species.max_length !== 0 
              ? formatLength(species.max_length, locale === 'tr' ? 'tr-TR' : 'en-US')
              : t('common:unknown')
            }
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="package" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoLabel}>{String(t('fishSpecies:details.maxWeight') || 'Max Weight')}:</Text>
          <Text style={styles.infoValue}>
            {species?.max_weight && species.max_weight !== 0
              ? formatWeight(species.max_weight, locale === 'tr' ? 'tr-TR' : 'en-US')
              : t('common:unknown')
            }
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="activity" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoLabel}>{String(t('fishSpecies:details.depthRange') || 'Depth Range')}:</Text>
          <Text style={styles.infoValue}>
            {(species?.min_depth !== null && species?.min_depth !== 0) || (species?.max_depth !== null && species?.max_depth !== 0)
              ? `${formatDepth(species?.min_depth || 0, locale === 'tr' ? 'tr-TR' : 'en-US')} - ${species?.max_depth ? formatDepth(species.max_depth, locale === 'tr' ? 'tr-TR' : 'en-US') : '?'}`
              : t('common:unknown')
            }
          </Text>
        </View>
        </View>
      </View>

      {species?.habitats && species.habitats.length > 0 && (
        <View style={styles.infoSection}>
          <SectionHeader 
            title={t('fishSpecies:details.habitat')}
          />
          <View style={styles.card}>
            <View style={styles.habitatContainer}>
            {species.habitats.map((h: string, idx: number) => {
              const habitat = getHabitatType(h, locale);
              if (!habitat) return null;
              
              return (
                <View key={idx} style={styles.habitatItem}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{String(habitat.label || habitat.code || t('common:unknown'))}</Text>
                  </View>
                  <Text style={styles.habitatDescription}>{String(habitat.description || 'No description available')}</Text>
                </View>
              );
            })}
            </View>
          </View>
        </View>
      )}

      <CommunityStats stats={communityStats} locale={locale} />
    </View>
  );

  const renderReviewsTab = () => (
    <View ref={reviewSectionRef}>
      <ReviewSection
        reviews={reviews}
        userReview={userReview}
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
          setReviewText(userReview.review_text || '');
          setIsGoodEating(userReview.is_good_eating ?? null);
          setPutsUpGoodFight(userReview.puts_up_good_fight ?? null);
          setIsHardToCatch(userReview.is_hard_to_catch ?? null);
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
          const supabase = getNativeSupabaseClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            navigation.dispatch(
              CommonActions.reset({ 
                index: 0, 
                routes: [{ name: 'Auth' }] 
              })
            );
            return;
          }
          
          const apiService = createNativeApiService();
          await apiService.species.voteReviewHelpful(reviewId, isHelpful);
          
          // Update local state immediately
          setUserVotes(prev => ({ ...prev, [reviewId]: isHelpful }));
          
          // Update review counts locally for better UX
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
          setModalMessage(`${t('fishSpecies:reviews.couldNotVote')}: ${err instanceof Error ? err.message : String(err)}`);
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
    <FishCatchesTab speciesId={species!.id} />
  );

  const renderSimilarTab = () => (
    <View>
      <SectionHeader 
        title={t('fishSpecies:similar.title')}
      />
      
      {relatedSpecies.length > 0 ? (
        <FlatList
          data={relatedSpecies}
          numColumns={2}
          key="2-columns"
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          columnWrapperStyle={relatedSpecies.length % 2 === 0 ? styles.row : styles.rowOdd}
          renderItem={({ item: fish, index }) => (
            <View style={[
              styles.relatedCardContainer,
              relatedSpecies.length % 2 !== 0 && index === relatedSpecies.length - 1 && styles.singleCardContainer
            ]}>
              <FishSpeciesCard
                species={{
                  id: fish.id,
                  name: getFishDisplayName(fish),
                  scientificName: fish.scientific_name,
                  description: '',
                  postCount: 0,
                  season: '',
                  image: fish.image_url || '',
                  family: fish.family,
                  conservationStatus: fish.conservation_status
                }}
                onPress={() => navigation.push('FishDetail', { species: fish })}
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <View style={styles.tabContent}>
          <Text style={styles.comingSoonText}>
            {t('fishSpecies:similar.noSimilarSpecies')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderGearTab = () => (
    <FishTopGearTab speciesId={species!.id} />
  );

  const renderDisciplinesTab = () => (
    <FishDisciplinesTab speciesId={species!.id} />
  );

  const renderHeaderContent = () => (
    <>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <Text style={styles.scientificName}>{species!.scientific_name}</Text>
          <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            onPress={handleFollowToggle}
            disabled={followLoading}
            loading={followLoading}
            icon={isFollowing ? 'user' : 'user-plus'}
            size="sm"
          >
            {isFollowing ? t('fishSpecies:follow.following') : t('fishSpecies:follow.follow')}
          </Button>
        </View>
        {statistics && (
          <View style={styles.statsColumn}>
            <View style={styles.statItem}>
              <Icon name="users" size={16} color={theme.colors.primary} />
              <Text style={styles.statText}>
                {`${statistics.follower_count} ${statistics.follower_count === 1 ? t('fishSpecies:follow.follower') : t('fishSpecies:follow.followers')}`}
              </Text>
            </View>
            <RatingDisplay 
              rating={statistics.average_rating || 0} 
              count={statistics.review_count}
              size="small"
              onPress={() => {}} // Reviews'a geçiş StickyTabLayout'da handle edilecek
            />
          </View>
        )}
      </View>

      {/* Image */}
      <View style={styles.imageCard}>
        <View style={styles.imageContainer}>
          {species!.image_url && !imageError ? (
            <Image
              source={{ uri: getProxiedImageUrl(species!.image_url) }}
              style={styles.image}
              onError={() => setImageError(true)}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={isDark ? ['#1E3A8A', '#1E40AF'] : ['#EFF6FF', '#DBEAFE']}
              style={styles.imagePlaceholder}
             />
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

  if (error || !species) {
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
            <Text style={styles.errorText}>{String(error || t('fishSpecies:speciesNotFound') || 'Species not found')}</Text>
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
        title={getFishDisplayName(species)}
        onBackPress={() => {
          navigation.goBack()
        }}
        rightButtons={[{ icon: 'share', onPress: handleShare }]}
      />

      <ScreenContainer paddingVertical="none" paddingHorizontal="none">
        <StickyTabLayout
          headerContent={renderHeaderContent()}
          tabs={fishTabs}
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
          setIsGoodEating(null);
          setPutsUpGoodFight(null);
          setIsHardToCatch(null);
        }}
        onSubmit={async (data) => {
          try {
            await handleReviewSubmit({
              rating: data.rating,
              review_text: data.reviewText,
              is_good_eating: data.isGoodEating ?? undefined,
              puts_up_good_fight: data.putsUpGoodFight ?? undefined,
              is_hard_to_catch: data.isHardToCatch ?? undefined
            });
            // Reset form after successful submit
            setReviewRating(0);
            setReviewText('');
            setIsGoodEating(null);
            setPutsUpGoodFight(null);
            setIsHardToCatch(null);
            setIsReviewModalOpen(false);
          } catch (err) {
            // Error is handled in handleReviewSubmit
            // Modal stays open for user to retry
          }
        }}
        title={editingReview
          ? t('fishSpecies:reviews.editReview')
          : t('fishSpecies:reviews.addReview')
        }
        itemName={species ? getFishDisplayName(species) : ''}
        itemIcon="fish"
        rating={reviewRating}
        onRatingChange={setReviewRating}
        reviewText={reviewText}
        onReviewTextChange={setReviewText}
        showCommunityQuestions={true}
        isGoodEating={isGoodEating}
        onIsGoodEatingChange={setIsGoodEating}
        putsUpGoodFight={putsUpGoodFight}
        onPutsUpGoodFightChange={setPutsUpGoodFight}
        isHardToCatch={isHardToCatch}
        onIsHardToCatchChange={setIsHardToCatch}
        labels={{
          yourRating: t('fishSpecies:reviews.yourRating'),
          tapToRate: t('fishSpecies:reviews.tapToRate'),
          yourReview: t('fishSpecies:reviews.yourReview'),
          reviewPlaceholder: t('fishSpecies:reviews.reviewPlaceholder'),
          communityQuestions: t('fishSpecies:reviews.communityQuestions'),
          optional: t('fishSpecies:reviews.optional'),
          communityDescription: t('fishSpecies:reviews.communityDescription'),
          goodEating: t('fishSpecies:reviews.goodEating'),
          goodFighter: t('fishSpecies:reviews.goodFighter'),
          hardToCatch: t('fishSpecies:reviews.hardToCatch'),
          cancel: t('common:cancel'),
          submit: t('common:submit'),
          update: t('fishSpecies:reviews.update')
        }}
        isEditing={editingReview}
        isLoading={loading}
      />

      {/* Delete Confirmation Modal */}
      <FishivoModal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t('fishSpecies:reviews.deleteReview')}
        preset="delete"
        description={t('fishSpecies:reviews.deleteReviewConfirm')}
        primaryButton={{
          text: t('common:delete'),
          onPress: async () => {
            try {
              if (!userReview) {
                throw new Error('No review to delete');
              }
              
              const apiService = createNativeApiService();
              await apiService.species.deleteReview(userReview.id);
              
              // Remove from reviews list
              setReviews(reviews.filter(r => r.id !== userReview.id));
              setUserReview(null);
              setShowDeleteConfirm(false);
              
              // Update statistics if exists
              if (statistics && statistics.review_count > 0) {
                setStatistics({
                  ...statistics,
                  review_count: Math.max(0, statistics.review_count - 1),
                  average_rating: statistics.review_count > 1 ? 
                    ((statistics.average_rating * statistics.review_count) - (userReview.rating || 0)) / (statistics.review_count - 1) : 
                    0
                });
              }
            } catch (err) {
              setModalMessage(t('fishSpecies:reviews.couldNotDeleteReview'));
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
  italic: {
    fontStyle: 'italic',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  badge: {
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  habitatContainer: {
    gap: theme.spacing.sm,
  },
  habitatItem: {
    marginBottom: theme.spacing.md,
  },
  habitatDescription: {
    fontSize: theme.typography.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginTop: theme.spacing.xs,
  },
  infoSection: {
    marginBottom: theme.spacing.xs,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  comingSoonText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  rowOdd: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  relatedCardContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  singleCardContainer: {
    flex: 0.48, // Tek kart yarım ekran kaplar
  },
  deleteModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.error,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  deleteButtonText: {
    fontSize: theme.typography.sm,
    color: '#fff',
    fontWeight: theme.typography.medium,
  },
});

export default FishDetailScreen;