import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { getProxiedImageUrl } from '@fishivo/utils';

export interface FishingDiscipline {
  id: string;
  name: string;
  name_tr?: string;
  description: string;
  description_tr?: string;
  popularity_score: number; // 1-100
  success_rate: number; // percentage for this species
  best_season?: string;
  best_time_of_day?: string;
  recommended_depth?: {
    min: number;
    max: number;
  };
  icon: string;
  equipment_needed: string[];
  rating?: number; // Ortalama puan
  review_count?: number; // Yorum sayısı
  technique_id?: number; // Teknik ID'si
  image_url?: string; // Görsel URL'si
}

interface DisciplineCardProps {
  item: FishingDiscipline;
  onPress?: (item: FishingDiscipline) => void;
  locale?: string;
  showStats?: boolean;
  reviewsText?: string;
  noReviewsText?: string;
  popularityText?: string;
}

const DisciplineCard: React.FC<DisciplineCardProps> = ({ 
  item, 
  onPress,
  locale = 'tr',
  showStats = true,
  reviewsText = 'reviews',
  noReviewsText = 'No reviews',
  popularityText = 'Popularity'
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const [imageError, setImageError] = useState(false);
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageArea}>
        {item.image_url && !imageError ? (
          <>
            <Image
              source={{ uri: getProxiedImageUrl(item.image_url) }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
            <View style={styles.iconOverlay}>
              <Icon name={item.icon} size={24} color="#fff" />
            </View>
          </>
        ) : (
          <View style={styles.iconFallback}>
            <Icon name={item.icon} size={32} color={theme.colors.primary} />
          </View>
        )}
      </View>
      
      <View style={styles.textArea}>
        {/* Discipline Name */}
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {locale === 'tr' && item.name_tr ? item.name_tr : item.name}
        </Text>
        
        {/* Description */}
        {item.description && (
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {locale === 'tr' && item.description_tr ? item.description_tr : item.description}
          </Text>
        )}
        
        {/* Rating Row */}
        {showStats && item.review_count !== undefined && item.review_count > 0 ? (
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>
              • {item.review_count} {reviewsText}
            </Text>
          </View>
        ) : (
          <Text style={styles.noReviewsText}>
            {noReviewsText}
          </Text>
        )}
        
        {/* Stats Row */}
        {showStats && (
          <View style={styles.statsRow}>
            <Text style={styles.popularityText}>
              {item.popularity_score}% {popularityText}
            </Text>
            {item.best_season && (
              <Text style={styles.seasonText} numberOfLines={1}>
                {item.best_season}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  imageArea: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: isDark ? theme.colors.surface : '#f5f5f5',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    width: '100%',
    padding: theme.spacing.sm,
    minHeight: 85,
  },
  name: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  description: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: theme.spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: theme.typography.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.medium,
  },
  reviewCount: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  noReviewsText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  statsRow: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs / 2,
  },
  popularityText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  seasonText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
});

export default DisciplineCard;