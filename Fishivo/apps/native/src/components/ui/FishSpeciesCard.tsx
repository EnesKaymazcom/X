import React from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import Icon from '@/components/ui/Icon';
import { getConservationStatusInfo, getConservationStatusColors } from '@/utils/conservation-status';
import { FishSpeciesDisplay } from '@fishivo/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FishSpeciesCardProps {
  species: FishSpeciesDisplay;
  onPress: () => void;
}

// Helper function to convert R2 URLs to custom domain URLs
const getProxiedImageUrl = (r2Url: string | null | undefined): string => {
  if (!r2Url) return '';
  
  // If it's already using the custom domain, return as is
  if (r2Url.includes('images.fishivo.com')) {
    return r2Url;
  }
  
  // If it's a full R2 URL, convert to custom domain
  if (r2Url.includes('.r2.dev/')) {
    const path = r2Url.split('.r2.dev/')[1];
    return `https://images.fishivo.com/${path}`;
  }
  
  // If it's already a relative path, assume it's correct
  if (r2Url.startsWith('/')) {
    return r2Url;
  }
  
  // Otherwise return the original URL
  return r2Url;
};

const FishSpeciesCard: React.FC<FishSpeciesCardProps> = ({ species, onPress }) => {
  const { theme, isDark } = useTheme();
  const { locale, t } = useTranslation();
  const [imageError, setImageError] = React.useState(false);
  const styles = createStyles(theme, isDark);
  
  // Conservation status
  const conservationStatus = species.conservationStatus ? getConservationStatusInfo(species.conservationStatus) : null;
  const statusColors = species.conservationStatus ? getConservationStatusColors(species.conservationStatus) : null;
  
  // Get proxied image URL
  const imageUrl = getProxiedImageUrl(species.image);

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Image Container */}
          <View style={styles.imageContainer}>
            {imageUrl && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              onError={() => {
                setImageError(true);
              }}
              onLoad={() => {
                // Image loaded successfully
              }}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={isDark ? [theme.colors.surface, theme.colors.surfaceVariant] : [theme.colors.surfaceVariant, theme.colors.surface]}
              style={styles.imagePlaceholder}
            >
              <Icon name="fish" size={48} color="#60A5FA" />
            </LinearGradient>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Fish Name */}
          <Text style={styles.name} numberOfLines={1}>
            {species.name}
          </Text>

          {/* Scientific Name */}
          {species.scientificName && (
            <Text style={styles.scientificName} numberOfLines={1}>
              {species.scientificName}
            </Text>
          )}

          {/* Alternative Name Match */}
          {species.matchedAlternativeName && (
            <View style={styles.alternativeNameContainer}>
              <Icon name="search" size={10} color={theme.colors.primary} />
              <Text style={styles.alternativeName} numberOfLines={1}>
                {species.matchedAlternativeName} olarak da bilinir
              </Text>
            </View>
          )}

          {/* Conservation Status */}
          {conservationStatus && statusColors && (
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: statusColors.bgColor,
                  borderColor: statusColors.borderColor
                }
              ]}>
                <Text style={[styles.statusCode, { color: statusColors.color }]}>
                  {conservationStatus.code}
                </Text>
              </View>
            </View>
          )}

          {/* Family */}
          {species.family && (
            <Text style={styles.family} numberOfLines={1}>
              {t('fishSpecies.card.family')} {species.family}
            </Text>
          )}


          {/* View Details */}
          <Text style={styles.viewDetails}>
            {t('fishSpecies.card.viewDetails')}
          </Text>
        </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 2,
    overflow: 'hidden',
    padding: theme.spacing.sm,
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
  content: {
    padding: theme.spacing.sm,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
  },
  family: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs / 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 3,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  statusCode: {
    fontSize: 9,
    fontWeight: '600',
  },
  statusLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  viewDetails: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: theme.spacing.xs / 2,
  },
  alternativeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: theme.spacing.xs / 2,
  },
  alternativeName: {
    fontSize: 10,
    color: theme.colors.primary,
    fontStyle: 'italic',
    flex: 1,
  },
});

export default FishSpeciesCard;