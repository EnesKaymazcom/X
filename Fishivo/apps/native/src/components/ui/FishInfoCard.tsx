import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { Theme } from '@/theme';
import Icon from '@/components/ui/Icon';
import { getConservationStatusBadgeProps, getConservationStatusInfo } from '@fishivo/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // 24px padding on each side
const IMAGE_HEIGHT = CARD_WIDTH * 0.6; // 3:5 aspect ratio

// Conservation Status Badge Component
const ConservationStatusBadge: React.FC<{ status: string; locale: 'tr' | 'en' }> = ({ status, locale }) => {
  const { theme } = useTheme();
  const badgeProps = getConservationStatusBadgeProps(status, locale);
  const statusInfo = getConservationStatusInfo(status);
  
  // Get background color based on status
  const getBackgroundColor = (status: string) => {
    switch (status) {
      case 'LC': return 'rgba(34, 197, 94, 0.1)'; // green
      case 'NT': return 'rgba(251, 191, 36, 0.1)'; // yellow
      case 'VU': return 'rgba(251, 146, 60, 0.1)'; // orange
      case 'EN': return 'rgba(239, 68, 68, 0.1)'; // red
      case 'CR': return 'rgba(127, 29, 29, 0.1)'; // dark red
      case 'EW': return 'rgba(71, 85, 105, 0.1)'; // gray
      case 'EX': return 'rgba(0, 0, 0, 0.1)'; // black
      case 'DD': return 'rgba(148, 163, 184, 0.1)'; // slate
      case 'NE': return 'rgba(209, 213, 219, 0.1)'; // light gray
      default: return 'rgba(148, 163, 184, 0.1)';
    }
  };
  
  const getTextColor = (status: string) => {
    switch (status) {
      case 'LC': return '#22c55e'; // green
      case 'NT': return '#fbbf24'; // yellow
      case 'VU': return '#fb923c'; // orange
      case 'EN': return '#ef4444'; // red
      case 'CR': return '#7f1d1d'; // dark red
      case 'EW': return '#475569'; // gray
      case 'EX': return '#000000'; // black
      case 'DD': return '#94a3b8'; // slate
      case 'NE': return '#9ca3af'; // light gray
      default: return '#94a3b8';
    }
  };
  
  return (
    <View style={{ alignItems: 'flex-end' }}>
      <View style={{
        backgroundColor: getBackgroundColor(status),
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 4,
      }}>
        <Text style={{
          fontSize: 11,
          fontWeight: '600',
          color: getTextColor(status),
        }}>
          {badgeProps.children}
        </Text>
      </View>
      <Text style={{
        fontSize: 11,
        color: theme.colors.textSecondary,
      }}>
        {statusInfo?.label[locale]}
      </Text>
    </View>
  );
};

interface FishInfoCardProps {
  species: string;
  speciesId?: string;
  speciesImage?: string;
  scientificName?: string;
  conservationStatus?: string;
  locale?: 'tr' | 'en';
  onPress?: () => void;
}

const FishInfoCard: React.FC<FishInfoCardProps> = ({
  species,
  speciesId,
  speciesImage,
  scientificName,
  conservationStatus,
  locale = 'en',
  onPress,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const isClickable = speciesId && onPress;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={isClickable ? onPress : undefined}
      activeOpacity={isClickable ? 0.7 : 1}
    >
      {/* Fish Image */}
      {speciesImage ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: speciesImage }}
            style={styles.fishImage}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={[styles.imageContainer, styles.placeholderContainer]}>
          <Icon name="fish" size={60} color={theme.colors.textSecondary} />
        </View>
      )}

      {/* Fish Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailsRow}>
          {/* Left side - Names */}
          <View style={styles.namesContainer}>
            {/* Species Name */}
            <Text style={styles.speciesName} numberOfLines={1}>
              {species}
            </Text>
            
            {/* Scientific Name */}
            {scientificName && (
              <Text style={styles.scientificName} numberOfLines={1}>
                {scientificName}
              </Text>
            )}
          </View>
          
          {/* Right side - Conservation Status */}
          {conservationStatus && (
            <View style={styles.conservationContainer}>
              <ConservationStatusBadge 
                status={conservationStatus} 
                locale={locale}
              />
            </View>
          )}
        </View>
      </View>

      {/* Arrow indicator if clickable */}
      {isClickable && (
        <View style={styles.arrowContainer}>
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    padding: theme.spacing.md,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
  },
  detailsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  namesContainer: {
    flex: 1,
    gap: 4,
  },
  speciesName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.text,
  },
  scientificName: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  conservationContainer: {
    flexShrink: 0,
  },
  arrowContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
  },
});

export default FishInfoCard;