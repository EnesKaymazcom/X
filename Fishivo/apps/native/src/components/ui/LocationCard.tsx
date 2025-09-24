import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from '@/components/ui/Icon';
import { theme } from '@/theme';
import { useTranslation } from '@/contexts/LanguageContext';

const { width } = Dimensions.get('window');

interface Location {
  id: string;
  name: string;
  type: 'manual' | 'spot' | 'private-spot';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  isFavorite: boolean;
  isPrivate?: boolean;
  lastUsed?: Date;
}

interface LocationCardProps {
  location: Location;
  onPress: (location: Location) => void;
  onToggleFavorite?: (locationId: string) => void;
  onDelete?: (locationId: string) => void;
  variant?: 'grid' | 'list';
  showActions?: boolean;
  style?: any;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onPress,
  onToggleFavorite,
  onDelete,
  variant = 'list',
  showActions = true,
  style,
}) => {
  const { t } = useTranslation();
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'spot': return 'compass';
      case 'private-spot': return 'shield';
      case 'manual': return 'map-pin';
      default: return 'map-pin';
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'spot': return theme.colors.primary;
      case 'private-spot': return theme.colors.accent;
      case 'manual': return theme.colors.secondary;
      default: return theme.colors.textSecondary;
    }
  };

  const getLocationTypeBadge = (type: string) => {
    switch (type) {
      case 'spot': return t('common.locationTypes.spot');
      case 'private-spot': return t('common.locationTypes.privateSpot');
      case 'manual': return t('common.locationTypes.manual');
      default: return 'SPOT';
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return t('common.time.today');
    if (diffInDays === 1) return t('common.time.yesterday');
    if (diffInDays < 7) return t('common.time.daysAgo', { count: diffInDays });
    if (diffInDays < 30) return t('common.time.weeksAgo', { count: Math.floor(diffInDays / 7) });
    return t('common.time.monthsAgo', { count: Math.floor(diffInDays / 30) });
  };

  if (variant === 'grid') {
    return (
      <TouchableOpacity
        style={[styles.favoriteLocationCard, style]}
        onPress={() => onPress(location)}
      >
        <View style={styles.favoriteLocationHeader}>
          <View style={[styles.locationIconContainer, { backgroundColor: `${getLocationTypeColor(location.type)}15` }]}>
            <Icon 
              name={getLocationIcon(location.type)} 
              size={16} 
              color={getLocationTypeColor(location.type)} 
            />
          </View>
          {showActions && onToggleFavorite && (
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite(location.id);
              }}
            >
              <Icon name="heart" size={14} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.favoriteLocationContent}>
          <Text style={styles.favoriteLocationName} numberOfLines={1}>
            {location.name}
          </Text>
          <Text style={styles.favoriteLocationAddress} numberOfLines={2}>
            {location.address}
          </Text>
          
          {location.lastUsed && (
            <Text style={styles.lastUsedText}>
              {getRelativeTime(location.lastUsed)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.locationCard, style]}
      onPress={() => onPress(location)}
    >
      <View style={[styles.locationIconContainer, { backgroundColor: `${getLocationTypeColor(location.type)}15` }]}>
        <Icon 
          name={getLocationIcon(location.type)} 
          size={16} 
          color={getLocationTypeColor(location.type)} 
        />
      </View>
      
      <View style={styles.locationDetails}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationName} numberOfLines={1}>
            {location.name}
          </Text>
          <View style={styles.locationTypeBadge}>
            <Text style={[styles.locationTypeText, { color: getLocationTypeColor(location.type) }]}>
              {getLocationTypeBadge(location.type)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.locationAddress} numberOfLines={1}>
          {location.address}
        </Text>
        
        {location.lastUsed && (
          <Text style={styles.lastUsedText}>
            {t('common.lastUsed')}: {getRelativeTime(location.lastUsed)}
          </Text>
        )}
      </View>
      
      {showActions && (
        <View style={styles.locationActions}>
          {onToggleFavorite && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite(location.id);
              }}
            >
              <Icon 
                name="heart" 
                size={16} 
                color={location.isFavorite ? theme.colors.error : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                onDelete(location.id);
              }}
            >
              <Icon name="trash-2" size={16} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid variant styles
  favoriteLocationCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  favoriteLocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  favoriteLocationContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  favoriteLocationName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    lineHeight: 20,
    minHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  favoriteLocationAddress: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  favoriteButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List variant styles
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDetails: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  locationName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  locationTypeBadge: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  locationTypeText: {
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
  },
  locationAddress: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  lastUsedText: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
  },
  locationActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
});

export default LocationCard; 