import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Icon, 
  AppHeader, 
  ScreenContainer,
  RatingDisplay,
  Button,
  ReviewSection,
  ReviewModal,
  FishivoModal
} from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { createNativeApiService } from '@fishivo/api';
import { Theme } from '@/theme';
import { getProxiedImageUrl } from '@fishivo/utils';
import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';

// Equipment interface based on database
interface Equipment {
  id: number;
  name: string;
  category: string;
  brand: string;
  model: string;
  image_url?: string;
  description_tr?: string;
  description_en?: string;
  user_rating?: number;
  rating_count?: number;
  review_count?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface EquipmentReview {
  id: string;
  user_id: string;
  equipment_id: number;
  rating: number;
  review_text: string;
  created_at: string;
  helpful_count: number;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

type GearDetailScreenProps = StackScreenProps<RootStackParamList, 'GearDetail'>;

const GearDetailScreen: React.FC<GearDetailScreenProps> = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { t, locale } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, isDark);
  const { equipment: routeEquipment, openReviewModal = false } = route.params;
  const apiService = createNativeApiService();
  
  const [equipment, setEquipment] = useState<Equipment | null>(routeEquipment);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reviews, setReviews] = useState<EquipmentReview[]>([]);
  const [userReview, setUserReview] = useState<EquipmentReview | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(openReviewModal);
  const [userVotes, setUserVotes] = useState<{ [reviewId: string]: boolean }>({});
  
  // Modal states  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const getEquipmentDescription = (): string => {
    if (!equipment) return '';
    return locale === 'tr' ? (equipment.description_tr || '') : (equipment.description_en || '');
  };

  const getCategoryName = (category: string): string => {
    const categoryMap: { [key: string]: { tr: string; en: string } } = {
      'Makine': { tr: 'Makine', en: 'Reel' },
      'Olta': { tr: 'Olta', en: 'Rod' },
      'Suni Yem': { tr: 'Suni Yem', en: 'Lure' },
      'İğne': { tr: 'İğne', en: 'Hook' },
      'Misina': { tr: 'Misina', en: 'Line' },
      'Aksesuar': { tr: 'Aksesuar', en: 'Accessory' },
    };
    
    const mapped = categoryMap[category];
    if (mapped) {
      return locale === 'tr' ? mapped.tr : mapped.en;
    }
    return category;
  };

  useEffect(() => {
    fetchReviews();
  }, [equipment?.id]);

  const fetchReviews = async () => {
    if (!equipment?.id) return;
    
    try {
      // Simulate fetching reviews
      // In real app, this would be: await apiService.equipment.getReviews(equipment.id)
      setReviews([]);
      
      // Check if user has reviewed
      const supabase = getNativeSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // In real app: await apiService.equipment.getUserReview(equipment.id)
        setUserReview(null);
      }
    } catch (error) {
    }
  };

  const handleShare = async () => {
    if (!equipment) return;
    
    try {
      await Share.share({
        message: t('gear.shareMessage', {
          name: equipment.name,
          brand: equipment.brand,
          defaultValue: `${equipment.brand} ${equipment.name} - Fishivo'da inceleyin!`
        }),
        title: equipment.name,
      });
    } catch (error) {
      // Error handled silently
    }
  };

  const handleReviewSubmit = async (data: {
    rating: number;
    review_text?: string;
  }) => {
    if (!equipment) return;
    
    try {
      // In real app: await apiService.equipment.submitReview(equipment.id, data)
      setModalMessage(t('gear.reviewSubmitSuccess', { defaultValue: 'İncelemeniz başarıyla gönderildi!' }));
      setShowErrorModal(true);
      setIsReviewModalOpen(false);
      fetchReviews();
    } catch (error) {
      setModalMessage(t('gear.reviewSubmitError', { defaultValue: 'İnceleme gönderilirken bir hata oluştu.' }));
      setShowErrorModal(true);
    }
  };

  const handleReviewEdit = (review: EquipmentReview) => {
    // Implement review edit
  };

  const handleReviewDelete = async (reviewId: string) => {
    try {
      // In real app: await apiService.equipment.deleteReview(reviewId)
      fetchReviews();
    } catch (error) {
      setModalMessage(t('gear.reviewDeleteError', { defaultValue: 'İnceleme silinirken bir hata oluştu.' }));
      setShowErrorModal(true);
    }
  };

  const handleReviewHelpful = async (reviewId: string) => {
    try {
      // Toggle helpful
      setUserVotes(prev => ({
        ...prev,
        [reviewId]: !prev[reviewId]
      }));
      
      // In real app: await apiService.equipment.toggleReviewHelpful(reviewId)
    } catch (error) {
    }
  };

  const handleReviewReport = async (reviewId: string, reason: string) => {
    try {
      // In real app: await apiService.equipment.reportReview(reviewId, reason)
      setModalMessage(t('gear.reviewReported', { defaultValue: 'İnceleme bildirildi.' }));
      setShowErrorModal(true);
    } catch (error) {
      setModalMessage(t('gear.reviewReportError', { defaultValue: 'İnceleme bildirilirken bir hata oluştu.' }));
      setShowErrorModal(true);
    }
  };

  const handleAddReview = () => {
    // Auth'a yönlendirme yapmıyoruz
    setModalMessage(t('common.loginRequired'));
    setShowErrorModal(true);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader 
          title=""
          onBackPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!equipment) {
    return (
      <ScreenContainer>
        <AppHeader 
          title=""
          onBackPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t('gear.notFound', { defaultValue: 'Ekipman bulunamadı' })}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader 
        title={equipment.name}
        onBackPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')}
        rightIcon="share-2"
        onRightPress={handleShare}
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {equipment.image_url && !imageError ? (
            <Image
              source={{ uri: getProxiedImageUrl(equipment.image_url) }}
              style={styles.equipmentImage}
              onError={() => setImageError(true)}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon 
                name={equipment.category === 'Makine' ? 'settings' : 'package'} 
                size={80} 
                color={theme.colors.textSecondary} 
              />
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.brand}>{equipment.brand}</Text>
          <Text style={styles.name}>{equipment.name}</Text>
          <Text style={styles.category}>{getCategoryName(equipment.category)}</Text>
          
          {getEquipmentDescription() ? (
            <Text style={styles.description}>{getEquipmentDescription()}</Text>
          ) : null}

          {/* Rating */}
          {equipment.user_rating && equipment.rating_count ? (
            <View style={styles.ratingContainer}>
              <RatingDisplay 
                rating={equipment.user_rating} 
                count={equipment.rating_count}
                size="large"
              />
              {equipment.review_count ? (
                <Text style={styles.reviewCount}>
                  {equipment.review_count} {t('gear.reviews', { defaultValue: 'inceleme' })}
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.noRatingContainer}>
              <Text style={styles.noRatingText}>
                {t('gear.noReviews', { defaultValue: 'Henüz inceleme yok' })}
              </Text>
              <Button
                variant="primary"
                size="sm"
                onPress={() => setIsReviewModalOpen(true)}
                style={styles.firstReviewButton}
              >
                {t('gear.beFirst', { defaultValue: 'İlk inceleyen ol!' })}
              </Button>
            </View>
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <ReviewSection
            reviews={reviews}
            userReview={userReview}
            onReviewEdit={handleReviewEdit}
            onReviewDelete={handleReviewDelete}
            onReviewHelpful={handleReviewHelpful}
            onReviewReport={handleReviewReport}
            onAddReview={() => setIsReviewModalOpen(true)}
            userVotes={userVotes}
            emptyMessage={t('gear.noReviewsYet', { defaultValue: 'Henüz inceleme yapılmamış' })}
            entityType="equipment"
          />
        </View>
      </ScrollView>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        existingReview={userReview || undefined}
        title={t('gear.writeReview', { defaultValue: 'İnceleme Yaz' })}
        entityType="equipment"
      />

      {/* Error/Success Modal */}
      <FishivoModal
        isVisible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={t('common.info')}
        message={modalMessage}
        buttons={[
          {
            text: t('common.ok'),
            onPress: () => setShowErrorModal(false),
          }
        ]}
      />
    </ScreenContainer>
  );
};

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
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
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  imageContainer: {
    height: 300,
    backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  equipmentImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  brand: {
    fontSize: theme.typography.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
    marginBottom: theme.spacing.xs,
  },
  name: {
    fontSize: theme.typography.xl,
    color: theme.colors.text,
    fontWeight: theme.typography.bold,
    marginBottom: theme.spacing.xs,
  },
  category: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.base,
    color: theme.colors.text,
    lineHeight: theme.typography.base * 1.5,
    marginBottom: theme.spacing.md,
  },
  ratingContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reviewCount: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  noRatingContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  noRatingText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  firstReviewButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  reviewsSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});

export default GearDetailScreen;