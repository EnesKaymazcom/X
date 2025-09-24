import React from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { FishivoModal } from '@/components/ui/FishivoModal';
import StarRating from '@/components/ui/StarRating';
import CommunityQuestionCard from '@/components/ui/CommunityQuestionCard';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/theme';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    rating: number;
    reviewText?: string;
    isGoodEating?: boolean | null;
    putsUpGoodFight?: boolean | null;
    isHardToCatch?: boolean | null;
    isBeginnerFriendly?: boolean | null;
    isWeatherSensitive?: boolean | null;
    isSuitableForNight?: boolean | null;
  }) => Promise<void>;
  
  // Dynamic content
  title: string;
  itemName?: string;
  itemIcon?: string;
  
  // Form values
  rating: number;
  onRatingChange: (rating: number) => void;
  reviewText: string;
  onReviewTextChange: (text: string) => void;
  
  // Community questions
  showCommunityQuestions?: boolean;
  // Fish-specific questions
  isGoodEating?: boolean | null;
  onIsGoodEatingChange?: (value: boolean | null) => void;
  putsUpGoodFight?: boolean | null;
  onPutsUpGoodFightChange?: (value: boolean | null) => void;
  isHardToCatch?: boolean | null;
  onIsHardToCatchChange?: (value: boolean | null) => void;
  // Fishing technique-specific questions
  isBeginnerFriendly?: boolean | null;
  onIsBeginnerFriendlyChange?: (value: boolean | null) => void;
  isWeatherSensitive?: boolean | null;
  onIsWeatherSensitiveChange?: (value: boolean | null) => void;
  isSuitableForNight?: boolean | null;
  onIsSuitableForNightChange?: (value: boolean | null) => void;
  
  // Labels (for i18n)
  labels: {
    yourRating: string;
    tapToRate: string;
    yourReview: string;
    reviewPlaceholder: string;
    communityQuestions: string;
    optional: string;
    communityDescription: string;
    goodEating?: string;
    goodFighter?: string;
    hardToCatch?: string;
    beginnerFriendly?: string;
    weatherSensitive?: string;
    suitableForNight?: string;
    cancel: string;
    submit: string;
    update: string;
  };
  
  // State
  isEditing?: boolean;
  isLoading?: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  title,
  itemName,
  itemIcon = 'star',
  rating,
  onRatingChange,
  reviewText,
  onReviewTextChange,
  showCommunityQuestions = false,
  isGoodEating,
  onIsGoodEatingChange,
  putsUpGoodFight,
  onPutsUpGoodFightChange,
  isHardToCatch,
  onIsHardToCatchChange,
  isBeginnerFriendly,
  onIsBeginnerFriendlyChange,
  isWeatherSensitive,
  onIsWeatherSensitiveChange,
  isSuitableForNight,
  onIsSuitableForNightChange,
  labels,
  isEditing = false,
  isLoading = false
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleSubmit = async () => {
    try {
      await onSubmit({
        rating,
        reviewText,
        isGoodEating: showCommunityQuestions ? isGoodEating : undefined,
        putsUpGoodFight: showCommunityQuestions ? putsUpGoodFight : undefined,
        isHardToCatch: showCommunityQuestions ? isHardToCatch : undefined,
        isBeginnerFriendly: showCommunityQuestions ? isBeginnerFriendly : undefined,
        isWeatherSensitive: showCommunityQuestions ? isWeatherSensitive : undefined,
        isSuitableForNight: showCommunityQuestions ? isSuitableForNight : undefined
      });
      onClose();
    } catch (error) {
      // Error handling should be done by parent component
    }
  };

  return (
    <FishivoModal
      visible={visible}
      onClose={onClose}
      preset="review"
      title={title}
      showDragIndicator={true}
      showCloseButton={true}
    >
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Item Info */}
          {itemName && (
            <View style={styles.itemInfo}>
              <Icon name={itemIcon} size={16} color={theme.colors.primary} />
              <Text style={styles.itemText}>{itemName}</Text>
            </View>
          )}

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingHeader}>
              <Icon name="star" size={16} color={theme.colors.primary} />
              <Text style={styles.ratingTitle}>
                {labels.yourRating}
              </Text>
            </View>
            <Text style={styles.ratingText}>
              {rating === 0 ? labels.tapToRate : `${rating}/5`}
            </Text>
            <View style={styles.ratingContent}>
              <StarRating
                rating={rating}
                onRatingChange={onRatingChange}
                size="medium"
                color="#FFC107"
                spacing={8}
              />
            </View>
          </View>

          {/* Review Text */}
          <View style={styles.textContainer}>
            <View style={styles.textHeader}>
              <Icon name="edit" size={16} color={theme.colors.primary} />
              <Text style={styles.textTitle}>
                {labels.yourReview}
              </Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={reviewText}
              onChangeText={onReviewTextChange}
              multiline
              numberOfLines={3}
              placeholder={labels.reviewPlaceholder}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          {/* Community Questions */}
          {showCommunityQuestions && (
            <View style={styles.communityContainer}>
              <View style={styles.communityHeader}>
                <Icon name="users" size={16} color={theme.colors.primary} />
                <Text style={styles.communityTitle}>
                  {labels.communityQuestions}
                  <Text style={styles.communityOptional}> ({labels.optional})</Text>
                </Text>
              </View>
              <Text style={styles.communityDescription}>
                {labels.communityDescription}
              </Text>

              <View style={styles.questionCards}>
                {/* Fish-specific questions */}
                {labels.goodEating && (
                  <CommunityQuestionCard
                    question={labels.goodEating}
                    value={isGoodEating ?? null}
                    onValueChange={onIsGoodEatingChange || (() => {})}
                    icon="utensils"
                  />
                )}
                {labels.goodFighter && (
                  <CommunityQuestionCard
                    question={labels.goodFighter}
                    value={putsUpGoodFight ?? null}
                    onValueChange={onPutsUpGoodFightChange || (() => {})}
                    icon="zap"
                  />
                )}
                {labels.hardToCatch && (
                  <CommunityQuestionCard
                    question={labels.hardToCatch}
                    value={isHardToCatch ?? null}
                    onValueChange={onIsHardToCatchChange || (() => {})}
                    icon="target"
                  />
                )}
                
                {/* Fishing technique-specific questions */}
                {labels.beginnerFriendly && (
                  <CommunityQuestionCard
                    question={labels.beginnerFriendly}
                    value={isBeginnerFriendly ?? null}
                    onValueChange={onIsBeginnerFriendlyChange || (() => {})}
                    icon="award"
                  />
                )}
                {labels.weatherSensitive && (
                  <CommunityQuestionCard
                    question={labels.weatherSensitive}
                    value={isWeatherSensitive ?? null}
                    onValueChange={onIsWeatherSensitiveChange || (() => {})}
                    icon="cloud"
                  />
                )}
                {labels.suitableForNight && (
                  <CommunityQuestionCard
                    question={labels.suitableForNight}
                    value={isSuitableForNight ?? null}
                    onValueChange={onIsSuitableForNightChange || (() => {})}
                    icon="moon"
                  />
                )}
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <View style={styles.button}>
              <Button
                variant="secondary"
                onPress={onClose}
                fullWidth
              >
                {labels.cancel}
              </Button>
            </View>
            <View style={styles.button}>
              <Button
                variant="primary"
                onPress={handleSubmit}
                disabled={isLoading || rating === 0}
                fullWidth
              >
                {isEditing ? labels.update : labels.submit}
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </FishivoModal>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md
  },
  itemText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.primary
  },
  ratingContainer: {
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm
  },
  ratingTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text
  },
  ratingContent: {
    marginTop: theme.spacing.xs
  },
  ratingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs
  },
  textContainer: {
    marginBottom: theme.spacing.lg
  },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm
  },
  textTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.base,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  communityContainer: {
    marginBottom: theme.spacing.md
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs
  },
  communityTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: theme.colors.text
  },
  communityOptional: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.regular,
    color: theme.colors.textSecondary
  },
  communityDescription: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md
  },
  questionCards: {
    gap: theme.spacing.sm
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  button: {
    flex: 1
  }
});

export { ReviewModal };