import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { Icon, Button, StarRating, SectionHeader, FishivoModal, EmptyState } from '@/components/ui/';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { SpeciesReview, ReportReason } from '@fishivo/types';
import { Theme } from '@/theme';

interface ReviewSectionProps {
  reviews: SpeciesReview[];
  userReview: SpeciesReview | null;
  locale: 'tr' | 'en';
  onAddReview: () => void;
  onEditReview?: () => void;
  onDeleteReview?: () => void;
  onUserPress?: (userId: string) => void;
  onVoteHelpful?: (reviewId: string, isHelpful: boolean) => void;
  onReportReview?: (reviewId: string, reason: ReportReason, description?: string) => Promise<void>;
  userVotes?: { [reviewId: string]: boolean };
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews,
  userReview,
  locale,
  onAddReview,
  onEditReview,
  onDeleteReview,
  onUserPress,
  onVoteHelpful,
  onReportReview,
  userVotes = {},
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, isDark);
  const [displayCount, setDisplayCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  
  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const [selectedReportReason, setSelectedReportReason] = useState<ReportReason | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [showReportSuccessModal, setShowReportSuccessModal] = useState(false);
  const [showReportErrorModal, setShowReportErrorModal] = useState(false);

  // Filter out user's own review from the list
  const otherReviews = reviews.filter(r => r.id !== userReview?.id);
  const displayedReviews = otherReviews.slice(0, displayCount);
  const hasMore = otherReviews.length > displayCount;

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 10);
      setIsLoading(false);
    }, 300);
  };

  const handleReportReview = (reviewId: string) => {
    setReportReviewId(reviewId);
    setShowReportModal(true);
  };

  const confirmReportReview = async () => {
    if (!selectedReportReason || !reportReviewId) return;
    
    try {
      if (onReportReview) {
        await onReportReview(reportReviewId, selectedReportReason, reportDescription || undefined);
      }
      
      setShowReportModal(false);
      setReportReviewId(null);
      setSelectedReportReason(null);
      setReportDescription('');
      
      setShowReportSuccessModal(true);
    } catch (error) {
      setShowReportModal(false);
      setReportReviewId(null);
      setSelectedReportReason(null);
      setReportDescription('');
      
      setShowReportErrorModal(true);
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'easy':
        return t('fishSpecies.reviews.difficultyLevels.easy');
      case 'medium':
        return t('fishSpecies.reviews.difficultyLevels.medium');
      case 'hard':
        return t('fishSpecies.reviews.difficultyLevels.hard');
      default:
        return level;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <StarRating
        rating={rating}
        size="small"
        readonly
        color="#FFC107"
      />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <SectionHeader 
        title={t('fishSpecies.reviews.title')}
        action={
          !userReview && (
            <Button
              variant="primary"
              size="sm"
              onPress={onAddReview}
              icon="plus"
            >
              {t('fishSpecies.reviews.writeReview')}
            </Button>
          )
        }
      />

      {/* User's own review */}
      {userReview && (
        <View style={[styles.reviewCard, styles.userReviewCard]}>
          <View style={styles.reviewHeader}>
            <View style={styles.userReviewHeaderContent}>
              <Text style={styles.ownReviewTitle}>
                {t('fishSpecies.reviews.yourReview')}
              </Text>
              <Text style={styles.reviewDate}>
                {formatDate(userReview.created_at)}
              </Text>
            </View>
          </View>
          
          {/* Review Content */}
          <View style={styles.reviewContentArea}>
            {/* Rating */}
            <View style={styles.ratingRow}>
              {renderStars(userReview.rating)}
              <Text style={styles.ratingText}>{userReview.rating}/5</Text>
            </View>
            
            {renderReviewContent(userReview, true)}
            
            {/* Edit and Delete buttons at bottom right */}
            {(onEditReview || onDeleteReview) && (
              <View style={styles.editButtonContainer}>
                {onEditReview && (
                  <TouchableOpacity 
                    onPress={onEditReview}
                    style={styles.editButton}
                  >
                    <Icon name="edit" size={16} color={theme.colors.primary} />
                    <Text style={styles.editButtonText}>
                      {t('fishSpecies.reviews.edit')}
                    </Text>
                  </TouchableOpacity>
                )}
                {onDeleteReview && (
                  <TouchableOpacity 
                    onPress={onDeleteReview}
                    style={styles.deleteButton}
                  >
                    <Icon name="trash-2" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.deleteButtonText}>
                      {t('common.delete')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Other reviews or empty state */}
      {otherReviews.length > 0 ? (
        <>
          <View style={styles.reviewsList}>
            {displayedReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <TouchableOpacity 
                    style={styles.userInfo}
                    onPress={() => onUserPress && review.user_id && onUserPress(review.user_id)}
                    disabled={!onUserPress || !review.user_id}
                  >
                    {review.user?.avatar_url ? (
                      <Image 
                        source={{ uri: review.user.avatar_url }} 
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Icon name="user" size={20} color={theme.colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.userDetails}>
                      <View style={styles.userTextInfo}>
                        {review.user?.full_name && (
                          <Text style={styles.userFullName}>
                            {review.user.full_name}
                          </Text>
                        )}
                        <Text style={styles.userName}>
                          @{review.user?.username || 'anonymous'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.reviewHeaderRight}>
                    <Text style={styles.reviewDate}>
                      {formatDate(review.created_at)}
                    </Text>
                    {review.is_verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>
                          {t('fishSpecies.reviews.verified')}
                        </Text>
                      </View>
                    )}
                    {onReportReview && (
                      <TouchableOpacity 
                        style={styles.moreButton}
                        onPress={() => handleReportReview(review.id)}
                      >
                        <Icon name="more-vertical" size={20} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                
                {/* Review Content */}
                <View style={styles.reviewContentArea}>
                  {/* Rating */}
                  <View style={styles.ratingRow}>
                    {renderStars(review.rating)}
                    <Text style={styles.ratingText}>{review.rating}/5</Text>
                  </View>
                  
                  {renderReviewContent(review, false)}
                </View>
              </View>
            ))}
          </View>
          
          {/* Load more button */}
          {hasMore && (
            <View style={styles.loadMoreContainer}>
              <Button
                variant="outline"
                size="md"
                onPress={handleLoadMore}
                disabled={isLoading}
                loading={isLoading}
                fullWidth={false}
              >
                {isLoading 
                  ? t('fishSpecies.reviews.loading')
                  : `${t('fishSpecies.reviews.showMore')} (${otherReviews.length - displayCount})`
                }
              </Button>
            </View>
          )}
        </>
      ) : (
        !userReview && (
          <EmptyState
            title={t('fishSpecies.reviews.noReviewsYet')}
          />
        )
      )}

      {/* Report Review Modal */}
      <FishivoModal
        visible={showReportModal}
        title={t('common.report')}
        onClose={() => {
          setShowReportModal(false);
          setReportReviewId(null);
          setSelectedReportReason(null);
          setReportDescription('');
        }}
        preset="report"
        description={t('common.selectReportReason')}
        buttons={[
          {
            text: t('common.report'),
            variant: 'destructive',
            onPress: confirmReportReview,
            disabled: !selectedReportReason
          }
        ]}
      >
        {/* Report Reason Options */}
        <View style={styles.reportReasons}>
            {[
              ReportReason.SPAM,
              ReportReason.INAPPROPRIATE_CONTENT,
            ].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reportReasonItem,
                  selectedReportReason === reason && styles.reportReasonItemSelected
                ]}
                onPress={() => setSelectedReportReason(reason)}
              >
                <View style={styles.reportReasonRadio}>
                  {selectedReportReason === reason && (
                    <View style={styles.reportReasonRadioInner} />
                  )}
                </View>
                <Text style={[
                  styles.reportReasonText,
                  { color: theme.colors.text }
                ]}>
                  {t(`common.reportReasons.${reason}`)}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
        
        {/* Optional Description */}
        <TextInput
          style={[
            styles.reportDescriptionInput,
            { 
              color: theme.colors.text,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background
            }
          ]}
          placeholder={t('common.reportDescriptionPlaceholder')}
          placeholderTextColor={theme.colors.textSecondary}
          value={reportDescription}
          onChangeText={setReportDescription}
          multiline
          numberOfLines={3}
          maxLength={500}
        />
        
      </FishivoModal>
      
      {/* Report Success Modal */}
      <FishivoModal
        visible={showReportSuccessModal}
        title={t('common.success')}
        onClose={() => setShowReportSuccessModal(false)}
        preset="success"
        description={t('common.reportSuccess')}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowReportSuccessModal(false)
        }}
      />
      
      {/* Report Error Modal */}
      <FishivoModal
        visible={showReportErrorModal}
        title={t('common.error')}
        onClose={() => setShowReportErrorModal(false)}
        preset="error"
        description={t('common.reportError')}
        primaryButton={{
          text: t('common.ok'),
          onPress: () => setShowReportErrorModal(false)
        }}
      />
    </View>
  );

  function renderReviewContent(review: SpeciesReview, isOwnReview: boolean) {
    return (
      <View style={styles.reviewContent}>
        {/* Review text */}
        {review.review_text && (
          <Text style={styles.comment}>
            {review.review_text}
          </Text>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          {review.caught_count !== undefined && review.caught_count > 0 && (
            <View style={styles.statItem}>
              <Icon name="fish" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>
                {review.caught_count} {t('fishSpecies.reviews.catches')}
              </Text>
            </View>
          )}
          {review.best_season && (
            <View style={styles.statItem}>
              <Icon name="calendar" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{review.best_season}</Text>
            </View>
          )}
          {review.difficulty_level && (
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                {getDifficultyLabel(review.difficulty_level)}
              </Text>
            </View>
          )}
        </View>

        {/* Detailed info - removed best_bait */}
        {(review.best_technique || review.fishing_tips) && (
          <View style={styles.detailsSection}>
            {review.best_technique && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>
                  {t('fishSpecies.reviews.bestTechnique')}
                </Text>
                <Text style={styles.detailValue}>{review.best_technique}</Text>
              </View>
            )}
            {review.fishing_tips && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>
                  {t('fishSpecies.reviews.tips')}
                </Text>
                <Text style={styles.detailValue}>{review.fishing_tips}</Text>
              </View>
            )}
          </View>
        )}

        {/* Best technique */}
        {review.best_technique && (
          <View style={styles.methodBadge}>
            <Icon name="anchor" size={14} color={theme.colors.primary} />
            <Text style={styles.methodText}>{review.best_technique}</Text>
          </View>
        )}

        {/* Was this helpful section - not for own review */}
        {!isOwnReview && onVoteHelpful && (
          <View style={styles.helpfulSection}>
            <View style={styles.helpfulRow}>
              <Text style={styles.helpfulText}>
                {t('fishSpecies.reviews.helpful')}
              </Text>
              <View style={styles.helpfulButtons}>
                <TouchableOpacity
                  style={[
                    styles.helpfulButton,
                    userVotes[review.id] === true && styles.helpfulButtonActive
                  ]}
                  onPress={() => onVoteHelpful(review.id, true)}
                >
                  <Icon 
                    name="thumb-up" 
                    size={14} 
                    color={userVotes[review.id] === true ? theme.colors.success : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.helpfulButtonText,
                    userVotes[review.id] === true && styles.helpfulButtonTextActive
                  ]}>
                    {t('common.yes')}
                  </Text>
                  {(review.helpful_count ?? 0) > 0 && (
                    <Text style={styles.helpfulCount}>({review.helpful_count})</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.helpfulButton,
                    userVotes[review.id] === false && styles.helpfulButtonActive
                  ]}
                  onPress={() => onVoteHelpful(review.id, false)}
                >
                  <Icon 
                    name="thumb-down" 
                    size={14} 
                    color={userVotes[review.id] === false ? theme.colors.error : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.helpfulButtonText,
                    userVotes[review.id] === false && styles.helpfulButtonTextActive
                  ]}>
                    {t('common.no')}
                  </Text>
                  {(review.unhelpful_count ?? 0) > 0 && (
                    <Text style={styles.helpfulCount}>({review.unhelpful_count})</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
};

const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  container: {
    marginTop: 0,
    marginBottom: theme.spacing.xl,
  },
  reviewsList: {
    gap: theme.spacing.sm,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    marginBottom: theme.spacing.md,
  },
  userReviewCard: {
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    padding: theme.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  ownReviewTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  userReviewHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  editButtonText: {
    fontSize: theme.typography.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.medium,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    borderRadius: theme.borderRadius.sm,
  },
  deleteButtonText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userTextInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs / 2,
  },
  userFullName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  userName: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
  },
  reviewDate: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  verifiedBadge: {
    backgroundColor: theme.colors.textSecondary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
  verifiedText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  reviewContent: {
    gap: theme.spacing.sm,
  },
  reviewContentArea: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '30',
  },
  comment: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  statText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  difficultyBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  difficultyText: {
    fontSize: theme.typography.xs,
    color: theme.colors.text,
  },
  detailsSection: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.xs / 2,
  },
  detailItem: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
  },
  detailValue: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  methodText: {
    fontSize: theme.typography.xs,
    color: theme.colors.primary,
  },
  loadMoreContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  helpfulSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  helpfulRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpfulText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  helpfulButtonActive: {
    backgroundColor: theme.colors.surface,
  },
  helpfulButtonText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  helpfulButtonTextActive: {
    fontWeight: theme.typography.medium,
  },
  helpfulCount: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  reviewHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  moreButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  // Report Modal Styles
  reportReasons: {
  },
  reportReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  reportReasonItemSelected: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
  },
  reportReasonRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportReasonRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  reportReasonText: {
    fontSize: theme.typography.sm,
    flex: 1,
  },
  reportDescriptionInput: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: theme.typography.sm,
  },
  modalTextWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
});

export default ReviewSection;